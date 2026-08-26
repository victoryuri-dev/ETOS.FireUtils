import { useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { riscoDoPavimento } from '../../data/extintores_calc'
import { calcularBrigadaPavimento } from '../../data/brigada_calc'
import Icon from '../../components/ui/Icon'
import EstruturaSection from '../../components/ui/EstruturaSection'
import EstruturaHeaderInfo from '../../components/ui/EstruturaHeaderInfo'
import { SISTEMA_ICON } from '../../data/sistemasIcons'

// ── Shared UI (mesmo estilo das demais páginas de medida) ────────────────
function Card({ children, className = '' }) {
  return <div className={`bg-surface border border-solid border-border rounded-lg overflow-hidden ${className}`}>{children}</div>
}
function CardHeader({ children }) {
  return <div className="py-3 px-[18px] border-b border-solid border-border bg-surface-2 flex items-center gap-2 flex-wrap">{children}</div>
}
function RiscoBadge({ risco }) {
  const map    = { baixo: 'low', medio: 'med', alto: 'high' }
  const labels = { baixo: 'Risco baixo', medio: 'Risco médio', alto: 'Risco alto' }
  if (!risco) return <span className="carga-class" style={{ background: 'var(--color-border-2)', color: 'var(--color-ink-faint)' }}>Risco pendente</span>
  return <span className={`carga-class ${map[risco]}`}>{labels[risco]}</span>
}

// ── Card de resultado de uma linha calculada (treinamento/instalação) ────
function NivelResultado({ titulo, nivel }) {
  if (!nivel) return null
  return (
    <div className="shrink-0 text-center border-l border-solid border-border pl-6">
      <div className="text-sm font-bold text-ink leading-none whitespace-nowrap">{nivel.label}</div>
      <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mt-1 whitespace-nowrap">{titulo}</div>
    </div>
  )
}

// ── Card de um pavimento ──────────────────────────────────────────────
function PavimentoCard({ pavimento, estruturaId, altura, cargaState, limiaresRisco, tabela, dispatch }) {
  const risco = riscoDoPavimento(pavimento, cargaState, limiaresRisco)
  const divisao = pavimento.divisao

  const setPopulacao = v => dispatch({ type: 'UPDATE_PAV', id: pavimento.id, changes: { populacaoFixa: v } })

  const { linha, resultado, nivelTreinamento, nivelInstalacao } = calcularBrigadaPavimento(
    divisao, risco, pavimento.populacaoFixa, altura, tabela
  )

  const semLinha = !linha
  const isento = linha?.isento
  const especial = resultado?.especial

  return (
    <Card className="mb-4">
      <CardHeader>
        <span className="text-[13px] font-semibold text-ink">{pavimento.label}</span>
        <span className="text-[11px] text-ink-faint bg-surface border border-solid border-border-2 rounded py-0.5 px-1.5 font-mono">{divisao || '—'}</span>
        <RiscoBadge risco={risco}/>
        {pavimento.area && <span className="text-[11px] text-ink-faint ml-auto">{pavimento.area} m²</span>}
      </CardHeader>

      <div className="py-3.5 px-[18px] border-b border-solid border-border flex items-end gap-4 flex-wrap">
        <div className="fg m-0 w-[180px]">
          <label>População fixa (pessoas)</label>
          <input
            type="number" min="0" step="1"
            value={pavimento.populacaoFixa ?? ''}
            onChange={e => setPopulacao(e.target.value)}
            placeholder="Ex: 12"
          />
        </div>
        <div className="text-[11px] text-ink-faint leading-[1.6] max-w-[420px]">
          Ocupantes fixos deste pavimento (funcionários/moradores em atividade contínua) no turno de maior população — ver Notas Gerais “a” e “b” quando houver mais de um turno.
        </div>
      </div>

      {semLinha ? (
        <div className="py-3.5 px-[18px]">
          <div className="ibox amber">
            <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
            <span className="text-xs">
              {divisao
                ? `A divisão ${divisao} ainda não está cadastrada na Tabela A.1 desta norma — verifique diretamente com o CBM competente.`
                : 'Classifique a divisão de ocupação deste pavimento na Etapa 4 para calcular a brigada.'}
            </span>
          </div>
        </div>
      ) : (
        <div className={`py-3.5 px-[18px] ${isento ? 'bg-surface-2' : especial ? 'bg-amber-dim' : 'bg-green-dim'}`}>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="shrink-0 text-center">
              <div className="text-2xl font-bold text-ink leading-none">{resultado.brigadistas ?? '—'}</div>
              <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mt-1 whitespace-nowrap">brigadista{resultado.brigadistas !== 1 ? 's' : ''} exigido{resultado.brigadistas !== 1 ? 's' : ''}</div>
            </div>
            {!isento && !especial && resultado.faixaUsada && (
              <div className="shrink-0 text-center border-l border-solid border-border pl-6">
                <div className="text-sm font-bold text-ink leading-none whitespace-nowrap">{resultado.faixaUsada}</div>
                <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mt-1 whitespace-nowrap">faixa da Tabela A.1</div>
              </div>
            )}
            <NivelResultado titulo="Nível de treinamento" nivel={nivelTreinamento}/>
            <NivelResultado titulo="Nível de instalação" nivel={nivelInstalacao}/>
          </div>

          {(resultado.detalhe || nivelTreinamento?.detalhe || nivelInstalacao?.detalhe || nivelTreinamento?.podeReduzirParaBasico) && (
            <div className="text-[11px] text-ink-faint leading-[1.6] mt-3 pt-3 border-t border-solid border-border-2 flex flex-col gap-1">
              {resultado.detalhe && <span>{resultado.detalhe}</span>}
              {nivelTreinamento?.detalhe && <span>{nivelTreinamento.detalhe}</span>}
              {nivelTreinamento?.podeReduzirParaBasico && (
                <span>Nota 4: como a edificação tem altura ≤ 12 m, o treinamento pode ser reduzido para o nível básico.</span>
              )}
            </div>
          )}
        </div>
      )}

      {!semLinha && linha.notas?.length > 0 && (
        <div className="py-2.5 px-[18px] flex flex-wrap gap-1.5">
          {linha.notas.map(n => (
            <span key={n} className="text-[10px] text-ink-faint bg-surface-2 border border-solid border-border-2 rounded py-1 px-2">Nota {n}</span>
          ))}
        </div>
      )}
    </Card>
  )
}

// ── Referência normativa (topo da página) ────────────────────────────
function ReferenciaNormativa({ brigNorma }) {
  const [open, setOpen] = useState(false)
  const { NORMA_BRIGADA, NOTAS_TABELA_A1, NOTAS_GERAIS, OBSERVACOES_TRANSCRICAO } = brigNorma

  return (
    <Card className="mb-8">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full py-3 px-[18px] border-b border-solid border-border bg-surface-2 flex items-center gap-2 text-left"
      >
        <span className="text-[13px] font-semibold text-ink">Parâmetros normativos ({NORMA_BRIGADA.nome})</span>
        <span className="text-[11px] text-ink-faint">Anexo A — Tabela A.1, notas e observações</span>
        <Icon name="chevD" size={14} className={`ml-auto text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>
      {open && <div className="py-3.5 px-[18px] flex flex-col gap-4">
        <div>
          <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">Notas específicas da Tabela A.1</div>
          <ul className="flex flex-col gap-1.5">
            {Object.entries(NOTAS_TABELA_A1).map(([n, texto]) => (
              <li key={n} className="text-[12px] text-ink-muted leading-[1.6]"><strong className="text-ink">Nota {n}:</strong> {texto}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">Notas gerais</div>
          <ul className="flex flex-col gap-1.5">
            {Object.entries(NOTAS_GERAIS).map(([n, texto]) => (
              <li key={n} className="text-[12px] text-ink-muted leading-[1.6]"><strong className="text-ink">{n})</strong> {texto}</li>
            ))}
          </ul>
        </div>
        {OBSERVACOES_TRANSCRICAO?.length > 0 && (
          <div className="ibox amber">
            <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold">Observações sobre a fonte desta tabela</span>
              {OBSERVACOES_TRANSCRICAO.map((o, i) => <span key={i} className="text-[11px] leading-[1.6]">{o}</span>)}
            </div>
          </div>
        )}
      </div>}
    </Card>
  )
}

// ── Page Principal ────────────────────────────────────────────────────
export default function BrigadaIncendioPage() {
  const { state, dispatch } = useProjeto()
  const { extintores: extNorma, brigada: brigNorma } = useNorma()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">

        <div className="mb-7">
          <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Medidas de Segurança</div>
          <h2 className="flex items-center gap-2 text-[22px] font-bold text-ink mb-1.5">
            <Icon name={SISTEMA_ICON.brigada} size={20} color="var(--color-red)" className="shrink-0"/>
            Brigada de Incêndio
          </h2>
          <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[650px] m-0">
            Dimensionamento da brigada de incêndio orgânica por pavimento, conforme o Anexo A (Tabela A.1) da {brigNorma.NORMA_BRIGADA.nome}. Divisão de ocupação e grau de risco vêm automaticamente da classificação já feita nas Etapas 4 e 5 — informe apenas a população fixa de cada pavimento.
          </p>
        </div>

        <ReferenciaNormativa brigNorma={brigNorma}/>

        {state.estruturas.map(est => {
          const pavimentos = state.pavimentos.filter(p => p.estruturaId === est.id)
          return (
            <EstruturaSection key={est.id} titulo={est.nome} extra={<EstruturaHeaderInfo estrutura={est}/>}>
              {pavimentos.length === 0 ? (
                <div className="ibox amber">
                  <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
                  <span className="text-xs">Nenhum pavimento cadastrado nesta estrutura ainda — configure os pavimentos na Etapa 2.</span>
                </div>
              ) : pavimentos.map(pav => (
                <PavimentoCard
                  key={pav.id}
                  pavimento={pav}
                  estruturaId={est.id}
                  altura={est.altura}
                  cargaState={state.cargaState[est.id] || {}}
                  limiaresRisco={extNorma.LIMIARES_RISCO}
                  tabela={brigNorma.TABELA_A1}
                  dispatch={dispatch}
                />
              ))}
            </EstruturaSection>
          )
        })}
      </div>
    </div>
  )
}
