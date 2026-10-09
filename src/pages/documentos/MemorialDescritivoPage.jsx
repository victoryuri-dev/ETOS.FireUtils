import { Fragment, useEffect, useRef, useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { buildMemorial } from '../../data/memorial/registry'
import { MEDIDAS_ANEXO_B_COL1, MEDIDAS_ANEXO_B_COL2, RISCOS_ESPECIAIS, estadoMedidaSistema } from '../../utils/anexoB'
import { getCNAEsDivisao, getNts } from '../../data/normas/index'
import { edificacaoEhTerrea } from '../../data/trrf_calc'
import { fmtNum, fmtUn } from '../../utils/numero'
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

// Secoes do memorial fluem livremente pelo Paged.js (ver PreviewPaginado):
// a maioria das medidas de seguranca (texto curto, caso comum de Acesso de
// Viatura, Compartimentacao etc.) nao forca quebra de pagina propria e cabe
// empilhada com a seguinte na mesma folha A4, economizando papel. Um grupo
// fixo de secoes (ver FOLHA_ISOLADA/ISOLAR_SECOES_MEDIDA abaixo) sempre abre
// pagina nova, por serem "capitulos" do documento ou secoes longas/complexas
// que não devem dividir folha com outra coisa. Aqui a secao e so um bloco de
// conteudo, sem largura, sombra ou margem de folha.
const FOLHA = 'memorial-secao relative flex flex-col w-full bg-white text-black'

// Secoes que sempre abrem pagina propria (nunca dividem folha com a secao
// anterior), por serem capitulos do documento (Objetivo+Legislacao, Sobre a
// Edificacao, Caracterizacao, Medidas Aplicadas) ou medidas de seguranca
// longas/complexas o bastante pra nao fazer sentido espremidas com outra
// coisa na mesma folha — ver ISOLAR_SECOES_MEDIDA pra quais medidas entram
// aqui.
const FOLHA_ISOLADA = `${FOLHA} memorial-secao-isolada`

// Titulos de SecaoMedida (ver buildMemorial) que, por extensao/complexidade,
// tambem devem sempre abrir pagina propria — comparado por igualdade
// (Saída de Emergência) ou prefixo (o memorial de calculo de hidrantes leva
// o sistema no titulo: "Memorial de Cálculo — Sistema de Hidrantes").
const ISOLAR_SECOES_MEDIDA = new Set(['Saída de Emergência'])
const secaoMedidaEhIsolada = titulo => ISOLAR_SECOES_MEDIDA.has(titulo) || titulo.startsWith('Memorial de Cálculo')

// CSS processado pelo Paged.js: pagina A4 com margem de 25mm e numero da
// pagina no canto inferior direito. Capa e Sumario (pagina nomeada
// "pretextual") contam na numeracao, mas nao exibem o numero.
//
// Capa/Sumario continuam cada uma na sua propria pagina (break-after: page),
// inclusive com altura minima de pagina cheia — a Capa depende disso pra
// centralizar o titulo verticalmente (my-auto). `.memorial-secao-isolada`
// (ver FOLHA_ISOLADA acima) tambem sempre abre pagina propria. As demais
// secoes (a maioria das medidas de seguranca) NAO forcam quebra: so pedem
// break-inside:avoid pra uma secao pequena nao ficar cortada ao meio entre
// duas paginas (ela inteira pula pra proxima pagina se nao couber no resto
// da atual) — sem impedir que, quando sobra espaco, a proxima secao comece
// ali mesmo, embaixo da anterior; nesse caso, `.memorial-secao-medida` da
// uma linha em branco de respiro entre as duas (igual ao gap entre
// titulo/subtitulo), pra nao ficarem coladas uma na outra.
//
// A margem inferior do ultimo elemento da secao e zerada de proposito: a secao
// e flex-col (margens nao colapsam), entao a margem de uma tabela que termina
// rente ao fim da folha estourava a pagina em poucos px invisiveis. O Paged.js
// tratava isso como transbordo e, ao corrigir, descartava as ultimas celulas
// da ultima linha da tabela.
const CSS_PAGINA = `
@page { size: A4 portrait; margin: 25mm; @bottom-right { content: counter(page); } }
@page pretextual { @bottom-right { content: none; } }
.memorial-pretextual { page: pretextual; break-after: page; min-height: 246mm; }
.memorial-secao:not(.memorial-pretextual) { break-inside: avoid; }
.memorial-secao-isolada { break-before: page; }
.memorial-secao-medida { margin-top: 1.5em; }
tr, td, th { break-inside: avoid; }
.memorial-secao > :last-child,
.memorial-secao > :last-child > :last-child,
.memorial-secao > :last-child > :last-child > :last-child { margin-bottom: 0 !important; }
`

// Estilo unico de tabela do memorial — cabecalho cinza, zebra nas linhas e
// borda clara. Centralizado aqui pra que as tabelas das medidas, do Anexo de
// medidas aplicadas e da caracterizacao nao divirjam com o tempo.
const TABELA = 'w-full border-collapse text-[10.5px] text-black mt-4 mb-2'
const TABELA_THEAD = 'bg-[#f3f4f6]'
const TABELA_TH = 'border border-solid border-[#d1d5db] px-2.5 py-2 font-bold'
const TABELA_TD = 'border border-solid border-[#d1d5db] px-2.5 py-2'
const zebra = i => (i % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]')

// Texto corrido do documento inteiro — sempre 1,5 de entrelinha e sem margem
// (nenhum espaço extra antes/depois de parágrafo, item de lista ou campo: só
// a quebra do próprio bloco separa um do outro, como "Antes: 0pt / Depois:
// 0pt / Entrelinhas: 1,5" no Word). Centralizado aqui pra nunca divergir
// entre as seções do memorial — ver Titulo (abaixo) pro espaçamento de
// título/subtítulo, que é a única folga deliberada.
const TEXTO = 'text-[12.5px] text-black leading-[1.5] text-justify'
const TEXTO_PEQUENO = 'text-[12px] text-black leading-[1.5]'

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
// Espaçamento antes E depois do próprio título/subtítulo (não uma linha em
// branco inteira — só o respiro visual de separação); `first:mt-0` zera a
// margem de cima quando é o primeiro elemento da folha, já separado pela
// quebra de página/seção.
function Titulo({ nivel, numero, children }) {
  const Tag = `h${nivel}`
  return (
    <Tag
      className="font-heading text-black leading-[1.5] mt-4 mb-2 first:mt-0"
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

// Depois que o Paged.js paginou: a margem de cima de `.memorial-secao-medida`
// (o respiro entre duas medidas empilhadas na mesma folha — ver CSS_PAGINA)
// não deve sobrar quando essa secao calhar de ser a primeira da pagina (por
// quebra natural de conteudo, nao por `.memorial-secao-isolada`) — o topo da
// folha ja separa visualmente, e o Paged.js nao recorta essa margem sozinho
// (mesmo motivo da margem de baixo, zerada à parte em CSS_PAGINA).
function zerarMargemTopoDePagina(destino) {
  destino.querySelectorAll('.pagedjs_page').forEach(pagina => {
    const primeira = pagina.querySelector('.memorial-secao-medida')
    if (primeira) primeira.style.marginTop = '0'
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

  return (
    <div className={`${FOLHA} memorial-pretextual`}>
      <div className="text-center my-auto py-16">
        <h1 className="capa-titulo font-heading font-bold text-black uppercase">
          Memorial Descritivo de Projeto de Prevenção e Combate a Incêndio
        </h1>
      </div>

      <div className="text-center text-[12px] text-black flex flex-col gap-1.5 pb-8">
        {edificacao && <div>{edificacao}</div>}
        {enderecoCompleto && <div>{enderecoCompleto}</div>}
      </div>
    </div>
  )
}

function Sumario() {
  return (
    <div className={`${FOLHA} memorial-pretextual`}>
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
    <div className={FOLHA_ISOLADA}>
      <Titulo nivel={1} numero={String(SECAO_OBJETIVO)}>Objetivo</Titulo>
      <p className={TEXTO}>
        Memorial Técnico Descritivo apresentado ao Corpo de Bombeiros Militar do Estado do Maranhão (CBMMA), como
        requisito legal para análise, aprovação e regularização do Projeto de Segurança Contra Incêndio e Pânico da
        edificação.
      </p>

      <Titulo nivel={1} numero={String(SECAO_LEGISLACAO)}>Sobre a Legislação</Titulo>
      <p className={TEXTO}>
        O projeto foi desenvolvido atendendo as determinações do Decreto Estadual, que regulamenta a Lei, e que, por
        sua vez, dispõe sobre a segurança contra incêndio e pânico e dá outras providências. O projeto atende também
        as Normas Brasileiras (NBR&apos;s) da Associação Brasileira de Normas Técnicas (ABNT), assim como as
        seguintes instruções técnicas:
      </p>
      <ul className={`${TEXTO_PEQUENO} list-none pl-2`}>
        {NTS_PADRAO_MA.map(nt => (
          <li key={nt.numero}><strong>{nt.numero}</strong> — {nt.nome}</li>
        ))}
        {nts.map(nt => (
          <li key={nt.numero}><strong>{nt.numero}</strong> — {nt.nome}</li>
        ))}
      </ul>
    </div>
  )
}

// Sem valor, o campo nem aparece — evita linhas tipo "Endereço: " em
// branco num documento que projetos "apenas dimensionamento" nunca
// preenchem (ver ProjetoContext.jsx tipoProjeto).
function CampoDiscriminado({ label, value }) {
  if (!value) return null
  return <div><strong>{label}:&nbsp;</strong>{value}</div>
}

function SobreEdificacao({ state }) {
  const endereco = enderecoCompletoDe(state, '')

  // Situação da edificação (Etapa 2): nova ou existente. Os dados legais só
  // entram quando o usuário optou por informá-los (mesma regra da Etapa 2 —
  // projeto com algum desses dados preenchido conta como "sim"); ano de
  // construção e AVCB só fazem sentido pra existente — observações
  // complementares (state.condicoesAtuais) valem pras duas situações.
  const existente = state.situacao === 'existente'
  const situacaoTxt = existente ? 'Edificação existente'
    : state.situacao === 'nova' ? 'Edificação nova' : ''
  const jaTemDadosLegais = !!(state.numeroAlvara || state.anoConstrucao || state.numeroAVCB || state.validadeAVCB)
  const legais = (state.informarDadosLegais || (jaTemDadosLegais ? 'sim' : '')) === 'sim'
  const fmtData = iso => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
    return m ? `${m[3]}/${m[2]}/${m[1]}` : (iso || '')
  }

  // Subitem só entra na numeração se tiver ao menos um campo preenchido —
  // assim "3.1, 3.2, 3.3" nunca pula um número quando um bloco some (ver
  // ProjetoContext.jsx tipoProjeto).
  const blocos = [
    { titulo: 'Responsável Técnico', campos: [
      ['Responsável Técnico', state.rtNome],
      ['Especialidade', state.rtEspecialidade],
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
      ['Situação', situacaoTxt],
      ['Endereço', endereco],
      ['Área construída total', state.areaConstruidaTotal ? fmtUn(state.areaConstruidaTotal, 'm²', 2, `${state.areaConstruidaTotal} m²`) : ''],
      ['Área do terreno', state.areaTerreno ? fmtUn(state.areaTerreno, 'm²', 2, `${state.areaTerreno} m²`) : ''],
      ['Número do alvará', legais ? state.numeroAlvara : ''],
      ['Ano de construção', legais && existente ? state.anoConstrucao : ''],
      ['Situação perante o CBMMA', legais && existente ? state.situacaoCBM : ''],
      ['Nº do AVCB anterior', legais && existente ? state.numeroAVCB : ''],
      ['Validade do AVCB', legais && existente ? fmtData(state.validadeAVCB) : ''],
      ['Observações complementares', state.condicoesAtuais?.trim()],
    ] },
  ].filter(b => b.campos.some(([, v]) => v))

  return (
    <div className={FOLHA_ISOLADA}>
      <Titulo nivel={1} numero={String(SECAO_SOBRE_EDIFICACAO)}>Sobre a Edificação</Titulo>

      {blocos.map((bloco, i) => (
        <Fragment key={bloco.titulo}>
          <Titulo nivel={2} numero={`${SECAO_SOBRE_EDIFICACAO}.${i + 1}`}>{tituloCase(bloco.titulo)}</Titulo>
          <div className={`${TEXTO_PEQUENO} pl-6`}>
            {bloco.campos.map(([label, value]) => (
              <CampoDiscriminado key={label} label={label} value={value}/>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function Caracterizacao({ state, porEstrutura }) {
  return (
    <div className={FOLHA_ISOLADA}>
      <Titulo nivel={1} numero={String(SECAO_CARACTERIZACAO)}>Caracterização da Edificação e do Risco</Titulo>

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

        const alturaPisoPisoTxt = est.alturaPisoPiso === '' || est.alturaPisoPiso == null ? '' : `${fmtNum(est.alturaPisoPiso, 2, est.alturaPisoPiso)} m${edificacaoEhTerrea(est) ? ' (Edificação Térrea)' : ''}`

        return (
          <Fragment key={est.id}>
            <Titulo nivel={2} numero={`${SECAO_CARACTERIZACAO}.${estIdx + 1}`}>{tituloCase(est.nome)}</Titulo>

            <div className={TEXTO_PEQUENO}>
              <div><strong>Área construída:&nbsp;</strong>{est.areaTotal ? fmtUn(est.areaTotal, 'm²', 2, `${est.areaTotal} m²`) : '—'}</div>
              <div><strong>Altura piso a piso:&nbsp;</strong>{alturaPisoPisoTxt || '—'}</div>
              <div><strong>Altura total:&nbsp;</strong>{est.altura ? fmtUn(est.altura, 'm', 2, `${est.altura} m`) : '—'}</div>
            </div>

            <p className="titulo-tabela">Ocupações por pavimento</p>
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
                      <td className={`${TABELA_TD} text-center`}>{cargaQ ? <>{fmtUn(cargaQ, 'MJ/m²')}<br/>{classificarCarga(cargaQ)}</> : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Fragment>
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
  const temIsenta = multiplasEstruturas
    ? medidas.some(m => porEstrutura.some(pe => estadoMedidaSistema(pe.sistemas, m.key) === 'isenta'))
    : medidas.some(m => estadoMedidaSistema(sistemas, m.key) === 'isenta')
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
    <div className={FOLHA_ISOLADA}>
      <Titulo nivel={1} numero={String(SECAO_MEDIDAS_APLICADAS)}>Medidas de Segurança Contra Incêndio e Emergência do Projeto</Titulo>

      {multiplasEstruturas ? (
        <table className={TABELA}>
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
                {porEstrutura.map(pe => {
                  const estado = estadoMedidaSistema(pe.sistemas, m.key)
                  return (
                    <td key={pe.estrutura.id} className={`${TABELA_TD} text-center text-[16px] font-bold leading-none`}>
                      {estado === 'x' ? 'X' : estado === 'isenta' ? '-' : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className={TABELA}>
          <thead>
            <tr className={TABELA_THEAD}>
              <th className={`${TABELA_TH} text-left`}>Medidas de Segurança Aplicadas</th>
              <th className={`${TABELA_TH} w-[70px]`}></th>
            </tr>
          </thead>
          <tbody>
            {medidas.map((m, i) => (
              <tr key={m.key} className={zebra(i)}>
                <td className={TABELA_TD}>{m.label}</td>
                <td className={`${TABELA_TD} text-center text-[16px] font-bold leading-none`}>
                  {estadoMedidaSistema(sistemas, m.key) === 'isenta' ? '-' : 'X'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {temIsenta && (
        <p className="text-[10px] text-black/60">
          <strong>-</strong>: Medida de segurança isenta. Ver motivo na seção dedicada.
        </p>
      )}

      {riscosAtivosGlobal.length > 0 && (
        <>
          <Titulo nivel={2} numero={`${SECAO_MEDIDAS_APLICADAS}.1`}>Riscos Especiais</Titulo>
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
            <p className="text-[10.5px] text-black leading-[1.5]">
              <strong>Outros (por estrutura):&nbsp;</strong>{outrosDescsMultiplas.join(' · ')}
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
  return <><strong>{item.label}:&nbsp;</strong><span className="whitespace-pre-line">{item.valor}</span></>
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
        ? 'text-[12px] text-black leading-[1.5] pl-2.5 border-l-2 border-solid border-black font-medium'
        // 'lettered': o próprio texto já traz o prefixo ("a) ..." — ver
        // memorial/saida_emergencia.js), então sem marcador "•" duplicado.
        : estilo === 'lettered'
        ? 'text-[12px] text-black leading-[1.5] pl-4'
        : "text-[12px] text-black leading-[1.5] pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#8a8a8c]"
    }>
      <ListaItemTexto item={item}/>
      {item?.sub?.length > 0 && (
        <ul className="list-none ml-2">
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
      return <Titulo nivel={2} numero={bloco.numero}>{tituloCase(bloco.texto)}</Titulo>
    case 'titulo3':
      return <Titulo nivel={3} numero={bloco.numero}>{bloco.texto}</Titulo>
    case 'paragrafo':
      return <p className={`${TEXTO} indent-8`}>{bloco.texto}</p>
    // Equação em destaque (memorial/hidrantesCalculo.js) — texto em notação
    // de engenharia (Q^1,85, P_hd01 etc.), convertido pra sobrescrito/
    // subscrito de verdade (formatarFormula) — sem fração renderizada
    // (numerador/denominador em vez de "A / B" numa linha só), única
    // simplificação que o resto do memorial descritivo também não faz.
    case 'formula':
      return (
        <div
          className="text-[12px] text-black font-mono leading-[1.5] pl-3 border-l-2 border-solid border-[#c9c9cb] whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: formatarFormula(bloco.texto) }}
        />
      )
    case 'campo':
      return <div className={TEXTO_PEQUENO}><strong>{bloco.label}:&nbsp;</strong><span className="whitespace-pre-line">{bloco.valor}</span></div>
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
        <table className={TABELA} style={bloco.larguras ? { tableLayout: 'fixed' } : undefined}>
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
        <ul className="list-none">
          {bloco.itens.map((item, i) => <ListaLi key={i} item={item} estilo={bloco.estilo}/>)}
        </ul>
      )
    case 'organograma':
      return (
        <div>
          {/* mb-5 aqui (em vez de deixar só o mb-1 do próprio OrganogramaNo)
              separa uma árvore (Saída/Escada-Rampa raiz) da próxima com uma
              linha em branco — sem isso, a última Circulação de uma árvore
              encosta direto na raiz seguinte. Exceção deliberada à regra de
              "sem margem": aqui não é texto corrido, é separador visual
              entre diagramas de árvore distintos. */}
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

// Bloco de assinatura ao final do documento — sem título numerado (não
// entra no Sumário) e sem a classe `memorial-secao`, pra não forçar página
// própria: continua no fluxo, ficando na última folha do memorial.
function Assinatura({ state }) {
  return (
    <div className="flex flex-col items-center mt-16 pt-6">
      <div className="w-[340px] text-center">
        <div className="border-t border-solid border-black pt-2">
          <div className="text-[12.5px] text-black font-semibold">{state.rtNome || ' '}</div>
        </div>
        <div className="text-[11px] text-black mt-1">{state.rtEspecialidade || ' '}</div>
        <div className="text-[11px] text-black">{state.rtConselho ? `Registro Profissional: ${state.rtConselho}` : ' '}</div>
      </div>
    </div>
  )
}

function SecaoMedida({ secao, numeroSecao, state, ultima }) {
  const isolada = secaoMedidaEhIsolada(secao.titulo)
  return (
    <div className={isolada ? FOLHA_ISOLADA : `${FOLHA} memorial-secao-medida`}>
      <Titulo nivel={1} numero={String(numeroSecao)}>{secao.titulo}</Titulo>

      {secao.blocos
        ? numerarBlocos(secao.blocos, numeroSecao).map((b, i) => <BlocoMedida key={i} bloco={b}/>)
        : secao.paragrafos.map((p, i) => (
            <p key={i} className={`${TEXTO} indent-8 pl-2`}>{p}</p>
          ))}

      {/* Assinatura dentro da última seção (não depois dela), pra entrar no
          fluxo normal do documento — sem seção própria, ela só continua
          embaixo do conteúdo da última medida, na mesma folha ou na
          seguinte, conforme o espaço que sobrar (ver CSS_PAGINA). */}
      {ultima && <Assinatura state={state}/>}
    </div>
  )
}

// Níveis de zoom do preview, como num editor de texto.
const NIVEIS_ZOOM = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.25, 1.5]
const CHAVE_ZOOM = 'memorial-zoom'

function lerZoomSalvo() {
  try {
    const salvo = Number(localStorage.getItem(CHAVE_ZOOM))
    return NIVEIS_ZOOM.includes(salvo) ? salvo : 1
  } catch { return 1 }
}

function proximoZoom(atual, direcao) {
  const i = NIVEIS_ZOOM.indexOf(atual)
  return NIVEIS_ZOOM[Math.min(NIVEIS_ZOOM.length - 1, Math.max(0, (i < 0 ? NIVEIS_ZOOM.indexOf(1) : i) + direcao))]
}

export default function MemorialDescritivoPage({ onBack }) {
  const { state }    = useProjeto()
  const { sistemas, porEstrutura } = useMedidasObrigatorias()
  const secoes = buildMemorial(state, sistemas, porEstrutura)
  const rolagemRef = useRef(null)
  const [indice, setIndice] = useState([])
  const aposPaginar = destino => {
    zerarMargemTopoDePagina(destino)
    preencherPaginasSumario(destino)
    setIndice(coletarSecoes(destino))
  }

  // Zoom do preview (só na tela — a impressão sai sempre em 100%): reduzindo,
  // as folhas passam a caber lado a lado, como no Word/Docs.
  const [zoom, setZoom] = useState(lerZoomSalvo)
  const mudarZoom = direcao => setZoom(z => proximoZoom(z, direcao))
  useEffect(() => {
    try { localStorage.setItem(CHAVE_ZOOM, String(zoom)) } catch { /* sem storage: só não lembra */ }
  }, [zoom])
  // Ctrl + roda do mouse dá zoom no documento em vez de na página inteira.
  useEffect(() => {
    const cont = rolagemRef.current
    if (!cont) return
    const aoRodar = e => {
      if (!e.ctrlKey) return
      e.preventDefault()
      setZoom(z => proximoZoom(z, e.deltaY < 0 ? 1 : -1))
    }
    cont.addEventListener('wheel', aoRodar, { passive: false })
    return () => cont.removeEventListener('wheel', aoRodar)
  }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-none">
      <div className="no-print shrink-0 flex items-center justify-between py-3 px-8 border-b border-solid border-border bg-none">
        <button className="btn-ghost" onClick={onBack}>
          <Icon name="left" size={13}/> Voltar
        </button>
        <div className="flex items-center gap-1" role="group" aria-label="Zoom do documento">
          <button type="button" className="btn-ghost px-2" onClick={() => mudarZoom(-1)} disabled={zoom <= NIVEIS_ZOOM[0]} aria-label="Diminuir zoom" title="Diminuir zoom (Ctrl + roda do mouse)">
            <Icon name="minus" size={13}/>
          </button>
          <button type="button" className="btn-ghost px-2 min-w-[58px] justify-center tabular-nums" onClick={() => setZoom(1)} title="Voltar para 100%">
            {Math.round(zoom * 100)}%
          </button>
          <button type="button" className="btn-ghost px-2" onClick={() => mudarZoom(1)} disabled={zoom >= NIVEIS_ZOOM[NIVEIS_ZOOM.length - 1]} aria-label="Aumentar zoom" title="Aumentar zoom (Ctrl + roda do mouse)">
            <Icon name="plus" size={13}/>
          </button>
        </div>
        <button className="btn-primary" onClick={() => window.print()} disabled={!secoes.length}>
          <Icon name="file" size={13}/> Imprimir / Salvar PDF
        </button>
      </div>

      {/* `relative` ancora o MenuSecoes na tela; na impressão vira `static`,
          senão a .print-area (absoluta) passa a ser recortada pelos
          overflow-hidden dos ancestrais e só sai a 1ª folha. */}
      <div className="relative print:static flex-1 min-h-0 flex flex-col">
      <MenuSecoes secoes={indice} rolagemRef={rolagemRef}/>
      <div ref={rolagemRef} className="flex-1 overflow-auto py-8 flex flex-col" style={{ '--memorial-zoom': zoom }}>
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
              <SecaoMedida key={i} secao={secao} numeroSecao={PRIMEIRA_SECAO_MEDIDA + i} state={state} ultima={i === secoes.length - 1}/>
            ))}
          </PreviewPaginado>
        )}
      </div>
      </div>
    </div>
  )
}
