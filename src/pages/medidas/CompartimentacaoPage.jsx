import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { calcularAreaMaximaCompartimentacao } from '../../data/compart_calc'
import Icon from '../../components/ui/Icon'
import EstruturaSection from '../../components/ui/EstruturaSection'
import EstruturaHeaderInfo from '../../components/ui/EstruturaHeaderInfo'
import { SISTEMA_ICON } from '../../data/sistemasIcons'

function Card({ children, className = '' }) {
  return <div className={`bg-surface border border-solid border-border rounded-lg overflow-hidden ${className}`}>{children}</div>
}

function Checklist({ titulo, opcoes, valores, onToggle }) {
  return (
    <div>
      <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">{titulo}</div>
      <div className="flex flex-col gap-1.5">
        {opcoes.map(o => (
          <label key={o.key} className="flex items-start gap-2 text-xs text-ink-muted cursor-pointer">
            <input
              type="checkbox"
              checked={valores.includes(o.key)}
              onChange={() => onToggle(o.key)}
              className="mt-0.5 shrink-0"
            />
            <span>{o.texto || o.label}{o.ref && <span className="text-ink-faint"> — item {o.ref}</span>}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function ObrigatoriedadeBadge({ obrigatorio }) {
  return obrigatorio ? (
    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full border border-solid text-[11px] font-semibold bg-[rgba(192,21,42,.20)] border-red-border text-red">
      <Icon name="check" size={12}/> Exigida
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full border border-solid text-[11px] font-semibold bg-[rgba(29,158,117,.20)] border-green-border text-green">
      <Icon name="x" size={12}/> Não exigida
    </span>
  )
}

function TabelaAreaMaxima({ resultado }) {
  if (!resultado.tipo) {
    return (
      <div className="ibox amber">
        <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
        <span className="text-xs">Informe a altura da estrutura (Etapa 2 — Edificação) para classificar o tipo de edificação (Anexo B, NT 09 CBMMA) e verificar a área máxima de compartimentação.</span>
      </div>
    )
  }

  return (
    <>
      <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">
        Tipo de edificação (Anexo B, NT 09 CBMMA)
      </div>
      <div className="text-xs text-ink font-semibold mb-3">Tipo {resultado.tipo} — {resultado.tipoNome}</div>

      {resultado.linhas.length === 0 ? (
        <div className="text-xs text-ink-faint">Nenhum pavimento com divisão/área classificada ainda.</div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-solid border-border">
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">Pavimento</th>
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">Divisão</th>
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">Área do pavimento</th>
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">Área máxima permitida</th>
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-solid divide-border">
            {resultado.linhas.map(l => (
              <tr key={l.pavimento.id}>
                <td className="py-2 px-3 text-xs text-ink">{l.pavimento.label}</td>
                <td className="py-2 px-3 text-xs text-ink-faint">{l.pavimento.divisao}</td>
                <td className="py-2 px-3 text-xs text-ink-faint">{l.area ? `${l.area} m²` : '—'}</td>
                <td className="py-2 px-3 text-xs text-ink-faint">
                  {!l.encontrado ? '—' : typeof l.valor === 'number' ? `${l.valor} m²` : 'sem limite (item 5.5 ss.)'}
                </td>
                <td className="py-2 px-3 text-xs font-semibold">
                  {!l.area ? <span className="text-ink-faint">Informe a área</span>
                    : l.excede ? <span className="text-red">Excede — subdividir compartimento</span>
                    : <span className="text-green">Conforme</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {resultado.pavimentosExcedentes.length > 0 && (
        <div className="ibox red mt-3">
          <Icon name="warn" size={14} color="var(--color-red)" className="shrink-0"/>
          <span className="text-xs">
            {resultado.pavimentosExcedentes.length === 1 ? 'Um pavimento excede' : `${resultado.pavimentosExcedentes.length} pavimentos excedem`} a área máxima de compartimentação horizontal — é necessário subdividir a área em mais de um compartimento (parede corta-fogo) ou obter isenção via NT específica (chuveiros automáticos, quando aplicável).
          </span>
        </div>
      )}
    </>
  )
}

function EstruturaCompartimentacao({ est, pavimentos, compart, obrigH, obrigV, dispatch }) {
  const {
    TABELA_AREA_MAXIMA: tabelaArea, CLASSES_TIPO_EDIFICACAO: classesTipo,
    ELEMENTOS_COMPART_HORIZONTAL, ELEMENTOS_COMPART_VERTICAL,
    CONDICOES_ESPECIAIS_HORIZONTAL, CONDICOES_ESPECIAIS_VERTICAL,
    TRRF_MINIMO_PAREDE_COMPARTIMENTACAO, TRRF_REDUCAO_MAXIMA_ABERTURAS,
    TRRF_MINIMO_ENCLAUSURAMENTO_ESCADA_ELEVADOR,
  } = compart
  const resultadoArea = calcularAreaMaximaCompartimentacao(pavimentos, est, tabelaArea, classesTipo)

  const elementosH = est.elementosCompartHorizontal || []
  const elementosV = est.elementosCompartVertical || []
  const condH = est.condicoesEspeciaisCompartHorizontal || []
  const condV = est.condicoesEspeciaisCompartVertical || []

  const toggleArr = (field, atual, key) => {
    const next = atual.includes(key) ? atual.filter(x => x !== key) : [...atual, key]
    dispatch({ type: 'SET_ESTRUTURA_FIELD', id: est.id, field, value: next })
  }
  const setObs = (v) => dispatch({ type: 'SET_ESTRUTURA_FIELD', id: est.id, field: 'obsCompartimentacao', value: v })

  return (
    <EstruturaSection titulo={est.nome} extra={<EstruturaHeaderInfo estrutura={est}/>}>

      {/* Compartimentação Horizontal */}
      <Card className="mb-3">
        <div className="py-3.5 px-[18px] flex items-center justify-between border-b border-solid border-border">
          <div className="flex items-center gap-2">
            <Icon name={SISTEMA_ICON.compart_horizontal} size={15} color="var(--color-red)"/>
            <span className="text-xs font-bold text-ink">Compartimentação Horizontal</span>
          </div>
          <ObrigatoriedadeBadge obrigatorio={obrigH}/>
        </div>
        {obrigH ? (
          <div className="py-3.5 px-[18px] flex flex-col gap-4">
            <TabelaAreaMaxima resultado={resultadoArea}/>
            <div className="grid grid-cols-2 gap-4">
              <Checklist
                titulo="Elementos de proteção adotados (itens 5.1.3 e 5.1.5 — constar no memorial)"
                opcoes={ELEMENTOS_COMPART_HORIZONTAL}
                valores={elementosH}
                onToggle={(k) => toggleArr('elementosCompartHorizontal', elementosH, k)}
              />
              <Checklist
                titulo="Condições especiais aplicáveis"
                opcoes={CONDICOES_ESPECIAIS_HORIZONTAL}
                valores={condH}
                onToggle={(k) => toggleArr('condicoesEspeciaisCompartHorizontal', condH, k)}
              />
            </div>
            <div className="ibox amber">
              <Icon name="info" size={13} color="var(--color-amber)" className="shrink-0"/>
              <span className="text-xs">TRRF mínimo da parede de compartimentação: {TRRF_MINIMO_PAREDE_COMPARTIMENTACAO} min (EI-{TRRF_MINIMO_PAREDE_COMPARTIMENTACAO}). Portas/vedadores/registros podem ter até {TRRF_REDUCAO_MAXIMA_ABERTURAS} min a menos que a parede, nunca abaixo de {TRRF_MINIMO_PAREDE_COMPARTIMENTACAO} min (itens 5.4.1 e 5.4.2).</span>
            </div>
          </div>
        ) : (
          <div className="py-3.5 px-[18px]">
            <div className="ibox green">
              <Icon name="check" size={13} color="var(--color-green)" className="shrink-0"/>
              <span className="text-xs">Compartimentação horizontal não exigida para a ocupação/altura atual desta estrutura, conforme NT 01 CBMMA (Tabela 5 ou 6 aplicável).</span>
            </div>
          </div>
        )}
      </Card>

      {/* Compartimentação Vertical */}
      <Card className="mb-3">
        <div className="py-3.5 px-[18px] flex items-center justify-between border-b border-solid border-border">
          <div className="flex items-center gap-2">
            <Icon name={SISTEMA_ICON.compart_vertical} size={15} color="var(--color-red)"/>
            <span className="text-xs font-bold text-ink">Compartimentação Vertical</span>
          </div>
          <ObrigatoriedadeBadge obrigatorio={obrigV}/>
        </div>
        {obrigV ? (
          <div className="py-3.5 px-[18px] flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Checklist
                titulo="Elementos de proteção adotados (itens 6.1.2 e 6.1.5 — constar no memorial)"
                opcoes={ELEMENTOS_COMPART_VERTICAL}
                valores={elementosV}
                onToggle={(k) => toggleArr('elementosCompartVertical', elementosV, k)}
              />
              <Checklist
                titulo="Condições especiais aplicáveis"
                opcoes={CONDICOES_ESPECIAIS_VERTICAL}
                valores={condV}
                onToggle={(k) => toggleArr('condicoesEspeciaisCompartVertical', condV, k)}
              />
            </div>
            <div className="ibox amber">
              <Icon name="info" size={13} color="var(--color-amber)" className="shrink-0"/>
              <span className="text-xs">TRRF mínimo dos entrepisos: {TRRF_MINIMO_PAREDE_COMPARTIMENTACAO} min (EI-{TRRF_MINIMO_PAREDE_COMPARTIMENTACAO}). Paredes de enclausuramento de escadas e elevadores de segurança: mínimo {TRRF_MINIMO_ENCLAUSURAMENTO_ESCADA_ELEVADOR} min (EI-{TRRF_MINIMO_ENCLAUSURAMENTO_ESCADA_ELEVADOR}), conforme itens 6.4.1 e 6.4.2.2.</span>
            </div>
          </div>
        ) : (
          <div className="py-3.5 px-[18px]">
            <div className="ibox green">
              <Icon name="check" size={13} color="var(--color-green)" className="shrink-0"/>
              <span className="text-xs">Compartimentação vertical não exigida para a ocupação/altura atual desta estrutura, conforme NT 01 CBMMA (Tabela 5 ou 6 aplicável). Atenção: a inexistência ou quebra da compartimentação vertical soma as áreas dos pavimentos interligados para fins de área máxima de compartimentação horizontal (item 6.1.1).</span>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="py-3.5 px-[18px]">
          <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">Observações do responsável técnico</div>
          <textarea
            value={est.obsCompartimentacao || ''}
            onChange={e => setObs(e.target.value)}
            placeholder="Anotações livres sobre isenções, reduções ou justificativas de compartimentação aplicadas a esta estrutura (opcional)."
            className="bg-bg border border-solid border-border rounded-md text-ink text-xs py-2 px-2.5 w-full outline-none box-border min-h-[72px]"
          />
        </div>
      </Card>
    </EstruturaSection>
  )
}

export default function CompartimentacaoPage() {
  const { state, dispatch } = useProjeto()
  const { compart } = useNorma()
  const { porEstrutura } = useMedidasObrigatorias()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">

        <div className="mb-7">
          <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Medidas de Segurança</div>
          <h2 className="flex items-center gap-2 text-[22px] font-bold text-ink mb-1.5">
            <Icon name={SISTEMA_ICON.compart_horizontal} size={20} color="var(--color-red)" className="shrink-0"/>
            Compartimentação Horizontal e Vertical
          </h2>
          <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[640px] m-0">
            Verificação de exigibilidade (NT 01 CBMMA) e de área máxima de compartimentação (Anexo B, NT 09 CBMMA), por estrutura, a partir da ocupação, altura e área de cada pavimento.
          </p>
        </div>

        {state.estruturas.map(est => {
          const pe = porEstrutura.find(x => x.estrutura.id === est.id)
          return (
            <EstruturaCompartimentacao
              key={est.id}
              est={est}
              pavimentos={state.pavimentos.filter(p => p.estruturaId === est.id)}
              compart={compart}
              obrigH={!!pe?.medidas?.compart_horizontal}
              obrigV={!!pe?.medidas?.compart_vertical}
              dispatch={dispatch}
            />
          )
        })}
      </div>
    </div>
  )
}
