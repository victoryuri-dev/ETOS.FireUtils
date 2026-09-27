import { useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import Icon from '../../components/ui/Icon'
import EstruturaSection from '../../components/ui/EstruturaSection'
import EstruturaHeaderInfo from '../../components/ui/EstruturaHeaderInfo'
import { SISTEMA_ICON } from '../../data/sistemasIcons'
import { statusEstrutura } from '../../utils/statusEstrutura'
import {
  TIPOS_DETECTOR, deteccaoDaEstrutura, deteccaoPav, resumoDeteccaoPavimento, notasAplicaveis, comAreaEfetiva, fmtNum,
} from '../../data/deteccao_alarme_calc'
import { Card, CampoNum, LinhaChave, Erro, NotasDaNorma, QuadroParametros, inputBase, TH, TD } from '../../components/deteccao/DaUi'

// ── Detecção de Incêndio ────────────────────────────────────────────────
// Tipo e quantidade de detectores por pavimento (NT 19 — mesma norma do
// Alarme, ver AlarmeIncendioPage). A área de cobertura vem da norma (por tipo,
// pé-direito e viga) e pode ser substituída; a quantidade abaixo do mínimo por
// área é corrigida ao sair do campo. É uma estimativa mínima por área: a
// distribuição final deve ser conferida em planta.

function EstruturaDeteccao({ estrutura, pavimentos: pavsBrutos, norma, exigido }) {
  const { dispatch } = useProjeto()
  const pavimentos = comAreaEfetiva(pavsBrutos, estrutura)
  const [avisos, setAvisos] = useState({})
  const cfg = deteccaoDaEstrutura(estrutura)
  const { DETECTORES: det, ITENS: itens, ENTREFORROS: entre, NORMA: nrm } = norma

  const setCfg = changes => dispatch({ type: 'SET_ESTRUTURA_FIELD', id: estrutura.id, field: 'deteccao', value: { ...cfg, ...changes } })
  const setPav = (pav, changes) => dispatch({ type: 'UPDATE_PAV', id: pav.id, changes: { deteccao: { ...deteccaoPav(pav), ...changes } } })
  const aviso = (chave, texto) => setAvisos(a => ({ ...a, [chave]: texto }))

  const linhas = pavimentos.map(pav => ({ pav, r: resumoDeteccaoPavimento(pav, det) }))
  const totalDetectores = linhas.reduce((s, l) => s + (l.r.qtdAdotada || 0), 0)
  const resolvidos = linhas.filter(l => l.r.completo && (!l.r.porArea || l.r.peDireito > 0)).length

  const validarQtd = (pav, r) => () => {
    if (deteccaoPav(pav).qtd !== '' && r.abaixoDoMinimo) {
      setPav(pav, { qtd: String(r.qtdMin) })
      aviso(`qtd-${pav.id}`, `Em ${pav.label}, a quantidade não pode ser inferior a ${r.qtdMin} detector(es) para cobrir ${fmtNum(r.area)} m² com ${fmtNum(r.areaDetector)} m² por detector. O valor foi ajustado automaticamente.`)
    }
  }

  const { especificas, gerais } = notasAplicaveis(norma, pavimentos.map(p => p.divisao))

  const status = pavimentos.length === 0
    ? statusEstrutura('pendente', 'Sem pavimentos')
    : resolvidos === 0
      ? statusEstrutura('pendente', 'Dados pendentes')
      : statusEstrutura('andamento', resolvidos === pavimentos.length ? 'Revisar e concluir' : `${resolvidos} de ${pavimentos.length} pavimentos`)

  return (
    <EstruturaSection
      titulo={estrutura.nome}
      extra={<EstruturaHeaderInfo estrutura={estrutura} semArea/>}
      status={status}
      conclusao={pavimentos.length > 0 ? { estruturaId: estrutura.id, medida: 'deteccao' } : null}
      defaultOpen={false}
    >
      {!exigido && (
        <div className="ibox amber mb-3.5">
          <Icon name="info" size={13} color="var(--color-amber)" className="shrink-0"/>
          <span className="text-xs">O sistema de detecção não consta como exigido para a ocupação e a altura desta estrutura. Preencha apenas se for adotado.</span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Card titulo="Detectores por pavimento" icone={SISTEMA_ICON.deteccao}>
          <div className="text-[11px] text-ink-faint leading-[1.6] mb-3">
            Informe o tipo, o pé-direito (altura do teto) e a altura de vigas sob a laje; a área por detector e a quantidade mínima são calculadas pela norma.
            Você pode substituir a área por detector e a quantidade adotada (em branco vale o calculado). Cobertura por área: fumaça pontual até {det.tipos.fumaca_pontual.area_max_m2} m² (teto até {det.tipos.fumaca_pontual.altura_max_m} m) e temperatura pontual até {det.tipos.temperatura_pontual.area_max_m2} m² (teto até {det.tipos.temperatura_pontual.altura_max_m} m).
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-solid border-border">
                  <th className={TH}>Pavimento</th>
                  <th className={`${TH} text-right`}>Área</th>
                  <th className={TH}>Tipo de detector</th>
                  <th className={TH}>Pé-direito</th>
                  <th className={TH}>Viga</th>
                  <th className={TH}>Área/detector</th>
                  <th className={TH}>Quantidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-solid divide-border">
                {linhas.map(({ pav, r }) => {
                  const d = deteccaoPav(pav)
                  return (
                    <tr key={pav.id} className="align-top">
                      <td className={`${TD} text-ink whitespace-nowrap`}>{pav.label}</td>
                      <td className={`${TD} text-ink-faint text-right whitespace-nowrap`}>{pav.area ? `${pav._areaEstimada ? '≈ ' : ''}${fmtNum(pav.area)} m²` : '—'}</td>
                      <td className={TD}>
                        <select className={`${inputBase} min-w-[140px]`} value={d.tipo} onChange={e => setPav(pav, { tipo: e.target.value, areaDetector: '', qtd: '' })}>
                          {TIPOS_DETECTOR.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                        </select>
                      </td>
                      <td className={TD}>
                        {r.porArea
                          ? <div className="w-[84px]"><CampoNum valor={d.peDireito} unidade="m" step="0.1" onChange={v => setPav(pav, { peDireito: v })}/></div>
                          : <span className="text-ink-faint">—</span>}
                      </td>
                      <td className={TD}>
                        {r.porArea
                          ? <div className="w-[84px]"><CampoNum valor={d.viga} unidade="m" step="0.05" placeholder="0" onChange={v => setPav(pav, { viga: v })}/></div>
                          : <span className="text-ink-faint">—</span>}
                      </td>
                      <td className={TD}>
                        {r.porArea
                          ? <div className="w-[96px]"><CampoNum valor={d.areaDetector} unidade="m²" step="0.5" placeholder={r.cobertura.areaMax != null ? fmtNum(r.cobertura.areaMax, 1) : ''}
                              onChange={v => setPav(pav, { areaDetector: v })}/></div>
                          : <span className="text-ink-faint">definido pelo projeto</span>}
                      </td>
                      <td className={TD}>
                        <div className="w-24"><CampoNum valor={d.qtd} placeholder={r.qtdMin != null ? String(r.qtdMin) : '—'}
                          onChange={v => { aviso(`qtd-${pav.id}`, ''); setPav(pav, { qtd: v }) }} onBlur={validarQtd(pav, r)}/></div>
                        {r.areaSubstituida && <div className="text-[10px] text-amber mt-1">área substituída</div>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-solid border-border">
                  <td className={`${TD} font-semibold text-ink`} colSpan={6}>Total da estrutura</td>
                  <td className={`${TD} font-bold text-ink`}>{totalDetectores}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {linhas.some(({ pav }) => pav._areaEstimada) && (
            <div className="text-[11px] text-ink-faint leading-[1.6] mt-3">≈ Área do pavimento ainda não informada na classificação (Etapa 4): usada a área da estrutura dividida pelos pavimentos. Informe a área de cada pavimento para o cálculo exato.</div>
          )}
          {Object.entries(avisos).filter(([, v]) => v).map(([k, v]) => <Erro key={k}>{v}</Erro>)}
          {linhas.flatMap(({ pav, r }) => r.alertas.map((a, i) => (
            <div key={`${pav.id}-${i}`} className="ibox amber mt-2 mb-0">
              <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
              <span className="text-xs"><strong>{pav.label}:</strong> {a}</span>
            </div>
          )))}
          {linhas.some(({ r }) => !r.porArea) && (
            <div className="text-[11px] text-ink-faint leading-[1.6] mt-3">
              Detectores lineares e de chama não têm área de cobertura fixa: informe a quantidade conforme o fabricante e as regras do item {itens.deteccao_linear || 'da norma'} e da NBR 17240.
            </div>
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
            Tipo e quantidade de detectores por pavimento conforme a {nrm.sigla} ({nrm.base_tecnica}). A área por detector vem da norma, em função do tipo, do pé-direito e das vigas, e pode ser substituída; quantidades abaixo do mínimo por área são corrigidas.
            {itens.projeto ? ` O projeto deve conter todos os elementos necessários ao seu entendimento (item ${itens.projeto}).` : ''}
          </p>
        </div>

        <QuadroParametros titulo={`Parâmetros normativos (${nrm.sigla})`} sigla={nrm.orgao} linhas={linhasNorma}/>

        {state.estruturas.map(est => {
          const pavimentos = state.pavimentos.filter(p => p.estruturaId === est.id)
          const pe = porEstrutura.find(p => p.estrutura.id === est.id)
          return (
            <EstruturaDeteccao key={est.id} estrutura={est} pavimentos={pavimentos} norma={norma}
              exigido={!!(pe?.sistemas?.deteccao?.obrigatorio || pe?.sistemas?.deteccao?.ativo)}/>
          )
        })}
      </div>
    </div>
  )
}
