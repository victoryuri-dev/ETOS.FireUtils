import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'

const server = await createServer({server:{middlewareMode:true}, appType:'custom'})
after(() => server.close())
const { buildFormularioPB } = await server.ssrLoadModule('/src/data/memorial/PB/formulario.js')
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

test('sem a tabela de exigências (fallback offline), exigibilidade fica em aberto, exceto no mínimo de referência', () => {
  const f = gerar(projeto())
  assert.equal(f.temTabelaExigencias, false)
  const exig = prefixo => secao(f, prefixo).linhas.find(l => l.tipo === 'exigivel').exigivel
  assert.equal(exig('10.'), true)     // saída de emergência — mínimo de referência
  assert.equal(exig('17.'), null)     // hidrantes — não dá pra afirmar "não exigível"
  assert.equal(exig('19.'), null)     // SPDA — sem regra no app
})

test('saídas de emergência saem do dimensionamento do projeto', () => {
  const s = secao(gerar(projeto()), '10.')
  assert.equal(valorCampo(s, 'Capacidade de público (pessoas) total da edificação:'), '60') // 300 m² / 5 m²/pessoa
  assert.ok(valorCampo(s, 'Largura (metros) dos acessos e descargas:'))
  assert.ok(valorCampo(s, 'Distanciamento (metros) máximo a ser percorrido no piso de descarga:').includes('C-1'))
})

test('atestos só aparecem marcados quando o RT marca', () => {
  assert.equal(marcados(secao(gerar(projeto()), '10.')).length, 0)
  const s = secao(gerar(projeto({ memorialPB:{ atestos:{ se_guardas_5_8:true } } })), '10.')
  assert.deepEqual(marcados(s), ['As guardas e corrimãos atendem aos requisitos do item 5.8 da NT 12'])
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
  const stub = `export const getNormaRemota = (uf, s) => (uf === 'PB' && s === 'medidas_seguranca' ? { limiares: { areaMin: 750, alturaMin: 12 }, medidas: {} } : null)
export const sistemaExisteNoCatalogo = () => false
export const carregarNormasRemotas = async () => {}
export const carregarCatalogoNormas = async () => {}
export const normasCarregadas = () => true`
  const srv = await createServer({ server:{ middlewareMode:true, hmr:false }, appType:'custom', plugins:[{
    name:'stub-normas-remotas', enforce:'pre',
    resolveId: id => (id.endsWith('lib/normasRemote') || id.endsWith('lib/normasRemote.js') ? '\0stub-normas' : null),
    load: id => (id === '\0stub-normas' ? stub : null),
  }] })
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
  const stub = `const LINHA = ${linha}
export const getNormaRemota = (uf, s) => (uf === 'PB' && s === 'medidas_seguranca' ? LINHA : null)
export const sistemaExisteNoCatalogo = () => false
export const carregarNormasRemotas = async () => {}
export const carregarCatalogoNormas = async () => {}
export const normasCarregadas = () => true`
  const srv = await createServer({ server:{ middlewareMode:true, hmr:false }, appType:'custom', plugins:[{
    name:'stub-normas-pb', enforce:'pre',
    resolveId: id => (id.endsWith('lib/normasRemote') || id.endsWith('lib/normasRemote.js') ? '\0stub-normas-pb' : null),
    load: id => (id === '\0stub-normas-pb' ? stub : null),
  }] })
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
    const { buildFormularioPB: build } = await srv.ssrLoadModule('/src/data/memorial/PB/formulario.js')
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
