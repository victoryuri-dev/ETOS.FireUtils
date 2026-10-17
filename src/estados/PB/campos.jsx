import { useProjeto } from '../../context/ProjetoContext'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { getMemorialFormulario, getSE, getIluminacao } from '../../data/normas/index'
import {
  ATESTOS_PB, ELEMENTOS_COMPART_H_PB, ELEMENTOS_COMPART_V_PB, ESTAGIOS_EXISTENTE, ESTAGIOS_COM_ADAPTACOES,
  distanciaMaximaPontosPB, TIPOS_HIDRANTE_PB, RESERVATORIOS_PB, LANCES_INTERNOS_PB, LANCES_EXTERNOS_PB, MANGUEIRAS_PB,
} from './formulario'
import { dimensionamentoSaidasPB } from './saidas'
import { decidirAcessoViaturaPB } from './acessoViatura'
import { fmtNum } from '../../utils/numero'
import FormSection from '../../components/ui/FormSection'
import Checkbox from '../../components/ui/Checkbox'
import SwitchToggle from '../../components/ui/SwitchToggle'

// Campos do formulário do Memorial Descritivo do CBMPB — só o que o
// formulário pede e nenhuma outra tela coleta, guardado em state.memorialPB
// (ProjetoContext). Usados nas páginas de medida da PB (estados/PB/paginas)
// e, os gerais, nas etapas da Configuração (estados/ExtensaoConfig.jsx). O
// restante de cada seção sai dos dados da Configuração e dos cálculos.

function useCamposPB() {
  const { state, dispatch } = useProjeto()
  const m = state.memorialPB || {}
  const set = changes => dispatch({ type: 'SET_MEMORIAL_PB', changes })
  const campo = key => ({ value: m[key] || '', onChange: e => set({ [key]: e.target.value }) })
  const atestos = m.atestos || {}
  const alternarAtesto = key => set({ atestos: { ...atestos, [key]: !atestos[key] } })
  const alternarEm = (key, valor) => {
    const lista = m[key] || []
    set({ [key]: lista.includes(valor) ? lista.filter(v => v !== valor) : [...lista, valor] })
  }
  return { state, dispatch, m, set, campo, atestos, alternarAtesto, alternarEm, F: getMemorialFormulario(state.uf) }
}

export function BoxPB({ titulo = 'Preenchimento do formulário', item, children }) {
  return (
    <FormSection title={titulo} description={item ? `Item ${item} do formulário do Memorial Descritivo do CBMPB.` : undefined}>
      <div className="flex flex-col gap-3">{children}</div>
    </FormSection>
  )
}

function Marcador({ label, checked, onChange }) {
  return (
    <div role="button" tabIndex={0} className="flex items-start gap-2 text-[12.5px] text-ink-muted leading-[1.45] cursor-pointer" onClick={onChange}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange() } }}>
      <span className="mt-0.5"><Checkbox checked={checked} onChange={onChange}/></span>
      <span>{label}</span>
    </div>
  )
}

function Rotulo({ children }) {
  return <span className="text-[11px] font-medium text-ink-faint uppercase tracking-[.06em]">{children}</span>
}

function Atestos({ lista, atestos, alternar, titulo = 'Declarações do responsável técnico' }) {
  return (
    <div className="flex flex-col gap-2">
      <Rotulo>{titulo}</Rotulo>
      {lista.map(([key, label]) => <Marcador key={key} label={label} checked={!!atestos[key]} onChange={() => alternar(key)}/>)}
    </div>
  )
}

function Opcoes({ titulo, lista, valor, onChange }) {
  return (
    <div className="fg">
      <label>{titulo}</label>
      <select value={valor || ''} onChange={e => onChange(e.target.value)}>
        <option value="">— não informado —</option>
        {lista.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </div>
  )
}

const Obs = ({ label, campo }) => <div className="fg"><label>{label}</label><textarea rows={2} {...campo}/></div>

// ── Configuração ──────────────────────────────────────────────────────────

// Etapa 2, box Situação: item 3.6. Edificação nova = "ainda será construída",
// sem pergunta. Existente: as três opções "as built" do formulário;
// adaptações da NT 16 ou Resoluções Técnicas pedem a descrição delas.
export function EstagioExistentePB() {
  const { state, m, set, campo, F } = useCamposPB()
  if (!F || state.situacao !== 'existente') return null
  const opcoes = F.ESTAGIOS_CONSTRUCAO.filter(e => ESTAGIOS_EXISTENTE.includes(e.key))
  return (
    <div className="mb-3.5 py-3 px-4 rounded-md border border-solid border-border">
      <div className="text-[13px] font-medium text-ink mb-0.5">Estágio de construção (CBMPB)</div>
      <div className="text-[11px] text-ink-faint mb-3">Item 3.6 do formulário do Memorial Descritivo da Paraíba.</div>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Estágio de construção">
        {opcoes.map(e => {
          const sel = m.estagioConstrucao === e.key
          return (
            <div key={e.key} role="radio" aria-checked={sel} tabIndex={0}
              onClick={() => set({ estagioConstrucao: e.key })}
              onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); set({ estagioConstrucao: e.key }) } }}
              className={`border border-solid rounded-md py-2.5 px-3.5 flex items-center gap-3 cursor-pointer ${sel ? 'border-red-border bg-red-dim' : 'border-border bg-transparent'}`}>
              <span className={`w-3.5 h-3.5 rounded-full border-[1.5px] border-solid shrink-0 flex items-center justify-center ${sel ? 'border-red' : 'border-ink-hint'}`}>
                {sel && <span className="w-1.5 h-1.5 rounded-full bg-red"/>}
              </span>
              <span className={`text-[12.5px] ${sel ? 'text-ink font-medium' : 'text-ink-muted'}`}>{e.label}</span>
            </div>
          )
        })}
      </div>
      {ESTAGIOS_COM_ADAPTACOES.includes(m.estagioConstrucao) && (
        <div className="fg mt-3">
          <label>{m.estagioConstrucao === 'existente_nt16' ? 'Adaptações da NT 16 utilizadas na edificação' : 'Resoluções Técnicas utilizadas na edificação'}</label>
          <textarea rows={3} {...campo('adaptacoes')}/>
        </div>
      )}
    </div>
  )
}

// Etapa 4 (Classificação): item 3.1.
export function CamposPBGerais() {
  const { campo, F } = useCamposPB()
  if (!F) return null
  return (
    <div className="mt-6">
      <BoxPB titulo="Campos específicos da Paraíba" item="3.1">
        <Obs label="Observações complementares — natureza da ocupação" campo={campo('obsNatureza')}/>
      </BoxPB>
    </div>
  )
}

// Etapa 6 (Medidas de segurança): item 3.4.1 — só com o risco GLP.
export function CamposPBGlp() {
  const { state, m, set, F } = useCamposPB()
  const temGlp = Object.values(state.riscosEspeciaisPorEstrutura || {}).some(r => r?.glp)
  if (!F || !temGlp) return null
  return (
    <div className="mt-6">
      <BoxPB titulo="Campos específicos da Paraíba" item="3.4.1">
        <Opcoes titulo="Classe de risco para revenda de GLP (Tabela 1, NBR 15514)" lista={F.CLASSES_GLP.map(g => [g.key, g.label])}
          valor={m.glpClasse} onChange={v => set({ glpClasse: v })}/>
      </BoxPB>
    </div>
  )
}

// ── Páginas de medida da PB ───────────────────────────────────────────────

// 8 — elementos de compartimentação adotados e a característica de cada um.
export function CamposCompartimentacaoPB() {
  const { m, set } = useCamposPB()
  const el = m.compartElementos || { h: [], v: [] }
  const spec = m.especificacaoCompart || {}
  const alternar = (sentido, key) => {
    const lista = el[sentido] || []
    set({ compartElementos: { ...el, [sentido]: lista.includes(key) ? lista.filter(k => k !== key) : [...lista, key] } })
  }
  const grupo = (sentido, titulo, lista) => (
    <div className="flex flex-col gap-2">
      <Rotulo>{titulo}</Rotulo>
      {lista.map(([key, label]) => {
        const marcado = (el[sentido] || []).includes(key)
        return (
          <div key={key} className="flex flex-col gap-1.5">
            <Marcador label={label} checked={marcado} onChange={() => alternar(sentido, key)}/>
            {marcado && (
              <input className="ml-6" value={spec[`${sentido}:${key}`] || ''} placeholder="Característica — ex.: alvenaria EI-120"
                onChange={e => set({ especificacaoCompart: { ...spec, [`${sentido}:${key}`]: e.target.value } })}/>
            )}
          </div>
        )
      })}
    </div>
  )
  return (
    <BoxPB item="8">
      {grupo('h', 'Compartimentação horizontal', ELEMENTOS_COMPART_H_PB)}
      {grupo('v', 'Compartimentação vertical', ELEMENTOS_COMPART_V_PB)}
    </BoxPB>
  )
}

// 10 — número de saídas por pavimento (e a população quando a divisão não
// tem taxa por área), tipo de escada e atestos. O resto sai do cálculo.
export function CamposSaidasPB() {
  const { state, m, set, campo, atestos, alternarAtesto } = useCamposPB()
  const { porEstrutura } = useMedidasObrigatorias()
  const se = getSE(state.uf)
  const r = dimensionamentoSaidasPB(state, porEstrutura)
  const entradas = m.saidas || {}
  const setPav = (id, changes) => set({ saidas: { ...entradas, [id]: { ...(entradas[id] || {}), ...changes } } })
  return (
    <BoxPB item="10">
      {!se && <p className="text-[12.5px] text-ink-faint m-0">A norma de saídas de emergência da PB não está cadastrada (Supabase) — o dimensionamento fica em branco.</p>}
      {r?.estruturas.map(({ est, pavs, er }) => (
        <div key={est.id} className="flex flex-col gap-2">
          <Rotulo>{est.nome}</Rotulo>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="text-[10px] text-ink-faint uppercase tracking-[.06em] text-left">
                  <th className="py-1.5 pr-2 font-medium">Pavimento</th>
                  <th className="py-1.5 pr-2 font-medium">Divisão</th>
                  <th className="py-1.5 pr-2 font-medium">Área</th>
                  <th className="py-1.5 pr-2 font-medium">População</th>
                  <th className="py-1.5 pr-2 font-medium">Nº de saídas</th>
                  <th className="py-1.5 pr-2 font-medium text-right">Acessos / portas</th>
                  <th className="py-1.5 font-medium text-right">Dist. máx.</th>
                </tr>
              </thead>
              <tbody>
                {pavs.map(p => (
                  <tr key={p.pav.id} className="border-t border-solid border-border-2">
                    <td className="py-1.5 pr-2 text-ink">{p.pav.label}</td>
                    <td className="py-1.5 pr-2">{p.pav.divisao || '—'}</td>
                    <td className="py-1.5 pr-2">{p.pav.area ? `${fmtNum(p.pav.area, 2)} m²` : '—'}</td>
                    <td className="py-1.5 pr-2">
                      <input className="w-24" type="number" min="0" step="1" value={entradas[p.pav.id]?.populacao || ''}
                        placeholder={p.origem === 'area' ? String(p.populacao) : 'informar'}
                        title={p.taxa?.obs || ''}
                        onChange={e => setPav(p.pav.id, { populacao: e.target.value })}/>
                    </td>
                    <td className="py-1.5 pr-2">
                      <input className="w-16" type="number" min="1" step="1" value={entradas[p.pav.id]?.nSaidas || ''} placeholder="1"
                        onChange={e => setPav(p.pav.id, { nSaidas: e.target.value })}/>
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono">{p.ad ? `${fmtNum(p.ad.la, 2)} / ${fmtNum(p.pt.la, 2)} m` : '—'}</td>
                    <td className="py-1.5 text-right font-mono">{p.distancia != null ? `${fmtNum(p.distancia, 0)} m` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <span className="text-[11.5px] text-ink-faint">
            População pela área ÷ taxa da divisão (deixe em branco) ou informada. {er ? `Escadas/rampas: ${er.n} UP — ${fmtNum(er.la, 2)} m (pela população de ${er.pavimento}).` : ''}
          </span>
        </div>
      ))}
      <div className="fg">
        <label>Tipo de escada usada na edificação</label>
        <select {...campo('tipoEscada')}>
          <option value="">Automático (Tabela 3 da NT 12/2025)</option>
          <option value="NE">Não Enclausurada - NE</option>
          <option value="EP">Enclausurada Protegida - EP</option>
          <option value="PF">A prova de fumaça - PF</option>
        </select>
      </div>
      <Atestos lista={ATESTOS_PB.saidas} atestos={atestos} alternar={alternarAtesto}/>
    </BoxPB>
  )
}

// 11.1 — modelo do plano de emergência.
export function CamposPlanoPB() {
  const { m, set, F } = useCamposPB()
  if (!F) return null
  return (
    <BoxPB item="11.1">
      <Opcoes titulo="Como o plano de emergência foi elaborado" lista={F.MODELOS_PLANO.map(p => [p.key, p.label])}
        valor={m.planoModelo} onChange={v => set({ planoModelo: v })}/>
    </BoxPB>
  )
}

// 12 — população fixa por pavimento (base do cálculo da Tabela A.1),
// carga horária, simulados, atestos e dimensionamento.
export function CamposBrigadaPB() {
  const { state, dispatch, campo, atestos, alternarAtesto } = useCamposPB()
  return (
    <BoxPB item="12">
      <div className="flex flex-col gap-2">
        <Rotulo>População fixa por pavimento</Rotulo>
        {(state.estruturas || []).map(est => (
          <div key={est.id} className="flex flex-col gap-1.5">
            <span className="text-[12px] text-ink font-medium">{est.nome}</span>
            {(state.pavimentos || []).filter(p => p.estruturaId === est.id).map(pav => (
              <div key={pav.id} className="flex items-center gap-3 text-[12.5px]">
                <span className="flex-1 text-ink-muted">{pav.label} <span className="text-ink-faint">({pav.divisao || 'sem divisão'})</span></span>
                <input className="w-24" type="number" min="0" step="1" value={pav.populacaoFixa ?? ''}
                  onChange={e => dispatch({ type: 'UPDATE_PAV', id: pav.id, changes: { populacaoFixa: e.target.value } })}/>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="g2">
        <div className="fg"><label>Carga horária mínima do treinamento</label><input {...campo('brigadaCargaHoraria')} placeholder="Ex.: 16 h"/></div>
        <div className="fg"><label>Tempo entre simulados (máximo 12 meses)</label><input {...campo('brigadaIntervaloSimulados')} placeholder="Ex.: 6 meses"/></div>
      </div>
      <Atestos lista={ATESTOS_PB.brigada} atestos={atestos} alternar={alternarAtesto}/>
      <Obs label="Dimensionamento" campo={campo('brigadaDimensionamento')}/>
    </BoxPB>
  )
}

// 13 — tipo(s) de sistema, fluxo luminoso, altura de instalação (distância
// máxima = 4 × altura) e atestos; os de 13.1–13.4 só do tipo adotado.
const GRUPO_DO_TIPO = { bloco_autonomo: 'blocos', central: 'central_bateria', ups: 'ups', motogerador: 'gerador' }
export function CamposIluminacaoPB() {
  const { state, m, campo, atestos, alternarAtesto, alternarEm } = useCamposPB()
  const tiposNorma = getIluminacao(state.uf)?.TIPOS_SISTEMA || []
  const G = ATESTOS_PB.iluminacao
  const grupos = new Set((m.iluTipos || []).map(t => GRUPO_DO_TIPO[t]))
  const tem = (...ks) => ks.some(k => grupos.has(k))
  const dist = distanciaMaximaPontosPB(m.iluAlturaInstalacao)
  const secoes = [
    ['Gerais', G.geral, true],
    ['Circuitos de alimentação das baterias', G.circuitoBaterias, tem('blocos', 'central_bateria', 'ups')],
    ['Circuitos de alimentação das luminárias', G.circuitoLuminarias, tem('central_bateria', 'ups', 'gerador')],
    ['Luminárias', G.luminarias, true],
    ['13.1 Conjunto de blocos autônomos', G.blocos, tem('blocos')],
    ['13.2 Sistema centralizado por baterias', G.central_bateria, tem('central_bateria')],
    ['13.3 Sistema centralizado por UPS', G.ups, tem('ups')],
    ['13.4 Grupo motogerador', G.gerador, tem('gerador')],
  ]
  return (
    <BoxPB item="13">
      <div className="flex flex-col gap-2">
        <Rotulo>Tipo de sistema</Rotulo>
        {tiposNorma.map(t => <Marcador key={t.key} label={t.label} checked={(m.iluTipos || []).includes(t.key)} onChange={() => alternarEm('iluTipos', t.key)}/>)}
      </div>
      <div className="g2">
        <div className="fg"><label>Altura de instalação do ponto de luz (m)</label><input inputMode="decimal" {...campo('iluAlturaInstalacao')} placeholder="Ex.: 2,40"/></div>
        <div className="fg"><label>Distância máxima entre pontos (4 × altura)</label><input readOnly value={dist ? `${fmtNum(dist, 2)} m` : ''} placeholder="Informe a altura"/></div>
      </div>
      <div className="fg"><label>Fluxo luminoso exato das luminárias (lm)</label><input inputMode="decimal" {...campo('iluFluxo')} placeholder="Ex.: 300"/></div>
      {secoes.filter(([, , mostrar]) => mostrar).map(([titulo, lista]) => (
        <Atestos key={titulo} titulo={titulo} lista={lista} atestos={atestos} alternar={alternarAtesto}/>
      ))}
    </BoxPB>
  )
}

// 14 — local das centrais, tipos de detector e atestos do alarme.
const DETECTORES_FORMULARIO = [
  ['fumaca_pontual', 'Detecção pontual de fumaça'],
  ['temperatura_pontual', 'Detecção pontual de temperatura'],
  ['fumaca_linear', 'Detecção linear de fumaça'],
]
export function CamposAlarmeDeteccaoPB({ alarme, deteccao }) {
  const { m, campo, atestos, alternarAtesto, alternarEm } = useCamposPB()
  return (
    <BoxPB item="14">
      {alarme && (
        <>
          <div className="fg"><label>Localização da central de alarme (cômodo)</label><input {...campo('alarmeCentralLocal')} placeholder="Ex.: Portaria"/></div>
          <Atestos titulo="14.1 Alarme — declarações" lista={ATESTOS_PB.alarme} atestos={atestos} alternar={alternarAtesto}/>
        </>
      )}
      {deteccao && (
        <>
          <div className="fg"><label>Localização da central de detecção</label><input {...campo('deteccaoCentralLocal')} placeholder="Em branco = a mesma do alarme"/></div>
          <div className="flex flex-col gap-2">
            <Rotulo>14.2 Tipos de detector adotados</Rotulo>
            {DETECTORES_FORMULARIO.map(([key, label]) => <Marcador key={key} label={label} checked={(m.detectoresTipos || []).includes(key)} onChange={() => alternarEm('detectoresTipos', key)}/>)}
          </div>
        </>
      )}
    </BoxPB>
  )
}

// 15 — atestos da sinalização.
export function CamposSinalizacaoPB() {
  const { atestos, alternarAtesto } = useCamposPB()
  return (
    <BoxPB item="15">
      <Atestos lista={ATESTOS_PB.sinalizacao} atestos={atestos} alternar={alternarAtesto}/>
    </BoxPB>
  )
}

// 16 — capacidade extintora do nível III (as demais linhas são automáticas).
export function CamposExtintoresPB() {
  const { m, set, F } = useCamposPB()
  if (!F) return null
  return (
    <BoxPB item="16">
      <Opcoes titulo="Capacidade extintora adotada para edificação de nível III"
        lista={F.EXTINTORES_NIVEL.filter(l => l.nivel === 'III').map(l => [l.key, `${l.texto.replace('Edificação de nível III com capacidade extintora mínima de ', '')}${l.detalhe ? ' (distância máxima reduzida)' : ''}`])}
        valor={m.extintorNivelIII} onChange={v => set({ extintorNivelIII: v })}/>
      <span className="text-[11.5px] text-ink-faint">O nível de carga (I, II ou III) e as linhas especiais (G-3, GLP, central de gás, fogos) são marcados automaticamente.</span>
    </BoxPB>
  )
}

// 17 — sistema de hidrantes (vazão e pressão informadas pelo RT) e Anexo B.
export function CamposHidrantesPB() {
  const { m, set, campo, atestos, alternarAtesto } = useCamposPB()
  const h = m.hidrantes || {}
  const setH = changes => set({ hidrantes: { ...h, ...changes } })
  const inp = (key, label, extra = {}) => (
    <div className="fg"><label>{label}</label><input value={h[key] || ''} onChange={e => setH({ [key]: e.target.value })} {...extra}/></div>
  )
  return (
    <BoxPB item="17">
      <Opcoes titulo="Tipo de sistema (NT 15/2016)" lista={TIPOS_HIDRANTE_PB.map(([k, l]) => [k, l.replace(/ \(.*/, '') + (k === 'tipo4_40' ? ' — DN40' : k === 'tipo4_65' ? ' — DN65' : '')])}
        valor={h.tipo} onChange={v => setH({ tipo: v })}/>
      <div className="g2">
        {inp('vazao', 'Vazão do hidrante mais desfavorável (l/min)', { inputMode: 'decimal' })}
        {inp('pressao', 'Pressão do hidrante mais desfavorável (mca)', { inputMode: 'decimal' })}
      </div>
      <Rotulo>17.1 Reserva técnica de incêndio</Rotulo>
      <Opcoes titulo="Reservatório" lista={RESERVATORIOS_PB} valor={h.reservatorio} onChange={v => setH({ reservatorio: v })}/>
      <div className="g2">
        {h.reservatorio === 'enterrado' && inp('nsth', 'NSTH (reservatório enterrado)')}
        {inp('rtiMaterial', 'Material de construção da RTI')}
        {inp('rtiVolume', 'RTI (m³)', { inputMode: 'decimal' })}
      </div>
      <Rotulo>17.2 Mangueiras e tubulações</Rotulo>
      <div className="g2">
        {inp('tubDiametro', 'Diâmetro das tubulações')}
        {inp('tubMaterial', 'Material das tubulações')}
      </div>
      <div className="g2">
        <Opcoes titulo="Lances de mangueira — hidrantes internos" lista={LANCES_INTERNOS_PB} valor={h.lancesInternos} onChange={v => setH({ lancesInternos: v })}/>
        <Opcoes titulo="Lances de mangueira — hidrantes externos" lista={LANCES_EXTERNOS_PB} valor={h.lancesExternos} onChange={v => setH({ lancesExternos: v })}/>
      </div>
      <Opcoes titulo="Tipo de mangueira (NBR 11861)" lista={MANGUEIRAS_PB} valor={h.mangueira} onChange={v => setH({ mangueira: v })}/>
      <Atestos titulo="Mangueiras — declarações" lista={ATESTOS_PB.hidrantes.mangueiras} atestos={atestos} alternar={alternarAtesto}/>
      <Rotulo>17.3 Bombas de incêndio</Rotulo>
      <div className="g2">
        {inp('bombaPrincipalPressao', 'Pressão da bomba principal (mca)', { inputMode: 'decimal' })}
        {inp('bombaReservaPressao', 'Pressão da bomba reserva (mca)', { inputMode: 'decimal' })}
        {inp('jockeyVazao', 'Vazão da bomba jockey (l/min)', { inputMode: 'decimal' })}
      </div>
      <Atestos titulo="Bombas e tubulação — declarações" lista={ATESTOS_PB.hidrantes.bombas} atestos={atestos} alternar={alternarAtesto}/>
      <Obs label="Anexo B — dimensionamento do sistema de hidrantes (pressurização, bombas, abrigos, recalque etc.)" campo={campo('hidAnexo')}/>
    </BoxPB>
  )
}

// 6 — o RT informa distâncias e dados da via; a linha do formulário é
// decidida por decidirAcessoViaturaPB (estados/PB/acessoViatura.js).
const LINHA_AV = {
  1: 'Sem hidrante de recalque e edificação a até 20 m da via — acesso facultativo.',
  2: 'Recalque a até 20 m e edificação a até 50 m da via — acesso facultativo.',
  3: 'Sem hidrante de recalque e edificação a mais de 20 m da via — acesso obrigatório.',
  4: 'Recalque a até 20 m e edificação a mais de 50 m da via — acesso obrigatório.',
  5: 'Recalque a mais de 20 m e edificação a mais de 50 m da via — acesso obrigatório.',
}
// Pergunta de sim/não com switch (o mesmo SwitchToggle das outras páginas):
// ligado = sim, desligado = não.
function SimNao({ pergunta, valor, onChange }) {
  const sim = valor === true
  return (
    <div className="flex items-center justify-between gap-3 text-[12.5px] text-ink-muted">
      <span>{pergunta}</span>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs w-7 text-right ${sim ? 'text-ink font-medium' : 'text-ink-faint'}`}>{sim ? 'Sim' : 'Não'}</span>
        <SwitchToggle checked={sim} onChange={onChange}/>
      </div>
    </div>
  )
}

// Campo numérico como o do MA (AcessoViaturaPage): vazio mostra o valor
// padrão (já vale no cálculo) e, ao sair do campo, valor abaixo do mínimo da
// norma volta para o mínimo.
function NumeroLimitado({ label, value, onChange, padrao, minimo, sufixo = 'm' }) {
  const exibido = value === '' || value == null ? (padrao ?? '') : value
  const aoSair = () => {
    const n = parseFloat(String(value ?? '').replace(',', '.'))
    if (Number.isFinite(n) && minimo != null && n < minimo) onChange(String(minimo))
  }
  return (
    <div className="fg">
      <label>{label}</label>
      <div className="relative">
        <input type="number" step="0.01" min={minimo ?? 0} value={exibido} onChange={e => onChange(e.target.value)} onBlur={aoSair} className={sufixo ? 'pr-8' : ''}/>
        {sufixo && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-faint">{sufixo}</span>}
      </div>
    </div>
  )
}

export function CamposAcessoViaturaPB() {
  const { m, set, F } = useCamposPB()
  const { sistemas } = useMedidasObrigatorias()
  if (!F?.ACESSO_VIATURA) return null
  const P = F.ACESSO_VIATURA
  const av = m.acessoViatura || {}
  const setAv = changes => set({ acessoViatura: { ...av, ...changes } })
  // Hidrante de recalque: há sempre que o sistema de hidrantes é exigido.
  const recalque = !!(sistemas?.hidrantes?.ativo || sistemas?.hidrantes?.obrigatorio)
  const r = decidirAcessoViaturaPB(av, recalque, P)
  const numero = (key, label, extra = {}) => (
    <NumeroLimitado label={label} value={av[key]} onChange={v => setAv({ [key]: v })} {...extra}/>
  )
  const pergunta = (key, texto) => <SimNao pergunta={texto} valor={av[key]} onChange={v => setAv({ [key]: v })}/>
  return (
    <>
      <FormSection title="Distâncias até a via pública">
        <div className="flex flex-col gap-3">
          <div className="g2">
            {numero('distanciaEdificacao', 'Entrada da circulação comum até a via pública (do meio-fio)', { minimo: 0 })}
            {recalque && numero('distanciaRecalque', 'Registro do hidrante de recalque até a via pública', { minimo: 0 })}
          </div>
          {r?.caso && (
            <div className={`ibox ${r.obrigatorio ? 'amber' : 'green'}`}>
              <span className="text-xs"><strong>Linha {r.caso} do formulário:</strong> {LINHA_AV[r.caso]}</span>
            </div>
          )}
        </div>
      </FormSection>

      {r?.obrigatorio && (
        <FormSection title="Via de acesso">
          <div className="flex flex-col gap-3">
            <div className="g2">
              {numero('larguraVia', `Largura da via (mín. ${fmtNum(P.via.larguraReduzidaMin, 2)} m)`, { padrao: P.via.larguraMin, minimo: P.via.larguraReduzidaMin })}
              {numero('alturaLivre', `Altura livre (mín. ${fmtNum(P.via.alturaLivreMin, 2)} m)`, { padrao: P.via.alturaLivreMin, minimo: P.via.alturaLivreMin })}
              {numero('extensaoVia', 'Comprimento da via em relação à via pública', { minimo: 0 })}
            </div>
            {r.via.reduzida && (
              <div className="ibox amber">
                <span className="text-xs">
                  <strong>Largura abaixo de 6,00 m:</strong> como compensação, a faixa de estacionamento é obrigatória e deve atender aos itens a) a h) do formulário — 6 × 15 m, 25.000 kgf, desnível até 5%, paralela a uma face com aberturas e a até 8 m dela, livre de obstáculos e sinalizada com "PROIBIDO PARAR E ESTACIONAR".
                </span>
              </div>
            )}
            {r.via.exigeRetorno && (
              <div className="ibox amber">
                <span className="text-xs">
                  <strong>Retorno obrigatório:</strong> a via tem menos de {fmtNum(P.retorno.larguraAbaixoDe, 2)} m de largura e mais de {fmtNum(P.retorno.comprimentoAcimaDe, 0)} m de comprimento — prever área de retorno que garanta a entrada e a saída das viaturas{P.retorno.opcoes?.length ? ` (retorno ${P.retorno.opcoes.join(', ').replace(/, ([^,]*)$/, ' ou $1')})` : ''}.
                </span>
              </div>
            )}
            {pergunta('cargaConfirmada', 'A via suporta viaturas de 25.000 kgf em toda a sua extensão?')}
          </div>
        </FormSection>
      )}

      {r?.obrigatorio && (
        <FormSection title="Portão de acesso">
          <div className="flex flex-col gap-3">
            {pergunta('temPortao', 'Há portão de acesso?')}
            {av.temPortao === true && (
              <div className="g2">
                {numero('portaoLargura', `Largura do portão (mín. ${fmtNum(P.portao.larguraMin, 2)} m)`, { padrao: P.portao.larguraMin, minimo: P.portao.larguraMin })}
                {numero('portaoAltura', `Altura do portão (mín. ${fmtNum(P.portao.alturaMin, 2)} m)`, { padrao: P.portao.alturaMin, minimo: P.portao.alturaMin })}
              </div>
            )}
          </div>
        </FormSection>
      )}
    </>
  )
}
