import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { servidorComNormas } from './helpers/normasDeTeste.mjs'
import { readFileSync } from 'node:fs'

// Normas servidas a partir dos arquivos de seed, como se fossem as linhas do
// Supabase (o app não lê mais arquivo local — ver helpers/normasDeTeste.mjs).
const server = await servidorComNormas()
after(() => server.close())
const { buildFormularioPB } = await server.ssrLoadModule('/src/estados/PB/formulario.js')
const { medidasObrigatorias } = await server.ssrLoadModule('/src/hooks/useMedidasObrigatorias.js')
const { riscosEspeciaisDoEstado, RISCOS_ESPECIAIS } = await server.ssrLoadModule('/src/utils/anexoB.js')

const SISTEMAS = Object.fromEntries(['acesso_viatura','seg_estrutural','compart_horizontal','compart_vertical','controle_acabamento','saida_emergencia','gerenciamento_risco','brigada','iluminacao','sinalizacao','extintores','hidrantes','alarme','deteccao','sprinklers','controle_fumaca','central_gas','spda'].map(k => [k, { obrigatorio:false, ativo:false }]))

function projeto(extra = {}) {
  return {
    uf:'PB', tipoProjeto:'completo', situacao:'nova', nome:'Teste',
    estruturas:[{ id:'e1', nome:'Bloco A', areaTotal:'1200', altura:'9', alturaPisoPiso:9, alturaEdificacao:9, nPavimentos:3, nSubsolos:0 }],
    pavimentos:[{
      id:'p1', estruturaId:'e1', label:'Térreo', tipo:'terreo', divisao:'C-1', area:'400', pisoDescarga:true,
      ambientes:[{ id:'a1', nome:'Loja', divisao:'C-1', area:'300', acessoId:'ac2' }],
      acessos:[{ id:'ac1', nome:'Saída', alimentaEm:null }, { id:'ac2', nome:'Acesso', alimentaEm:'ac1' }],
    }],
    cargaState:{ e1:{ 'C-1':{ metodo:'levantamento', valorManual:'500' } } },
    sistemas: SISTEMAS, sistemasPorEstrutura:{}, riscosEspeciaisPorEstrutura:{}, riscosOutrosDescPorEstrutura:{},
    memorialPB:{},
    ...extra,
  }
}
function gerar(state) {
  const { sistemas, porEstrutura } = medidasObrigatorias(state)
  return buildFormularioPB(state, sistemas, porEstrutura)
}
const secao = (f, prefixo) => f.secoes.find(s => s.titulo.startsWith(prefixo))
const marcados = s => s.linhas.flatMap(l => [...(l.itens || []), ...(l.tipo === 'checkValor' ? [l] : [])]).filter(i => i.x).map(i => i.label)
const valorCampo = (s, label) => s.linhas.flatMap(l => l.celulas || []).find(c => c.label === label)?.valor

test('estado sem formulário próprio não gera o memorial da PB', () => {
  assert.equal(gerar(projeto({ uf:'MA' })), null)
})

test('as 20 seções saem na ordem do modelo do CBMPB', () => {
  const f = gerar(projeto())
  assert.equal(f.secoes.length, 20)
  assert.ok(f.secoes[0].titulo.startsWith('1.'))
  assert.ok(f.secoes[19].titulo.startsWith('20.'))
})

test('identificação, natureza, altura, risco e nível saem do projeto', () => {
  const f = gerar(projeto({ respRazaoSocial:'Loja X', bairro:'Centro', cidade:'João Pessoa', rtNome:'Fulano', rtConselho:'CREA 123', artNumero:'999' }))
  const id = secao(f, '1.')
  assert.equal(valorCampo(id, 'Obra/Razão Social:'), 'Loja X')
  assert.equal(valorCampo(id, 'Município:'), 'João Pessoa')
  assert.equal(valorCampo(id, 'ART/RRT nº:'), '999')
  const p = secao(f, '3.')
  const x = marcados(p)
  assert.ok(x.includes('C-1 - Comércio com carga de incêndio Nível I'))
  assert.ok(x.includes('Tipo III'))                      // 9 m: 6 < H ≤ 12
  assert.ok(x.includes('Médio'))                         // 500 MJ/m²
  assert.ok(x.includes('Nível II'))
  assert.ok(x.includes('A edificação ainda será construída'))
})

test('forma de apresentação: PCI marcado pelo enquadramento automático do tipo de projeto', () => {
  // Fallback offline: sem a tabela de medidas da PB não há limiares, nada é marcado.
  assert.deepEqual(marcados(secao(gerar(projeto()), '2.')), [])
})

test('tipo de projeto: técnico ou simplificado pelos limiares de cada estado', async () => {
  const { enquadrarTipoProjeto, rotuloTipoProjeto } = await server.ssrLoadModule('/src/data/tipoProjeto.js')
  const est = (area, nPav, altura) => ({ id: `${area}-${altura}`, nome: 'E', areaTotal: String(area), nPavimentos: nPav, alturaEdificacao: altura, nSubsolos: 0 })
  // MA (tabela estática): simplificado só abaixo de 750 m² e 12 m (estrito).
  assert.equal(enquadrarTipoProjeto('MA', [est(500, 1, '')]).tipo, 'simplificado')
  assert.equal(enquadrarTipoProjeto('MA', [est(750, 1, '')]).tipo, 'tecnico')
  assert.equal(enquadrarTipoProjeto('MA', [est(500, 4, 12)]).tipo, 'tecnico')
  // Uma estrutura acima do limite basta para o projeto ser técnico.
  assert.equal(enquadrarTipoProjeto('MA', [est(500, 1, ''), est(800, 1, '')]).tipo, 'tecnico')
  // Altura de edificação de vários pavimentos não informada: pendente, não "simplificado".
  assert.equal(enquadrarTipoProjeto('MA', [est(500, 3, '')]).tipo, null)
  assert.equal(enquadrarTipoProjeto('MA', [{ ...est(500, 1, ''), areaTotal: '' }]).tipo, null)
  assert.equal(rotuloTipoProjeto('MA', 'simplificado'), 'Projeto Técnico Simplificado (PTS)')
  assert.equal(rotuloTipoProjeto('PB', 'simplificado'), 'Projeto Técnico de Segurança Contra Incêndio Simplificado (PCIS)')
  assert.equal(rotuloTipoProjeto('PB', 'tecnico'), 'Projeto de Segurança contra Incêndio (PCI)')
})

test('classe de GLP só marca com o risco especial GLP marcado', () => {
  const semRisco = marcados(secao(gerar(projeto({ memorialPB:{ glpClasse:'II' } })), '3.'))
  assert.ok(!semRisco.some(l => l.startsWith('CLASSE')))
  const comRisco = marcados(secao(gerar(projeto({ riscosEspeciaisPorEstrutura:{ e1:{ glp:true } }, memorialPB:{ glpClasse:'II' } })), '3.'))
  assert.ok(comRisco.includes('CLASSE II – Até 1.560 kg'))
  assert.ok(comRisco.includes('EXIGÍVEL'))
})

test('sem a tabela de exigências cadastrada para o estado, exigibilidade fica em aberto, exceto no mínimo de referência', () => {
  const f = gerar(projeto())
  assert.equal(f.temTabelaExigencias, false)
  const exig = prefixo => secao(f, prefixo).linhas.find(l => l.tipo === 'exigivel').exigivel
  assert.equal(exig('10.'), true)     // saída de emergência — mínimo de referência
  assert.equal(exig('17.'), null)     // hidrantes — não dá pra afirmar "não exigível"
  assert.equal(exig('19.'), null)     // SPDA — sem regra no app
})

test('saídas de emergência saem do dimensionamento da página comum (ambientes e acessos)', () => {
  const s = secao(gerar(projeto()), '10.')
  assert.equal(valorCampo(s, 'Capacidade de público (pessoas) total da edificação:'), '60') // 300 m² / 5 m²/pessoa (NT 12/2025)
  assert.ok(valorCampo(s, 'Largura (metros) dos acessos e descargas:'))
  assert.ok(valorCampo(s, 'Distanciamento (metros) máximo a ser percorrido no piso de descarga:').includes('C-1'))
})

test('10. declarações: só com mais de um pavimento; 5.7 e 5.8 já nascem marcadas', () => {
  // (o tipo de escada da seção 10 sai da Tabela 3 — não é atesto)
  const atestos = s => marcados(s).filter(l => !/^(Não Enclausurada|Enclausurada Protegida|A prova de fumaça)/.test(l))
  const E57 = 'As escadas atendem aos requisitos do item 5.7 da NT 12, conforme o tipo de escada informado'
  const E58 = 'As guardas e corrimãos atendem aos requisitos do item 5.8 da NT 12'
  const E59 = 'Os elevadores de emergência (quando exigido) atendem aos requisitos do item 5.9 da NT 12'
  assert.deepEqual(atestos(secao(gerar(projeto()), '10.')), [E57, E58])                          // padrão
  assert.deepEqual(atestos(secao(gerar(projeto({ memorialPB: { atestos: { se_escadas_5_7: false, se_elevadores_5_9: true } } })), '10.')), [E58, E59])
  // edificação térrea: nenhuma declaração
  const terrea = projeto({ estruturas: [{ id: 'e1', nome: 'Bloco A', areaTotal: '400', altura: '3', nPavimentos: 1, nSubsolos: 0 }] })
  assert.equal(atestos(secao(gerar(terrea), '10.')).length, 0)
})

test('extintores marcam o nível da carga; nível III depende da escolha do RT', () => {
  assert.ok(marcados(secao(gerar(projeto()), '16.')).some(l => l.includes('nível II')))
  const alto = projeto({ cargaState:{ e1:{ 'C-1':{ metodo:'levantamento', valorManual:'1500' } } } })
  assert.equal(marcados(secao(gerar(alto), '16.')).length, 0)
  alto.memorialPB = { extintorNivelIII:'nivel_III_4A' }
  assert.deepEqual(marcados(secao(gerar(alto), '16.')), ['Edificação de nível III com capacidade extintora mínima de 4A e 80BC'])
})

test('riscos especiais: PB tem lista própria, MA continua com a do Anexo B', () => {
  assert.equal(riscosEspeciaisDoEstado('MA'), RISCOS_ESPECIAIS)
  const pb = riscosEspeciaisDoEstado('PB').map(r => r.key)
  for (const k of ['tendas_inflamaveis', 'geradores_eletricos', 'estrutura_montada', 'sistemas_eletricos_montados', 'glp']) assert.ok(pb.includes(k), k)
  const r = secao(gerar(projeto({ riscosEspeciaisPorEstrutura:{ e1:{ geradores_eletricos:true } } })), '5.')
  assert.deepEqual(marcados(r), ['Geradores elétricos'])
})

test('SQL do memorial_formulario entrega o mesmo conteúdo do arquivo estático da PB', async () => {
  const dadosDoSql = arquivo => JSON.parse(readFileSync(new URL(`../supabase/migrations/${arquivo}`, import.meta.url), 'utf8').split('$j$')[1])
  const mf = await server.ssrLoadModule('/src/data/normas/PB/memorial_formulario.js')
  const esperado = Object.fromEntries(Object.entries(mf).map(([k, v]) => [k.toLowerCase(), v]))
  assert.deepEqual(dadosDoSql('20261016120001_seed_normas_memorial_formulario_pb.sql'), JSON.parse(JSON.stringify(esperado)))
})

test('tabela de medidas incompleta na base central não quebra o motor de normas', async () => {
  // Servidor à parte com normasRemote.js trocado por um stub: a linha
  // ('PB','medidas_seguranca') chega só com limiares e MEDIDAS, sem a
  // tabela simplificada — o caso que derrubava a criação de projeto.
  const srv = await servidorComNormas({ PB: { medidas_seguranca: { limiares: { areaMin: 750, alturaMin: 12 }, medidas: {} } } })
  try {
    const { getMedidasObrigatorias, getGruposSemDados } = await srv.ssrLoadModule('/src/data/normas/index.js')
    assert.doesNotThrow(() => getMedidasObrigatorias('PB', ['C-1'], 0, 0))      // simplificado, sem tabela
    assert.doesNotThrow(() => getMedidasObrigatorias('PB', ['C-1'], 20, 2000))  // normal, grupo sem dado
    assert.deepEqual(getGruposSemDados('PB', ['C-1'], 0, 0), ['C'])
  } finally {
    await srv.close()
  }
})

test('linha padronizada da PB: Tabela 5 inclusiva, subtabelas por divisão e grupos sem critério do app', async () => {
  // Recorte fiel da linha ('PB','medidas_seguranca') do Supabase, com a
  // tabela_simplificada lida do próprio SQL de padronização.
  const linha = readFileSync(new URL('./fixtures/medidas_seguranca_pb.json', import.meta.url), 'utf8')
  const srv = await servidorComNormas({ PB: { medidas_seguranca: JSON.parse(linha) } })
  try {
    const { getMedidasObrigatorias, getGruposSemDados } = await srv.ssrLoadModule('/src/data/normas/index.js')
    const exigidas = r => Object.entries(r.medidas).filter(([, v]) => v.obrigatorio).map(([k]) => k).sort()

    // Exatamente 930 m² e 12 m ainda é Tabela 5 ("menor ou igual").
    const limite = getMedidasObrigatorias('PB', ['C-1'], 12, 930)
    assert.equal(limite.simplificado, true)
    assert.deepEqual(exigidas(limite), ['extintores', 'iluminacao', 'saida_emergencia', 'sinalizacao'])
    assert.equal(limite.medidas.iluminacao.notaSimp, 1)
    assert.equal(getMedidasObrigatorias('PB', ['C-1'], 12, 931).simplificado, false)

    // Tabela 5: coluna por divisão (H-2_H-3_H-5) e "I_J_M-3" (grupo + divisão).
    assert.ok(exigidas(getMedidasObrigatorias('PB', ['H-2'], 6, 500)).includes('gerenciamento_risco'))
    assert.ok(exigidas(getMedidasObrigatorias('PB', ['M-3'], 6, 500)).includes('iluminacao'))
    assert.deepEqual(getGruposSemDados('PB', ['K-1'], 6, 500), ['K'])

    // Tabela 6, grupo direto (C) com alturaMax e condição em lista.
    assert.deepEqual(exigidas(getMedidasObrigatorias('PB', ['C-3'], 20, 2000)), ['extintores', 'gerenciamento_risco', 'hidrantes'])

    // Tabela 6, subtabela com a divisão na chave ('F-3_F-9').
    assert.deepEqual(exigidas(getMedidasObrigatorias('PB', ['F-9'], 20, 2000)), ['deteccao', 'sprinklers'])
    assert.deepEqual(getGruposSemDados('PB', ['F-3'], 20, 2000), [])

    // Exigência fixa (M-4/M-7) e grupos com critério que o app não coleta.
    assert.deepEqual(exigidas(getMedidasObrigatorias('PB', ['M-4'], 20, 2000)), ['brigada', 'saida_emergencia'])
    assert.deepEqual(getGruposSemDados('PB', ['K-1', 'L-1', 'M-4'], 20, 2000), ['K', 'L'])
    assert.doesNotThrow(() => getMedidasObrigatorias('PB', ['K-1', 'L-1'], 20, 2000))

    // Tipo de projeto na PB: 930 m² e 12 m ainda é PCIS; a seção 2 marca PCI.
    const { enquadrarTipoProjeto } = await srv.ssrLoadModule('/src/data/tipoProjeto.js')
    const e = (area, altura) => ({ id: 'x', nome: 'E', areaTotal: String(area), nPavimentos: 4, alturaEdificacao: altura, nSubsolos: 0 })
    assert.equal(enquadrarTipoProjeto('PB', [e(930, 12)]).tipo, 'simplificado')
    assert.equal(enquadrarTipoProjeto('PB', [e(931, 12)]).tipo, 'tecnico')
    const { buildFormularioPB: build } = await srv.ssrLoadModule('/src/estados/PB/formulario.js')
    const st = { ...projeto(), estruturas: [{ ...projeto().estruturas[0], areaTotal: '900', nPavimentos: 3, alturaEdificacao: 9 }] }
    const s2 = build(st, {}, []).secoes[1]
    assert.deepEqual(marcados(s2), ['Projeto de Segurança contra Incêndio - PCI — Projeto Técnico de Segurança Contra Incêndio Simplificado (PCIS)'])
  } finally {
    await srv.close()
  }
})

test('observações complementares: PB lista todas as estruturas; MA fica no contexto de cada estrutura', async () => {
  const { observacaoDaEstrutura, observacoesDoProjeto } = await server.ssrLoadModule('/src/utils/observacoes.js')
  const { textoMemorialSaidaEmergencia } = await server.ssrLoadModule('/src/data/memorial/saida_emergencia.js')
  const { textoMemorialSegEstrutural } = await server.ssrLoadModule('/src/data/memorial/seg_estrutural.js')

  // Campos que já existiam continuam sendo a fonte dessas duas medidas.
  assert.equal(observacaoDaEstrutura({ obsSegEstrutural: ' x ' }, 'seg_estrutural'), 'x')
  assert.equal(observacaoDaEstrutura({ obsCompartimentacao: 'y' }, 'compart_vertical'), 'y')
  assert.equal(observacaoDaEstrutura({ observacoes: { brigada: 'z' } }, 'brigada'), 'z')

  const base = projeto()
  const e2 = { ...base.estruturas[0], id:'e2', nome:'Bloco B' }
  const duas = projeto({
    estruturas: [
      { ...base.estruturas[0], observacoes: { saida_emergencia: 'Escada externa existente.' } },
      { ...e2, observacoes: { saida_emergencia: 'Sem pavimento superior.' } },
    ],
    pavimentos: [...base.pavimentos, { ...base.pavimentos[0], id:'p2', estruturaId:'e2' }],
  })
  assert.equal(observacoesDoProjeto(duas.estruturas, 'saida_emergencia'), 'Bloco A: Escada externa existente.\nBloco B: Sem pavimento superior.')

  // PB: o campo da seção 10 traz as duas, cada uma com o nome da estrutura.
  const s10 = secao(gerar(duas), '10.')
  assert.equal(s10.linhas.find(l => l.tipo === 'obs').valor, 'Bloco A: Escada externa existente.\nBloco B: Sem pavimento superior.')
  // Uma estrutura só: sem prefixo.
  const uma = projeto({ estruturas: [{ ...base.estruturas[0], observacoes: { saida_emergencia: 'Só uma.' } }] })
  assert.equal(secao(gerar(uma), '10.').linhas.find(l => l.tipo === 'obs').valor, 'Só uma.')

  // MA: cada observação logo depois do título da própria estrutura, antes do
  // primeiro pavimento (mesmo nível de título).
  const { blocos } = textoMemorialSaidaEmergencia({ ...duas, uf:'MA' }, {}, [])
  const titulos = blocos.map((b, i) => [b, i]).filter(([b]) => b.tipo === 'titulo2').map(([b, i]) => [b.texto, i])
  const idx = t => titulos.find(([x]) => x === t)[1]
  const obsA = blocos.findIndex(b => b.tipo === 'campo' && b.valor === 'Escada externa existente.')
  const obsB = blocos.findIndex(b => b.tipo === 'campo' && b.valor === 'Sem pavimento superior.')
  assert.ok(obsA > idx('Bloco A') && obsA < idx('Bloco B'))
  assert.ok(obsB > idx('Bloco B'))
  assert.equal(blocos[obsA].label, 'Observações complementares')
  assert.ok(obsA < blocos.findIndex((b, i) => i > idx('Bloco A') && b.tipo === 'titulo2' && b.texto.startsWith('Térreo')))

  // Rótulo padronizado também onde o campo já existia.
  const seg = textoMemorialSegEstrutural({ ...uma, uf:'MA', estruturas: [{ ...uma.estruturas[0], obsSegEstrutural: 'Estrutura metálica protegida.' }] })
  assert.ok(seg.blocos.some(b => b.tipo === 'campo' && b.label === 'Observações complementares' && b.valor === 'Estrutura metálica protegida.'))
})

test('3.6 estágio de construção segue a Situação da Etapa 2', () => {
  const marcadosDe36 = st => {
    const s3 = secao(gerar(projeto(st)), '3.')
    const i = s3.linhas.findIndex(l => l.tipo === 'sub' && l.titulo.startsWith('3.6'))
    const linhas = s3.linhas.slice(i + 1)
    return { x: linhas.flatMap(l => l.itens || []).filter(it => it.x).map(it => it.label), adapt: linhas.find(l => l.tipo === 'obs').valor }
  }
  assert.deepEqual(marcadosDe36({ situacao: 'nova' }).x, ['A edificação ainda será construída'])
  // Escolha de existente feita antes de voltar para "nova" não vale.
  assert.deepEqual(marcadosDe36({ situacao: 'nova', memorialPB: { estagioConstrucao: 'existente_rt', adaptacoes: 'RT 01' } }), { x: ['A edificação ainda será construída'], adapt: '' })
  // Existente sem escolha: nada marcado.
  assert.deepEqual(marcadosDe36({ situacao: 'existente' }).x, [])
  const nt16 = marcadosDe36({ situacao: 'existente', memorialPB: { estagioConstrucao: 'existente_nt16', adaptacoes: 'Escada existente mantida.' } })
  assert.deepEqual(nt16.x, ['A edificação já é existente (as built) e terá adaptações descritas na NT 16/2018 CBMPB'])
  assert.equal(nt16.adapt, 'Escada existente mantida.')
  // "Segurança atual" não leva adaptações, mesmo com texto antigo salvo.
  assert.equal(marcadosDe36({ situacao: 'existente', memorialPB: { estagioConstrucao: 'existente_atual', adaptacoes: 'x' } }).adapt, '')
})

test('13. iluminação: tipo, fluxo e altura da página da PB → distância 4×H; atestos do RT', () => {
  const base = { iluTipos: ['ups'], iluFluxo: '400' }
  const comIlu = (mpb = {}) => projeto({
    sistemas: { ...SISTEMAS, iluminacao: { obrigatorio: false, ativo: true } },
    memorialPB: { ...base, ...mpb },
  })
  // Requisitos obrigatórios já vêm marcados (gerais e de luminárias).
  const PADRAO = [
    'Tempo de autonomia do sistema de 2 horas',
    'Iluminamento nos locais planos a partir de 03 lux',
    'Iluminamento nos locais com desnível a partir de 05 lux',
    'Iluminamento nos locais planos em áreas de circulação aberta a partir de 01 lux',
    'Iluminamento nos locais com desnível em áreas de circulação aberta a partir de 03 lux',
    'Iluminação de balizamento em ambientes fechados com lotação superior a 100 pessoas (F-3, F-5, F-6, F-7, F-10 e F-11)',
    'Iluminamento no plano de referência em áreas de tarefa de alto risco de no mínimo 10% do previsto em ABNT NBR ISSO/CIE 8995-1 e não inferior a 15 lux',
    'Luminárias instaladas em áreas com possível acúmulo de fumaça possuem iluminância ≥ 15 lux',
    'Tensão de até 30Vcc',
    'Fluxo luminoso ≥ 300 lm e atende ao Anexo A e Tabela 1 da NBR (Fluxo exato: 400 lm)',
    'Material resiste a 70º C durante 1 hora de funcionamento e é anticorrosão',
  ]
  const vazio = secao(gerar(comIlu()), '13.')
  assert.equal(valorCampo(vazio, 'Altura de instalação do ponto de luz em relação ao piso (metros):'), '')
  assert.deepEqual(marcados(vazio).sort(), ['Central por UPS', ...PADRAO].sort())
  assert.ok(vazio.linhas.some(l => (l.itens || []).some(i => i.label.includes('Fluxo exato: 400 lm'))))

  // O RT pode desmarcar um padrão e marcar outros.
  const s = secao(gerar(comIlu({ iluAlturaInstalacao: '2,5', atestos: { ilu_autonomia_2h: false, ilu_ups_exclusiva: true } })), '13.')
  assert.equal(valorCampo(s, 'Distância máxima entre pontos de luz conforme Anexo A da NBR (4x altura de instalação):'), '10 m')
  assert.deepEqual(marcados(s).sort(), ['Central por UPS', 'UPS exclusiva para a iluminação de emergência', ...PADRAO.slice(1)].sort())

})

test('17. hidrantes: tipo, vazão/pressão, RTI e bombas vêm da página comum; extras da PB', () => {
  const p = projeto({
    sistemasPorEstrutura: { e1: { hidrantes: true } },
    hidrantes: {
      tipo: '4', tipoVariante: 1, rti: '12', reservatorioPosicao: 'subterraneo', reservatorioMaterial: 'Concreto',
      redeMaterial: 'Aço galvanizado', bombaExiste: true, bombaReserva: true, bombaJockey: true, bombaJockeyVazao: '20',
      dimensionamento: { dados_sistema: { q_min: 300 }, res: { P_valv_ref: 31.5, P_RTI: 48.2 } },
    },
    memorialPB: { hidrantes: { nsth: '1,5', lancesInternos: '2x15', mangueira: '3' } },
  })
  const s = secao(gerar(p), '17.')
  const m = marcados(s)
  assert.ok(m.some(l => l.startsWith('Sistema TIPO 4 (esguicho regulável DN65') && l.includes('300 l/min') && l.includes('31,5 mca')))
  assert.ok(m.includes('Reservatório enterrado'))
  assert.ok(m.includes('301 a 800Mj/m²'))   // carga 500 MJ/m²
  assert.ok(m.includes('Dois lances de 15m'))
  assert.ok(m.includes('Mangueira 3'))
  assert.equal(valorCampo(s, 'Em casos de reservatórios enterrados informar o valor da NSTH:'), '1,5')
  assert.equal(valorCampo(s, 'RTI em m³:'), '12')
  assert.equal(valorCampo(s, 'Material de construção da RTI:'), 'Concreto')
  assert.equal(valorCampo(s, 'Material das tubulações:'), 'Aço galvanizado')
  assert.equal(valorCampo(s, 'Pressão da bomba principal (mca) de incêndio:'), '48,2')
  assert.equal(valorCampo(s, 'Pressão da bomba reserva (mca) para risco médio e alto:'), '48,2')
  assert.equal(valorCampo(s, 'Vazão da bomba jockey (l/min) em sistema com mais de 6 pontos de hidrante:'), '20')
  // manancial informado na página da PB
  p.memorialPB.hidrantes.manancial = true
  assert.ok(marcados(secao(gerar(p), '17.')).includes('Manancial'))
})

test('14: central e detectores informados na página da PB', () => {
  const p = projeto({
    sistemasPorEstrutura: { e1: { alarme: true, deteccao: true } },
    memorialPB: { alarmeCentralLocal: 'Portaria', detectoresTipos: ['fumaca_pontual'] },
  })
  const s14 = secao(gerar(p), '14.')
  assert.equal(valorCampo(s14, 'Localização da central de alarme (cômodo):'), 'Portaria')
  assert.equal(valorCampo(s14, 'Localização da central do alarme:'), 'Portaria')
  assert.equal(valorCampo(s14, 'Raio de atuação em detecção pontual de temperatura (máximo 4,2m):'), '')
})

test('6. acesso de viatura: as distâncias informadas marcam a linha certa do formulário', () => {
  const sec = (av, hid = false) => secao(gerar(projeto({
    sistemasPorEstrutura: { e1: { acesso_viatura: true, hidrantes: hid } },
    memorialPB: { acessoViatura: av },
  })), '6.')
  const linha = s => s.linhas.filter(l => l.tipo === 'checks').findIndex(l => l.itens[0].x) + 1
  assert.equal(linha(sec({ distanciaEdificacao: '15' })), 1)
  assert.ok(marcados(sec({ distanciaEdificacao: '15' }))[0].endsWith('Distância: 15'))
  assert.equal(linha(sec({ distanciaEdificacao: '25' })), 3)
  assert.equal(linha(sec({ distanciaEdificacao: '40', distanciaRecalque: '12' }, true)), 2)
  assert.equal(linha(sec({ distanciaEdificacao: '60', distanciaRecalque: '12' }, true)), 4)
  assert.equal(linha(sec({ distanciaEdificacao: '60', distanciaRecalque: '25' }, true)), 5)
  assert.equal(linha(sec({ distanciaEdificacao: '40', distanciaRecalque: '25' }, true)), 0)   // sem linha no formulário
  assert.equal(linha(sec({ distanciaEdificacao: '40' }, true)), 0)                             // com recalque, falta a distância do recalque
  assert.equal(linha(sec({})), 0)                                                            // sem distância: nada marcado

  // via obrigatória: a)–f), largura reduzida, retorno, portão e faixa
  const via = { distanciaEdificacao: '25', larguraVia: '6', alturaLivre: '4,5', cargaConfirmada: true, temPortao: true, portaoLargura: '4', portaoAltura: '4,5' }
  const m1 = marcados(sec(via))
  assert.ok(m1.some(l => l.startsWith('Vias de acesso para viaturas')))
  assert.ok(m1.some(l => l.startsWith('O portão de acesso')))
  const m2 = marcados(sec({ ...via, larguraVia: '5,5', extensaoVia: '40' }))
  assert.ok(!m2.some(l => l.startsWith('Vias de acesso para viaturas')))
  assert.ok(m2.some(l => l.startsWith('Locais com via de acesso com largura inferior a 6,00 m')))
  assert.ok(m2.some(l => l.startsWith('Áreas para retorno')))
  assert.ok(m2.some(l => l.startsWith('Faixas de estacionamento')))
  // dados da via em branco = padrão (6 m, 4,5 m): basta responder que suporta 25.000 kgf
  assert.ok(marcados(sec({ distanciaEdificacao: '25', cargaConfirmada: true })).some(l => l.startsWith('Vias de acesso para viaturas')))
  assert.ok(!marcados(sec({ distanciaEdificacao: '25', cargaConfirmada: false })).some(l => l.startsWith('Vias de acesso para viaturas')))
  assert.ok(!marcados(sec(via)).some(l => l.startsWith('Faixas de estacionamento')))   // via de 6 m: faixa não se aplica
  // facultativo: nada da via é marcado
  assert.equal(marcados(sec({ ...via, distanciaEdificacao: '10' })).length, 1)
})

test('9. CMAR: linha e classes por estrutura (a mais restritiva entre as divisões)', () => {
  const p = projeto({
    estruturas: [
      { id: 'e1', nome: 'Bloco A', areaTotal: '1200', altura: '9', nPavimentos: 1 },
      { id: 'e2', nome: 'Bloco B', areaTotal: '800', altura: '6', nPavimentos: 1 },
    ],
    pavimentos: [
      { id: 'p1', estruturaId: 'e1', label: 'Térreo', divisao: 'A-2', area: '400', pisoDescarga: true },
      { id: 'p2', estruturaId: 'e2', label: 'Térreo', divisao: 'C-1', area: '300', pisoDescarga: true },
    ],
    sistemasPorEstrutura: { e1: { controle_acabamento: true }, e2: { controle_acabamento: true } },
  })
  const s = secao(gerar(p), '9.')
  const m = marcados(s)
  assert.ok(m.some(l => l.startsWith('Natureza da ocupação A ')))
  assert.ok(m.some(l => l.startsWith('Natureza da ocupação C,')))
  const textos = s.linhas.filter(l => l.tipo === 'texto').map(l => l.texto)
  assert.ok(textos.includes('Bloco A: Piso Classe I, II-A, III-A ou IV-A; Parede Classe I, II-A ou III-A; Teto Classe I, II-A ou III-A; Fachada Classe I a II-B'))
  assert.ok(textos.some(t => t.startsWith('Bloco B: ') && t.includes('Parede Classe I ou II-A')))
})

test('10. sem cálculo de escadas/rampas: N/A; térrea: demais andares N/A e 10.1 não exigível; com pavimentos, tipo automático', () => {
  const terrea = projeto({ estruturas: [{ id: 'e1', nome: 'Bloco A', areaTotal: '400', altura: '3', alturaPisoPiso: 3, nPavimentos: 1, nSubsolos: 0 }] })
  const s = secao(gerar(terrea), '10.')
  assert.equal(valorCampo(s, 'Largura (metros) das escadas e rampas:'), 'N/A')
  assert.equal(valorCampo(s, 'Distanciamento (metros) máximo a ser percorrido nos demais andares:'), 'N/A')
  assert.equal(s.linhas.find(l => l.tipo === 'exigivel').exigivel, false)   // 10.1: escadas não exigíveis

  // 3 pavimentos, 9 m, C-1 → Tabela 3: NE (6 < H ≤ 12)
  const p = projeto()
  p.pavimentos.push({ id: 'p2', estruturaId: 'e1', label: '1º pav', tipo: 'pavimento', divisao: 'C-1', area: '400', pisoDescarga: false, ambientes: [], acessos: [] })
  const s2 = secao(gerar(p), '10.')
  // pavimento sem escada/rampa calculada ainda: N/A
  assert.equal(valorCampo(s2, 'Largura (metros) das escadas e rampas:'), 'N/A')
  // com a escada calculada (raiz da árvore fora do piso de descarga = ER): a largura sai
  p.pavimentos[1].ambientes = [{ id: 'a2', nome: 'Loja', divisao: 'C-1', area: '200', acessoId: 'r2' }]
  p.pavimentos[1].acessos = [{ id: 'r2', nome: 'Escada', alimentaEm: null }]
  assert.match(valorCampo(secao(gerar(p), '10.'), 'Largura (metros) das escadas e rampas:'), /m$/)
  assert.equal(s2.linhas.find(l => l.tipo === 'exigivel').exigivel, true)
  assert.ok(marcados(s2).includes('Não Enclausurada - NE'))
})

test('Anexo A: só o dimensionamento por estrutura, sem as generalidades', async () => {
  const { textoMemorialSaidaEmergencia } = await server.ssrLoadModule('/src/data/memorial/saida_emergencia.js')
  const p = projeto()
  const { sistemas, porEstrutura } = medidasObrigatorias(p)
  const titulos = r => r.blocos.filter(b => b.tipo === 'titulo2').map(b => b.texto)
  assert.ok(titulos(textoMemorialSaidaEmergencia(p, sistemas, porEstrutura)).includes('Generalidades'))
  const so = titulos(textoMemorialSaidaEmergencia(p, sistemas, porEstrutura, { soDimensionamento: true }))
  assert.ok(!so.includes('Generalidades') && !so.includes('Dimensionamento das Saídas de Emergência'))
  assert.ok(so.includes('Bloco A'))
})

test('12. dimensionamento da brigada no formato do memorial do MA, sem a introdução', () => {
  const p = projeto({ sistemasPorEstrutura: { e1: { brigada: true } } })
  p.pavimentos[0].populacaoFixa = '8'
  const s = secao(gerar(p), '12.')
  const blocos = s.linhas.find(l => l.tipo === 'obs' && l.label === 'DIMENSIONAMENTO:').blocos
  assert.equal(blocos[0].tipo, 'titulo2')                          // sem o parágrafo introdutório
  assert.equal(blocos[0].texto, 'Bloco A')
  const [ref, res, ...outras] = blocos.filter(b => b.tipo === 'tabela')
  assert.equal(outras.length, 0)                                   // níveis saem em texto, sem tabela
  assert.deepEqual(ref.colunas, ['Divisão', 'Grau de risco', 'Até 8'])   // só a faixa usada
  assert.deepEqual(res.colunas, ['Pavimento', 'Divisão', 'Risco', 'Pop. fixa', 'Brigadistas'])
  assert.deepEqual(res.linhas[0].slice(0, 4), ['Térreo', 'C-1', 'Médio', '8'])
  const campos = blocos.filter(b => b.tipo === 'campo').map(b => b.label)
  assert.deepEqual(campos, ['Total de brigadistas exigidos na estrutura', 'Nível de treinamento'])
  assert.equal(blocos.find(b => b.label === 'Nível de treinamento').valor, 'Básico')
  // divisão por turno logo abaixo do total (padrão: matutino e vespertino)
  const iTotal = blocos.findIndex(b => b.label === 'Total de brigadistas exigidos na estrutura')
  assert.deepEqual(blocos[iTotal + 1].itens.map(i => i.label), ['Matutino', 'Vespertino'])
  // sem brigada exigida, o campo fica vazio
  const sem = secao(gerar(projeto({ sistemasPorEstrutura: { e1: { brigada: false } } })), '12.').linhas.find(l => l.tipo === 'obs' && l.label === 'DIMENSIONAMENTO:')
  assert.equal(sem.blocos.length, 0)
})

test('12. acima de 10 pessoas: colunas Até 10 / Acima de 10 (Nota 5) / Total', () => {
  const p = projeto({ sistemasPorEstrutura: { e1: { brigada: true } } })
  p.pavimentos[0].populacaoFixa = '40'
  p.pavimentos.push({ ...p.pavimentos[0], id: 'p2', label: 'Pavimento 2', tipo: 'tipo', pisoDescarga: false, populacaoFixa: '5' })
  const blocos = secao(gerar(p), '12.').linhas.find(l => l.tipo === 'obs' && l.label === 'DIMENSIONAMENTO:').blocos
  const [ref, res] = blocos.filter(b => b.tipo === 'tabela')
  assert.deepEqual(ref.colunas, ['Divisão', 'Grau de risco', 'Até 6', 'Até 10', 'Acima de 10'])
  assert.deepEqual(res.colunas, ['Pavimento', 'Divisão', 'Risco', 'Pop. fixa', 'Até 10', 'Acima de 10 (Nota 5)', 'Total'])
  const [terreo, pav2] = res.linhas
  const [base, acima, total] = terreo.slice(4)
  assert.equal(acima, '2')                                          // só o resultado (C-1, risco baixo: grupos de até 20)
  assert.equal(Number(total), Number(base) + 2)
  assert.equal(pav2[5], '—')
})

test('12. carga horária pela Tabela B.2 (maior nível exigido) e simulados com 12 meses por padrão', () => {
  const p = projeto({ sistemasPorEstrutura: { e1: { brigada: true } } })
  p.pavimentos[0].populacaoFixa = '8'
  const s = secao(gerar(p), '12.')
  assert.equal(valorCampo(s, 'Carga horária mínima do treinamento (conforme nível de treinamento):'), '4 horas')   // nível básico
  assert.equal(valorCampo(s, 'Tempo entre simulados na edificação (máximo a cada 12 meses):'), '12 meses')
  p.memorialPB = { brigadaIntervaloSimulados: '6 meses' }
  assert.equal(valorCampo(secao(gerar(p), '12.'), 'Tempo entre simulados na edificação (máximo a cada 12 meses):'), '6 meses')
})

test('brigada: maior grau de risco e maior nível entre os pavimentos', async () => {
  const { maiorRisco, maiorNivel } = await server.ssrLoadModule('/src/data/brigada_calc.js')
  assert.equal(maiorRisco(['baixo', null, 'alto', 'medio']), 'alto')
  assert.equal(maiorRisco([]), null)
  const n = nivel => ({ nivel, label: nivel })
  assert.equal(maiorNivel([n('basico'), n('avancado'), n('intermediario')]).nivel, 'avancado')
  assert.equal(maiorNivel([n('misto'), n('intermediario')]).nivel, 'intermediario')
  assert.equal(maiorNivel([null, { nivel: null, dinamico: true, label: 'A confirmar (Nota 8)' }]).label, 'A confirmar (Nota 8)')
})
