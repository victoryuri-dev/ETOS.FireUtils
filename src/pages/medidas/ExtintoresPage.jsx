import { useRef, useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { supabase } from '../../lib/supabase'
import { riscoDoPavimento, calcularPavimento, areaLimiteUnidadeUnica } from '../../data/extintores_calc'
import Icon from '../../components/ui/Icon'
import QuantityStepper from '../../components/ui/QuantityStepper'
import EstruturaSection from '../../components/ui/EstruturaSection'
import EstruturaHeaderInfo from '../../components/ui/EstruturaHeaderInfo'
import { SISTEMA_ICON } from '../../data/sistemasIcons'

// ── Importação do firedata.json (plugin Revit) ───────────────────────
// Formato esperado — um item por extintor físico (cada família do Revit
// vira um item; o site agrupa os itens idênticos de um mesmo ambiente e
// deduz a quantidade a partir da contagem):
//   { "extintores": { "_timestamp": "...", "itens": [
//       { "estrutura": "Estrutura 1", "pavimento": "Térreo", "ambiente": "Cozinha",
//         "tipo": "2A-20BC - 4 kg", "formato": "Portátil", "capacidade": "2-A:20-B:C", "carga": 4 },
//       ...
//   ] } }
//
// "estrutura" é casada por nome contra o que já está cadastrado no projeto
// (Etapa 2); quando vier vazia, o item entra na primeira estrutura do
// projeto. "pavimento" é casado por label dentro da estrutura resolvida; se
// não bater com nenhum label, tenta como "Nível N" do Revit (ver
// pavimentoPorNivelRevit — não cobre subsolo); se ainda assim não achar
// (nível vazio, subsolo não reconhecido etc.), cai no Térreo da estrutura.
// "ambiente" vazio vira "Geral".
//
// "tipo" é o rótulo livre do produto no Revit (não corresponde às chaves
// internas do catálogo normativo) — o agente extintor (água/espuma/CO2/pó
// BC/pó ABC) é inferido a partir das classes da "capacidade" (ver
// inferirTipoKey). Quando "tipo" já bater com uma chave interna válida
// (agua|espuma|co2|po_bc|po_abc|halogenado), ela é usada diretamente.
// "formato" é "Portátil" ou "Sobre rodas" (aceito sem acento/maiúsculas).
// "carga" é a carga (peso) do agente extintor em kg.
function normFormato(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, '')
}

// Deduz o agente extintor a partir das classes de fogo da capacidade
// (única informação confiável do agente que o Revit exporta hoje). Não
// distingue CO2/pó BC/halogenado — todos cobrem só B/C — então usa pó
// químico BC como padrão nesse caso, por ser o agente mais comum.
function inferirTipoKey(capacidade, catalogo) {
  const classes = new Set((capacidade || '').match(/[ABC]/g) || [])
  let key = null
  if (classes.has('A') && classes.has('B') && classes.has('C')) key = 'po_abc'
  else if (classes.has('A') && classes.has('B')) key = 'espuma'
  else if (classes.has('A')) key = 'agua'
  else if (classes.has('B') || classes.has('C')) key = 'po_bc'
  return catalogo.some(t => t.key === key) ? key : null
}

// Compara nomes/labels ignorando acento, caixa e espaços redundantes — o
// nome do nível no Revit e o label do pavimento cadastrado no site raramente
// são digitados de forma idêntica byte-a-byte.
function norm(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, ' ')
}

// O Revit não sabe se um pavimento é térreo, subsolo ou andar superior — só
// enumera "níveis" (Nível 1, Nível 2, ...) na ordem em que foram criados no
// projeto. Quando o nome não bate com nenhum pavimento cadastrado, tenta
// casar "Nível N" pela mesma numeração que o site já usa internamente para
// os pavimentos acima do solo (id termina em "-P{n}": P1 é sempre o Térreo,
// P2 é o "Pavimento 2" etc. — estável mesmo se o label for renomeado). Não
// tenta adivinhar subsolo: a numeração de nível do Revit para subsolo varia
// por escritório (pode ser negativa, pode reiniciar em 1...), então para
// esses o nome ainda precisa bater (ex.: nível chamado literalmente "Subsolo 1").
function pavimentoPorNivelRevit(nomePavimento, estruturaId, pavimentos) {
  const m = norm(nomePavimento).match(/^(?:n[ií]vel|piso|level)\s*(\d+)$/)
  if (!m) return null
  const n = parseInt(m[1], 10)
  return pavimentos.find(p => p.estruturaId === estruturaId && p.id === `${estruturaId}-P${n}`) || null
}

// `estruturaIdForcado`: quando o lote vem do Supabase (uma linha por
// estrutura, já resolvida no envio — ver revit-sync), a estrutura de
// destino já é conhecida e não depende de casar o nome digitado no Revit
// (`it.estrutura`) contra o cadastro. Passado só na importação por arquivo
// manual (fallback), onde essa informação não existe fora do próprio JSON.
function resolverImportacao(json, estruturas, pavimentos, tiposPortatil, tiposSobreRodas, estruturaIdForcado) {
  const dados = json?.extintores
  if (!dados?.itens) throw new Error('Chave "extintores.itens" não encontrada no arquivo.')

  const grupos = new Map()
  const erros = []

  const estruturaForcada = estruturaIdForcado ? estruturas.find(e => e.id === estruturaIdForcado) : null
  if (estruturaIdForcado && !estruturaForcada) {
    throw new Error('Estrutura vinculada não encontrada no projeto — reconfigure o vínculo no plugin.')
  }

  dados.itens.forEach((it, i) => {
    const linha = `Item ${i + 1}`

    let est
    if (estruturaForcada) {
      est = estruturaForcada
    } else if (norm(it.estrutura)) {
      est = estruturas.find(e => norm(e.nome) === norm(it.estrutura))
      if (!est) { erros.push(`${linha}: estrutura "${it.estrutura}" não encontrada no projeto (cadastradas: ${estruturas.map(e => e.nome).join(', ') || 'nenhuma'}).`); return }
    } else {
      est = estruturas[0]
      if (!est) { erros.push(`${linha}: nenhuma estrutura cadastrada no projeto para receber o extintor.`); return }
    }

    const pav = pavimentos.find(p => p.estruturaId === est.id && norm(p.label) === norm(it.pavimento))
      || pavimentoPorNivelRevit(it.pavimento, est.id, pavimentos)
      || pavimentos.find(p => p.estruturaId === est.id && p.tipo === 'terreo')
    if (!pav) { erros.push(`${linha}: ${est.nome} não tem nenhum pavimento cadastrado para receber o extintor.`); return }

    const formato = normFormato(it.formato)
    if (formato !== 'portatil' && formato !== 'sobrerodas') {
      erros.push(`${linha}: formato "${it.formato}" inválido (use "portatil" ou "sobreRodas").`); return
    }
    const sobreRodas = formato === 'sobrerodas'
    const catalogo = sobreRodas ? tiposSobreRodas : tiposPortatil

    let tipoKey = catalogo.some(t => t.key === it.tipo) ? it.tipo : inferirTipoKey(it.capacidade, catalogo)
    const tipoInfo = catalogo.find(t => t.key === tipoKey)
    if (!tipoInfo) { erros.push(`${linha}: não foi possível determinar o agente extintor a partir de tipo "${it.tipo}" / capacidade "${it.capacidade}".`); return }

    let carga = ''
    if (it.carga != null && it.carga !== '') {
      const n = Number(it.carga)
      if (Number.isNaN(n)) { erros.push(`${linha}: carga "${it.carga}" inválida.`); return }
      carga = String(n)
    }

    const ambiente   = norm(it.ambiente) ? it.ambiente : 'Geral'
    const capacidade = (it.capacidade || tipoInfo.capacidadeMinima).trim()
    const chave = [est.id, pav.id, ambiente, tipoKey, sobreRodas, capacidade, carga].join('|')

    const existente = grupos.get(chave)
    if (existente) existente.quantidade += 1
    else grupos.set(chave, { estruturaId: est.id, pavimentoId: pav.id, ambiente, tipo: tipoKey, sobreRodas, capacidade, carga, quantidade: 1 })
  })

  return { resolvidos: [...grupos.values()], erros, timestamp: dados._timestamp || null }
}

// ── Shared UI ─────────────────────────────────────────────────────────
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
function Chip({ ok, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md font-semibold text-xs border border-solid ${ok ? 'bg-green-dim border-green-border text-green' : 'bg-red-dim border-red-border text-red'}`}>
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
      <td className="py-1.5 px-2.5 border-b border-solid border-border-2">
        <select
          value={ext.sobreRodas ? 'sobreRodas' : 'portatil'}
          onChange={e => {
            const sobreRodas = e.target.value === 'sobreRodas'
            const novoCatalogo = sobreRodas ? tiposSobreRodas : tiposPortatil
            const aindaExiste = novoCatalogo.some(t => t.key === ext.tipo)
            const tipo = aindaExiste ? ext.tipo : 'po_abc'
            const tipoInfo = novoCatalogo.find(t => t.key === tipo)
            update({ sobreRodas, tipo, capacidade: tipoInfo?.capacidadeMinima || '' })
          }}
          className="text-xs py-1.5 px-2"
        >
          <option value="portatil">Portátil</option>
          <option value="sobreRodas">Sobre rodas</option>
        </select>
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
          type="number" min="0" step="0.1" value={ext.carga}
          onChange={e => update({ carga: e.target.value })}
          className="w-[72px] text-right"
          placeholder="kg"
        />
      </td>
      <td className="py-1.5 px-2.5 border-b border-solid border-border-2">
        <QuantityStepper value={ext.quantidade} min={1} onChange={v => update({ quantidade: v })}/>
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
  const [editing, setEditing] = useState(false)
  const [nome, setNome] = useState(ambiente)

  const commitRename = () => {
    const novo = nome.trim()
    if (novo && novo !== ambiente) {
      dispatch({ type: 'RENAME_AMBIENTE_EXTINTOR', estruturaId, pavimentoId, ambienteAntigo: ambiente, ambienteNovo: novo })
    } else {
      setNome(ambiente)
    }
  }

  const totalQtd = itens.reduce((s, e) => s + (parseInt(e.quantidade) || 0), 0)

  return (
    <div className="mb-3 border border-solid border-border rounded-md overflow-hidden">
      <div className="flex items-center gap-2.5 py-2 px-2.5 bg-surface-2 border-b border-solid border-border">
        {editing ? (
          <input
            autoFocus
            value={nome}
            onChange={e => setNome(e.target.value)}
            onBlur={() => { commitRename(); setEditing(false) }}
            onKeyDown={e => {
              if (e.key === 'Enter') { commitRename(); setEditing(false) }
              if (e.key === 'Escape') { setNome(ambiente); setEditing(false) }
            }}
            className="flex-1 text-[13px] font-semibold bg-transparent border-none p-0 outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="group flex-1 flex items-center gap-1.5 min-w-0 text-left bg-transparent"
          >
            <span className="text-[13px] font-semibold text-ink truncate">{nome}</span>
            <Icon name="edit" size={11} className="text-ink-hint group-hover:text-ink-muted transition-colors shrink-0"/>
          </button>
        )}

        <span className="text-[10px] text-ink-faint whitespace-nowrap">{totalQtd} extintor{totalQtd !== 1 ? 'es' : ''}</span>
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
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-left border-b border-solid border-border-2">Tipo</th>
            <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-left border-b border-solid border-border-2">Formato</th>
            <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-center border-b border-solid border-border-2">Capacidade</th>
            <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-right border-b border-solid border-border-2">Carga (kg)</th>
            <th className="text-[10px] text-ink-faint uppercase tracking-[.06em] font-medium py-2 px-2.5 text-left border-b border-solid border-border-2">Qtd.</th>
            <th className="w-9 border-b border-solid border-border-2"></th>
          </tr>
        </thead>
        <tbody>
          {itens.map(ext => (
            <LinhaExtintor key={ext.id} ext={ext} tiposPortatil={tiposPortatil} tiposSobreRodas={tiposSobreRodas} dispatch={dispatch}/>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Card de um pavimento ──────────────────────────────────────────────
function PavimentoCard({ pavimento, estruturaId, extintoresDoPav, cargaState, extNorma, dispatch }) {
  const { LIMIARES_RISCO, AREA_LIMITE_UNIDADE_UNICA, TIPOS_PORTATIL, TIPOS_SOBRE_RODAS, DISTANCIA_MAXIMA, NOTAS } = extNorma

  const risco = riscoDoPavimento(pavimento, cargaState, LIMIARES_RISCO)
  const grupos = agruparPorAmbiente(extintoresDoPav)
  const resultado = calcularPavimento(extintoresDoPav, risco, pavimento.area, {
    tiposPortatil: TIPOS_PORTATIL, tiposSobreRodas: TIPOS_SOBRE_RODAS,
    areaLimite: AREA_LIMITE_UNIDADE_UNICA,
  })

  const limiteArea = risco ? areaLimiteUnidadeUnica(risco, AREA_LIMITE_UNIDADE_UNICA) : null

  const adicionarAmbiente = () => {
    const nomesExistentes = new Set(grupos.map(g => g.ambiente))
    let n = grupos.length + 1
    while (nomesExistentes.has(`Ambiente ${n}`)) n++
    dispatch({ type: 'ADD_EXTINTOR', estruturaId, pavimentoId: pavimento.id, ambiente: `Ambiente ${n}` })
  }

  const conforme = resultado.temA && resultado.temBC && resultado.minimoAtendido

  return (
    <Card className="mb-4">
      <CardHeader>
        <span className="text-[13px] font-semibold text-ink">{pavimento.label}</span>
        <RiscoBadge risco={risco}/>
        {pavimento.area && <span className="text-[11px] text-ink-faint ml-auto">{pavimento.area} m²</span>}
      </CardHeader>

      {/* Resultado — o que importa, em primeiro lugar */}
      <div className={`py-3.5 px-[18px] border-b border-solid border-border ${conforme ? 'bg-green-dim' : 'bg-amber-dim'}`}>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="shrink-0 text-center">
            <div className="text-2xl font-bold text-ink leading-none">{resultado.totalUnidades}</div>
            <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mt-1 whitespace-nowrap">unidade{resultado.totalUnidades !== 1 ? 's' : ''} extintora{resultado.totalUnidades !== 1 ? 's' : ''}</div>
          </div>

          {risco && (
            <div className="shrink-0 text-center border-l border-solid border-border pl-6">
              <div className="text-sm font-bold text-ink leading-none whitespace-nowrap">
                {DISTANCIA_MAXIMA.portatil[risco]} m <span className="font-normal text-ink-faint">/</span> {DISTANCIA_MAXIMA.sobreRodas[risco]} m
              </div>
              <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mt-1 whitespace-nowrap">dist. máx. portátil / sobre rodas</div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap border-l border-solid border-border pl-6">
            <Chip ok={resultado.temA}>Classe A</Chip>
            <Chip ok={resultado.temBC}>Classes B/C</Chip>
            <Chip ok={resultado.minimoAtendido}>Mínimo do pavimento</Chip>
          </div>
        </div>

        {(!resultado.minimoAtendido || resultado.viaUnidadeUnica) && (
          <div className="text-[11px] text-ink-faint leading-[1.6] mt-3 pt-3 border-t border-solid border-border-2">
            {!resultado.minimoAtendido && NOTAS.minimoPorPavimento}
            {resultado.viaUnidadeUnica && `Atendido pela exceção de unidade única — ${NOTAS.unidadeUnica} (área do pavimento ≤ ${limiteArea} m² para o risco ${risco}).`}
          </div>
        )}
      </div>

      <div className="py-3.5 px-[18px]">
        {!risco && (
          <div className="ibox amber">
            <Icon name="warn" size={13} color="var(--color-amber)" className="shrink-0"/>
            <span className="text-xs">A carga de incêndio deste pavimento ainda não foi classificada na Etapa 5 (Carga de Incêndio) — a área-limite para unidade única (item 5.2.1.4.2) não pode ser verificada até lá.</span>
          </div>
        )}

        {grupos.length === 0 ? (
          <div className="py-8 text-center text-ink-faint text-[13px] mb-3">
            Nenhum ambiente adicionado. Clique em "Adicionar ambiente".
          </div>
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

        <button className="btn-ghost flex items-center gap-1.5 whitespace-nowrap" onClick={adicionarAmbiente}>
          <Icon name="plus" size={12}/> Adicionar ambiente
        </button>
      </div>
    </Card>
  )
}

// ── Referência normativa (topo da página) ────────────────────────────
const RISCO_ROWS = [
  { key: 'baixo', label: 'Risco baixo' },
  { key: 'medio', label: 'Risco médio' },
  { key: 'alto',  label: 'Risco alto' },
]

function RefLabel({ children }) {
  return <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">{children}</div>
}

function ReferenciaNormativa({ extNorma }) {
  const { TIPOS_PORTATIL, TIPOS_SOBRE_RODAS, DISTANCIA_MAXIMA, ALTURA_INSTALACAO, LOCAIS_RISCO_ESPECIAL, DISTANCIA_ENTRADA_ESCADA } = extNorma
  const [open, setOpen] = useState(false)

  return (
    <Card className="mb-8">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full py-3 px-[18px] border-b border-solid border-border bg-surface-2 flex items-center gap-2 text-left"
      >
        <span className="text-[13px] font-semibold text-ink">Parâmetros normativos (NT 21 CBMMA)</span>
        <span className="text-[11px] text-ink-faint">distâncias, capacidades mínimas e alturas de instalação</span>
        <Icon name="chevD" size={14} className={`ml-auto text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>
      {open && <div className="py-3.5 px-[18px] flex flex-col gap-4">
        <div>
          <RefLabel>Distância máxima a percorrer</RefLabel>
          <div className="border border-solid border-border rounded-md overflow-hidden">
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
                    <td className="py-1.5 px-2.5 text-sm text-ink border-b border-solid border-border-2">{r.label}</td>
                    <td className="py-1.5 px-2.5 text-sm font-semibold text-ink font-mono text-right border-b border-solid border-border-2">{DISTANCIA_MAXIMA.portatil[r.key]} m</td>
                    <td className="py-1.5 px-2.5 text-sm font-semibold text-ink font-mono text-right border-b border-solid border-border-2">{DISTANCIA_MAXIMA.sobreRodas[r.key]} m</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-1.5 px-2.5 text-sm text-ink border-b border-solid border-border-2">Classe D (metais)</td>
                  <td className="py-1.5 px-2.5 text-sm font-semibold text-ink font-mono text-right border-b border-solid border-border-2" colSpan={2}>{DISTANCIA_MAXIMA.classeD} m</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <RefLabel>Capacidade extintora mínima por tipo</RefLabel>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">Portátil</div>
              <ul className="flex flex-col gap-1">
                {TIPOS_PORTATIL.map(t => (
                  <li key={t.key} className="text-[13px] text-ink-muted flex justify-between gap-2">
                    <span>{t.label}</span><span className="font-mono font-semibold text-ink">{t.capacidadeMinima}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">Sobre rodas</div>
              <ul className="flex flex-col gap-1">
                {TIPOS_SOBRE_RODAS.map(t => (
                  <li key={t.key} className="text-[13px] text-ink-muted flex justify-between gap-2">
                    <span>{t.label}</span><span className="font-mono font-semibold text-ink">{t.capacidadeMinima}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <RefLabel>Altura de instalação</RefLabel>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between gap-2 text-[13px]">
              <span className="text-ink-muted">Suporte de parede</span>
              <span className="font-mono font-semibold text-ink">{ALTURA_INSTALACAO.suporteParede.alturaMinimaBase}–{ALTURA_INSTALACAO.suporteParede.alturaMaxima} m</span>
            </div>
            <div className="flex justify-between gap-2 text-[13px]">
              <span className="text-ink-muted">Apoiado no piso</span>
              <span className="font-mono font-semibold text-ink">{ALTURA_INSTALACAO.apoiadoPiso.min}–{ALTURA_INSTALACAO.apoiadoPiso.max} m</span>
            </div>
          </div>
        </div>

        <div>
          <RefLabel>Entrada e escadas</RefLabel>
          <div className="text-[13px] text-ink-muted leading-[1.6]">Pelo menos um extintor a até {DISTANCIA_ENTRADA_ESCADA} m da entrada principal da edificação e das escadas nos demais pavimentos.</div>
        </div>

        <div>
          <RefLabel>Locais de risco especial (exigem extintor próprio)</RefLabel>
          <div className="flex flex-wrap gap-1.5">
            {LOCAIS_RISCO_ESPECIAL.map(local => (
              <span key={local} className="text-[11px] text-ink-muted bg-surface-2 border border-solid border-border-2 rounded py-1 px-2">{local}</span>
            ))}
          </div>
        </div>
      </div>}
    </Card>
  )
}

// ── Page Principal ────────────────────────────────────────────────────
export default function ExtintoresPage() {
  const { state, dispatch } = useProjeto()
  const { extintores: extNorma } = useNorma()
  const [importInfo, setImportInfo] = useState(null)
  const [importErros, setImportErros] = useState([])
  const [buscando, setBuscando] = useState(false)
  const fileInputRef = useRef(null)

  // Aplica o payload da chave "extintores" (vindo de um arquivo ou do
  // Supabase) — mesmo parser de sempre, só muda a origem do JSON.
  // `estruturaIdForcado`: presente no pull do Supabase (uma linha por
  // estrutura), ausente no upload manual de arquivo.
  const aplicarExtintores = (payloadExtintores, estruturaIdForcado) => {
    try {
      const { resolvidos, erros, timestamp } = resolverImportacao(
        { extintores: payloadExtintores }, state.estruturas, state.pavimentos,
        extNorma.TIPOS_PORTATIL, extNorma.TIPOS_SOBRE_RODAS, estruturaIdForcado
      )
      if (resolvidos.length > 0) dispatch({ type: 'IMPORT_EXTINTORES', itens: resolvidos })
      return { total: resolvidos.length, erros, timestamp }
    } catch (err) {
      return { total: 0, erros: [err.message || 'Dados inválidos.'], timestamp: null }
    }
  }

  const handleImport = e => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target.result)
        const { total, erros, timestamp } = aplicarExtintores(json.extintores)
        setImportInfo({ timestamp, total })
        setImportErros(erros)
      } catch (err) {
        setImportInfo(null)
        setImportErros([err.message || 'Arquivo inválido.'])
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  // Busca uma linha por estrutura (cada arquivo Revit sincroniza a sua) e
  // aplica cada uma escopada — a importação de uma estrutura não mexe no
  // cadastro das demais (ver IMPORT_EXTINTORES em ProjetoContext.jsx).
  const handleBuscarRevit = async () => {
    setBuscando(true)
    const { data, error } = await supabase
      .from('revit_syncs_latest').select('estrutura_id, payload').eq('projeto_id', state.id).eq('medida', 'extintores')
    setBuscando(false)
    if (error || !data || data.length === 0) {
      setImportInfo(null)
      setImportErros(['Nenhum dado de extintores sincronizado do Revit ainda para este projeto.'])
      return
    }
    let totalGeral = 0
    const errosGeral = []
    let timestampMaisRecente = null
    for (const row of data) {
      const { total, erros, timestamp } = aplicarExtintores(row.payload, row.estrutura_id)
      totalGeral += total
      errosGeral.push(...erros)
      if (timestamp && (!timestampMaisRecente || timestamp > timestampMaisRecente)) timestampMaisRecente = timestamp
    }
    setImportInfo({ timestamp: timestampMaisRecente, total: totalGeral })
    setImportErros(errosGeral)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">

        <div className="flex items-start justify-between gap-4 mb-7">
          <div>
            <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Medidas de Segurança</div>
            <h2 className="flex items-center gap-2 text-[22px] font-bold text-ink mb-1.5">
              <Icon name={SISTEMA_ICON.extintores} size={20} color="var(--color-red)" className="shrink-0"/>
              Sistema de Proteção por Extintores de Incêndio
            </h2>
            <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[600px] m-0">
              Distribuição de extintores por estrutura, pavimento e ambiente conforme a NT 21 CBMMA. Cadastre manualmente ou importe do plugin Revit — o risco predominante (que define a área-limite para unidade única) vem da carga de incêndio classificada na Etapa 5.
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1.5">
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport}/>
            <button className="btn-ghost flex items-center gap-1.5 whitespace-nowrap" onClick={handleBuscarRevit} disabled={buscando}>
              <Icon name="upload" size={13}/>
              {buscando ? 'Buscando…' : 'Buscar do Revit'}
            </button>
            <button type="button" className="text-[10px] text-ink-faint hover:text-ink underline bg-transparent border-none cursor-pointer p-0" onClick={() => fileInputRef.current?.click()}>
              ou importar de um arquivo .json
            </button>
          </div>
        </div>

        {importErros.length > 0 && (
          <div className="ibox red mb-6">
            <Icon name="warn" size={13} color="var(--color-red)" className="shrink-0"/>
            <span className="text-xs">
              {importErros.length === 1 ? 'Um item não pôde ser importado' : `${importErros.length} itens não puderam ser importados`}: {importErros.join(' ')}
            </span>
          </div>
        )}

        {importInfo && (
          <div className="ibox green mb-6">
            <Icon name="check" size={13} color="var(--color-green)" className="shrink-0"/>
            <span className="text-xs">
              {importInfo.total} extintor{importInfo.total !== 1 ? 'es' : ''} importado{importInfo.total !== 1 ? 's' : ''} do Revit{importInfo.timestamp ? ` — exportação: ${importInfo.timestamp}` : ''}. Esta importação substituiu o cadastro anterior.
            </span>
          </div>
        )}

        <ReferenciaNormativa extNorma={extNorma}/>

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
                  extintoresDoPav={state.extintores.filter(e => e.pavimentoId === pav.id)}
                  cargaState={state.cargaState[est.id] || {}}
                  extNorma={extNorma}
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
