import { useProjeto } from '../../context/ProjetoContext'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { buildMemorial } from '../../data/memorial/registry'
import { NTS_PADRAO_MA, NT_CARGA_INCENDIO, NTS_POR_SISTEMA } from '../../data/normas/MA/nts'
import { MEDIDAS_ANEXO_B_COL1, MEDIDAS_ANEXO_B_COL2, RISCOS_ESPECIAIS } from '../../utils/anexoB'
import { getCNAEsDivisao, getOcupacoes } from '../../data/normas/index'
import Icon from '../../components/ui/Icon'

// Memorial descritivo: um documento para impressão, uma pagina A4 por medida
// de seguranca (secao vinda de buildMemorial). Medidas ainda sem builder
// registrado (ver memorial/registry.js) simplesmente nao aparecem aqui.
//
// Estrutura fixa de paginas: Capa (1), Sumario (2), Objetivo + Legislacao (3),
// Sobre a Edificacao (4), Caracterizacao (5), Medidas Aplicadas (6), depois
// uma pagina por medida dimensionada (7, 8, ...).
const PAGINA_SUMARIO = 2
const PAGINA_INTRODUCAO = 3
const PAGINA_SOBRE_EDIFICACAO = 4
const PAGINA_CARACTERIZACAO = 5
const PAGINA_MEDIDAS_APLICADAS = 6
const PRIMEIRA_PAGINA_MEDIDA = 7

// Cada pagina do memorial e uma folha A4 independente na tela (tamanho e
// sombra reais, com espaco entre folhas) — no impresso a sombra/arredondamento
// somem e a margem fica a cargo da @page nomeada "memorial" (index.css):
// 3cm em cima e embaixo (numero de pagina), 2cm na esquerda e na direita.
// O padding abaixo replica essas mesmas medidas na tela.
const FOLHA = 'memorial-secao relative flex flex-col w-[210mm] min-h-[297mm] mx-auto mb-8 print:mb-0 bg-white text-black shadow-[0_4px_24px_rgba(0,0,0,.35)] print:shadow-none rounded-lg print:rounded-none pt-[3cm] pb-[3cm] pl-[2cm] pr-[2cm] print:pt-0 print:pb-0 print:pl-0 print:pr-0'

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

function Capa({ state, totalPaginas }) {
  const edificacao = state.respFantasia || state.respRazaoSocial || state.nome || '[Nome Fantasia da Empresa ou Condomínio]'
  const enderecoCompleto = enderecoCompletoDe(state)
  const proprietario = state.propNome || '[Nome Completo ou Razão Social]'

  return (
    <div className={FOLHA}>
      <div className="flex flex-col items-start gap-2">
        <div className="w-[150px] h-[60px] border border-dashed border-[#c9c9cb] bg-[#eeeeef] flex items-center justify-center text-center px-2">
          <span className="text-[10px] font-bold text-[#8a8a8c] uppercase tracking-[.04em]">Logo da empresa</span>
        </div>
        <div className="text-[10.5px] text-black leading-relaxed">
          <div>CNPJ: {state.respCNPJ || 'XX.XXX.XXX/0001-XX'}</div>
          <div>Telefone: {state.respTelefone || '(XX) XXXXX-XXXX'}</div>
        </div>
      </div>

      <div className="text-center my-auto py-16">
        <h1 className="font-heading text-[26px] font-bold text-black uppercase tracking-[.02em]">Memorial Descritivo</h1>
        <p className="text-[13px] font-semibold text-[#4D4D4F] uppercase tracking-[.04em] mt-2">
          Projeto de Prevenção e Combate a Incêndio
        </p>
      </div>

      <div className="text-center text-[12px] text-black flex flex-col gap-1.5 pb-8">
        <div><strong>Edificação:</strong> {edificacao}</div>
        <div><strong>Endereço:</strong> {enderecoCompleto}</div>
        <div><strong>Proprietário:</strong> {proprietario}</div>
      </div>

      <div className="absolute bottom-0 right-0 text-[10px] text-[#8a8a8c]">{numeroPagina(1, totalPaginas)}</div>
    </div>
  )
}

function Sumario({ topicos, totalPaginas }) {
  return (
    <div className={FOLHA}>
      <h1 className="font-heading text-[20px] font-bold text-black uppercase tracking-[.04em] text-center mt-10 mb-14">Sumário</h1>

      <div className="max-w-[480px] mx-auto w-full flex flex-col gap-3.5">
        {topicos.map((t, i) => (
          <div key={i} className="flex items-baseline gap-2 text-[12.5px] text-black">
            <span className="font-heading font-medium uppercase tracking-[.02em]">{t.titulo}</span>
            <span className="flex-1 border-b border-dotted border-[#8a8a8c] translate-y-[-3px]"/>
            <span>{String(t.pagina).padStart(2, '0')}</span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 right-0 text-[10px] text-[#8a8a8c]">{numeroPagina(PAGINA_SUMARIO, totalPaginas)}</div>
    </div>
  )
}

function Introducao({ sistemas, totalPaginas }) {
  const nts = Object.entries(sistemas || {})
    .filter(([, s]) => s.ativo || s.obrigatorio)
    .map(([key]) => NTS_POR_SISTEMA[key])
    .filter(Boolean)
    .concat([NT_CARGA_INCENDIO])
    .filter((nt, i, arr) => arr.findIndex(n => n.numero === nt.numero) === i)
    .sort((a, b) => parseInt(a.numero.replace(/\D/g, ''), 10) - parseInt(b.numero.replace(/\D/g, ''), 10))

  return (
    <div className={FOLHA}>
      <h2 className="font-heading text-[15px] font-bold text-black uppercase tracking-[.04em] mb-2">Objetivo</h2>
      <p className="text-[12.5px] text-black leading-[1.85] text-justify mb-8">
        Memorial Técnico Descritivo apresentado ao Corpo de Bombeiros Militar do Estado do Maranhão (CBMMA), como
        requisito legal para análise, aprovação e regularização do Projeto de Segurança Contra Incêndio e Pânico da
        edificação.
      </p>

      <h2 className="font-heading text-[15px] font-bold text-black uppercase tracking-[.04em] mb-2">Sobre a Legislação</h2>
      <p className="text-[12.5px] text-black leading-[1.85] text-justify mb-3">
        O projeto foi desenvolvido atendendo as determinações do Decreto Estadual, que regulamenta a Lei, e que, por
        sua vez, dispõe sobre a segurança contra incêndio e pânico e dá outras providências. O projeto atende também
        as Normas Brasileiras (NBR&apos;s) da Associação Brasileira de Normas Técnicas (ABNT), assim como as
        seguintes instruções técnicas:
      </p>
      <ul className="text-[12.5px] text-black leading-[1.85] list-none">
        {NTS_PADRAO_MA.map(nt => <li key={nt.numero}>{nt.numero} - {nt.nome}</li>)}
        {nts.map(nt => <li key={nt.numero}>{nt.numero} - {nt.nome}</li>)}
      </ul>

      <div className="absolute bottom-0 right-0 text-[10px] text-[#8a8a8c]">{numeroPagina(PAGINA_INTRODUCAO, totalPaginas)}</div>
    </div>
  )
}

function CampoDiscriminado({ label, value }) {
  return <div><strong>{label}:</strong> {value}</div>
}

function SobreEdificacao({ state, totalPaginas }) {
  return (
    <div className={FOLHA}>
      <h1 className="font-heading text-[15px] font-bold text-black uppercase tracking-[.04em] mb-6">Sobre a Edificação</h1>

      <h2 className="font-heading text-[12px] font-bold text-black uppercase tracking-[.03em] mb-2">Responsável Técnico</h2>
      <div className="text-[12px] text-black leading-[1.9] pl-6 mb-5">
        <CampoDiscriminado label="Responsável Técnico" value={state.rtNome}/>
        <CampoDiscriminado label="Registro Profissional" value={state.rtConselho}/>
        <CampoDiscriminado label="Número da ART / RRT" value={state.artNumero}/>
      </div>

      <h2 className="font-heading text-[12px] font-bold text-black uppercase tracking-[.03em] mb-2">Responsável pelo Uso</h2>
      <div className="text-[12px] text-black leading-[1.9] pl-6 mb-5">
        <CampoDiscriminado label="Razão Social" value={state.respRazaoSocial}/>
        <CampoDiscriminado label="Nome Fantasia" value={state.respFantasia}/>
        <CampoDiscriminado label="CNPJ" value={state.respCNPJ}/>
        <CampoDiscriminado label="Telefone" value={state.respTelefone}/>
        <CampoDiscriminado label="E-mail" value={state.respEmail}/>
      </div>

      <h2 className="font-heading text-[12px] font-bold text-black uppercase tracking-[.03em] mb-2">Proprietário do Imóvel</h2>
      <div className="text-[12px] text-black leading-[1.9] pl-6 mb-5">
        <CampoDiscriminado label="Nome / Razão Social" value={state.propNome}/>
        <CampoDiscriminado label="CPF / CNPJ" value={state.propDocumento}/>
        <CampoDiscriminado label="Telefone" value={state.propTelefone}/>
        <CampoDiscriminado label="E-mail" value={state.propEmail}/>
      </div>

      <h2 className="font-heading text-[12px] font-bold text-black uppercase tracking-[.03em] mb-2">Dados do Imóvel</h2>
      <div className="text-[12px] text-black leading-[1.9] pl-6">
        <CampoDiscriminado label="Endereço" value={enderecoCompletoDe(state, '')}/>
        <CampoDiscriminado label="Área construída total" value={state.areaConstruidaTotal ? `${state.areaConstruidaTotal} m²` : ''}/>
        <CampoDiscriminado label="Área do terreno" value={state.areaTerreno ? `${state.areaTerreno} m²` : ''}/>
      </div>

      <div className="absolute bottom-0 right-0 text-[10px] text-[#8a8a8c]">{numeroPagina(PAGINA_SOBRE_EDIFICACAO, totalPaginas)}</div>
    </div>
  )
}

function Caracterizacao({ state, porEstrutura, totalPaginas }) {
  return (
    <div className={FOLHA}>
      <h1 className="font-heading text-[15px] font-bold text-black uppercase tracking-[.04em] mb-6">Caracterização da Edificação e do Risco</h1>

      {porEstrutura.map(({ estrutura: est }) => {
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
            <h2 className="font-heading text-[12px] font-bold text-black mb-1.5">{est.nome}</h2>

            <div className="border border-solid border-[#c9c9cb] flex text-[11.5px] text-black mb-3">
              <div className="flex-1 px-2.5 py-1.5 border-r border-solid border-[#c9c9cb]"><strong>Área construída:</strong> {est.areaTotal ? `${est.areaTotal} m²` : ''}</div>
              <div className="flex-1 px-2.5 py-1.5 border-r border-solid border-[#c9c9cb]"><strong>Altura piso a piso:</strong> {alturaPisoPisoTxt}</div>
              <div className="flex-1 px-2.5 py-1.5"><strong>Altura total:</strong> {est.altura ? `${est.altura} m` : ''}</div>
            </div>

            <table className="w-full border-collapse text-[11px] text-black">
              <thead>
                <tr>
                  <th className="border border-solid border-[#c9c9cb] px-2 py-1 text-left w-[110px]">Pavimento</th>
                  <th className="border border-solid border-[#c9c9cb] px-2 py-1 text-left">Divisão</th>
                  <th className="border border-solid border-[#c9c9cb] px-2 py-1 text-left">CNAE / Atividade</th>
                  <th className="border border-solid border-[#c9c9cb] px-2 py-1 w-[130px]">Carga de Incêndio</th>
                </tr>
              </thead>
              <tbody>
                {linhas.length === 0 ? (
                  <tr><td colSpan={4} className="border border-solid border-[#c9c9cb] px-2 py-2 text-center text-[#8a8a8c]">Nenhuma ocupação classificada</td></tr>
                ) : linhas.map((l, i) => {
                  const cargaQ = cargaDaOcupacao(state, est.id, l.divisao, l.cnae)
                  const desc = descricaoDivisao(state, l.divisao)
                  return (
                    <tr key={i}>
                      <td className="border border-solid border-[#c9c9cb] px-2 py-1">{l.pavimento}</td>
                      <td className="border border-solid border-[#c9c9cb] px-2 py-1">{[l.divisao, desc].filter(Boolean).join(' — ')}</td>
                      <td className="border border-solid border-[#c9c9cb] px-2 py-1">{[l.cnae, l.cnaeDesc].filter(Boolean).join(' — ')}</td>
                      <td className="border border-solid border-[#c9c9cb] px-2 py-1 text-center">{cargaQ ? `${cargaQ} MJ/m² - ${classificarCarga(cargaQ)}` : ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}

      <div className="absolute bottom-0 right-0 text-[10px] text-[#8a8a8c]">{numeroPagina(PAGINA_CARACTERIZACAO, totalPaginas)}</div>
    </div>
  )
}

function MedidasAplicadas({ state, sistemas, porEstrutura, totalPaginas }) {
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
      <h1 className="font-heading text-[15px] font-bold text-black uppercase tracking-[.04em] mb-6 leading-[1.3]">
        Medidas de Segurança Contra Incêndio e Emergência do Projeto
      </h1>

      {multiplasEstruturas ? (
        <table className="w-full border-collapse text-[11px] text-black mb-8">
          <thead>
            <tr>
              <th className="border border-solid border-[#c9c9cb] px-2.5 py-1.5 text-left">Medidas de Segurança Aplicadas</th>
              {porEstrutura.map(({ estrutura: est }) => (
                <th key={est.id} className="border border-solid border-[#c9c9cb] px-2.5 py-1.5 w-[70px]">{est.nome}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {medidas.map(m => (
              <tr key={m.key}>
                <td className="border border-solid border-[#c9c9cb] px-2.5 py-1.5">{m.label}</td>
                {porEstrutura.map(pe => (
                  <td key={pe.estrutura.id} className="border border-solid border-[#c9c9cb] px-2.5 py-1.5 text-center text-[16px] font-bold leading-none">
                    {pe.sistemas[m.key]?.ativo ? 'X' : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul className="border border-solid border-[#c9c9cb] text-[11.5px] text-black list-none mb-8">
          {medidas.map((m, i) => (
            <li key={m.key} className={`px-2.5 py-1.5 ${i < medidas.length - 1 ? 'border-b border-solid border-[#c9c9cb]' : ''}`}>{m.label}</li>
          ))}
        </ul>
      )}

      {riscosAtivosGlobal.length > 0 && (
        <>
          <h2 className="font-heading text-[12px] font-bold text-black uppercase tracking-[.03em] mb-2">Riscos Especiais</h2>
          {multiplasEstruturas ? (
            <table className="w-full border-collapse text-[11px] text-black">
              <thead>
                <tr>
                  <th className="border border-solid border-[#c9c9cb] px-2.5 py-1.5 text-left">Risco Especial</th>
                  {porEstrutura.map(({ estrutura: est }) => (
                    <th key={est.id} className="border border-solid border-[#c9c9cb] px-2.5 py-1.5 w-[70px]">{est.nome}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riscosAtivosGlobal.map(r => (
                  <tr key={r.key}>
                    <td className="border border-solid border-[#c9c9cb] px-2.5 py-1.5">{r.label}</td>
                    {porEstrutura.map(pe => (
                      <td key={pe.estrutura.id} className="border border-solid border-[#c9c9cb] px-2.5 py-1.5 text-center text-[16px] font-bold leading-none">
                        {riscosPorEstrutura[pe.estrutura.id]?.[r.key] ? 'X' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-2 border border-solid border-[#c9c9cb] divide-x divide-y divide-[#c9c9cb] text-[11.5px] text-black">
              {riscosAtivosUnica.map((label, i) => (
                <div key={i} className="px-2.5 py-1.5">{label}</div>
              ))}
            </div>
          )}
          {outrosDescsMultiplas.length > 0 && (
            <p className="text-[10.5px] text-black leading-[1.6] mt-1.5 mb-0">
              <strong>Outros (por estrutura):</strong> {outrosDescsMultiplas.join(' · ')}
            </p>
          )}
        </>
      )}

      <div className="absolute bottom-0 right-0 text-[10px] text-[#8a8a8c]">{numeroPagina(PAGINA_MEDIDAS_APLICADAS, totalPaginas)}</div>
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

// Um <li> de bloco 'lista', com sub-lista recursiva (item.sub pode ter seus
// próprios itens com sub, sem limite de profundidade — ex.: riscos especiais
// com mais de uma estrutura viram Riscos > Estrutura > risco, 3 níveis).
function ListaLi({ item, estilo }) {
  return (
    <li className={
      estilo === 'alerta'
        ? 'text-[12px] text-black leading-[1.6] mb-1.5 pl-2.5 border-l-2 border-solid border-black font-medium'
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

// Blocos de conteudo (opcionais, ver memorial/seg_estrutural.js) — permitem
// que uma secao troque paragrafo corrido por tabela/lista/campo quando isso
// deixa os valores mais faceis de achar (ex.: TRRF por pavimento). Secoes
// que so retornam `paragrafos` (ex.: acesso_viatura.js) continuam iguais.
function BlocoMedida({ bloco }) {
  switch (bloco.tipo) {
    case 'titulo2':
      return <h2 className="font-heading text-[12px] font-bold text-black uppercase tracking-[.03em] mt-5 mb-2 first:mt-0">{bloco.texto}</h2>
    case 'paragrafo':
      return <p className="text-[12.5px] text-black leading-[1.85] text-justify mb-3 indent-8">{bloco.texto}</p>
    case 'campo':
      return <div className="text-[12px] text-black leading-[1.7] mb-1.5"><strong>{bloco.label}:</strong> <span className="whitespace-pre-line">{bloco.valor}</span></div>
    case 'tabela':
      return (
        <table className="w-full border-collapse text-[11px] text-black mb-4" style={bloco.larguras ? { tableLayout: 'fixed' } : undefined}>
          {bloco.larguras && (
            <colgroup>
              {bloco.larguras.map((w, i) => <col key={i} style={{ width: w }}/>)}
            </colgroup>
          )}
          <thead>
            <tr>
              {bloco.colunas.map((c, i) => <th key={i} className="border border-solid border-[#c9c9cb] px-2 py-1 text-left">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {bloco.linhas.map((linha, i) => (
              <tr key={i}>
                {linha.map((cel, j) => (
                  <td key={j} className="border border-solid border-[#c9c9cb] px-2 py-1">
                    {cel && typeof cel === 'object' && cel.tipo === 'imagem'
                      ? <img src={cel.src} alt={cel.alt || ''} className="w-9 h-9 object-contain block"/>
                      : cel}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
    case 'lista':
      return (
        <ul className="list-none mb-4">
          {bloco.itens.map((item, i) => <ListaLi key={i} item={item} estilo={bloco.estilo}/>)}
        </ul>
      )
    default:
      return null
  }
}

function SecaoMedida({ secao, pagina, totalPaginas }) {
  return (
    <div className={FOLHA}>
      <h1 className="font-heading text-[15px] font-bold text-black uppercase tracking-[.04em] mb-6">{secao.titulo}</h1>

      {secao.blocos
        ? secao.blocos.map((b, i) => <BlocoMedida key={i} bloco={b}/>)
        : secao.paragrafos.map((p, i) => (
            <p key={i} className="text-[12.5px] text-black leading-[1.85] text-justify mb-3 indent-8">{p}</p>
          ))}

      <div className="absolute bottom-0 right-0 text-[10px] text-[#8a8a8c]">
        {numeroPagina(pagina, totalPaginas)}
      </div>
    </div>
  )
}

export default function MemorialDescritivoPage({ onBack }) {
  const { state }    = useProjeto()
  const { sistemas, porEstrutura } = useMedidasObrigatorias()
  const secoes = buildMemorial(state, sistemas)
  const totalPaginas = PRIMEIRA_PAGINA_MEDIDA - 1 + secoes.length
  const topicos = [
    { titulo: 'Objetivo', pagina: PAGINA_INTRODUCAO },
    { titulo: 'Sobre a Legislação', pagina: PAGINA_INTRODUCAO },
    { titulo: 'Sobre a Edificação', pagina: PAGINA_SOBRE_EDIFICACAO },
    { titulo: 'Caracterização da Edificação e do Risco', pagina: PAGINA_CARACTERIZACAO },
    { titulo: 'Medidas de Segurança Aplicadas', pagina: PAGINA_MEDIDAS_APLICADAS },
    ...secoes.map((secao, i) => ({ titulo: secao.titulo, pagina: PRIMEIRA_PAGINA_MEDIDA + i })),
  ]

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

      <div className="flex-1 overflow-y-auto py-8">
        {!secoes.length ? (
          <div className="max-w-[600px] mx-auto py-16 px-10 text-center border border-dashed border-border rounded-lg text-ink-faint text-[13px]">
            Nenhuma medida com memorial disponível ainda. Preencha o dimensionamento de uma medida (ex.: Acesso de Viatura) para gerar as páginas aqui.
          </div>
        ) : (
          <div className="print-area print-area-memorial">
            <Capa state={state} totalPaginas={totalPaginas}/>
            <Sumario topicos={topicos} totalPaginas={totalPaginas}/>
            <Introducao sistemas={sistemas} totalPaginas={totalPaginas}/>
            <SobreEdificacao state={state} totalPaginas={totalPaginas}/>
            <Caracterizacao state={state} porEstrutura={porEstrutura} totalPaginas={totalPaginas}/>
            <MedidasAplicadas state={state} sistemas={sistemas} porEstrutura={porEstrutura} totalPaginas={totalPaginas}/>
            {secoes.map((secao, i) => (
              <SecaoMedida key={i} secao={secao} pagina={PRIMEIRA_PAGINA_MEDIDA + i} totalPaginas={totalPaginas}/>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
