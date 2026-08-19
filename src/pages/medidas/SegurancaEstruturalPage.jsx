import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { calcularTRRF, metodologiaDosMateriais } from '../../data/trrf_calc'
import Icon from '../../components/ui/Icon'
import EstruturaSection from '../../components/ui/EstruturaSection'
import { SISTEMA_ICON } from '../../data/sistemasIcons'
import EstruturaHeaderInfo from '../../components/ui/EstruturaHeaderInfo'

function Card({ children, className = '' }) {
  return <div className={`bg-surface border border-solid border-border rounded-lg overflow-hidden ${className}`}>{children}</div>
}

function LinhaPavimento({ linha }) {
  const { pavimento: p, classe, valor, referencia } = linha
  return (
    <tr>
      <td className="py-2 px-3 text-xs text-ink">{p.label}</td>
      <td className="py-2 px-3 text-xs text-ink-faint capitalize">{linha.posicao}</td>
      <td className="py-2 px-3 text-xs text-ink-faint">{p.divisao || '—'}</td>
      <td className="py-2 px-3 text-xs text-ink-faint">{classe || '—'}</td>
      <td className="py-2 px-3 text-xs font-semibold">
        {typeof valor === 'number' ? (
          <span className="text-ink">{valor} min</span>
        ) : referencia ? (
          <span className="text-amber">Ver item {referencia}</span>
        ) : !classe ? (
          <span className="text-ink-faint">—</span>
        ) : (
          <span className="text-amber">Não enquadrado</span>
        )}
      </td>
    </tr>
  )
}

function EstruturaTRRF({ est, pavimentos, tabela, classesAltura, classesSubsolo, divisoesSemOcupacao, materiaisMapa, dispatch }) {
  const sub = parseInt(est.nSubsolos) || 0
  const resultado = calcularTRRF(pavimentos, est, tabela, classesAltura, classesSubsolo, divisoesSemOcupacao)
  const metodologias = metodologiaDosMateriais(est.estrutura, materiaisMapa)

  const setObs = (v) => dispatch({ type:'SET_ESTRUTURA_FIELD', id: est.id, field:'obsSegEstrutural', value: v })

  return (
    <EstruturaSection titulo={est.nome} extra={<EstruturaHeaderInfo estrutura={est}/>}>
      <Card className="mb-3">
        <div className="py-3.5 px-[18px] grid grid-cols-2 gap-3.5">
          <div>
            <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1">Altura da edificação (piso de descarga ao último pavimento)</div>
            <div className="text-xs text-ink font-semibold">
              {est.alturaPisoPiso === '' || est.alturaPisoPiso == null ? '—' : `${est.alturaPisoPiso} m`} {resultado.classeAltura ? `— Classe ${resultado.classeAltura}` : ''}
            </div>
            {resultado.subsoloSomado && (
              <div className="text-[10px] text-amber mt-1">
                + {est.profundidadeSubsolo} m de subsolo ocupado = {resultado.alturaEfetiva} m para a classificação (item 4.31, NT 03 CBMMA)
              </div>
            )}
          </div>
          <div>
            <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1">Profundidade do subsolo</div>
            <div className="text-xs text-ink font-semibold">
              {sub === 0 ? 'Sem subsolo' : est.profundidadeSubsolo ? `${est.profundidadeSubsolo} m — Classe ${resultado.classeSubsolo || '—'}` : (
                <span className="text-amber">Informe a profundidade na Etapa 2 (Edificação)</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {!resultado.classeAltura && (
        <div className="ibox amber mb-3">
          <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
          <span className="text-xs">Altura da edificação ainda não informada ou fora da faixa coberta pelo Anexo B (acima de 250 m) — classe de altura não pôde ser determinada.</span>
        </div>
      )}

      <Card className="mb-3">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-solid border-border">
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">Pavimento</th>
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">Posição</th>
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">Divisão</th>
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">Classe</th>
              <th className="py-2 px-3 text-left text-[10px] text-ink-faint uppercase tracking-[.06em]">TRRF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-solid divide-border">
            {resultado.linhas.map(l => <LinhaPavimento key={l.pavimento.id} linha={l}/>)}
          </tbody>
        </table>
      </Card>

      {resultado.pendenciasNaoRegressao.map((pend, i) => (
        <div key={i} className="ibox red mb-3">
          <Icon name="warn" size={14} color="var(--color-red)" className="shrink-0"/>
          <span className="text-xs">
            ATENÇÃO: o TRRF de <strong>{pend.pavimentoInferior.label}</strong> ({pend.trrfInferior} min) é inferior ao TRRF de <strong>{pend.pavimentoSuperior.label}</strong>, imediatamente acima ({pend.trrfSuperior} min). Conforme item 5.12 da NT 01 CBMMA, essa elevação depende de avaliação de risco de colapso progressivo pelo responsável técnico — não é aplicada automaticamente. Confirme o julgamento antes de assinar o memorial.
          </span>
        </div>
      ))}

      {resultado.avisos.length > 0 && (
        <div className="ibox amber mb-3">
          <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
          <span className="text-xs">
            {resultado.avisos.length === 1 ? 'Um pavimento não teve' : `${resultado.avisos.length} pavimentos não tiveram`} o TRRF determinado diretamente pela tabela do Anexo B (combinação não enquadrada ou item específico do Anexo A) — consulte o SSCI do CBMMA antes de finalizar.
          </span>
        </div>
      )}

      <Card className="mb-3">
        <div className="py-3.5 px-[18px]">
          <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">Metodologia de comprovação (por material estrutural)</div>
          {metodologias.length === 0 ? (
            <div className="text-xs text-amber">Selecione o(s) material(is) estrutural(is) na Etapa 2 (Edificação).</div>
          ) : (
            <ul className="flex flex-col gap-1">
              {metodologias.map(m => (
                <li key={m.material} className="text-xs text-ink-faint">
                  <strong className="text-ink">{m.material}</strong> — {m.norma}: {m.metodologia}.
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card>
        <div className="py-3.5 px-[18px]">
          <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">Observações do responsável técnico</div>
          <textarea
            value={est.obsSegEstrutural || ''}
            onChange={e => setObs(e.target.value)}
            placeholder="Anotações livres sobre isenções, reduções ou justificativas aplicadas a esta estrutura (opcional)."
            className="bg-bg border border-solid border-border rounded-md text-ink text-xs py-2 px-2.5 w-full outline-none box-border min-h-[72px]"
          />
        </div>
      </Card>
    </EstruturaSection>
  )
}

export default function SegurancaEstruturalPage() {
  const { state, dispatch } = useProjeto()
  const { trrf } = useNorma()
  const { TABELA_TRRF, CLASSES_ALTURA, CLASSES_SUBSOLO, DIVISOES_SEM_OCUPACAO_SUBSOLO, METODOLOGIA_POR_MATERIAL } = trrf

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">

        <div className="mb-7">
          <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Medidas de Segurança</div>
          <h2 className="flex items-center gap-2 text-[22px] font-bold text-ink mb-1.5">
            <Icon name={SISTEMA_ICON.seg_estrutural} size={20} color="var(--color-red)" className="shrink-0"/>
            Segurança Estrutural Contra Incêndio
          </h2>
          <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[640px] m-0">
            Classificação e TRRF (Tempo Requerido de Resistência ao Fogo) conforme Anexo B da NT 01 CBMMA, calculados por estrutura a partir da altura (acima do solo) e da profundidade do subsolo.
          </p>
        </div>

        {state.estruturas.map(est => (
          <EstruturaTRRF
            key={est.id}
            est={est}
            pavimentos={state.pavimentos.filter(p => p.estruturaId === est.id)}
            tabela={TABELA_TRRF}
            classesAltura={CLASSES_ALTURA}
            classesSubsolo={CLASSES_SUBSOLO}
            divisoesSemOcupacao={DIVISOES_SEM_OCUPACAO_SUBSOLO}
            materiaisMapa={METODOLOGIA_POR_MATERIAL}
            dispatch={dispatch}
          />
        ))}
      </div>
    </div>
  )
}
