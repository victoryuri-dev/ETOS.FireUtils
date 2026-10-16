import { useProjeto } from '../../context/ProjetoContext'
import { getMemorialFormulario, getCompartimentacao } from '../../data/normas/index'
import { ATESTOS_PB, ELEMENTOS_COMPART_H_PB, ELEMENTOS_COMPART_V_PB, ESTAGIOS_EXISTENTE, ESTAGIOS_COM_ADAPTACOES } from '../../data/memorial/PB/formulario'
import FormSection from '../ui/FormSection'
import Checkbox from '../ui/Checkbox'

// Boxes "Campos específicos da Paraíba": o que o formulário do Memorial
// Descritivo do CBMPB (data/memorial/PB/formulario.js) pede e que nenhuma
// outra tela do projeto coleta — guardado em state.memorialPB. Cada box fica
// no fim da página da medida correspondente (ou da etapa de Configuração,
// para os parâmetros gerais), e só aparece em projetos da PB: o restante do
// formulário sai dos dados que essas mesmas páginas já pedem — inclusive as
// observações de cada seção, que vêm das "Observações complementares" por
// estrutura (components/ui/ObservacoesComplementares.jsx).

function useCamposPB() {
  const { state, dispatch } = useProjeto()
  const m = state.memorialPB || {}
  const set = changes => dispatch({ type: 'SET_MEMORIAL_PB', changes })
  const campo = key => ({ value: m[key] || '', onChange: e => set({ [key]: e.target.value }) })
  const atestos = m.atestos || {}
  const alternarAtesto = key => set({ atestos: { ...atestos, [key]: !atestos[key] } })
  return { state, m, set, campo, atestos, alternarAtesto, F: getMemorialFormulario(state.uf) }
}

function BoxPB({ item, children }) {
  return (
    <div className="mt-6">
    <FormSection
      title="Campos específicos da Paraíba"
      description={`Pedidos pelo formulário do Memorial Descritivo do CBMPB${item ? ` (item ${item})` : ''}.`}
    >
      <div className="flex flex-col gap-3">{children}</div>
    </FormSection>
    </div>
  )
}

function Atesto({ label, checked, onChange }) {
  return (
    <div role="button" tabIndex={0} className="flex items-start gap-2 text-[12.5px] text-ink-muted leading-[1.45] cursor-pointer" onClick={onChange}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange() } }}>
      <span className="mt-0.5"><Checkbox checked={checked} onChange={onChange}/></span>
      <span>{label}</span>
    </div>
  )
}

function Atestos({ lista, atestos, alternar }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium text-ink-faint uppercase tracking-[.06em]">Declarações do responsável técnico</span>
      {lista.map(([key, label]) => <Atesto key={key} label={label} checked={!!atestos[key]} onChange={() => alternar(key)}/>)}
    </div>
  )
}

const Obs = ({ label, campo }) => <div className="fg"><label>{label}</label><textarea rows={2} {...campo}/></div>

// ── Configuração (Etapa 2), box Situação: item 3.6 ─────────────────────────
// Edificação nova = "ainda será construída", sem pergunta. Existente: o RT
// escolhe entre as três opções "as built" do formulário; adaptações da NT 16
// ou Resoluções Técnicas pedem a descrição delas.

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

// ── Configuração (Classificação): item 3.1 ───────────────────────────────────────
// (Item 2, forma de apresentação: enquadramento automático do tipo de
// projeto — TipoProjetoBox. Item 3.6, estágio: box Situação —
// EstagioExistentePB.)
export function CamposPBGerais() {
  const { campo, F } = useCamposPB()
  if (!F) return null
  return (
    <BoxPB item="3.1">
      <Obs label="Observações complementares — natureza da ocupação" campo={campo('obsNatureza')}/>
    </BoxPB>
  )
}

// ── Configuração (Etapa de Medidas): item 3.4.1 — só com o risco GLP ───────
export function CamposPBGlp() {
  const { state, campo, F } = useCamposPB()
  const temGlp = Object.values(state.riscosEspeciaisPorEstrutura || {}).some(r => r?.glp)
  if (!F || !temGlp) return null
  return (
    <BoxPB item="3.4.1">
      <div className="fg">
        <label>Classe de risco para revenda de GLP (Tabela 1, NBR 15514)</label>
        <select {...campo('glpClasse')}>
          <option value="">— não informada —</option>
          {F.CLASSES_GLP.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
        </select>
      </div>
    </BoxPB>
  )
}

// ── Compartimentação: item 8 (característica de cada elemento marcado) ────
export function CamposPBCompartimentacao() {
  const { state, m, set, F } = useCamposPB()
  if (!F) return null
  const { ELEMENTOS_COMPART_HORIZONTAL = [], ELEMENTOS_COMPART_VERTICAL = [] } = getCompartimentacao(state.uf)
  const rotulo = (lista, key) => lista.find(([k]) => k === key)?.[1] || key
  const marcados = (campoEst, catalogo, formulario, prefixo, sentido) =>
    [...new Set((state.estruturas || []).flatMap(e => e[campoEst] || []))]
      .filter(k => catalogo.some(el => el.key === k))
      .map(k => ({ chave: `${prefixo}:${k}`, label: `${sentido} — ${rotulo(formulario, k)}` }))
  const lista = [
    ...marcados('elementosCompartHorizontal', ELEMENTOS_COMPART_HORIZONTAL, ELEMENTOS_COMPART_H_PB, 'h', 'Horizontal'),
    ...marcados('elementosCompartVertical', ELEMENTOS_COMPART_VERTICAL, ELEMENTOS_COMPART_V_PB, 'v', 'Vertical'),
  ]
  const spec = m.especificacaoCompart || {}
  return (
    <BoxPB item="8">
      {lista.length === 0
        ? <p className="text-[12.5px] text-ink-faint m-0">Marque os elementos de compartimentação adotados acima para informar a característica de cada um.</p>
        : lista.map(({ chave, label }) => (
            <div key={chave} className="fg">
              <label>Característica — {label}</label>
              <input value={spec[chave] || ''} onChange={e => set({ especificacaoCompart: { ...spec, [chave]: e.target.value } })} placeholder="Ex.: alvenaria EI-120"/>
            </div>
          ))}
    </BoxPB>
  )
}

// ── Saída de emergência: item 10.1 ─────────────────────────────────────────
export function CamposPBSaidas() {
  const { campo, atestos, alternarAtesto, F } = useCamposPB()
  if (!F) return null
  return (
    <BoxPB item="10">
      <div className="fg">
        <label>Tipo de escada usada na edificação</label>
        <select {...campo('tipoEscada')}>
          <option value="">Automático (pela norma, quando cadastrada)</option>
          <option value="NE">Não Enclausurada - NE</option>
          <option value="EP">Enclausurada Protegida - EP</option>
          <option value="PF">A prova de fumaça - PF</option>
        </select>
      </div>
      <Atestos lista={ATESTOS_PB.saidas} atestos={atestos} alternar={alternarAtesto}/>
    </BoxPB>
  )
}

// ── Gerenciamento de risco: item 11.1 ──────────────────────────────────────
export function CamposPBPlano() {
  const { campo, F } = useCamposPB()
  if (!F) return null
  return (
    <BoxPB item="11.1">
      <div className="fg">
        <label>Como o plano de emergência foi elaborado</label>
        <select {...campo('planoModelo')}>
          <option value="">— não informado —</option>
          {F.MODELOS_PLANO.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>
    </BoxPB>
  )
}

// ── Brigada de incêndio: item 12 ───────────────────────────────────────────
export function CamposPBBrigada() {
  const { campo, atestos, alternarAtesto, F } = useCamposPB()
  if (!F) return null
  return (
    <BoxPB item="12">
      <div className="g2">
        <div className="fg"><label>Carga horária mínima do treinamento</label><input {...campo('brigadaCargaHoraria')} placeholder="Ex.: 16 h"/></div>
        <div className="fg"><label>Tempo entre simulados (máximo 12 meses)</label><input {...campo('brigadaIntervaloSimulados')} placeholder="Ex.: 6 meses"/></div>
      </div>
      <Atestos lista={ATESTOS_PB.brigada} atestos={atestos} alternar={alternarAtesto}/>
      <Obs label="Dimensionamento" campo={campo('brigadaDimensionamento')}/>
    </BoxPB>
  )
}

// ── Alarme: item 14.1 ──────────────────────────────────────────────────────
export function CamposPBAlarme() {
  const { atestos, alternarAtesto, F } = useCamposPB()
  if (!F) return null
  return (
    <BoxPB item="14.1">
      <Atestos lista={ATESTOS_PB.alarme} atestos={atestos} alternar={alternarAtesto}/>
    </BoxPB>
  )
}

// ── Extintores: item 16 ────────────────────────────────────────────────────
export function CamposPBExtintores() {
  const { campo, F } = useCamposPB()
  if (!F) return null
  return (
    <BoxPB item="16">
      <div className="fg">
        <label>Capacidade extintora adotada para edificação de nível III</label>
        <select {...campo('extintorNivelIII')}>
          <option value="">— não informada —</option>
          {F.EXTINTORES_NIVEL.filter(l => l.nivel === 'III').map(l => (
            <option key={l.key} value={l.key}>{l.texto.replace('Edificação de nível III com capacidade extintora mínima de ', '')}{l.detalhe ? ' (distância máxima reduzida)' : ''}</option>
          ))}
        </select>
      </div>
    </BoxPB>
  )
}
