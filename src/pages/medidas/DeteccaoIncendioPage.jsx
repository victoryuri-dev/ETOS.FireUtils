import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import Icon from '../../components/ui/Icon'
import EstruturaSection from '../../components/ui/EstruturaSection'
import EstruturaHeaderInfo from '../../components/ui/EstruturaHeaderInfo'
import { SISTEMA_ICON } from '../../data/sistemasIcons'
import { statusEstrutura } from '../../utils/statusEstrutura'
import {
  TIPOS_DETECTOR, deteccaoDaEstrutura, deteccaoPav, detectoresAtivos, resumoDeteccaoPavimento, notasAplicaveis, fmtNum,
} from '../../data/deteccao_alarme_calc'
import { Card, CampoNum, BotaoOpcao, LinhaChave, NotasDaNorma, QuadroParametros, inputBase, TH, TD } from '../../components/deteccao/DaUi'

// ── Detecção de Incêndio ────────────────────────────────────────────────
// Tipos e quantidades de detectores por pavimento (NT 19 — mesma norma do
// Alarme, ver AlarmeIncendioPage). Mesmo padrão dos avisadores do Alarme: os
// tipos usados são escolhidos uma vez na estrutura e cada um libera a sua
// coluna de quantidade em todos os pavimentos — pavimento sem aquele tipo fica
// em branco. A quantidade vem do projeto (distribuição em planta).

function EstruturaDeteccao({ estrutura, pavimentos, norma, exigido }) {
  const { dispatch } = useProjeto()
  const cfg = deteccaoDaEstrutura(estrutura)
  const { ITENS: itens, ENTREFORROS: entre, NORMA: nrm } = norma

  const setCfg = changes => dispatch({ type: 'SET_ESTRUTURA_FIELD', id: estrutura.id, field: 'deteccao', value: { ...cfg, ...changes } })
  const setQtd = (pav, key, v) => {
    const d = deteccaoPav(pav)
    dispatch({ type: 'UPDATE_PAV', id: pav.id, changes: { deteccao: { ...d, tipos: { ...d.tipos, [key]: v } } } })
  }

  const ativos = detectoresAtivos(estrutura, pavimentos)
  const alternar = key => {
    const atuais = ativos.map(t => t.key)
    setCfg({ tiposDetector: atuais.includes(key) ? atuais.filter(k => k !== key) : [...atuais, key] })
  }

  const linhas = pavimentos.map(pav => ({ pav, r: resumoDeteccaoPavimento(pav, ativos) }))
  const totalTipo = key => linhas.reduce((s, l) => s + (l.r.itens.find(i => i.tipo === key)?.qtd || 0), 0)
  const totalDetectores = linhas.reduce((s, l) => s + l.r.total, 0)
  const resolvidos = linhas.filter(l => l.r.completo).length

  const { especificas, gerais } = notasAplicaveis(norma, pavimentos.map(p => p.divisao))

  const status = !exigido
    ? statusEstrutura('concluido', 'Não exigida')
    : pavimentos.length === 0
    ? statusEstrutura('pendente', 'Sem pavimentos')
    : resolvidos === 0
      ? statusEstrutura('pendente', 'Dados pendentes')
      : statusEstrutura('andamento', resolvidos === pavimentos.length ? 'Revisar e concluir' : `${resolvidos} de ${pavimentos.length} pavimentos`)

  return (
    <EstruturaSection
      titulo={estrutura.nome}
      extra={<EstruturaHeaderInfo estrutura={estrutura} semArea/>}
      status={status}
      conclusao={exigido && pavimentos.length > 0 ? { estruturaId: estrutura.id, medida: 'deteccao' } : null}
      defaultOpen={false}
    >
      {!exigido ? (
        <div className="ibox green">
          <Icon name="check" size={13} color="var(--color-green)" className="shrink-0"/>
          <span className="text-xs">Sistema de detecção não exigido para a ocupação/altura atual desta estrutura, conforme NT 01 CBMMA.</span>
        </div>
      ) : (
      <>
      <div className="flex flex-col gap-3">
        <Card titulo="Detectores por pavimento" icone={SISTEMA_ICON.deteccao}
          direita={<span className="text-[11px] text-ink-faint">Total da estrutura: <strong className="text-ink">{fmtNum(totalDetectores, 0)}</strong></span>}>
          <div className="text-[13px] text-ink font-medium mb-1">Tipos de detector utilizados</div>
          <div className="text-[11px] text-ink-faint mb-2.5">Selecione um ou mais — cada tipo ativo libera a sua coluna de quantidade por pavimento. Pavimento sem aquele tipo fica em branco.</div>
          <div className="flex gap-2 mb-3.5">
            {TIPOS_DETECTOR.map(t => (
              <BotaoOpcao key={t.key} ativo={ativos.some(a => a.key === t.key)} onClick={() => alternar(t.key)}>{t.label}</BotaoOpcao>
            ))}
          </div>

          {pavimentos.length === 0 ? (
            <div className="ibox amber mt-2 mb-0">
              <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
              <span className="text-xs">Nenhum pavimento cadastrado nesta estrutura ainda — configure os pavimentos na Etapa 2.</span>
            </div>
          ) : ativos.length === 0 ? (
            <div className="text-[11px] text-amber">Selecione acima os tipos de detector utilizados para informar as quantidades.</div>
          ) : (
            <>
              <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mt-1 mb-2">Quantidades por pavimento</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-solid border-border">
                      <th className={TH}>Pavimento</th>
                      {ativos.map(t => <th key={t.key} className={TH}>{t.label}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-solid divide-border">
                    {pavimentos.map(pav => {
                      const { tipos } = deteccaoPav(pav)
                      return (
                        <tr key={pav.id}>
                          <td className={`${TD} text-ink whitespace-nowrap`}>{pav.label}</td>
                          {ativos.map(t => (
                            <td key={t.key} className={TD}>
                              <div className="w-28"><CampoNum valor={tipos[t.key] ?? ''} placeholder="0" onChange={v => setQtd(pav, t.key, v)}/></div>
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-solid border-border">
                      <td className={`${TD} font-semibold text-ink`}>Total da estrutura</td>
                      {ativos.map(t => <td key={t.key} className={`${TD} font-bold text-ink`}>{fmtNum(totalTipo(t.key), 0)}</td>)}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </Card>

        <Card titulo="Premissas da estrutura" icone="info">
          <LinhaChave titulo="Entreforros / entrepisos com instalações combustíveis" item={itens.entreforros}
            descricao={`Havendo detecção, são obrigatórios detectores nesses espaços${entre.obrigatorio_com_deteccao ? '' : ''}.`}
            checked={cfg.entreforros} onChange={v => setCfg({ entreforros: v })}/>
          {cfg.entreforros && (
            <div className="pb-2.5">
              <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1">Onde e quais instalações</div>
              <input className={inputBase} value={cfg.entreforrosDescricao} placeholder="Ex.: forro do 1º pavimento com eletrocalhas e cabos elétricos"
                onChange={e => setCfg({ entreforrosDescricao: e.target.value })}/>
            </div>
          )}
          <LinhaChave titulo="Ambientes com ar-condicionado ou ventilação forçada"
            descricao="Recomenda-se detectores próximos aos retornos e afastados 1,50 m dos pontos de insuflamento; o sistema deve funcionar com e sem ventilação."
            checked={cfg.arCondicionado} onChange={v => setCfg({ arCondicionado: v })}/>
        </Card>
      </div>

      <NotasDaNorma especificas={especificas} gerais={gerais} sigla={nrm.sigla}/>
      </>
      )}
    </EstruturaSection>
  )
}

export default function DeteccaoIncendioPage() {
  const { state } = useProjeto()
  const { deteccaoAlarme: norma } = useNorma()
  const { porEstrutura } = useMedidasObrigatorias()
  const { NORMA: nrm, DETECTORES: det, ITENS: itens } = norma
  const f = det.tipos.fumaca_pontual, t = det.tipos.temperatura_pontual

  const linhasNorma = [
    ['Fumaça pontual — área máxima', `${f.area_max_m2} m² (${f.lado_m} m x ${f.lado_m} m, raio ${fmtNum(f.raio_m, 1)} m)`, f.item],
    ['Fumaça pontual — altura máxima do teto', `${f.altura_max_m} m`, f.item],
    ['Temperatura pontual — área máxima', `${t.area_max_m2} m² (${t.lado_m} m x ${t.lado_m} m, raio ${fmtNum(t.raio_m, 1)} m)`, t.item],
    ['Temperatura pontual — altura máxima do teto', `${t.altura_max_m} m`, t.item],
    ['Afastamento mínimo da parede/viga', `${fmtNum(f.afastamento_parede_min_m)} m`, f.item],
    ['Redução por viga de 0,21 a 0,60 m', 'dois terços da área', f.item],
    ['Redução por viga acima de 0,60 m', 'metade da área', f.item],
    ['Detector linear de fumaça — distância máx. emissor/receptor', `${det.tipos.fumaca_linear.dist_emissor_receptor_max_m} m`, det.tipos.fumaca_linear.item],
    ['Detector linear de fumaça — distância entre feixes', `${det.tipos.fumaca_linear.dist_entre_feixes_max_m} m`, det.tipos.fumaca_linear.item],
    ['Fonte dos parâmetros dos detectores', det.fonte, null],
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">
        <div className="mb-7">
          <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Medidas de Segurança</div>
          <h2 className="flex items-center gap-2 text-[22px] font-bold text-ink mb-1.5">
            <Icon name={SISTEMA_ICON.deteccao} size={20} color="var(--color-red)" className="shrink-0"/>
            Detecção de Incêndio
          </h2>
          <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[650px] m-0">
            Tipos e quantidades de detectores por pavimento conforme a {nrm.sigla} ({nrm.base_tecnica}). Um pavimento pode ter mais de um tipo de detector.
            {itens.projeto ? ` O projeto deve conter todos os elementos necessários ao seu entendimento (item ${itens.projeto}).` : ''}
          </p>
        </div>

        <QuadroParametros titulo={`Parâmetros normativos (${nrm.sigla})`} sigla={nrm.orgao} linhas={linhasNorma}/>

        {state.estruturas.map(est => {
          const pavimentos = state.pavimentos.filter(p => p.estruturaId === est.id)
          const pe = porEstrutura.find(p => p.estrutura.id === est.id)
          return (
            <EstruturaDeteccao key={est.id} estrutura={est} pavimentos={pavimentos} norma={norma}
              exigido={!!pe?.sistemas?.deteccao?.ativo}/>
          )
        })}
      </div>
    </div>
  )
}
