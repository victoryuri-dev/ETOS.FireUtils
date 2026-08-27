import { useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { riscoDoPavimentoRobusto, calcularBrigadaPavimento } from '../../data/brigada_calc'
import Icon from '../../components/ui/Icon'
import EstruturaSection from '../../components/ui/EstruturaSection'
import EstruturaHeaderInfo from '../../components/ui/EstruturaHeaderInfo'
import { SISTEMA_ICON } from '../../data/sistemasIcons'

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
// Recebe o cálculo já pronto (calculado uma única vez em TabelaBrigadaEstrutura,
// que também precisa dele para os totais) — evita rodar a mesma regra duas vezes.
function LinhaPavimento({ pavimento, risco, linha, resultado, nivelTreinamento, nivelInstalacao, notasIdentificadas, dispatch }) {
  const divisao = pavimento.divisao
  const setPopulacao = v => dispatch({ type: 'UPDATE_PAV', id: pavimento.id, changes: { populacaoFixa: v } })

  const semLinha = !linha
  const isento = linha?.isento
  const especial = resultado?.especial

  return (
    <tr>
      <td className="py-2 px-2.5 border-b border-solid border-border-2 text-[13px] font-medium text-ink whitespace-nowrap">{pavimento.label}</td>
      <td className="py-2 px-2.5 border-b border-solid border-border-2">
        <span className="text-[11px] text-ink-faint bg-surface-2 border border-solid border-border-2 rounded py-0.5 px-1.5 font-mono">{divisao || '—'}</span>
      </td>
      <td className="py-2 px-2.5 border-b border-solid border-border-2"><RiscoBadge risco={risco}/></td>
      <td className="py-2 px-2.5 border-b border-solid border-border-2">
        <input
          type="number" min="0" step="1"
          value={pavimento.populacaoFixa ?? ''}
          onChange={e => setPopulacao(e.target.value)}
          placeholder="0"
          className="w-16 text-right"
        />
      </td>
      {semLinha ? (
        <td className="py-2 px-2.5 border-b border-solid border-border-2" colSpan={4}>
          <span className="text-[11px] text-amber flex items-center gap-1.5">
            <Icon name="warn" size={12} color="var(--color-amber)" className="shrink-0"/>
            {divisao ? `Divisão ${divisao} não cadastrada na Tabela A.1 — verifique com o CBM competente.` : 'Classifique a divisão de ocupação na Etapa 4.'}
          </span>
        </td>
      ) : (
        <>
          <td className="py-2 px-2.5 border-b border-solid border-border-2 text-center">
            <span className={`text-base font-bold ${isento ? 'text-ink-faint' : 'text-ink'}`}>{resultado.brigadistas ?? '—'}</span>
            {especial && <Icon name="warn" size={11} color="var(--color-amber)" className="inline-block ml-1 align-text-top" title={resultado.detalhe}/>}
          </td>
          <td className="py-2 px-2.5 border-b border-solid border-border-2"><NivelBadge nivel={nivelTreinamento}/></td>
          <td className="py-2 px-2.5 border-b border-solid border-border-2"><NivelBadge nivel={nivelInstalacao}/></td>
          <td className="py-2 px-2.5 border-b border-solid border-border-2">
            <div className="flex flex-wrap gap-1">
              {notasIdentificadas?.map(n => <span key={n} className="text-[10px] text-ink-faint bg-surface-2 border border-solid border-border-2 rounded py-0.5 px-1.5">Nota {n}</span>)}
            </div>
          </td>
        </>
      )}
    </tr>
  )
}

// ── Tabela de dimensionamento de uma estrutura ────────────────────────
function TabelaBrigadaEstrutura({ estrutura, pavimentos, cargaEst, cnaesDiv, limiaresRisco, tabela, notasTabela, dispatch }) {
  const linhasCalculadas = pavimentos.map(pav => {
    const risco = riscoDoPavimentoRobusto(pav, cargaEst, cnaesDiv, limiaresRisco)
    return { pav, risco, ...calcularBrigadaPavimento(pav.divisao, risco, pav.populacaoFixa, estrutura.altura, tabela) }
  })

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
  const totalBrigadistas = linhasCalculadas.reduce((s, l) => s + (l.resultado?.brigadistas || 0), 0)
  const ORDEM_NIVEL = { basico: 1, intermediario: 2, avancado: 3 }
  const nivelMaisAlto = (campo) => linhasCalculadas
    .map(l => l[campo])
    .filter(n => n && !n.dinamico)
    .reduce((max, n) => (!max || ORDEM_NIVEL[n.nivel] > ORDEM_NIVEL[max.nivel]) ? n : max, null)
  const treinamentoMax = nivelMaisAlto('nivelTreinamento')
  const instalacaoMax = nivelMaisAlto('nivelInstalacao')

  return (
    <>
      <div className="border border-solid border-border rounded-md overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-2">
              <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-left border-b border-solid border-border">Pavimento</th>
              <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-left border-b border-solid border-border">Divisão</th>
              <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-left border-b border-solid border-border">Risco</th>
              <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-right border-b border-solid border-border">Pop. fixa</th>
              <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-center border-b border-solid border-border">Brigadistas</th>
              <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-left border-b border-solid border-border">Treinamento</th>
              <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-left border-b border-solid border-border">Instalação</th>
              <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-left border-b border-solid border-border">Notas</th>
            </tr>
          </thead>
          <tbody>
            {linhasCalculadas.map(({ pav, risco, linha, resultado, nivelTreinamento, nivelInstalacao, notasIdentificadas }) => (
              <LinhaPavimento
                key={pav.id}
                pavimento={pav}
                risco={risco}
                linha={linha}
                resultado={resultado}
                nivelTreinamento={nivelTreinamento}
                nivelInstalacao={nivelInstalacao}
                notasIdentificadas={notasIdentificadas}
                dispatch={dispatch}
              />
            ))}
          </tbody>
          {totalNumerico && (
            <tfoot>
              <tr className="bg-surface-2">
                <td className="py-2 px-2.5 text-[12px] font-semibold text-ink" colSpan={4}>Total da estrutura</td>
                <td className="py-2 px-2.5 text-center text-base font-bold text-ink">{totalBrigadistas}</td>
                <td className="py-2 px-2.5"><NivelBadge nivel={treinamentoMax}/></td>
                <td className="py-2 px-2.5"><NivelBadge nivel={instalacaoMax}/></td>
                <td/>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {observacoes.length > 0 && (
        <div className="text-[11px] text-ink-faint leading-[1.6] mt-2.5 flex flex-col gap-1">
          {observacoes.map((o, i) => <span key={i}>{o}</span>)}
        </div>
      )}
    </>
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
              ) : (
                <TabelaBrigadaEstrutura
                  estrutura={est}
                  pavimentos={pavimentos}
                  cargaEst={state.cargaState[est.id] || {}}
                  cnaesDiv={cnaesDiv}
                  limiaresRisco={extNorma.LIMIARES_RISCO}
                  tabela={brigNorma.TABELA_A1}
                  notasTabela={brigNorma.NOTAS_TABELA_A1}
                  dispatch={dispatch}
                />
              )}
            </EstruturaSection>
          )
        })}
      </div>
    </div>
  )
}
