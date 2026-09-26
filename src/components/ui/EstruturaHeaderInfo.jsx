import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { classificarPavimentos } from '../../utils/classificacao'
import Icon from './Icon'

const getCls = q => q <= 300 ? 'green' : q <= 1200 ? 'amber' : 'red'
const RISCO_LBL = { green: 'Risco baixo', amber: 'Risco médio', red: 'Risco alto' }

// Mesma pilula usada nos badges de risco (.carga-class, index.css) — um so
// padrao visual pros tres dados do cabecalho, em vez de cada um com um
// tratamento diferente (texto solto, texto colorido, badge com borda).
const TONE = {
  neutral: 'bg-white/[.04] border-border text-ink-faint',
  green:   'bg-[rgba(29,158,117,.12)] border-green-border text-green',
  amber:   'bg-[rgba(186,117,23,.12)] border-amber-border text-amber',
  red:     'bg-red-dim border-red-border text-red',
}

export function Chip({ tone = 'neutral', icon, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full border border-solid text-[11px] font-semibold whitespace-nowrap shrink-0 ${TONE[tone]}`}>
      {icon && <Icon name={icon} size={14}/>}
      {children}
    </span>
  )
}

function divCnaeMap(pavimentos) {
  const map = {}
  pavimentos.forEach(p => {
    if (p.divisao && !map[p.divisao]) map[p.divisao] = p.cnae
    ;(p.acess || []).forEach(a => { if (a.divisao && !map[a.divisao]) map[a.divisao] = a.cnae })
  })
  return map
}

// Maior carga de incendio entre as divisoes da estrutura — mesma logica de
// resolucao usada na Etapa 5 (tabela normativa via CNAE, ou valor de
// levantamento quando esse for o metodo escolhido).
function maxCarga(pavimentos, cargaEst, cnaesDiv) {
  const cnaeMap = divCnaeMap(pavimentos)
  let max = 0
  Object.keys(cnaeMap).forEach(code => {
    const st = cargaEst[code]
    if (!st) return
    const q = st.metodo === 'levantamento'
      ? parseFloat(st.valorManual) || 0
      : (cnaeMap[code] ? cnaesDiv(code)[cnaeMap[code]]?.cargaIncendio : null) ?? st.cargaIncendio ?? 0
    if (q > max) max = q
  })
  return max
}

// ── Resumo no cabecalho de uma EstruturaSection — ocupacao, risco de
// incendio e area construida. Le direto do estado global (nao depende do
// que a pagina especifica ja calculou) pra que o mesmo resumo apareca, com
// os mesmos dados, em toda tela que lista estruturas — e va aparecendo aos
// poucos, conforme cada etapa anterior e preenchida.
// `mostrar` escolhe quais badges aparecem: 'area', 'pavimentos', 'risco',
// 'ocupacao'. Padrão = todos; as telas de medidas escolhem só os que fazem
// sentido pra elas; `semArea` tira só a área construída (que só a
// Compartimentação mostra).
export default function EstruturaHeaderInfo({ estrutura, apenasOcupacao = false, semArea = false, mostrar = ['area', 'pavimentos', 'risco', 'ocupacao'] }) {
  const { state } = useProjeto()
  const { cnaesDiv } = useNorma()

  const pavimentos = state.pavimentos.filter(p => p.estruturaId === estrutura.id)
  const areaEstrutura = parseFloat(estrutura.areaTotal) || 0

  const { principaisDivs, edificacaoMista, mistaDivs, temOcupacoes } = classificarPavimentos(pavimentos, areaEstrutura)
  const divsOcupacao = temOcupacoes ? (edificacaoMista ? mistaDivs : principaisDivs) : []

  const cargaEst = state.cargaState[estrutura.id] || {}
  const q = maxCarga(pavimentos, cargaEst, cnaesDiv)
  const cls = q > 0 ? getCls(q) : null

  const ver = k => !apenasOcupacao && mostrar.includes(k) && !(k === 'area' && semArea)
  const temAlgo = (ver('area') && areaEstrutura > 0) || ver('pavimentos') || (ver('risco') && q > 0)
    || (mostrar.includes('ocupacao') && divsOcupacao.length > 0)
  if (!temAlgo && !(apenasOcupacao && divsOcupacao.length > 0)) return null

  const totalPavimentos = (parseInt(estrutura.nPavimentos) || 1) + (parseInt(estrutura.nSubsolos) || 0)
  const pavimentosLabel = totalPavimentos === 1 ? 'Térrea' : `${totalPavimentos} pavimentos`

  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-end">
      {ver('area') && areaEstrutura > 0 && <Chip icon="area">{areaEstrutura} m²</Chip>}
      {ver('pavimentos') && <Chip icon="stair">{pavimentosLabel}</Chip>}
      {ver('risco') && q > 0 && <Chip tone={cls} icon="flame">{RISCO_LBL[cls]}</Chip>}
      {(apenasOcupacao || mostrar.includes('ocupacao')) && divsOcupacao.length > 0 && (
        <Chip tone={edificacaoMista ? 'amber' : 'red'} icon="newbld">{divsOcupacao.join(' • ')}</Chip>
      )}
    </div>
  )
}
