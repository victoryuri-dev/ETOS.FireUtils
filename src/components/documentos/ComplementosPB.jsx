import { useProjeto } from '../../context/ProjetoContext'
import { getMemorialFormulario, getCompartimentacao } from '../../data/normas/index'
import { ATESTOS_PB, ELEMENTOS_COMPART_H_PB, ELEMENTOS_COMPART_V_PB } from '../../data/memorial/PB/formulario'
import Checkbox from '../ui/Checkbox'
import Icon from '../ui/Icon'

// Painel lateral do Memorial da PB (MemorialPBPage.jsx): só os campos que o
// formulário do CBMPB pede e que nenhuma outra tela do projeto coleta
// (state.memorialPB). Tudo o mais no formulário sai das etapas e das telas
// de cada medida — aqui não se repete nenhum dado já cadastrado lá.

function Grupo({ titulo, children, aberto = false }) {
  return (
    <details open={aberto} className="border-b border-solid border-border group">
      <summary className="cursor-pointer list-none flex items-center justify-between py-3 px-4 text-[13px] font-semibold text-ink">
        {titulo}
        <Icon name="chevD" size={13} className="transition-transform group-open:rotate-180"/>
      </summary>
      <div className="px-4 pb-4 flex flex-col gap-3">{children}</div>
    </details>
  )
}

function Atesto({ label, checked, onChange }) {
  return (
    <div role="button" tabIndex={0} className="flex items-start gap-2 text-[12px] text-ink-muted leading-[1.45] cursor-pointer" onClick={onChange}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange() } }}>
      <span className="mt-0.5"><Checkbox checked={checked} onChange={onChange}/></span>
      <span>{label}</span>
    </div>
  )
}

export default function ComplementosPB({ temTabelaExigencias }) {
  const { state, dispatch } = useProjeto()
  const F = getMemorialFormulario(state.uf)
  const m = state.memorialPB || {}
  const set = changes => dispatch({ type: 'SET_MEMORIAL_PB', changes })
  const campo = key => ({ value: m[key] || '', onChange: e => set({ [key]: e.target.value }) })
  const atestos = m.atestos || {}
  const alternarAtesto = key => set({ atestos: { ...atestos, [key]: !atestos[key] } })
  const listaAtestos = lista => lista.map(([key, label]) => (
    <Atesto key={key} label={label} checked={!!atestos[key]} onChange={() => alternarAtesto(key)}/>
  ))

  const temGlp = Object.values(state.riscosEspeciaisPorEstrutura || {}).some(r => r?.glp)
  const { ELEMENTOS_COMPART_HORIZONTAL = [], ELEMENTOS_COMPART_VERTICAL = [] } = getCompartimentacao(state.uf)
  const rotulo = (lista, key) => lista.find(([k]) => k === key)?.[1] || key
  // Só os elementos já marcados na tela de Compartimentação — a característica
  // é a única coisa que o formulário pede a mais sobre eles.
  const marcados = [
    ...[...new Set((state.estruturas || []).flatMap(e => e.elementosCompartHorizontal || []))]
      .filter(k => ELEMENTOS_COMPART_HORIZONTAL.some(el => el.key === k)).map(k => ({ chave: `h:${k}`, label: `Horizontal — ${rotulo(ELEMENTOS_COMPART_H_PB, k)}` })),
    ...[...new Set((state.estruturas || []).flatMap(e => e.elementosCompartVertical || []))]
      .filter(k => ELEMENTOS_COMPART_VERTICAL.some(el => el.key === k)).map(k => ({ chave: `v:${k}`, label: `Vertical — ${rotulo(ELEMENTOS_COMPART_V_PB, k)}` })),
  ]
  const spec = m.especificacaoCompart || {}

  if (!F) return null
  return (
    <div className="text-ink">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-[15px] font-semibold mb-1">Complementos do formulário</h3>
        <p className="text-[12px] text-ink-faint leading-[1.5] m-0">
          O restante do formulário é preenchido com os dados das etapas e das medidas do projeto.
        </p>
        {!temTabelaExigencias && (
          <div className="ibox amber mt-3 mb-0">
            <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
            <span>A tabela de exigências da NT 04/2023 CBMPB ainda não está cadastrada: só as medidas do mínimo de referência saem como &quot;Exigível&quot;; as demais ficam sem marcação até o cadastro.</span>
          </div>
        )}
      </div>

      <Grupo titulo="2 · Forma de apresentação" aberto>
        <div className="fg">
          <label>Forma de apresentação</label>
          <select {...campo('formaApresentacao')}>
            <option value="">— não informada —</option>
            {F.FORMAS_APRESENTACAO.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </div>
      </Grupo>

      <Grupo titulo="3 · Parâmetros de dimensionamento">
        <div className="fg"><label>3.1 Observação livre (natureza da ocupação)</label><textarea rows={2} {...campo('obsNatureza')}/></div>
        <div className="fg">
          <label>3.4.1 Classe de revenda de GLP (NBR 15514)</label>
          <select {...campo('glpClasse')} disabled={!temGlp}>
            <option value="">— não informada —</option>
            {F.CLASSES_GLP.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
          </select>
          {!temGlp && <span className="text-[11px] text-ink-faint">Disponível quando o risco especial GLP estiver marcado na Configuração.</span>}
        </div>
        <div className="fg">
          <label>3.6 Estágio de construção</label>
          <select {...campo('estagioConstrucao')}>
            <option value="">{state.situacao === 'nova' ? 'Automático (edificação nova: ainda será construída)' : '— não informado —'}</option>
            {F.ESTAGIOS_CONSTRUCAO.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
          </select>
        </div>
        <div className="fg"><label>Adaptações da NT 16 e/ou Resoluções Técnicas</label><textarea rows={3} {...campo('adaptacoes')}/></div>
      </Grupo>

      <Grupo titulo="7 a 9 · Estrutura, compartimentação e CMAR">
        <div className="fg"><label>7 Observações livres (segurança estrutural)</label><textarea rows={2} {...campo('obsSegEstrutural')}/></div>
        {marcados.length > 0
          ? marcados.map(({ chave, label }) => (
              <div key={chave} className="fg">
                <label>8 {label}</label>
                <input value={spec[chave] || ''} onChange={e => set({ especificacaoCompart: { ...spec, [chave]: e.target.value } })} placeholder="Característica (ex.: alvenaria EI-120)"/>
              </div>
            ))
          : <p className="text-[12px] text-ink-faint m-0">8 Nenhum elemento de compartimentação marcado ainda (tela de Compartimentação).</p>}
        <div className="fg"><label>9 Observação (CMAR)</label><textarea rows={2} {...campo('obsCmar')}/></div>
      </Grupo>

      <Grupo titulo="10 · Saída de emergência">
        <div className="fg">
          <label>10.1 Tipo de escada</label>
          <select {...campo('tipoEscada')}>
            <option value="">Automático (pela norma, quando cadastrada)</option>
            <option value="NE">Não Enclausurada - NE</option>
            <option value="EP">Enclausurada Protegida - EP</option>
            <option value="PF">A prova de fumaça - PF</option>
          </select>
        </div>
        {listaAtestos(ATESTOS_PB.saidas)}
        <div className="fg"><label>Observações livres</label><textarea rows={2} {...campo('obsSaidas')}/></div>
      </Grupo>

      <Grupo titulo="11 · Plano de emergência">
        <div className="fg">
          <label>11.1 Como o plano foi elaborado</label>
          <select {...campo('planoModelo')}>
            <option value="">— não informado —</option>
            {F.MODELOS_PLANO.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
        <div className="fg"><label>Observações livres</label><textarea rows={2} {...campo('obsPlano')}/></div>
      </Grupo>

      <Grupo titulo="12 · Brigada de incêndio">
        <div className="fg"><label>Carga horária mínima do treinamento</label><input {...campo('brigadaCargaHoraria')} placeholder="Ex.: 16 h"/></div>
        <div className="fg"><label>Tempo entre simulados (máximo 12 meses)</label><input {...campo('brigadaIntervaloSimulados')} placeholder="Ex.: 6 meses"/></div>
        {listaAtestos(ATESTOS_PB.brigada)}
        <div className="fg"><label>Dimensionamento</label><textarea rows={2} {...campo('brigadaDimensionamento')}/></div>
        <div className="fg"><label>Observação livre</label><textarea rows={2} {...campo('obsBrigada')}/></div>
      </Grupo>

      <Grupo titulo="14 · Alarme e detecção">
        {listaAtestos(ATESTOS_PB.alarme)}
        <div className="fg"><label>14.1 Observações livres (alarme)</label><textarea rows={2} {...campo('obsAlarme')}/></div>
        <div className="fg"><label>14.2 Observações livres (detecção)</label><textarea rows={2} {...campo('obsDeteccao')}/></div>
      </Grupo>

      <Grupo titulo="16 · Extintores">
        <div className="fg">
          <label>Capacidade adotada no nível III</label>
          <select {...campo('extintorNivelIII')}>
            <option value="">— não informada —</option>
            {F.EXTINTORES_NIVEL.filter(l => l.nivel === 'III').map(l => <option key={l.key} value={l.key}>{l.texto.replace('Edificação de nível III com capacidade extintora mínima de ', '')}{l.detalhe ? ' (distância reduzida)' : ''}</option>)}
          </select>
        </div>
        <div className="fg"><label>Observações livres</label><textarea rows={2} {...campo('obsExtintores')}/></div>
      </Grupo>
    </div>
  )
}
