import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { calcularAreaMaximaCompartimentacao } from '../../data/compart_calc'
import Icon from '../../components/ui/Icon'
import Checkbox from '../../components/ui/Checkbox'
import InfoTip from '../../components/ui/InfoTip'
import EstruturaSection from '../../components/ui/EstruturaSection'
import EstruturaHeaderInfo from '../../components/ui/EstruturaHeaderInfo'
import { SISTEMA_ICON } from '../../data/sistemasIcons'

function Card({ children, className = '' }) {
  return <div className={`bg-surface border border-solid border-border rounded-lg overflow-hidden ${className}`}>{children}</div>
}

// Separador leve entre o bloco de verificação (resultado) e o de
// documentação (elementos adotados, condições, TRRF) — a hierarquia visual
// que faltava: primeiro a resposta, depois o suporte pro memorial.
function Divisor() {
  return <div className="border-t border-solid border-border -mx-[18px]"/>
}

function SectionLabel({ children, tip }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-ink-faint uppercase tracking-[.06em] mb-2">
      {children}
      {tip && <InfoTip text={tip}/>}
    </div>
  )
}

function Checklist({ titulo, tip, opcoes, valores, onToggle }) {
  return (
    <div>
      <SectionLabel tip={tip}>{titulo}</SectionLabel>
      <div className="flex flex-col gap-1.5">
        {opcoes.map(o => (
          <div key={o.key} className="flex items-center gap-2 text-xs text-ink-muted cursor-pointer" onClick={() => onToggle(o.key)}>
            <Checkbox checked={valores.includes(o.key)} onChange={() => onToggle(o.key)}/>
            <span className="flex-1">{o.label || o.texto}</span>
            {o.texto && o.label && <InfoTip text={o.ref ? `${o.texto} (item ${o.ref})` : o.texto}/>}
          </div>
        ))}
      </div>
    </div>
  )
}

function ObrigatoriedadeBadge({ obrigatorio, isenta }) {
  if (obrigatorio && isenta) {
    return (
      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full border border-solid text-[11px] font-semibold bg-[rgba(29,158,117,.20)] border-green-border text-green">
        <Icon name="check" size={12}/> Isenta — sistema substituto
      </span>
    )
  }
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

// Botões de substituição por sistema alternativo (notas de rodapé da
// Tabela 6, NT 01 CBMMA — ver SUBSTITUICOES_COMPARTIMENTACAO). Só aparece
// quando é relevante: a compartimentação já não está conforme, ou uma
// substituição já foi escolhida (pra permitir trocar/remover) — na situação
// comum (conforme, sem isenção) fica escondido, sem disputar atenção com o
// resultado principal.
function SubstituicaoButtons({ opcoes, ativa, onSelecionar, onLimpar }) {
  return (
    <div>
      <SectionLabel tip="Notas de rodapé da Tabela 6 (NT 01 CBMMA) — a nota exata varia por grupo de ocupação e altura; confirme contra a tabela aplicável antes de marcar.">
        Substituir por sistema alternativo
      </SectionLabel>
      <div className="flex flex-wrap gap-2">
        {opcoes.map(o => {
          const selecionada = ativa === o.key
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => selecionada ? onLimpar() : onSelecionar(o.key)}
              className={`py-1.5 px-3 rounded-md border border-solid text-[11px] font-semibold cursor-pointer transition-colors ${
                selecionada
                  ? 'bg-green-dim border-green-border text-green'
                  : 'bg-transparent border-border text-ink-muted hover:border-red-border hover:text-red'
              }`}
            >
              {selecionada && <Icon name="check" size={11} className="mr-1"/>}
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AreaConsideradaInput({ linha, onChangeArea }) {
  const overrideRaw = linha.overrideAtivo ? linha.area : ''
  return (
    <input
      type="number"
      min="0"
      step="any"
      value={overrideRaw}
      onChange={e => onChangeArea(linha.pavimento.id, e.target.value)}
      placeholder={linha.areaPavimento ? String(linha.areaPavimento) : '0'}
      className="bg-bg border border-solid border-border rounded-md text-ink text-xs py-1.5 px-2 w-[90px] text-right outline-none box-border"
    />
  )
}

function SituacaoCelula({ linha }) {
  if (!linha.area) return <span className="text-ink-faint">Informe a área</span>
  if (linha.excede) return <span className="inline-flex items-center gap-1 text-red"><Icon name="warn" size={12}/> Excede</span>
  return <span className="inline-flex items-center gap-1 text-green"><Icon name="check" size={12}/> Conforme</span>
}

function TabelaAreaMaxima({ resultado, onChangeArea, isenta }) {
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
      <div className="text-xs text-ink-muted mb-3">
        <span className="text-ink-faint">Tipo de edificação (Anexo B) </span>
        <span className="font-semibold text-ink">Tipo {resultado.tipo} — {resultado.tipoNome}</span>
      </div>

      {resultado.linhas.length === 0 ? (
        <div className="text-xs text-ink-faint">Nenhum pavimento com divisão/área classificada ainda.</div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-solid border-border">
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">Pavimento</th>
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">Divisão</th>
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">
                <span className="inline-flex items-center gap-1">
                  Área considerada
                  <InfoTip text="Item 5.1.2, NT 09 CBMMA: deve incluir a área de todos os pavimentos e mezaninos interligados com este pavimento — o padrão é a área cadastrada do próprio pavimento, sem interligação."/>
                </span>
              </th>
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">Área máxima</th>
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-solid divide-border">
            {resultado.linhas.map(l => (
              <tr key={l.pavimento.id}>
                <td className="py-2 px-3 text-xs text-ink">{l.pavimento.label}</td>
                <td className="py-2 px-3 text-xs text-ink-faint">{l.pavimento.divisao}</td>
                <td className="py-2 px-3 text-xs text-ink-faint">
                  <AreaConsideradaInput linha={l} onChangeArea={onChangeArea}/> m²
                </td>
                <td className="py-2 px-3 text-xs text-ink-faint">
                  {!l.encontrado ? '—' : typeof l.valor === 'number' ? `${l.valor} m²` : 'sem limite'}
                </td>
                <td className="py-2 px-3 text-xs font-semibold"><SituacaoCelula linha={l}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isenta ? (
        resultado.pavimentosExcedentes.length > 0 && (
          <div className="ibox amber mt-3">
            <Icon name="info" size={13} color="var(--color-amber)" className="shrink-0"/>
            <span className="text-xs">
              Tabela informativa: a compartimentação foi substituída por sistema alternativo, então {resultado.pavimentosExcedentes.length === 1 ? 'o pavimento acima' : 'os pavimentos acima'} não precisa{resultado.pavimentosExcedentes.length === 1 ? '' : 'm'} ser subdividido{resultado.pavimentosExcedentes.length === 1 ? '' : 's'}.
            </span>
          </div>
        )
      ) : (
        resultado.pavimentosExcedentes.length > 0 && (
          <div className="ibox red mt-3">
            <Icon name="warn" size={14} color="var(--color-red)" className="shrink-0"/>
            <span className="text-xs">
              {resultado.pavimentosExcedentes.length === 1 ? 'Um pavimento excede' : `${resultado.pavimentosExcedentes.length} pavimentos excedem`} a área máxima — subdivida o compartimento ou substitua por sistema alternativo (abaixo).
            </span>
          </div>
        )
      )}
    </>
  )
}

function TrrfNota({ children }) {
  return (
    <div className="flex items-start gap-2 text-[11px] text-ink-faint leading-[1.6]">
      <Icon name="info" size={13} className="shrink-0 mt-0.5"/>
      <span>{children}</span>
    </div>
  )
}

function EstruturaCompartimentacao({ est, pavimentos, areaCompartimentacaoHorizontal, compart, obrigH, obrigV, dispatch }) {
  const {
    TABELA_AREA_MAXIMA: tabelaArea, CLASSES_TIPO_EDIFICACAO: classesTipo,
    ELEMENTOS_COMPART_HORIZONTAL, ELEMENTOS_COMPART_VERTICAL,
    CONDICOES_ESPECIAIS_HORIZONTAL, CONDICOES_ESPECIAIS_VERTICAL,
    SUBSTITUICOES_COMPARTIMENTACAO,
    TRRF_MINIMO_PAREDE_COMPARTIMENTACAO, TRRF_REDUCAO_MAXIMA_ABERTURAS,
    TRRF_MINIMO_ENCLAUSURAMENTO_ESCADA_ELEVADOR,
  } = compart
  const resultadoArea = calcularAreaMaximaCompartimentacao(pavimentos, est, tabelaArea, classesTipo, areaCompartimentacaoHorizontal)

  const elementosH = est.elementosCompartHorizontal || []
  const elementosV = est.elementosCompartVertical || []
  const condH = est.condicoesEspeciaisCompartHorizontal || []
  const condV = est.condicoesEspeciaisCompartVertical || []
  const isencaoH = est.isencaoCompartHorizontal || null
  const isencaoV = est.isencaoCompartVertical || null
  // Botões de substituição só entram na tela quando fazem diferença: a área
  // já excede o limite (é a saída natural do problema) ou uma substituição
  // já foi escolhida (pra poder trocar/remover) — no caso comum (conforme,
  // sem isenção) ficam fora, sem competir com o resultado.
  const mostrarSubstituicaoH = !!isencaoH || resultadoArea.pavimentosExcedentes.length > 0

  const toggleArr = (field, atual, key) => {
    const next = atual.includes(key) ? atual.filter(x => x !== key) : [...atual, key]
    dispatch({ type: 'SET_ESTRUTURA_FIELD', id: est.id, field, value: next })
  }
  const setObs = (v) => dispatch({ type: 'SET_ESTRUTURA_FIELD', id: est.id, field: 'obsCompartimentacao', value: v })
  const onChangeArea = (pavimentoId, valor) => dispatch({ type: 'SET_AREA_COMPARTIMENTACAO', pavimentoId, valor })

  // Seleciona uma substituição: grava a escolha na estrutura e liga (nunca
  // desliga) os sistemas correspondentes — clicar numa combinação diferente
  // só soma sistemas, nunca desativa o que já estava ligado por outro motivo.
  const selecionarSubstituicao = (campo, key) => {
    dispatch({ type: 'SET_ESTRUTURA_FIELD', id: est.id, field: campo, value: key })
    const opcao = SUBSTITUICOES_COMPARTIMENTACAO.find(o => o.key === key)
    opcao?.sistemas.forEach(sistemaKey => {
      dispatch({ type: 'TOGGLE_SISTEMA_ESTRUTURA', estruturaId: est.id, key: sistemaKey, value: true })
    })
  }
  const limparSubstituicao = (campo) => dispatch({ type: 'SET_ESTRUTURA_FIELD', id: est.id, field: campo, value: null })

  return (
    <EstruturaSection titulo={est.nome} extra={<EstruturaHeaderInfo estrutura={est}/>}>

      {/* Compartimentação Horizontal */}
      <Card className="mb-3">
        <div className="py-3.5 px-[18px] flex items-center justify-between border-b border-solid border-border">
          <div className="flex items-center gap-2">
            <Icon name={SISTEMA_ICON.compart_horizontal} size={15} color="var(--color-red)"/>
            <span className="text-xs font-bold text-ink">Compartimentação Horizontal</span>
          </div>
          <ObrigatoriedadeBadge obrigatorio={obrigH} isenta={!!isencaoH}/>
        </div>
        {obrigH ? (
          <div className="py-3.5 px-[18px] flex flex-col gap-4">
            {isencaoH && (
              <div className="ibox green">
                <Icon name="check" size={13} color="var(--color-green)" className="shrink-0"/>
                <span className="text-xs">
                  Isenta da área máxima mediante {SUBSTITUICOES_COMPARTIMENTACAO.find(o => o.key === isencaoH)?.texto.toLowerCase()} — confirme a nota de rodapé aplicável antes de assinar o memorial.
                  {' '}<button type="button" onClick={() => limparSubstituicao('isencaoCompartHorizontal')} className="underline cursor-pointer text-green">Remover</button>
                </span>
              </div>
            )}

            <TabelaAreaMaxima resultado={resultadoArea} onChangeArea={onChangeArea} isenta={!!isencaoH}/>

            {mostrarSubstituicaoH && (
              <SubstituicaoButtons
                opcoes={SUBSTITUICOES_COMPARTIMENTACAO}
                ativa={isencaoH}
                onSelecionar={(k) => selecionarSubstituicao('isencaoCompartHorizontal', k)}
                onLimpar={() => limparSubstituicao('isencaoCompartHorizontal')}
              />
            )}

            <Divisor/>

            <div className="grid grid-cols-2 gap-6">
              <Checklist
                titulo="Elementos de proteção adotados"
                tip="Itens 5.1.3 e 5.1.5, NT 09 CBMMA — a solução adotada deve constar no memorial descritivo."
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

            <TrrfNota>
              TRRF mínimo da parede: {TRRF_MINIMO_PAREDE_COMPARTIMENTACAO} min (EI-{TRRF_MINIMO_PAREDE_COMPARTIMENTACAO}). Portas/vedadores/registros podem ter até {TRRF_REDUCAO_MAXIMA_ABERTURAS} min a menos, nunca abaixo de {TRRF_MINIMO_PAREDE_COMPARTIMENTACAO} min (itens 5.4.1 e 5.4.2).
            </TrrfNota>
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
          <ObrigatoriedadeBadge obrigatorio={obrigV} isenta={!!isencaoV}/>
        </div>
        {obrigV ? (
          <div className="py-3.5 px-[18px] flex flex-col gap-4">
            {isencaoV && (
              <div className="ibox green">
                <Icon name="check" size={13} color="var(--color-green)" className="shrink-0"/>
                <span className="text-xs">
                  Isenta mediante {SUBSTITUICOES_COMPARTIMENTACAO.find(o => o.key === isencaoV)?.texto.toLowerCase()} — a compartimentação das fachadas e a selagem dos shafts/dutos continuam exigidas. Confirme a nota de rodapé aplicável antes de assinar o memorial.
                  {' '}<button type="button" onClick={() => limparSubstituicao('isencaoCompartVertical')} className="underline cursor-pointer text-green">Remover</button>
                </span>
              </div>
            )}

            <SubstituicaoButtons
              opcoes={SUBSTITUICOES_COMPARTIMENTACAO}
              ativa={isencaoV}
              onSelecionar={(k) => selecionarSubstituicao('isencaoCompartVertical', k)}
              onLimpar={() => limparSubstituicao('isencaoCompartVertical')}
            />

            <Divisor/>

            <div className="grid grid-cols-2 gap-6">
              <Checklist
                titulo="Elementos de proteção adotados"
                tip="Itens 6.1.2 e 6.1.5, NT 09 CBMMA — a solução adotada deve constar no memorial descritivo."
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

            <TrrfNota>
              TRRF mínimo dos entrepisos: {TRRF_MINIMO_PAREDE_COMPARTIMENTACAO} min (EI-{TRRF_MINIMO_PAREDE_COMPARTIMENTACAO}). Enclausuramento de escadas/elevadores de segurança: mínimo {TRRF_MINIMO_ENCLAUSURAMENTO_ESCADA_ELEVADOR} min (EI-{TRRF_MINIMO_ENCLAUSURAMENTO_ESCADA_ELEVADOR}), itens 6.4.1 e 6.4.2.2.
            </TrrfNota>
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
          <SectionLabel>Observações do responsável técnico</SectionLabel>
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
              areaCompartimentacaoHorizontal={state.areaCompartimentacaoHorizontal}
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
