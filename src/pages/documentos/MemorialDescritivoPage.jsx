import { useRef, useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { buildMemorial } from '../../data/memorial/registry'
import { MEDIDAS_ANEXO_B_COL1, MEDIDAS_ANEXO_B_COL2, RISCOS_ESPECIAIS } from '../../utils/anexoB'
import { getCNAEsDivisao, getNts } from '../../data/normas/index'
import { edificacaoEhTerrea } from '../../data/trrf_calc'
import Icon from '../../components/ui/Icon'
import PreviewPaginado from '../../components/documentos/PreviewPaginado'
import MenuSecoes from '../../components/documentos/MenuSecoes'

// Memorial descritivo: um documento para impressão, uma pagina A4 por medida
// de seguranca (secao vinda de buildMemorial). Medidas ainda sem builder
// registrado (ver memorial/registry.js) simplesmente nao aparecem aqui.
//
// Numeracao progressiva (ABNT NBR 6024): comeca em 1 no Objetivo e segue ate a
// ultima secao; capa e Sumario nao sao numerados. O numero vem antes do
// titulo, separado por um unico espaco e sem ponto final ("1 OBJETIVO",
// "4.1 Refeitorio"). Gradacao: secao primaria (h1) em MAIUSCULAS e negrito;
// secundaria (h2) e terciaria (h3) em negrito, com maiusculas so nas iniciais.
// O Sumario e montado a partir dos titulos numerados (data-toc), e os numeros
// de pagina vem do Paged.js (target-counter) — ver montarSumario.
const SECAO_OBJETIVO = 1
const SECAO_LEGISLACAO = 2
const SECAO_SOBRE_EDIFICACAO = 3
const SECAO_CARACTERIZACAO = 4
const SECAO_MEDIDAS_APLICADAS = 5
const PRIMEIRA_SECAO_MEDIDA = 6

// Ate que nivel de titulo o Sumario lista (1 = so secoes primarias, 2 = ate as
// secundarias, 3 = ate as terciarias).
const NIVEL_MAXIMO_SUMARIO = 1

// Cada secao do memorial comeca numa pagina nova; o Paged.js (ver
// PreviewPaginado) divide o documento em folhas A4 reais, com margem de 25mm,
// e parte as secoes longas entre paginas — na tela e na impressao. Aqui a
// secao e so um bloco de conteudo, sem largura, sombra ou margem de folha.
const FOLHA = 'memorial-secao relative flex flex-col w-full bg-white text-black'

// CSS processado pelo Paged.js: pagina A4 com margem de 25mm e quebra de
// pagina por secao.
const CSS_PAGINA = `
@page { size: A4 portrait; margin: 25mm; }
.memorial-secao { break-after: page; min-height: 246mm; }
.memorial-secao:last-child { break-after: auto; }
`

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

// Titulo numerado do memorial. `nivel` (1-3) define a tag (h1-h3); `numero`
// ("4", "4.1", "4.1.1") entra antes do texto com um unico espaco. Titulos com
// numero ganham data-toc/data-toc-num, que o Sumario usa (montarSumario).
function Titulo({ nivel, numero, className = '', children }) {
  const Tag = `h${nivel}`
  return (
    <Tag
      className={`font-heading text-black ${className}`}
      data-toc={numero ? nivel : undefined}
      data-toc-num={numero || undefined}
    >
      {numero ? `${numero} ` : ''}{children}
    </Tag>
  )
}

// Nomes digitados em CAIXA ALTA (ex.: "REFEITÓRIO") viram "Refeitório" nos
// titulos secundarios/terciarios; texto que ja tem minusculas fica como esta.
const CONECTIVOS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'a', 'o', 'para', 'com'])
function tituloCase(texto) {
  if (!texto || texto !== texto.toUpperCase() || texto === texto.toLowerCase()) return texto
  return texto.toLowerCase().split(' ').map((p, i) =>
    (i > 0 && CONECTIVOS.has(p)) ? p : p.charAt(0).toUpperCase() + p.slice(1)
  ).join(' ')
}

// Numera os blocos de uma secao de medida: 'titulo2' vira N.M; 'titulo3' vira
// N.M.K. O memorial de hidrantes ja numera os proprios topicos ("7. Titulo" e
// "7.1 Trecho ...") — esses numeros sao aproveitados e apenas prefixados com
// o da secao, em vez de repetidos. Passos "1)" / "a)" de calculo mantem o
// marcador proprio, sem numero de secao.
function numerarBlocos(blocos, numeroSecao) {
  let n2 = 0
  let n3 = 0
  return blocos.map(b => {
    if (b.tipo === 'titulo2') {
      if (b.semNumero) {
        const m = b.texto.match(/^(\d+)\.\s+(.*)$/)
        if (!m) return b
        n2 = Number(m[1])
        n3 = 0
        return { ...b, numero: `${numeroSecao}.${n2}`, texto: m[2] }
      }
      n2 += 1
      n3 = 0
      return { ...b, numero: `${numeroSecao}.${n2}` }
    }
    if (b.tipo === 'titulo3') {
      const explicito = b.texto.match(/^(\d+(?:\.\d+)+)\s+(.*)$/)
      if (explicito) return { ...b, numero: `${numeroSecao}.${explicito[1]}`, texto: explicito[2] }
      if (/^(\d+|[a-z])\)\s/.test(b.texto) || n2 === 0) return b
      n3 += 1
      return { ...b, numero: `${numeroSecao}.${n2}.${n3}` }
    }
    return b
  })
}

// Preenche o Sumario (container [data-sumario]) numa COPIA do documento, antes
// do Paged.js paginar: uma linha por titulo numerado (ate NIVEL_MAXIMO_SUMARIO),
// com link pro titulo. O numero da pagina nasce como um espaco reservado (mesma
// largura do numero final, pra a paginacao nao mudar) e e preenchido depois de
// paginar, por preencherPaginasSumario.
function montarSumario(raiz) {
  const alvo = raiz.querySelector('[data-sumario]')
  if (!alvo) return
  const titulos = [...raiz.querySelectorAll('[data-toc]')].filter(h => Number(h.dataset.toc) <= NIVEL_MAXIMO_SUMARIO)
  alvo.replaceChildren(...titulos.map((h, i) => {
    const id = `sumario-${i}`
    h.id = id
    const numero = h.dataset.tocNum
    const texto = h.textContent.trim().slice(numero.length).trim()
    const a = document.createElement('a')
    a.href = `#${id}`
    a.className = `sumario-item sumario-n${h.dataset.toc}`
    const titulo = document.createElement('span')
    titulo.className = 'sumario-titulo'
    titulo.textContent = `${numero} ${texto}`
    const pontos = document.createElement('span')
    pontos.className = 'sumario-pontos'
    const pagina = document.createElement('span')
    pagina.className = 'sumario-pagina'
    pagina.textContent = '00'
    a.append(titulo, pontos, pagina)
    return a
  }))
}

// Titulos primarios ja paginados (nos elementos que estao na tela), pro menu
// flutuante de navegacao.
function coletarSecoes(destino) {
  return [...destino.querySelectorAll('h1[data-toc="1"]')].map(h => {
    const numero = h.dataset.tocNum
    return { id: h.id, numero, texto: h.textContent.trim().slice(numero.length).trim(), el: h }
  })
}

// Depois que o Paged.js paginou: cada linha do Sumario recebe o numero da
// pagina (contando a capa como 1) em que o titulo dela realmente caiu.
function preencherPaginasSumario(destino) {
  const paginas = [...destino.querySelectorAll('.pagedjs_page')]
  destino.querySelectorAll('.sumario-item').forEach(item => {
    const alvo = destino.querySelector(item.getAttribute('href'))
    const indice = alvo ? paginas.findIndex(p => p.contains(alvo)) : -1
    const campo = item.querySelector('.sumario-pagina')
    if (campo) campo.textContent = indice >= 0 ? String(indice + 1) : ''
  })
}

function Capa({ state }) {
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
        <p className="text-[13px] font-bold text-[#4D4D4F] uppercase tracking-[.04em] mt-2">
          Projeto de Prevenção e Combate a Incêndio
        </p>
      </div>

      <div className="text-center text-[12px] text-black flex flex-col gap-1.5 pb-8">
        {edificacao && <div><strong>Edificação:</strong> {edificacao}</div>}
        {enderecoCompleto && <div><strong>Endereço:</strong> {enderecoCompleto}</div>}
        {proprietario && <div><strong>Proprietário:</strong> {proprietario}</div>}
      </div>
    </div>
  )
}

function Sumario() {
  return (
    <div className={FOLHA}>
      <h1 className="font-heading text-black text-center mb-8">Sumário</h1>
      <div data-sumario/>
    </div>
  )
}

function Introducao({ sistemas, uf }) {
  const { NTS_PADRAO_MA, NT_CARGA_INCENDIO, NTS_POR_SISTEMA } = getNts(uf)
  const nts = Object.entries(sistemas || {})
    .filter(([, s]) => s.ativo || s.obrigatorio)
    .map(([key]) => NTS_POR_SISTEMA[key])
    .filter(Boolean)
    .concat([NT_CARGA_INCENDIO])
    .filter((nt, i, arr) => arr.findIndex(n => n.numero === nt.numero) === i)
    .sort((a, b) => parseInt(a.numero.replace(/\D/g, ''), 10) - parseInt(b.numero.replace(/\D/g, ''), 10))

  return (
    <div className={FOLHA}>
      <div className="mb-8">
        <Titulo nivel={1} numero={String(SECAO_OBJETIVO)} className="mb-3">Objetivo</Titulo>
        <p className="text-[12.5px] text-black leading-[1.85] text-justify">
          Memorial Técnico Descritivo apresentado ao Corpo de Bombeiros Militar do Estado do Maranhão (CBMMA), como
          requisito legal para análise, aprovação e regularização do Projeto de Segurança Contra Incêndio e Pânico da
          edificação.
        </p>
      </div>

      <div>
        <Titulo nivel={1} numero={String(SECAO_LEGISLACAO)} className="mb-3">Sobre a Legislação</Titulo>
        <div>
          <p className="text-[12.5px] text-black leading-[1.85] text-justify mb-3">
            O projeto foi desenvolvido atendendo as determinações do Decreto Estadual, que regulamenta a Lei, e que, por
            sua vez, dispõe sobre a segurança contra incêndio e pânico e dá outras providências. O projeto atende também
            as Normas Brasileiras (NBR&apos;s) da Associação Brasileira de Normas Técnicas (ABNT), assim como as
            seguintes instruções técnicas:
          </p>
          <ul className="text-[12px] text-black leading-[1.8] list-none pl-2">
            {NTS_PADRAO_MA.map(nt => (
              <li key={nt.numero} className="mb-1"><strong>{nt.numero}</strong> — {nt.nome}</li>
            ))}
            {nts.map(nt => (
              <li key={nt.numero} className="mb-1"><strong>{nt.numero}</strong> — {nt.nome}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Sem valor, o campo nem aparece — evita linhas tipo "Endereço: " em
// branco num documento que projetos "apenas dimensionamento" nunca
// preenchem (ver ProjetoContext.jsx tipoProjeto).
function CampoDiscriminado({ label, value }) {
  if (!value) return null
  return <div><strong>{label}:</strong> {value}</div>
}

function SobreEdificacao({ state }) {
  const endereco = enderecoCompletoDe(state, '')

  // Subitem só entra na numeração se tiver ao menos um campo preenchido —
  // assim "3.1, 3.2, 3.3" nunca pula um número quando um bloco some (ver
  // ProjetoContext.jsx tipoProjeto).
  const blocos = [
    { titulo: 'Responsável Técnico', campos: [
      ['Responsável Técnico', state.rtNome],
      ['Registro Profissional', state.rtConselho],
      ['Número da ART / RRT', state.usaArt ? state.artNumero : ''],
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

  return (
    <div className={FOLHA}>
      <Titulo nivel={1} numero={String(SECAO_SOBRE_EDIFICACAO)} className="mb-6">Sobre a Edificação</Titulo>

      {blocos.map((bloco, i) => (
        <div key={bloco.titulo} className="mb-5 last:mb-0">
          <Titulo nivel={2} numero={`${SECAO_SOBRE_EDIFICACAO}.${i + 1}`} className="mb-2">{tituloCase(bloco.titulo)}</Titulo>
          <div className="text-[12px] text-black leading-[1.9] pl-6">
            {bloco.campos.map(([label, value]) => (
              <CampoDiscriminado key={label} label={label} value={value}/>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Caracterizacao({ state, porEstrutura }) {
  return (
    <div className={FOLHA}>
      <Titulo nivel={1} numero={String(SECAO_CARACTERIZACAO)} className="mb-8">Caracterização da Edificação e do Risco</Titulo>

      {porEstrutura.map(({ estrutura: est }, estIdx) => {
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

        const alturaPisoPisoTxt = est.alturaPisoPiso === '' || est.alturaPisoPiso == null ? '' : `${est.alturaPisoPiso} m${edificacaoEhTerrea(est) ? ' (Edificação Térrea)' : ''}`

        return (
          <div key={est.id} className="mb-7">
            <Titulo nivel={2} numero={`${SECAO_CARACTERIZACAO}.${estIdx + 1}`} className="mb-2">{tituloCase(est.nome)}</Titulo>

            <div className="mb-4">
              <div className="border border-solid border-[#e5e7eb] rounded bg-[#f9fafb] flex text-[11.5px] text-black">
                <div className="flex-1 px-3 py-2.5 border-r border-solid border-[#e5e7eb]"><strong>Área construída:</strong> {est.areaTotal ? `${est.areaTotal} m²` : '—'}</div>
                <div className="flex-1 px-3 py-2.5 border-r border-solid border-[#e5e7eb]"><strong>Altura piso a piso:</strong> {alturaPisoPisoTxt || '—'}</div>
                <div className="flex-1 px-3 py-2.5"><strong>Altura total:</strong> {est.altura ? `${est.altura} m` : '—'}</div>
              </div>

              <p className="titulo-tabela mt-4 mb-2.5">Ocupações por pavimento</p>
              <table className={`${TABELA} table-fixed`}>
                <colgroup>
                  <col style={{ width: '30mm' }}/>
                  <col style={{ width: '20mm' }}/>
                  <col/>
                  <col style={{ width: '28mm' }}/>
                </colgroup>
                <thead>
                  <tr className={TABELA_THEAD}>
                    <th className={`${TABELA_TH} text-left`}>Pavimento</th>
                    <th className={`${TABELA_TH} text-left`}>Divisão</th>
                    <th className={`${TABELA_TH} text-left`}>CNAE / Atividade</th>
                    <th className={`${TABELA_TH} text-center`}>Carga de Incêndio</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.length === 0 ? (
                    <tr><td colSpan={4} className={`${TABELA_TD} text-center text-[#9ca3af]`}>Nenhuma ocupação classificada</td></tr>
                  ) : linhas.map((l, i) => {
                    const cargaQ = cargaDaOcupacao(state, est.id, l.divisao, l.cnae)
                    return (
                      <tr key={i} className={zebra(i)}>
                        <td className={TABELA_TD}>{l.pavimento}</td>
                        <td className={TABELA_TD}>{l.divisao}</td>
                        <td className={TABELA_TD}>{[l.cnae, l.cnaeDesc].filter(Boolean).join(' — ')}</td>
                        <td className={`${TABELA_TD} text-center`}>{cargaQ ? <>{cargaQ} MJ/m²<br/>{classificarCarga(cargaQ)}</> : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MedidasAplicadas({ state, sistemas, porEstrutura }) {
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

  return (
    <div className={FOLHA}>
      <Titulo nivel={1} numero={String(SECAO_MEDIDAS_APLICADAS)} className="mb-8 leading-[1.3]">Medidas de Segurança Contra Incêndio e Emergência do Projeto</Titulo>

      {multiplasEstruturas ? (
        <table className={`${TABELA} mb-8`}>
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
        <table className={`${TABELA} mb-8`}>
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
      )}

      {riscosAtivosGlobal.length > 0 && (
        <>
          <Titulo nivel={2} numero={`${SECAO_MEDIDAS_APLICADAS}.1`} className="mb-2">Riscos Especiais</Titulo>
          {multiplasEstruturas ? (
            <table className={TABELA}>
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
            <table className={TABELA}>
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
          )}
          {outrosDescsMultiplas.length > 0 && (
            <p className="text-[10.5px] text-black leading-[1.6] mt-1.5 mb-0">
              <strong>Outros (por estrutura):</strong> {outrosDescsMultiplas.join(' · ')}
            </p>
          )}
        </>
      )}
    </div>
  )
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

// Blocos de conteudo (opcionais, ver memorial/seg_estrutural.js) — permitem
// que uma secao troque paragrafo corrido por tabela/lista/campo quando isso
// deixa os valores mais faceis de achar (ex.: TRRF por pavimento). Secoes
// que so retornam `paragrafos` (ex.: acesso_viatura.js) continuam iguais.
function BlocoMedida({ bloco }) {
  switch (bloco.tipo) {
    // O numero ja vem calculado em `bloco.numero` (ver numerarBlocos).
    case 'titulo2':
      return <Titulo nivel={2} numero={bloco.numero} className="mt-5 mb-2 first:mt-0">{tituloCase(bloco.texto)}</Titulo>
    case 'titulo3':
      return <Titulo nivel={3} numero={bloco.numero} className="mt-4 mb-2">{bloco.texto}</Titulo>
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

function SecaoMedida({ secao, numeroSecao }) {
  return (
    <div className={FOLHA}>
      <Titulo nivel={1} numero={String(numeroSecao)} className="mb-8">{secao.titulo}</Titulo>

      {secao.blocos
        ? numerarBlocos(secao.blocos, numeroSecao).map((b, i) => <BlocoMedida key={i} bloco={b}/>)
        : secao.paragrafos.map((p, i) => (
            <p key={i} className="text-[12.5px] text-black leading-[1.85] text-justify mb-3 indent-8 pl-2">{p}</p>
          ))}
    </div>
  )
}

export default function MemorialDescritivoPage({ onBack }) {
  const { state }    = useProjeto()
  const { sistemas, porEstrutura } = useMedidasObrigatorias()
  const secoes = buildMemorial(state, sistemas, porEstrutura)
  const rolagemRef = useRef(null)
  const [indice, setIndice] = useState([])
  const aposPaginar = destino => {
    preencherPaginasSumario(destino)
    setIndice(coletarSecoes(destino))
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-none">
      <div className="no-print shrink-0 flex items-center justify-between py-3 px-8 border-b border-solid border-border bg-none">
        <button className="btn-ghost" onClick={onBack}>
          <Icon name="left" size={13}/> Voltar
        </button>
        <button className="btn-primary" onClick={() => window.print()} disabled={!secoes.length}>
          <Icon name="file" size={13}/> Imprimir / Salvar PDF
        </button>
      </div>

      <div className="relative flex-1 min-h-0 flex flex-col">
      <MenuSecoes secoes={indice} rolagemRef={rolagemRef}/>
      <div ref={rolagemRef} className="flex-1 overflow-y-auto py-8 flex flex-col">
        {!secoes.length ? (
          <div className="max-w-[600px] mx-auto py-16 px-10 text-center border border-dashed border-border rounded-lg text-ink-faint text-[13px]">
            Nenhuma medida com memorial disponível ainda. Preencha o dimensionamento de uma medida (ex.: Acesso de Viatura) para gerar as páginas aqui.
          </div>
        ) : (
          <PreviewPaginado css={CSS_PAGINA} prepararConteudo={montarSumario} aposPaginar={aposPaginar}>
            <Capa state={state}/>
            <Sumario/>
            <Introducao sistemas={sistemas} uf={state.uf}/>
            <SobreEdificacao state={state}/>
            <Caracterizacao state={state} porEstrutura={porEstrutura}/>
            <MedidasAplicadas state={state} sistemas={sistemas} porEstrutura={porEstrutura}/>
            {secoes.map((secao, i) => (
              <SecaoMedida key={i} secao={secao} numeroSecao={PRIMEIRA_SECAO_MEDIDA + i}/>
            ))}
          </PreviewPaginado>
        )}
      </div>
      </div>
    </div>
  )
}
