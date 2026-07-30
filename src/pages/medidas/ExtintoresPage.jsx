import { useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { riscoDoPavimento, calcularPavimento, areaLimiteUnidadeUnica } from '../../data/extintores_calc'
import Icon from '../../components/ui/Icon'

// ── Shared UI ─────────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return <div className={`bg-surface border border-solid border-border rounded-lg overflow-hidden ${className}`}>{children}</div>
}
function CardHeader({ children }) {
  return <div className="py-3 px-[18px] border-b border-solid border-border bg-surface-2 flex items-center gap-2 flex-wrap">{children}</div>
}
function SectionTitle({ label }) {
  return <h3 className="text-sm font-bold text-ink mb-3">{label}</h3>
}
function RiscoBadge({ risco }) {
  const map    = { baixo: 'low', medio: 'med', alto: 'high' }
  const labels = { baixo: 'Risco baixo', medio: 'Risco médio', alto: 'Risco alto' }
  if (!risco) return <span className="carga-class" style={{ background: 'var(--color-border-2)', color: 'var(--color-ink-faint)' }}>Risco pendente</span>
  return <span className={`carga-class ${map[risco]}`}>{labels[risco]}</span>
}
function Chip({ ok, children }) {
  return (
    <span className={`inline-flex items-center gap-1 py-[3px] px-2 rounded font-medium text-[11px] border border-solid ${ok ? 'bg-green-dim border-green-border text-green' : 'bg-red-dim border-red-border text-red'}`}>
      {ok ? '✓' : '✗'} {children}
    </span>
  )
}

// ── Grupo de ambientes a partir da lista flat de extintores ──────────
function agruparPorAmbiente(extintores) {
  const ordem = []
  const mapa = {}
  extintores.forEach(e => {
    if (!mapa[e.ambiente]) { mapa[e.ambiente] = []; ordem.push(e.ambiente) }
    mapa[e.ambiente].push(e)
  })
  return ordem.map(ambiente => ({ ambiente, itens: mapa[ambiente] }))
}

// ── Linha de um extintor dentro de um ambiente ───────────────────────
// A capacidade extintora nasce preenchida com o mínimo normativo do tipo
// (item 5.1.1/5.1.4 NT 21 CBMMA), mas é livre para o projetista aumentar
// conforme a capacidade do agente efetivamente aplicado no projeto.
function LinhaExtintor({ ext, tiposPortatil, tiposSobreRodas, dispatch }) {
  const catalogo = ext.sobreRodas ? tiposSobreRodas : tiposPortatil

  const update = changes => dispatch({ type: 'UPDATE_EXTINTOR', id: ext.id, changes })

  return (
    <tr>
      <td className="py-1.5 px-2.5 border-b border-solid border-border-2">
        <select
          value={ext.tipo}
          onChange={e => {
            const tipo = e.target.value
            const tipoInfo = catalogo.find(t => t.key === tipo)
            update({ tipo, capacidade: tipoInfo?.capacidadeMinima || '' })
          }}
          className="text-xs py-1.5 px-2"
        >
          {catalogo.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
      </td>
      <td className="py-1.5 px-2.5 border-b border-solid border-border-2 text-center">
        <input
          type="checkbox"
          checked={ext.sobreRodas}
          onChange={e => {
            const sobreRodas = e.target.checked
            const novoCatalogo = sobreRodas ? tiposSobreRodas : tiposPortatil
            const aindaExiste = novoCatalogo.some(t => t.key === ext.tipo)
            const tipo = aindaExiste ? ext.tipo : 'po_abc'
            const tipoInfo = novoCatalogo.find(t => t.key === tipo)
            update({ sobreRodas, tipo, capacidade: tipoInfo?.capacidadeMinima || '' })
          }}
          className="w-auto"
        />
      </td>
      <td className="py-1.5 px-2.5 border-b border-solid border-border-2">
        <input
          value={ext.capacidade}
          onChange={e => update({ capacidade: e.target.value })}
          className="w-[130px] text-center font-mono text-xs"
        />
      </td>
      <td className="py-1.5 px-2.5 border-b border-solid border-border-2">
        <input
          type="number" min="1" value={ext.quantidade}
          onChange={e => update({ quantidade: e.target.value })}
          className="w-[64px] text-right"
        />
      </td>
      <td className="py-1.5 px-2.5 border-b border-solid border-border-2 text-center">
        <button className="btn-del" onClick={() => dispatch({ type: 'REMOVE_EXTINTOR', id: ext.id })}>
          <Icon name="trash" size={13}/>
        </button>
      </td>
    </tr>
  )
}

// ── Bloco de um ambiente (grupo de extintores com o mesmo nome) ──────
function AmbienteBloco({ estruturaId, pavimentoId, ambiente, itens, tiposPortatil, tiposSobreRodas, dispatch }) {
  const [nome, setNome] = useState(ambiente)

  const commitRename = () => {
    const novo = nome.trim()
    if (novo && novo !== ambiente) {
      dispatch({ type: 'RENAME_AMBIENTE_EXTINTOR', estruturaId, pavimentoId, ambienteAntigo: ambiente, ambienteNovo: novo })
    } else {
      setNome(ambiente)
    }
  }

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1.5">
        <input
          value={nome}
          onChange={e => setNome(e.target.value)}
          onBlur={commitRename}
          className="flex-1 text-xs font-semibold"
        />
        <button
          className="btn-add"
          onClick={() => dispatch({ type: 'ADD_EXTINTOR', estruturaId, pavimentoId, ambiente })}
        >
          <Icon name="plus" size={11}/> Extintor
        </button>
        <button
          className="btn-del"
          title="Remover ambiente e todos os extintores"
          onClick={() => dispatch({ type: 'REMOVE_AMBIENTE_EXTINTOR', estruturaId, pavimentoId, ambiente })}
        >
          <Icon name="trash" size={13}/>
        </button>
      </div>
      <div className="border border-solid border-border rounded-md overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-2">
              <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-left border-b border-solid border-border">Tipo</th>
              <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-center border-b border-solid border-border">Sobre rodas</th>
              <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-center border-b border-solid border-border">Capacidade</th>
              <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-left border-b border-solid border-border">Qtd.</th>
              <th className="w-9 border-b border-solid border-border"></th>
            </tr>
          </thead>
          <tbody>
            {itens.map(ext => (
              <LinhaExtintor key={ext.id} ext={ext} tiposPortatil={tiposPortatil} tiposSobreRodas={tiposSobreRodas} dispatch={dispatch}/>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Card de um pavimento ──────────────────────────────────────────────
function PavimentoCard({ pavimento, estruturaId, extintoresDoPav, cargaState, extNorma, dispatch }) {
  const [novoAmbiente, setNovoAmbiente] = useState('')
  const { LIMIARES_RISCO, AREA_LIMITE_UNIDADE_UNICA, TIPOS_PORTATIL, TIPOS_SOBRE_RODAS, NOTAS } = extNorma

  const risco = riscoDoPavimento(pavimento, cargaState, LIMIARES_RISCO)
  const grupos = agruparPorAmbiente(extintoresDoPav)
  const resultado = calcularPavimento(extintoresDoPav, risco, pavimento.area, {
    tiposPortatil: TIPOS_PORTATIL, tiposSobreRodas: TIPOS_SOBRE_RODAS,
    areaLimite: AREA_LIMITE_UNIDADE_UNICA,
  })

  const limiteArea = risco ? areaLimiteUnidadeUnica(risco, AREA_LIMITE_UNIDADE_UNICA) : null

  const adicionarAmbiente = () => {
    const nome = novoAmbiente.trim()
    if (!nome) return
    dispatch({ type: 'ADD_EXTINTOR', estruturaId, pavimentoId: pavimento.id, ambiente: nome })
    setNovoAmbiente('')
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <span className="text-[13px] font-semibold text-ink">{pavimento.label}</span>
        <RiscoBadge risco={risco}/>
        {pavimento.area && <span className="text-[11px] text-ink-faint ml-auto">{pavimento.area} m²</span>}
      </CardHeader>

      <div className="py-3.5 px-[18px]">
        {!risco && (
          <div className="ibox amber">
            <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
            <span className="text-xs">A carga de incêndio deste pavimento ainda não foi classificada na Etapa 5 (Carga de Incêndio) — a área-limite para unidade única (item 5.2.1.4.2) não pode ser verificada até lá.</span>
          </div>
        )}

        {grupos.length === 0 ? (
          <div className="text-xs text-ink-faint mb-3">Nenhum ambiente cadastrado neste pavimento ainda.</div>
        ) : grupos.map(g => (
          <AmbienteBloco
            key={g.ambiente}
            estruturaId={estruturaId}
            pavimentoId={pavimento.id}
            ambiente={g.ambiente}
            itens={g.itens}
            tiposPortatil={TIPOS_PORTATIL}
            tiposSobreRodas={TIPOS_SOBRE_RODAS}
            dispatch={dispatch}
          />
        ))}

        <div className="flex items-center gap-2 mb-4">
          <input
            value={novoAmbiente}
            onChange={e => setNovoAmbiente(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && adicionarAmbiente()}
            placeholder="Nome do ambiente (ex.: Cozinha, Depósito, Casa de bombas)"
            className="flex-1 text-xs"
          />
          <button className="btn-add" onClick={adicionarAmbiente}>
            <Icon name="plus" size={11}/> Ambiente
          </button>
        </div>

        {/* Resumo de conformidade */}
        <div className="bg-bg border border-solid border-border rounded-md py-3 px-3.5 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Chip ok={resultado.temA}>Classe A</Chip>
            <Chip ok={resultado.temBC}>Classes B/C</Chip>
            <Chip ok={resultado.minimoAtendido}>Mínimo do pavimento</Chip>
            <span className="text-[11px] text-ink-faint">{resultado.totalUnidades} unidade{resultado.totalUnidades !== 1 ? 's' : ''} extintora{resultado.totalUnidades !== 1 ? 's' : ''}</span>
          </div>
          {!resultado.minimoAtendido && (
            <div className="text-[11px] text-ink-faint leading-[1.6]">{NOTAS.minimoPorPavimento}</div>
          )}
          {resultado.permiteUnidadeUnica && (resultado.temA !== resultado.temBC) && (
            <div className="text-[11px] text-ink-faint leading-[1.6]">
              {NOTAS.unidadeUnica} (área do pavimento ≤ {limiteArea} m² para o risco {risco}).
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// ── Referência normativa (topo da página) ────────────────────────────
const RISCO_ROWS = [
  { key: 'baixo', label: 'A. Risco baixo' },
  { key: 'medio', label: 'B. Risco médio' },
  { key: 'alto',  label: 'C. Risco alto' },
]

function ReferenciaNormativa({ extNorma }) {
  const { TIPOS_PORTATIL, TIPOS_SOBRE_RODAS, DISTANCIA_MAXIMA, ALTURA_INSTALACAO, LOCAIS_RISCO_ESPECIAL, NOTAS } = extNorma

  return (
    <Card className="mb-8">
      <CardHeader><span className="text-[13px] font-semibold text-ink">Parâmetros gerais (NT 21 CBMMA)</span></CardHeader>
      <div className="py-3.5 px-[18px]">
        <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">Distância máxima a percorrer (itens 5.1.2 e 5.1.5)</div>
        <div className="border border-solid border-border rounded-md overflow-hidden mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-2">
                <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-left border-b border-solid border-border">Risco</th>
                <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-right border-b border-solid border-border">Portátil</th>
                <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-right border-b border-solid border-border">Sobre rodas</th>
              </tr>
            </thead>
            <tbody>
              {RISCO_ROWS.map(r => (
                <tr key={r.key}>
                  <td className="py-1.5 px-2.5 text-xs text-ink border-b border-solid border-border-2">{r.label}</td>
                  <td className="py-1.5 px-2.5 text-xs text-ink font-mono text-right border-b border-solid border-border-2">{DISTANCIA_MAXIMA.portatil[r.key]} m</td>
                  <td className="py-1.5 px-2.5 text-xs text-ink font-mono text-right border-b border-solid border-border-2">{DISTANCIA_MAXIMA.sobreRodas[r.key]} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-[11px] text-ink-faint leading-[1.6] mb-4">{NOTAS.classeD} Distância máxima a percorrer: {DISTANCIA_MAXIMA.classeD} m (item 5.1.3.1).</div>

        <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">Capacidade extintora mínima por tipo (itens 5.1.1 e 5.1.4)</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">Portátil (item 5.1.1)</div>
            <ul className="flex flex-col gap-1">
              {TIPOS_PORTATIL.map(t => (
                <li key={t.key} className="text-xs text-ink-faint flex justify-between gap-2">
                  <span>{t.label}</span><span className="font-mono text-ink">{t.capacidadeMinima}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">Sobre rodas (item 5.1.4)</div>
            <ul className="flex flex-col gap-1">
              {TIPOS_SOBRE_RODAS.map(t => (
                <li key={t.key} className="text-xs text-ink-faint flex justify-between gap-2">
                  <span>{t.label}</span><span className="font-mono text-ink">{t.capacidadeMinima}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="text-[11px] text-ink-faint leading-[1.6] mb-2">
          Altura de fixação do suporte de parede: entre {ALTURA_INSTALACAO.suporteParede.alturaMinimaBase} m e {ALTURA_INSTALACAO.suporteParede.alturaMaxima} m do piso (item 5.2.1.1). Apoiado sobre suporte no piso: entre {ALTURA_INSTALACAO.apoiadoPiso.min} m e {ALTURA_INSTALACAO.apoiadoPiso.max} m (item 5.2.1.3).
        </div>
        <div className="text-[11px] text-ink-faint leading-[1.6] mb-2">{NOTAS.entradaEscada}</div>
        <div className="text-[11px] text-ink-faint leading-[1.6]">
          <strong className="text-ink-muted">Locais de risco especial</strong> que exigem extintor próprio independente da proteção geral (item 5.2.1.9): {LOCAIS_RISCO_ESPECIAL.join(', ')}.
        </div>
      </div>
    </Card>
  )
}

// ── Page Principal ────────────────────────────────────────────────────
export default function ExtintoresPage() {
  const { state, dispatch } = useProjeto()
  const { extintores: extNorma } = useNorma()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">

        <div className="mb-7">
          <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Medidas de Segurança</div>
          <h2 className="text-[22px] font-bold text-ink mb-1.5">Sistema de Proteção por Extintores de Incêndio</h2>
          <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[640px] m-0">
            Distribuição de extintores por estrutura, pavimento e ambiente conforme a NT 21 CBMMA. Cadastre os ambientes de cada pavimento e os extintores instalados neles — o risco predominante (que define a área-limite para unidade única) vem da carga de incêndio classificada na Etapa 5.
          </p>
        </div>

        <ReferenciaNormativa extNorma={extNorma}/>

        {state.estruturas.map(est => {
          const pavimentos = state.pavimentos.filter(p => p.estruturaId === est.id)
          return (
            <div key={est.id} className="mb-9">
              <SectionTitle label={est.nome}/>
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
                  extintoresDoPav={state.extintores.filter(e => e.pavimentoId === pav.id)}
                  cargaState={state.cargaState}
                  extNorma={extNorma}
                  dispatch={dispatch}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
