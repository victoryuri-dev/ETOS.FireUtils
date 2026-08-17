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
  neutral: 'bg-white/[0.07] border-border text-ink-faint',
  green:   'bg-[rgba(29,158,117,.20)] border-green-border text-green',
  amber:   'bg-[rgba(186,117,23,.20)] border-amber-border text-amber',
  red:     'bg-[rgba(192,21,42,.20)] border-red-border text-red',
}

function Chip({ tone = 'neutral', icon, children }) {
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
export default function EstruturaHeaderInfo({ estrutura }) {
  const { state } = useProjeto()
  const { cnaesDiv } = useNorma()

  const pavimentos = state.pavimentos.filter(p => p.estruturaId === estrutura.id)
  const areaEstrutura = parseFloat(estrutura.areaTotal) || 0

  const { principaisDivs, edificacaoMista, mistaDivs, temOcupacoes } = classificarPavimentos(pavimentos, areaEstrutura)
  const divsOcupacao = temOcupacoes ? (edificacaoMista ? mistaDivs : principaisDivs) : []

  const cargaEst = state.cargaState[estrutura.id] || {}
  const q = maxCarga(pavimentos, cargaEst, cnaesDiv)
  const cls = q > 0 ? getCls(q) : null

  if (!divsOcupacao.length && !q && !areaEstrutura) return null

  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-end">
      {areaEstrutura > 0 && <Chip icon="area">{areaEstrutura} m²</Chip>}
      {q > 0 && <Chip tone={cls} icon="flame">{RISCO_LBL[cls]}</Chip>}
      {divsOcupacao.length > 0 && (
        <Chip tone={edificacaoMista ? 'amber' : 'red'} icon="newbld">{divsOcupacao.join(' • ')}</Chip>
      )}
    </div>
  )
}
