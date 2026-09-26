import { useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { riscoDoPavimentoRobusto, calcularBrigadaPavimento } from '../../data/brigada_calc'
import Icon from '../../components/ui/Icon'
import EstruturaSection from '../../components/ui/EstruturaSection'
import EstruturaHeaderInfo from '../../components/ui/EstruturaHeaderInfo'
import { SISTEMA_ICON } from '../../data/sistemasIcons'
import { statusEstrutura } from '../../utils/statusEstrutura'

// ── Shared UI (mesmo estilo das demais páginas de medida) ────────────────
function Card({ children, className = '' }) {
  return <div className={`bg-surface border border-solid border-border rounded-lg overflow-hidden ${className}`}>{children}</div>
}
function RiscoBadge({ risco }) {
  const map    = { baixo: 'low', medio: 'med', alto: 'high' }
  const labels = { baixo: 'Risco baixo', medio: 'Risco médio', alto: 'Risco alto' }
  if (!risco) return <span className="carga-class" style={{ background: 'var(--color-border-2)', color: 'var(--color-ink-faint)' }}>Risco pendente</span>
  return <span className={`carga-class ${map[risco]}`}>{labels[risco]}</span>
}

// ── Selo de nível de treinamento/instalação ──────────────────────────
function NivelBadge({ nivel }) {
  if (!nivel) return <span className="text-[11px] text-ink-faint">—</span>
  const map = { basico: 'low', intermediario: 'med', avancado: 'high' }
  return <span className={`carga-class ${nivel.dinamico ? 'med' : map[nivel.nivel] || ''}`} title={nivel.detalhe || undefined}>{nivel.label}</span>
}

// ── Linha de um pavimento dentro da tabela da estrutura ──────────────
// Recebe o cálculo já pronto (calculado uma única vez em EstruturaBrigada, que
// também precisa dele para os totais e o status) — evita rodar a regra duas vezes.
const TH = 'py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium'
const TD = 'py-2 px-3 text-xs'

function LinhaPavimento({ pavimento, risco, linha, resultado, nivelTreinamento, nivelInstalacao, dispatch }) {
  const divisao = pavimento.divisao
  const setPopulacao = v => dispatch({ type: 'UPDATE_PAV', id: pavimento.id, changes: { populacaoFixa: v } })
  const isento = linha?.isento
  const especial = resultado?.especial

  return (
    <tr>
      <td className={`${TD} text-ink whitespace-nowrap`}>{pavimento.label}</td>
      <td className={`${TD} text-ink-faint`}>{divisao || '—'}</td>
      <td className={TD}><RiscoBadge risco={risco}/></td>
      <td className={TD}>
        <input
          type="number" min="0" step="1"
          value={pavimento.populacaoFixa ?? ''}
          onChange={e => setPopulacao(e.target.value)}
          placeholder="0"
          className="w-16 text-right"
        />
      </td>
      {!linha ? (
        <td className={TD} colSpan={3}>
          <span className="text-[11px] text-amber flex items-center gap-1.5">
            <Icon name="warn" size={12} color="var(--color-amber)" className="shrink-0"/>
            {divisao ? `Divisão ${divisao} não cadastrada na Tabela A.1 — verifique com o CBM competente.` : 'Classifique a divisão de ocupação na Etapa 4.'}
          </span>
        </td>
      ) : (
        <>
          <td className={`${TD} text-center`}>
            <span className={`text-base font-bold ${isento ? 'text-ink-faint' : 'text-ink'}`}>{resultado.brigadistas ?? '—'}</span>
            {especial && <Icon name="warn" size={11} color="var(--color-amber)" className="inline-block ml-1 align-text-top" title={resultado.detalhe}/>}
          </td>
          <td className={TD}><NivelBadge nivel={nivelTreinamento}/></td>
          <td className={TD}><NivelBadge nivel={nivelInstalacao}/></td>
        </>
      )}
    </tr>
  )
}

const ORDEM_NIVEL = { basico: 1, intermediario: 2, avancado: 3 }

// ── Estrutura (card colapsável) com o dimensionamento da brigada ─────────
// Mesma estrutura visual da Compartimentação: EstruturaSection com status +
// um Card da medida (título + resumo) contendo a tabela por pavimento.
function EstruturaBrigada({ estrutura, pavimentos, cargaEst, cnaesDiv, limiaresRisco, tabela, notasTabela, dispatch }) {
  const linhasCalculadas = pavimentos.map(pav => {
    const risco = riscoDoPavimentoRobusto(pav, cargaEst, cnaesDiv, limiaresRisco)
    return { pav, risco, ...calcularBrigadaPavimento(pav.divisao, risco, pav.populacaoFixa, estrutura.altura, tabela) }
  })

  // Pavimento resolvido = tem linha na Tabela A.1 e já saiu número (ou é isento).
  const resolvidos = linhasCalculadas.filter(l => l.linha && (l.linha.isento || l.resultado?.brigadistas != null)).length
  // Status base: nunca "concluído" — o verde vem só do botão de concluir
  // (EstruturaSection, prop `conclusao`).
  const status = pavimentos.length === 0
    ? statusEstrutura('pendente', 'Sem pavimentos')
    : resolvidos === 0
      ? statusEstrutura('pendente', 'População pendente')
      : statusEstrutura('andamento', resolvidos === pavimentos.length ? 'Revisar e concluir' : `${resolvidos} de ${pavimentos.length} pavimentos`)

  // Texto de cada nota vem sempre do rodapé oficial (NOTAS_TABELA_A1) — nunca
  // uma paráfrase escrita à mão — e só aparece quando pelo menos um pavimento
  // desta estrutura efetivamente a identificou (ver notasIdentificadas em
  // brigada_calc.js). `observacoesLivres` cobre só os casos sem número de
  // nota (ex.: "informe a população fixa", regra 80% dos funcionários).
  const notasNumeros = new Set()
  const observacoesLivres = new Set()
  linhasCalculadas.forEach(({ resultado, nivelTreinamento, nivelInstalacao, notasIdentificadas }) => {
    if (resultado?.detalhe) observacoesLivres.add(resultado.detalhe)
    if (nivelTreinamento?.detalhe) observacoesLivres.add(nivelTreinamento.detalhe)
    if (nivelInstalacao?.detalhe) observacoesLivres.add(nivelInstalacao.detalhe)
    notasIdentificadas?.forEach(n => notasNumeros.add(n))
  })
  const notasTexto = [...notasNumeros].sort((a, b) => a - b).map(n => `Nota ${n}: ${notasTabela[n]}`)
  const observacoes = [...notasTexto, ...observacoesLivres]

  const totalNumerico = linhasCalculadas.some(l => l.resultado?.brigadistas != null)
  const totalBrigadistas = linhasCalculadas.reduce((t, l) => t + (l.resultado?.brigadistas || 0), 0)
  const nivelMaisAlto = (campo) => linhasCalculadas
    .map(l => l[campo])
    .filter(n => n && !n.dinamico)
    .reduce((max, n) => (!max || ORDEM_NIVEL[n.nivel] > ORDEM_NIVEL[max.nivel]) ? n : max, null)
  const treinamentoMax = nivelMaisAlto('nivelTreinamento')
  const instalacaoMax = nivelMaisAlto('nivelInstalacao')

  return (
    <EstruturaSection titulo={estrutura.nome} extra={<EstruturaHeaderInfo estrutura={estrutura}/>} status={status} conclusao={pavimentos.length > 0 ? { estruturaId: estrutura.id, medida: 'brigada' } : null} defaultOpen={false}>
      <Card>
        <div className="py-3.5 px-[18px] flex items-center justify-between border-b border-solid border-border">
          <div className="flex items-center gap-2">
            <Icon name={SISTEMA_ICON.brigada} size={15} color="var(--color-red)"/>
            <span className="text-xs font-bold text-ink">Brigada de Incêndio</span>
          </div>
          {totalNumerico && (
            <span className="text-xs text-ink-muted">
              Total da estrutura <strong className="text-ink text-sm ml-1">{totalBrigadistas}</strong> brigadista{totalBrigadistas === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <div className="py-3.5 px-[18px]">
          {pavimentos.length === 0 ? (
            <div className="ibox amber">
              <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
              <span className="text-xs">Nenhum pavimento cadastrado nesta estrutura ainda — configure os pavimentos na Etapa 2.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-solid border-border">
                    <th className={TH}>Pavimento</th>
                    <th className={TH}>Divisão</th>
                    <th className={TH}>Risco</th>
                    <th className={`${TH} text-right`}>Pop. fixa</th>
                    <th className={`${TH} text-center`}>Brigadistas</th>
                    <th className={TH}>Treinamento</th>
                    <th className={TH}>Instalação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-solid divide-border">
                  {linhasCalculadas.map(({ pav, risco, linha, resultado, nivelTreinamento, nivelInstalacao }) => (
                    <LinhaPavimento
                      key={pav.id}
                      pavimento={pav}
                      risco={risco}
                      linha={linha}
                      resultado={resultado}
                      nivelTreinamento={nivelTreinamento}
                      nivelInstalacao={nivelInstalacao}
                      dispatch={dispatch}
                    />
                  ))}
                </tbody>
                {totalNumerico && (
                  <tfoot>
                    <tr className="border-t border-solid border-border">
                      <td className={`${TD} font-semibold text-ink`} colSpan={4}>Total da estrutura</td>
                      <td className={`${TD} text-center text-base font-bold text-ink`}>{totalBrigadistas}</td>
                      <td className={TD}><NivelBadge nivel={treinamentoMax}/></td>
                      <td className={TD}><NivelBadge nivel={instalacaoMax}/></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {observacoes.length > 0 && (
            <div className="text-[11px] text-ink-faint leading-[1.6] mt-3 flex flex-col gap-1">
              {observacoes.map((o, i) => <span key={i}>{o}</span>)}
            </div>
          )}

        </div>
      </Card>
    </EstruturaSection>
  )
}

// ── Referência normativa (topo da página) ────────────────────────────
function ReferenciaNormativa({ brigNorma }) {
  const [open, setOpen] = useState(false)
  const { NORMA, NOTAS_TABELA_A1, NOTAS_GERAIS, OBSERVACOES_TRANSCRICAO } = brigNorma

  return (
    <Card className="mb-8">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full py-3 px-[18px] border-b border-solid border-border bg-surface-2 flex items-center gap-2 text-left"
      >
        <span className="text-[13px] font-semibold text-ink">Parâmetros normativos ({NORMA.nome})</span>
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
  const { extintores: extNorma, brigada: brigNorma, cnaesDiv } = useNorma()

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
            Dimensionamento da brigada de incêndio orgânica por pavimento, conforme o Anexo A (Tabela A.1) da {brigNorma.NORMA.nome}. Divisão de ocupação e grau de risco vêm automaticamente da classificação já feita nas Etapas 4 e 5 — informe apenas a população fixa de cada pavimento.
          </p>
        </div>

        <ReferenciaNormativa brigNorma={brigNorma}/>

        {state.estruturas.map(est => (
          <EstruturaBrigada
            key={est.id}
            estrutura={est}
            pavimentos={state.pavimentos.filter(p => p.estruturaId === est.id)}
            cargaEst={state.cargaState[est.id] || {}}
            cnaesDiv={cnaesDiv}
            limiaresRisco={extNorma.LIMIARES_RISCO}
            tabela={brigNorma.TABELA_A1}
            notasTabela={brigNorma.NOTAS_TABELA_A1}
            dispatch={dispatch}
          />
        ))}
      </div>
    </div>
  )
}
