import { useLayoutEffect, useRef, useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { buildMemorial } from '../../data/memorial/registry'
import { MEDIDAS_ANEXO_B_COL1, MEDIDAS_ANEXO_B_COL2, RISCOS_ESPECIAIS } from '../../utils/anexoB'
import { getCNAEsDivisao, getOcupacoes, getNts } from '../../data/normas/index'
import Icon from '../../components/ui/Icon'

// Memorial descritivo: um documento para impressão, montado em folhas A4.
// Medidas ainda sem builder registrado (ver memorial/registry.js) nao
// aparecem aqui.
//
// A ordem das secoes e fixa (Capa, Sumario, Objetivo + Legislacao, Sobre a
// Edificacao, Caracterizacao, Medidas Aplicadas, uma secao por medida), mas
// QUANTAS folhas cada uma ocupa nao e: o conteudo depende do projeto, entao
// o numero de paginas so se sabe depois de medir as alturas no navegador
// (ver usePaginacao). Por isso nao ha constante de numero de pagina aqui.

// Numeracao dos topicos (1., 1.1, 2. ...), independente da paginacao: e a
// ordem dos assuntos no documento, nao das folhas. Objetivo e Legislacao,
// por exemplo, sao dois topicos que costumam dividir a mesma folha.
const SECAO_OBJETIVO = 1
const SECAO_LEGISLACAO = 2
const SECAO_SOBRE_EDIFICACAO = 3
const SECAO_CARACTERIZACAO = 4
const SECAO_MEDIDAS_APLICADAS = 5
const PRIMEIRA_SECAO_MEDIDA = 6

// Cada pagina do memorial e uma folha A4 independente (210x297mm) na tela e
// no impresso — so a sombra/arredondamento e o espaco entre folhas somem na
// impressao. As margens (3cm topo/inferior, 2cm nas laterais) moram aqui, no
// padding da folha; a @page "memorial" (index.css) fica com margem 0
// justamente pra nao somar por cima. Uma fonte de verdade so: o que aparece
// na tela e o que sai impresso.
const MARGEM_V_MM = 30
const MARGEM_H_MM = 20
const ALTURA_CONTEUDO_MM = 297 - MARGEM_V_MM * 2
const LARGURA_CONTEUDO_MM = 210 - MARGEM_H_MM * 2

const FOLHA = 'memorial-secao relative flex flex-col w-[210mm] h-[297mm] overflow-hidden mx-auto mb-8 print:mb-0 bg-white text-black shadow-[0_4px_24px_rgba(0,0,0,.35)] print:shadow-none rounded-lg print:rounded-none pt-[3cm] pr-[2cm] pb-[3cm] pl-[2cm]'

// Numero da pagina no rodape, dentro da faixa de margem inferior — alinhado
// a direita pela mesma margem lateral. `absolute` se posiciona pela borda da
// folha, nao pelo padding dela, dai os insets repetirem as margens.
const NUM_PAGINA = 'absolute bottom-[1.5cm] right-[2cm] text-[10px] text-[#8a8a8c]'

// Estilo unico de tabela do memorial — cabecalho cinza, zebra nas linhas e
// borda clara. Centralizado aqui pra que as tabelas das medidas, do Anexo de
// medidas aplicadas e da caracterizacao nao divirjam com o tempo.
const TABELA = 'w-full border-collapse text-[10.5px] text-black'
const TABELA_THEAD = 'bg-[#f3f4f6]'
const TABELA_TH = 'border border-solid border-[#d1d5db] px-2.5 py-2 font-bold'
const TABELA_TD = 'border border-solid border-[#d1d5db] px-2.5 py-2'
const zebra = i => (i % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]')

// Mesmos limiares de classificacao de risco usados no dashboard do projeto
// (DashboardPage.jsx: getCargaCls/getCargaLbl) — mantidos aqui com a
// redacao curta que o memorial usa ("Baixo Risco" em vez de "Risco baixo · Classe I").
function classificarCarga(q) {
  return q <= 300 ? 'Baixo Risco' : q <= 1200 ? 'Médio Risco' : 'Alto Risco'
}

function enderecoCompletoDe(state, fallback = '[Rua, Número, Bairro, Cidade – UF, CEP]') {
  const linha = [state.endereco, state.numero].filter(Boolean).join(', ')
  return [linha, state.complemento, state.bairro, [state.cidade, state.uf].filter(Boolean).join(' – '), state.cep]
    .filter(Boolean).join(', ') || fallback
}

// Carga de incendio de uma ocupacao (divisao + CNAE) numa estrutura — mesma
// logica do getCarga() do Step5.jsx: com metodo "tabela" o valor vem do
// catalogo de CNAEs da divisao (state.cargaState[estruturaId][divisao]
// .cargaIncendio so e preenchido quando o usuario troca de metodo
// manualmente, entao nao da pra confiar só nele — teria ficado null e a
// carga sumiria da tabela).
function cargaDaOcupacao(state, estruturaId, divisao, cnae) {
  const c = state.cargaState?.[estruturaId]?.[divisao]
  if (c?.metodo === 'levantamento') return parseFloat(c.valorManual) || 0
  const daCatalogo = cnae ? getCNAEsDivisao(state.uf, divisao)[cnae]?.cargaIncendio : null
  return daCatalogo || c?.cargaIncendio || 0
}

// Descricao oficial da divisao (ex.: "C-1" -> "Comercio com baixa carga de incendio")
function descricaoDivisao(state, divisao) {
  if (!divisao) return ''
  const grupo = getOcupacoes(state.uf)[divisao.charAt(0)]
  return grupo?.divisoes?.[divisao] || ''
}

function numeroPagina(atual, total) {
  return `${String(atual).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
}

// Uma folha A4 ja com o rodape. O conteudo vai num bloco `shrink-0` porque a
// folha e flex-column de altura fixa: sem isso o flex comprimiria o conteudo
// pra caber, em vez de deixar o paginador decidir o corte.
function Folha({ pagina, totalPaginas, children }) {
  return (
    <div className={FOLHA}>
      <div className="shrink-0">{children}</div>
      <div className={NUM_PAGINA}>{numeroPagina(pagina, totalPaginas)}</div>
    </div>
  )
}

function Capa({ state, totalPaginas }) {
  // Nome do projeto é o único campo garantido em qualquer modo de projeto
  // (ver ProjetoContext.jsx tipoProjeto) — os demais só aparecem se
  // preenchidos, sem placeholder entre colchetes no documento final.
  const edificacao = state.respFantasia || state.respRazaoSocial || state.nome || ''
  const enderecoCompleto = enderecoCompletoDe(state, '')
  const proprietario = state.propNome || ''
  const temContato = state.respCNPJ || state.respTelefone

  return (
    <div className={FOLHA}>
      <div className="flex flex-col items-start gap-2">
        <div className="w-[150px] h-[60px] border border-dashed border-[#c9c9cb] bg-[#eeeeef] flex items-center justify-center text-center px-2">
          <span className="text-[10px] font-bold text-[#8a8a8c] uppercase tracking-[.04em]">Logo da empresa</span>
        </div>
        {temContato && (
          <div className="text-[10.5px] text-black leading-relaxed">
            {state.respCNPJ && <div>CNPJ: {state.respCNPJ}</div>}
            {state.respTelefone && <div>Telefone: {state.respTelefone}</div>}
          </div>
        )}
      </div>

      <div className="text-center my-auto py-16">
        <h1 className="font-heading text-[26px] font-bold text-black uppercase tracking-[.02em]">Memorial Descritivo</h1>
        <p className="text-[13px] font-semibold text-[#4D4D4F] uppercase tracking-[.04em] mt-2">
          Projeto de Prevenção e Combate a Incêndio
        </p>
      </div>

      <div className="text-center text-[12px] text-black flex flex-col gap-1.5 pb-8">
        {edificacao && <div><strong>Edificação:</strong> {edificacao}</div>}
        {enderecoCompleto && <div><strong>Endereço:</strong> {enderecoCompleto}</div>}
        {proprietario && <div><strong>Proprietário:</strong> {proprietario}</div>}
      </div>

      <div className={NUM_PAGINA}>{numeroPagina(1, totalPaginas)}</div>
    </div>
  )
}

const TITULO_SUMARIO = (
  <h1 className="font-heading text-[20px] font-bold text-black uppercase tracking-[.04em] text-center mt-10 mb-16">Sumário</h1>
)

// Uma linha do sumario = um bloco, auto-suficiente (largura e espacamento na
// propria linha, sem container em volta) pra que o paginador possa cortar a
// lista entre folhas num memorial com muitas medidas.
function blocosSumario(topicos) {
  return topicos.map((t, i) => (
    <div key={i} className="flex items-baseline gap-2 text-[12.5px] text-black max-w-[480px] mx-auto mb-3.5">
      <span className="font-heading font-medium uppercase tracking-[.02em]">{t.titulo}</span>
      <span className="flex-1 border-b border-dotted border-[#8a8a8c] translate-y-[-3px]"/>
      <span>{String(t.pagina).padStart(2, '0')}</span>
    </div>
  ))
}

function blocosIntroducao({ sistemas, uf }) {
  const { NTS_PADRAO_MA, NT_CARGA_INCENDIO, NTS_POR_SISTEMA } = getNts(uf)
  const nts = Object.entries(sistemas || {})
    .filter(([, s]) => s.ativo || s.obrigatorio)
    .map(([key]) => NTS_POR_SISTEMA[key])
    .filter(Boolean)
    .concat([NT_CARGA_INCENDIO])
    .filter((nt, i, arr) => arr.findIndex(n => n.numero === nt.numero) === i)
    .sort((a, b) => parseInt(a.numero.replace(/\D/g, ''), 10) - parseInt(b.numero.replace(/\D/g, ''), 10))

  return [
    <div key="objetivo" className="mb-8">
      <h2 className="font-heading text-[14px] font-bold text-black mb-3">
        <span className="text-[#6b7280]">{SECAO_OBJETIVO}.</span> Objetivo
      </h2>
      <p className="text-[12.5px] text-black leading-[1.85] text-justify">
        Memorial Técnico Descritivo apresentado ao Corpo de Bombeiros Militar do Estado do Maranhão (CBMMA), como
        requisito legal para análise, aprovação e regularização do Projeto de Segurança Contra Incêndio e Pânico da
        edificação.
      </p>
    </div>,
    <div key="legislacao">
      <h2 className="font-heading text-[14px] font-bold text-black mb-3">
        <span className="text-[#6b7280]">{SECAO_LEGISLACAO}.</span> Sobre a Legislação
      </h2>
      <p className="text-[12.5px] text-black leading-[1.85] text-justify mb-3">
        O projeto foi desenvolvido atendendo as determinações do Decreto Estadual, que regulamenta a Lei, e que, por
        sua vez, dispõe sobre a segurança contra incêndio e pânico e dá outras providências. O projeto atende também
        as Normas Brasileiras (NBR&apos;s) da Associação Brasileira de Normas Técnicas (ABNT), assim como as
        seguintes instruções técnicas:
      </p>
    </div>,
    // Cada NT e um bloco solto: a lista cresce com o numero de medidas do
    // projeto e precisa poder virar a folha no meio.
    ...NTS_PADRAO_MA.concat(nts).map(nt => (
      <div key={nt.numero} className="text-[12px] text-black leading-[1.8] pl-2 mb-1">
        <strong>{nt.numero}</strong> — {nt.nome}
      </div>
    )),
  ]
}

// Sem valor, o campo nem aparece — evita linhas tipo "Endereço: " em
// branco num documento que projetos "apenas dimensionamento" nunca
// preenchem (ver ProjetoContext.jsx tipoProjeto).
function CampoDiscriminado({ label, value }) {
  if (!value) return null
  return <div><strong>{label}:</strong> {value}</div>
}

function blocosSobreEdificacao({ state }) {
  const endereco = enderecoCompletoDe(state, '')

  // Subitem só entra na numeração se tiver ao menos um campo preenchido —
  // assim "3.1, 3.2, 3.3" nunca pula um número quando um bloco some (ver
  // ProjetoContext.jsx tipoProjeto).
  const blocos = [
    { titulo: 'Responsável Técnico', campos: [
      ['Responsável Técnico', state.rtNome],
      ['Registro Profissional', state.rtConselho],
      ['Número da ART / RRT', state.artNumero],
    ] },
    { titulo: 'Responsável pelo Uso', campos: [
      ['Razão Social', state.respRazaoSocial],
      ['Nome Fantasia', state.respFantasia],
      ['CNPJ', state.respCNPJ],
      ['Telefone', state.respTelefone],
      ['E-mail', state.respEmail],
    ] },
    { titulo: 'Proprietário do Imóvel', campos: [
      ['Nome / Razão Social', state.propNome],
      ['CPF / CNPJ', state.propDocumento],
      ['Telefone', state.propTelefone],
      ['E-mail', state.propEmail],
    ] },
    { titulo: 'Dados do Imóvel', campos: [
      ['Endereço', endereco],
      ['Área construída total', state.areaConstruidaTotal ? `${state.areaConstruidaTotal} m²` : ''],
      ['Área do terreno', state.areaTerreno ? `${state.areaTerreno} m²` : ''],
    ] },
  ].filter(b => b.campos.some(([, v]) => v))

  return blocos.map((bloco, i) => (
    <div key={bloco.titulo} className="mb-5">
      <h2 className="font-heading text-[13px] font-bold text-black mb-2">
        <span className="text-[#6b7280]">{SECAO_SOBRE_EDIFICACAO}.{i + 1}</span> {bloco.titulo}
      </h2>
      <div className="text-[12px] text-black leading-[1.9] pl-6">
        {bloco.campos.map(([label, value]) => (
          <CampoDiscriminado key={label} label={label} value={value}/>
        ))}
      </div>
    </div>
  ))
}

function blocosCaracterizacao({ state, porEstrutura }) {
  return porEstrutura.map(({ estrutura: est }, estIdx) => {
    const pavsEst = state.pavimentos.filter(p => p.estruturaId === est.id)

    // Uma linha por ocupacao: a principal de cada pavimento, mais uma
    // por uso adicional (p.acess) — uma estrutura pode ter varios
    // pavimentos e cada pavimento pode ter mais de uma ocupacao.
    const linhas = []
    pavsEst.forEach(p => {
      if (p.divisao) linhas.push({ pavimento: p.label, divisao: p.divisao, cnae: p.cnae, cnaeDesc: p.cnaeDesc })
      p.acess?.forEach(a => {
        if (a.divisao) linhas.push({ pavimento: `${p.label} (uso adicional)`, divisao: a.divisao, cnae: a.cnae, cnaeDesc: a.cnaeDesc })
      })
    })

    const alturaPisoPisoTxt = est.alturaPisoPiso === '' || est.alturaPisoPiso == null ? '' : `${est.alturaPisoPiso} m`

    return (
      <div key={est.id} className="mb-7">
        <h2 className="font-heading text-[13px] font-bold text-black mb-2">
          <span className="text-[#6b7280]">{SECAO_CARACTERIZACAO}.{estIdx + 1}</span> {est.nome}
        </h2>

        <div className="mb-4">
          <div className="border border-solid border-[#e5e7eb] rounded bg-[#f9fafb] flex text-[11.5px] text-black">
            <div className="flex-1 px-3 py-2.5 border-r border-solid border-[#e5e7eb]"><strong>Área construída:</strong> {est.areaTotal ? `${est.areaTotal} m²` : '—'}</div>
            <div className="flex-1 px-3 py-2.5 border-r border-solid border-[#e5e7eb]"><strong>Altura piso a piso:</strong> {alturaPisoPisoTxt || '—'}</div>
            <div className="flex-1 px-3 py-2.5"><strong>Altura total:</strong> {est.altura ? `${est.altura} m` : '—'}</div>
          </div>

          <h3 className="font-heading text-[12px] font-bold text-black mt-4 mb-2.5">Ocupações Identificadas</h3>
          <table className={TABELA}>
            <thead>
              <tr className={TABELA_THEAD}>
                <th className={`${TABELA_TH} text-left w-[135px]`}>Pavimento</th>
                <th className={`${TABELA_TH} text-left`}>Divisão</th>
                <th className={`${TABELA_TH} text-left`}>CNAE / Atividade</th>
                <th className={`${TABELA_TH} text-center w-[120px]`}>Carga de Incêndio</th>
              </tr>
            </thead>
            <tbody>
              {linhas.length === 0 ? (
                <tr><td colSpan={4} className={`${TABELA_TD} text-center text-[#9ca3af]`}>Nenhuma ocupação classificada</td></tr>
              ) : linhas.map((l, i) => {
                const cargaQ = cargaDaOcupacao(state, est.id, l.divisao, l.cnae)
                const desc = descricaoDivisao(state, l.divisao)
                return (
                  <tr key={i} className={zebra(i)}>
                    <td className={TABELA_TD}>{l.pavimento}</td>
                    <td className={TABELA_TD}>{[l.divisao, desc].filter(Boolean).join(' — ')}</td>
                    <td className={TABELA_TD}>{[l.cnae, l.cnaeDesc].filter(Boolean).join(' — ')}</td>
                    <td className={`${TABELA_TD} text-center`}>{cargaQ ? `${cargaQ} MJ/m² - ${classificarCarga(cargaQ)}` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  })
}

function blocosMedidasAplicadas({ state, sistemas, porEstrutura }) {
  const medidas = [...MEDIDAS_ANEXO_B_COL1, ...MEDIDAS_ANEXO_B_COL2]
    .filter(m => m.key && (sistemas[m.key]?.ativo || sistemas[m.key]?.obrigatorio))
    .map(m => m.key === 'central_gas' ? { ...m, label: 'Central GLP' } : m)
  const riscosPorEstrutura = state.riscosEspeciaisPorEstrutura || {}
  const outrosDescPorEstrutura = state.riscosOutrosDescPorEstrutura || {}
  const riscosAtivosGlobal = RISCOS_ESPECIAIS
    .filter(r => porEstrutura.some(pe => !!riscosPorEstrutura[pe.estrutura.id]?.[r.key]))
  const multiplasEstruturas = porEstrutura.length > 1
  // Estrutura unica: reaproveita o riscos dessa unica estrutura pra manter o
  // rotulo "Outros: <descricao>" embutido, como antes.
  const unicaEst = porEstrutura[0]?.estrutura
  const riscosAtivosUnica = multiplasEstruturas ? [] : RISCOS_ESPECIAIS
    .filter(r => unicaEst && !!riscosPorEstrutura[unicaEst.id]?.[r.key])
    .map(r => (r.key === 'outros' && outrosDescPorEstrutura[unicaEst.id]) ? `${r.label}: ${outrosDescPorEstrutura[unicaEst.id]}` : r.label)
  const outrosDescsMultiplas = multiplasEstruturas
    ? porEstrutura
        .filter(pe => riscosPorEstrutura[pe.estrutura.id]?.outros && outrosDescPorEstrutura[pe.estrutura.id])
        .map(pe => `${pe.estrutura.nome}: ${outrosDescPorEstrutura[pe.estrutura.id]}`)
    : []

  return [
    multiplasEstruturas ? (
      <table key="medidas" className={`${TABELA} mb-8`}>
        <thead>
          <tr className={TABELA_THEAD}>
            <th className={`${TABELA_TH} text-left`}>Medidas de Segurança Aplicadas</th>
            {porEstrutura.map(({ estrutura: est }) => (
              <th key={est.id} className={`${TABELA_TH} w-[70px]`}>{est.nome}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {medidas.map((m, i) => (
            <tr key={m.key} className={zebra(i)}>
              <td className={TABELA_TD}>{m.label}</td>
              {porEstrutura.map(pe => (
                <td key={pe.estrutura.id} className={`${TABELA_TD} text-center text-[16px] font-bold leading-none`}>
                  {pe.sistemas[m.key]?.ativo ? 'X' : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <table key="medidas" className={`${TABELA} mb-8`}>
        <thead>
          <tr className={TABELA_THEAD}>
            <th className={`${TABELA_TH} text-left`}>Medidas de Segurança Aplicadas</th>
          </tr>
        </thead>
        <tbody>
          {medidas.map((m, i) => (
            <tr key={m.key} className={zebra(i)}>
              <td className={TABELA_TD}>{m.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),

    ...(riscosAtivosGlobal.length === 0 ? [] : [
        <h2 key="riscos-titulo" className="font-heading text-[12px] font-bold text-black uppercase tracking-[.03em] mb-2">Riscos Especiais</h2>,
        multiplasEstruturas ? (
          <table key="riscos" className={TABELA}>
            <thead>
              <tr className={TABELA_THEAD}>
                <th className={`${TABELA_TH} text-left`}>Risco Especial</th>
                {porEstrutura.map(({ estrutura: est }) => (
                  <th key={est.id} className={`${TABELA_TH} w-[70px]`}>{est.nome}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {riscosAtivosGlobal.map((r, i) => (
                <tr key={r.key} className={zebra(i)}>
                  <td className={TABELA_TD}>{r.label}</td>
                  {porEstrutura.map(pe => (
                    <td key={pe.estrutura.id} className={`${TABELA_TD} text-center text-[16px] font-bold leading-none`}>
                      {riscosPorEstrutura[pe.estrutura.id]?.[r.key] ? 'X' : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table key="riscos" className={TABELA}>
            <thead>
              <tr className={TABELA_THEAD}>
                <th className={`${TABELA_TH} text-left`}>Risco Especial</th>
              </tr>
            </thead>
            <tbody>
              {riscosAtivosUnica.map((label, i) => (
                <tr key={i} className={zebra(i)}>
                  <td className={TABELA_TD}>{label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ),
        ...(outrosDescsMultiplas.length === 0 ? [] : [
          <p key="riscos-outros" className="text-[10.5px] text-black leading-[1.6] mt-1.5 mb-0">
            <strong>Outros (por estrutura):</strong> {outrosDescsMultiplas.join(' · ')}
          </p>,
        ]),
    ]),
  ]
}

// Texto de um item de bloco 'lista' (ver abaixo) — string simples (ex.: os
// avisos "estilo: alerta" de extintores.js/seg_estrutural.js) renderiza como
// está; { label, valor } (ex.: gerenciamento_risco.js) renderiza com o rotulo
// em negrito e o valor normal, igual ao bloco 'campo'.
function ListaItemTexto({ item }) {
  if (!item || typeof item !== 'object') return item
  if (!item.label) return item.texto ?? null
  return <><strong>{item.label}:</strong> <span className="whitespace-pre-line">{item.valor}</span></>
}

// Um nó do bloco 'organograma' (ver memorial/saida_emergencia.js) — raiz e
// Circulação em negrito/maiúsculo, ambiente em texto normal; filhos ficam
// recuados dentro de uma faixa com borda à esquerda, imitando o colchete
// que agrupa visualmente "o que esse nó alimenta" (sem limite de
// profundidade — Circulação pode ter outra Circulação dentro).
function OrganogramaNo({ no }) {
  return (
    <div className="mb-1 last:mb-0">
      <div className={no.bold
        ? 'font-heading text-[12.5px] font-bold text-black uppercase tracking-[.02em]'
        : 'text-[12px] text-black'
      }>
        {no.texto}
      </div>
      {no.sub?.length > 0 && (
        <div className="pl-4 ml-1 mt-1 pb-0.5 border-l border-solid border-[#999]">
          {no.sub.map((s, i) => <OrganogramaNo key={i} no={s}/>)}
        </div>
      )}
    </div>
  )
}

// Um <li> de bloco 'lista', com sub-lista recursiva (item.sub pode ter seus
// próprios itens com sub, sem limite de profundidade — ex.: riscos especiais
// com mais de uma estrutura viram Riscos > Estrutura > risco, 3 níveis).
function ListaLi({ item, estilo }) {
  return (
    <li className={
      estilo === 'alerta'
        ? 'text-[12px] text-black leading-[1.6] mb-1.5 pl-2.5 border-l-2 border-solid border-black font-medium'
        // 'lettered': o próprio texto já traz o prefixo ("a) ..." — ver
        // memorial/saida_emergencia.js), então sem marcador "•" duplicado.
        : estilo === 'lettered'
        ? 'text-[12px] text-black leading-[1.6] mb-1 pl-4'
        : "text-[12px] text-black leading-[1.6] mb-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#8a8a8c]"
    }>
      <ListaItemTexto item={item}/>
      {item?.sub?.length > 0 && (
        <ul className="list-none mt-1 ml-2">
          {item.sub.map((s, j) => <ListaLi key={j} item={s} estilo={estilo}/>)}
        </ul>
      )}
    </li>
  )
}

function escaparHtml(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Converte a notação de engenharia em texto simples (memorial/hidrantesCalculo.js,
// ex.: "Q^1,85", "P_hd01") em sobrescrito/subscrito de verdade — mesma
// conversão que o memorial.py do antigo plugin fazia (_sup/_sub) antes de
// virar HTML, só que aqui direto no bloco 'formula' do memorial do site.
function formatarFormula(texto) {
  let t = escaparHtml(texto)
  // Expoentes: "^1,85" ou "^−4,87" (inclui o sinal de menos unicode "−",
  // usado nos coeficientes de Hazen-Williams) -> <sup>1,85</sup>
  t = t.replace(/\^(−?-?[0-9]+(?:,[0-9]+)?)/g, (_, exp) => `<sup>${exp}</sup>`)
  // Subscritos: "P_hd01", "Q_hd02", "P_valv", "P_PA,alvo" -> P<sub>hd01</sub>
  // etc. — só letras/dígitos/vírgula depois do "_", pra não confundir com
  // separador de milhar nem cortar no meio de outra pontuação.
  t = t.replace(/\b([A-Za-zΔ∆]+)_([A-Za-z0-9,]+)\b/g, (_, base, sub) => `${base}<sub>${sub}</sub>`)
  return t
}

// Tipos que o BlocoMedida abaixo sabe desenhar. O paginador casa cada bloco
// com o no que ele gerou no DOM pela posicao, entao um bloco que nao renderiza
// nada desalinharia todos os seguintes — por isso os desconhecidos sao
// descartados antes de entrar na lista, e nao no switch.
const TIPOS_BLOCO = new Set([
  'titulo2', 'titulo3', 'paragrafo', 'formula', 'campo', 'tabela', 'lista', 'organograma',
])

// Blocos de conteudo (opcionais, ver memorial/seg_estrutural.js) — permitem
// que uma secao troque paragrafo corrido por tabela/lista/campo quando isso
// deixa os valores mais faceis de achar (ex.: TRRF por pavimento). Secoes
// que so retornam `paragrafos` (ex.: acesso_viatura.js) continuam iguais.
function BlocoMedida({ bloco, numeroBloco }) {
  switch (bloco.tipo) {
    // `semNumero` = o proprio builder ja numerou o topico (hidrantesCalculo.js
    // precisa disso porque os titulo3 dele citam esse numero) — prefixar de
    // novo aqui daria "15.1 1. Dados de Entrada".
    case 'titulo2':
      return <h2 className="font-heading text-[12px] font-bold text-black uppercase tracking-[.03em] mt-5 mb-2 first:mt-0">
        {!bloco.semNumero && <span className="text-[#6b7280]">{numeroBloco} </span>}
        {bloco.texto}
      </h2>
    // Sub-seção numerada dentro de um 'titulo2' (ex.: "6.1 Trecho HD01 ao
    // Ponto A", memorial/hidrantesCalculo.js) — o marcador ja vem no texto,
    // entao aqui e so o peso visual.
    case 'titulo3':
      return <h3 className="font-heading text-[12px] font-bold text-black mt-4 mb-2">{bloco.texto}</h3>
    case 'paragrafo':
      return <p className="text-[12.5px] text-black leading-[1.85] text-justify mb-3 indent-8">{bloco.texto}</p>
    // Equação em destaque (memorial/hidrantesCalculo.js) — texto em notação
    // de engenharia (Q^1,85, P_hd01 etc.), convertido pra sobrescrito/
    // subscrito de verdade (formatarFormula) — sem fração renderizada
    // (numerador/denominador em vez de "A / B" numa linha só), única
    // simplificação que o resto do memorial descritivo também não faz.
    case 'formula':
      return (
        <div
          className="text-[12px] text-black font-mono leading-[1.6] mb-3 pl-3 border-l-2 border-solid border-[#c9c9cb] whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: formatarFormula(bloco.texto) }}
        />
      )
    case 'campo':
      return <div className="text-[12px] text-black leading-[1.7] mb-1.5"><strong>{bloco.label}:</strong> <span className="whitespace-pre-line">{bloco.valor}</span></div>
    case 'tabela': {
      // th/td alinhados ao centro quando a tabela é majoritariamente
      // numérica (ex.: dimensionamento de Acesso/Saída) — colunas de
      // texto livre continuam usando `colunas`/alinhamento à esquerda.
      // `alinhas` (opcional, ex.: memorial/hidrantesCalculo.js) dá o
      // alinhamento POR COLUNA quando uma tabela mistura texto (rótulo à
      // esquerda) com números (valor à direita) — tem prioridade sobre
      // `centralizado` quando presente.
      const alinhamento = bloco.centralizado ? 'text-center' : 'text-left'
      const alinhaCol = i => (bloco.alinhas ? `text-${bloco.alinhas[i] || 'left'}` : alinhamento)
      return (
        <table className={`${TABELA} mb-4`} style={bloco.larguras ? { tableLayout: 'fixed' } : undefined}>
          {bloco.larguras && (
            <colgroup>
              {bloco.larguras.map((w, i) => <col key={i} style={{ width: w }}/>)}
            </colgroup>
          )}
          <thead>
            {/* `linhasCabecalho` (opcional) permite um cabeçalho com mais de
                uma linha e células mescladas horizontalmente (colSpan) — ex.:
                "POPULAÇÃO" | "ACESSO/DESCARGA" (3 colunas) | "PORTAS" (3
                colunas) numa linha, com CAPACIDADE/UP/LARGURA MÍNIMA embaixo
                de cada bloco na linha seguinte (ver memorial/saida_emergencia.js).
                Sem isso, cai no `colunas` de sempre (uma linha só). */}
            {bloco.linhasCabecalho
              ? bloco.linhasCabecalho.map((linha, i) => (
                  <tr key={i} className={TABELA_THEAD}>
                    {linha.map((c, j) => (
                      <th key={j} colSpan={c.colSpan} rowSpan={c.rowSpan} className={`${TABELA_TH} ${alinhamento}`}>{c.texto}</th>
                    ))}
                  </tr>
                ))
              : (
                <tr className={TABELA_THEAD}>
                  {bloco.colunas.map((c, i) => <th key={i} className={`${TABELA_TH} ${alinhaCol(i)}`}>{c}</th>)}
                </tr>
              )}
          </thead>
          <tbody>
            {/* Célula `null` = já coberta por um rowSpan de uma linha
                anterior (ver DIVISÃO na tabela de distâncias máximas em
                memorial/saida_emergencia.js) — não gera <td> nenhum pra
                não duplicar a coluna. Objeto `{ texto, rowSpan }` é uma
                célula normal que mescla verticalmente com as próximas
                `n-1` linhas nessa mesma posição. */}
            {bloco.linhas.map((linha, i) => (
              <tr key={i} className={zebra(i)}>
                {linha.map((cel, j) => {
                  if (cel === null) return null
                  const temRowSpan = cel && typeof cel === 'object' && 'texto' in cel
                  const conteudo = temRowSpan ? cel.texto : cel
                  return (
                    <td key={j} rowSpan={temRowSpan ? cel.rowSpan : undefined} className={`${TABELA_TD} ${alinhaCol(j)}`}>
                      {conteudo && typeof conteudo === 'object' && conteudo.tipo === 'imagem'
                        ? <img src={conteudo.src} alt={conteudo.alt || ''} className="w-9 h-9 object-contain block"/>
                        : conteudo}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
    case 'lista':
      return (
        <ul className="list-none mb-4">
          {bloco.itens.map((item, i) => <ListaLi key={i} item={item} estilo={bloco.estilo}/>)}
        </ul>
      )
    case 'organograma':
      return (
        <div className="mb-4">
          {/* mb-5 aqui (em vez de deixar só o mb-1 do próprio OrganogramaNo)
              separa uma árvore (Saída/Escada-Rampa raiz) da próxima com uma
              linha em branco — sem isso, a última Circulação de uma árvore
              encosta direto na raiz seguinte. */}
          {bloco.nos.map((no, i) => (
            <div key={i} className="mb-5 last:mb-0">
              <OrganogramaNo no={no}/>
            </div>
          ))}
        </div>
      )
    default:
      return null
  }
}

function blocosMedida({ secao, numeroSecao }) {
  let numeroBloco = 1

  if (!secao.blocos) {
    return secao.paragrafos.map((p, i) => (
      <p key={i} className="text-[12.5px] text-black leading-[1.85] text-justify mb-3 indent-8 pl-2">{p}</p>
    ))
  }
  return secao.blocos.filter(b => TIPOS_BLOCO.has(b.tipo)).map((b, i) => (
    <BlocoMedida
      key={i}
      bloco={b}
      numeroBloco={b.tipo === 'titulo2' && !b.semNumero ? `${numeroSecao}.${numeroBloco++}` : null}
    />
  ))
}

function tituloSecao(texto, numero) {
  return (
    <h1 className="font-heading text-[15px] font-bold text-black uppercase tracking-[.04em] mb-8">
      <span className="text-[#6b7280]">{numero}.</span> {texto}
    </h1>
  )
}

// Corta uma sequencia de blocos ja renderizados em folhas de `maxPx` de
// altura, usando a posicao real de cada um no DOM. `tops`/`fundo` vem de um
// container medido fora da tela; a altura ocupada por um bloco e a distancia
// ate o inicio do proximo, o que ja embute margem (inclusive as colapsadas,
// que somar marginTop+marginBottom contaria duas vezes).
//
// O titulo, quando existe, e o primeiro filho medido e conta so na primeira
// folha — dai a origem comecar em 0 e passar a ser o topo do bloco que abre
// cada folha seguinte.
function cortarEmFolhas(tops, fundo, maxPx, temTitulo) {
  const primeiro = temTitulo ? 1 : 0
  const fim = i => (i + 1 < tops.length ? tops[i + 1] : fundo)

  const folhas = []
  let atual = []
  let origem = 0
  for (let i = primeiro; i < tops.length; i++) {
    if (atual.length && fim(i) - origem > maxPx) {
      folhas.push(atual)
      atual = []
      origem = tops[i]
    }
    atual.push(i - primeiro)
  }
  folhas.push(atual)
  return folhas
}

// Mede as secoes fora da tela e devolve, pra cada uma, os indices de bloco de
// cada folha. Enquanto nao mediu, devolve null — o documento so e montado
// depois, porque a numeracao de pagina e o sumario dependem de quantas folhas
// cada secao ocupou.
function usePaginacao(secoes) {
  const medidorRef = useRef(null)
  const reguaRef = useRef(null)
  const [folhasPorSecao, setFolhasPorSecao] = useState(null)

  // Sem array de dependencias de proposito: os blocos sao elementos React
  // novos a cada render, entao nao ha dep estavel pra comparar. Em vez disso
  // a medicao roda sempre e so troca o estado quando o resultado muda, o que
  // encerra o ciclo no segundo render.
  useLayoutEffect(() => {
    const medidor = medidorRef.current
    const maxPx = reguaRef.current?.offsetHeight
    if (!medidor || !maxPx) return

    const proximo = Array.from(medidor.children).map(secaoEl => {
      const filhos = Array.from(secaoEl.children)
      return cortarEmFolhas(
        filhos.map(f => f.offsetTop),
        secaoEl.scrollHeight,
        maxPx,
        secaoEl.dataset.titulo === '1',
      )
    })

    setFolhasPorSecao(atual =>
      JSON.stringify(atual) === JSON.stringify(proximo) ? atual : proximo
    )
  })

  // Fora do fluxo e invisivel, mas renderizado de verdade (sem `display:none`,
  // que zeraria as alturas) e na largura util da folha, pra medir o mesmo
  // texto que sera impresso.
  const medidor = (
    <div aria-hidden className="fixed left-[-10000px] top-0 invisible pointer-events-none">
      <div ref={reguaRef} style={{ height: `${ALTURA_CONTEUDO_MM}mm` }}/>
      <div ref={medidorRef}>
        {secoes.map(secao => (
          // `relative` e obrigatorio: offsetTop e medido a partir do ancestral
          // posicionado, entao sem isso os blocos reportariam a posicao dentro
          // do medidor inteiro e cada secao herdaria a altura das anteriores.
          <div
            key={secao.id}
            data-titulo={secao.titulo ? '1' : '0'}
            className="relative"
            style={{ width: `${LARGURA_CONTEUDO_MM}mm` }}
          >
            {secao.titulo}
            {secao.blocos}
          </div>
        ))}
      </div>
    </div>
  )

  return { medidor, folhasPorSecao }
}

export default function MemorialDescritivoPage({ onBack }) {
  const { state }    = useProjeto()
  const { sistemas, porEstrutura } = useMedidasObrigatorias()
  const secoes = buildMemorial(state, sistemas, porEstrutura)

  // As secoes de conteudo, na ordem do documento. `sumario` lista os topicos
  // que apontam pra primeira folha da secao — Objetivo e Legislacao sao dois
  // topicos numa secao so, dai ser uma lista e nao um titulo unico.
  const conteudo = [
    {
      id: 'introducao',
      titulo: null,
      blocos: blocosIntroducao({ sistemas, uf: state.uf }),
      sumario: ['Objetivo', 'Sobre a Legislação'],
    },
    {
      id: 'sobre-edificacao',
      titulo: tituloSecao('Sobre a Edificação', SECAO_SOBRE_EDIFICACAO),
      blocos: blocosSobreEdificacao({ state }),
      sumario: ['Sobre a Edificação'],
    },
    {
      id: 'caracterizacao',
      titulo: tituloSecao('Caracterização da Edificação e do Risco', SECAO_CARACTERIZACAO),
      blocos: blocosCaracterizacao({ state, porEstrutura }),
      sumario: ['Caracterização da Edificação e do Risco'],
    },
    {
      id: 'medidas-aplicadas',
      titulo: tituloSecao('Medidas de Segurança Contra Incêndio e Emergência do Projeto', SECAO_MEDIDAS_APLICADAS),
      blocos: blocosMedidasAplicadas({ state, sistemas, porEstrutura }),
      sumario: ['Medidas de Segurança Aplicadas'],
    },
    ...secoes.map((secao, i) => ({
      id: `medida-${i}`,
      titulo: tituloSecao(secao.titulo, PRIMEIRA_SECAO_MEDIDA + i),
      blocos: blocosMedida({ secao, numeroSecao: PRIMEIRA_SECAO_MEDIDA + i }),
      sumario: [secao.titulo],
    })),
  ]

  // O sumario entra na medicao como uma secao qualquer: ele tambem pode
  // passar de uma folha, e o tamanho dele empurra a numeracao de todo o
  // resto. Os numeros ainda nao sao conhecidos aqui, mas a altura das linhas
  // nao depende deles — na segunda passada os valores certos entram sem
  // mudar o corte.
  const topicosProvisorios = conteudo.flatMap(s => s.sumario.map(titulo => ({ titulo, pagina: 0 })))
  const paraMedir = [
    { id: 'sumario', titulo: TITULO_SUMARIO, blocos: blocosSumario(topicosProvisorios) },
    ...conteudo,
  ]
  const { medidor, folhasPorSecao } = usePaginacao(paraMedir)

  if (!secoes.length) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden bg-none">
        <Barra onBack={onBack} podeImprimir={false}/>
        <div className="flex-1 overflow-y-auto py-8">
          <div className="max-w-[600px] mx-auto py-16 px-10 text-center border border-dashed border-border rounded-lg text-ink-faint text-[13px]">
            Nenhuma medida com memorial disponível ainda. Preencha o dimensionamento de uma medida (ex.: Acesso de Viatura) para gerar as páginas aqui.
          </div>
        </div>
      </div>
    )
  }

  // Capa (1) + folhas do sumario + folhas de cada secao de conteudo. Como o
  // sumario e a primeira entrada de `paraMedir`, os indices ficam deslocados
  // em 1 em relacao a `conteudo`.
  const folhasSumario = folhasPorSecao?.[0] ?? [[]]
  const folhasConteudo = conteudo.map((_, i) => folhasPorSecao?.[i + 1] ?? [[]])

  const primeiraPaginaDaSecao = []
  let proxima = 1 + 1 + folhasSumario.length // capa + sumario
  folhasConteudo.forEach(folhas => {
    primeiraPaginaDaSecao.push(proxima)
    proxima += folhas.length
  })
  const totalPaginas = proxima - 1

  const topicos = conteudo.flatMap((s, i) =>
    s.sumario.map(titulo => ({ titulo, pagina: primeiraPaginaDaSecao[i] }))
  )
  const linhasSumario = blocosSumario(topicos)

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-none">
      <Barra onBack={onBack} podeImprimir={!!folhasPorSecao}/>

      <div className="flex-1 overflow-y-auto py-8">
        {medidor}
        {/* Sem medicao ainda nao da pra numerar nada, entao a primeira passada
            nao desenha o documento — evita um flash com as paginas erradas. */}
        {folhasPorSecao && (
          <div className="print-area print-area-memorial">
            <Capa state={state} totalPaginas={totalPaginas}/>

            {folhasSumario.map((indices, f) => (
              <Folha key={`sumario-${f}`} pagina={2 + f} totalPaginas={totalPaginas}>
                {f === 0 && TITULO_SUMARIO}
                {linhasSumario.filter((_, i) => indices.includes(i))}
              </Folha>
            ))}

            {conteudo.map((secao, i) => folhasConteudo[i].map((indices, f) => (
              <Folha
                key={`${secao.id}-${f}`}
                pagina={primeiraPaginaDaSecao[i] + f}
                totalPaginas={totalPaginas}
              >
                {f === 0 && secao.titulo}
                {secao.blocos.filter((_, b) => indices.includes(b))}
              </Folha>
            )))}
          </div>
        )}
      </div>
    </div>
  )
}

function Barra({ onBack, podeImprimir }) {
  return (
    <div className="no-print shrink-0 flex items-center justify-between py-3 px-8 border-b border-solid border-border bg-none">
      <button className="btn-ghost" onClick={onBack}>
        <Icon name="left" size={13}/> Voltar
      </button>
      <button className="btn-primary" onClick={() => window.print()} disabled={!podeImprimir}>
        <Icon name="file" size={13}/> Imprimir / Salvar PDF
      </button>
    </div>
  )
}
