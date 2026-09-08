import { useState, useRef } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { supabase } from '../../lib/supabase'
import { getSE } from '../../data/normas/index'
import Icon from '../../components/ui/Icon'
import { SISTEMA_ICON } from '../../data/sistemasIcons'
import AcessosDescargasView from './AcessosDescargasView'
import { calcPopPav, contarSaidasPavimento, getDistanciaPavimento } from '../../data/se_calc'

// ── Helpers ───────────────────────────────────────────────────────────
let _seq = 0
const uid  = () => `se-${Date.now()}-${++_seq}`

// Ambientes ficam no reducer compartilhado (state.pavimentos[].ambientes) —
// aqui só remodela pro formato que esta página usa. `pisoDescarga`/
// `acessos` são repassados como estão no reducer — o popup de Acessos e
// Descargas (AcessosDescargasView) lê o pavimento cru direto de
// state.pavimentos, não esta versão remodelada.
function derivarPavimentos(projetoPavs) {
  if (!projetoPavs?.length) return []
  return projetoPavs.map(p => ({
    id: p.id, nome: p.label, estruturaId: p.estruturaId,
    pisoDescarga: p.pisoDescarga ?? (p.tipo === 'terreo'),
    ambientes: p.ambientes || [],
    acessos: p.acessos || [],
  }))
}

// ── Badge informativo (chuveiros/detecção — não editáveis aqui) ────────
function SistemaBadge({ ativo, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] py-1 px-2.5 rounded-md border border-solid ${ativo ? 'border-green-border bg-green-dim text-green' : 'border-border text-ink-faint'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ativo ? 'bg-green' : 'bg-border'}`}/>
      {label}
    </span>
  )
}

// ── Shared UI ─────────────────────────────────────────────────────────
function TH({ children, right, center }) {
  return <th className={`text-[10px] text-ink-faint uppercase tracking-[.07em] font-medium py-[9px] px-3.5 border-b border-solid border-border whitespace-nowrap bg-surface-2 ${right ? 'text-right' : center ? 'text-center' : 'text-left'}`}>{children}</th>
}
function TD({ children, red, bold, muted, right, center }) {
  const colorClass = red ? 'text-red' : muted ? 'text-ink-faint' : 'text-ink'
  return <td className={`py-2.5 px-3.5 text-[13px] ${colorClass} ${bold ? 'font-bold' : 'font-normal'} border-b border-solid border-border-2 align-middle ${right ? 'text-right' : center ? 'text-center' : 'text-left'}`}>{children}</td>
}
function Chip({ val, green }) {
  return <span className={`inline-block py-[3px] px-2.5 rounded font-bold text-[13px] font-mono border border-solid ${green ? 'bg-green-dim border-green-border text-green' : 'bg-red-dim border-red-border text-red'}`}>{val}</span>
}
function DimTable({ children }) {
  return <div className="border border-solid border-border rounded-md overflow-hidden mb-1"><table className="w-full border-collapse">{children}</table></div>
}

// ── Importação do firedata.json (plugin Revit) ────────────────────────
function norm(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, ' ')
}

// Acha o pavimento "de verdade" do site (id estável, ex.: est-1-P2) a
// partir do nome que vem do Revit — mesma lógica de casamento usada em
// ExtintoresPage.jsx. Com `estruturaId`, restringe a busca aos pavimentos
// dela (pull do Supabase, uma estrutura por vez); sem ele (upload manual
// de arquivo), busca entre todos.
function resolverPavimentoSite(nomeImportado, estruturaId, projetoPavimentos) {
  const candidatos = estruturaId ? projetoPavimentos.filter(p => p.estruturaId === estruturaId) : projetoPavimentos
  const porLabel = candidatos.find(p => norm(p.label) === norm(nomeImportado))
  if (porLabel) return porLabel
  const m = norm(nomeImportado).match(/^(?:n[ií]vel|piso|level)\s*(\d+)$/)
  if (m) {
    const porNivel = candidatos.find(p => p.id.endsWith(`-P${parseInt(m[1], 10)}`))
    if (porNivel) return porNivel
  }
  return candidatos.find(p => p.tipo === 'terreo') || null
}

// Ao contrário da versão antiga (que substituía a lista inteira de
// pavimentos por objetos novos, com ids sintéticos desconectados do
// projeto), resolve cada pavimento importado contra o cadastro real do
// site e devolve só as atualizações — quem chama decide como aplicar
// (mesclar, não substituir), preservando pavimentos de outras estruturas.
// `temChuveiros`/`temDeteccao` do payload NÃO são mais aplicados — esses
// dois são Medidas de Segurança da estrutura (Step6), não algo que a
// importação de ambientes deva sobrescrever silenciosamente.
function resolverImportacaoSaidas(payloadSE, estruturaIdForcado, projetoPavimentos) {
  if (!payloadSE?.pavimentos) throw new Error('Chave "pavimentos" não encontrada nos dados.')

  const erros = []
  const atualizacoes = new Map()

  payloadSE.pavimentos.forEach((p, pi) => {
    const nomeImportado = p.nome || `Pavimento ${pi + 1}`
    const pavSite = resolverPavimentoSite(nomeImportado, estruturaIdForcado, projetoPavimentos)
    if (!pavSite) { erros.push(`"${nomeImportado}": nenhum pavimento correspondente encontrado no projeto.`); return }
    atualizacoes.set(pavSite.id, {
      tipo: p.tipo || 'normal',
      ambientes: (p.ambientes || []).map((a, ai) => ({
        id:        uid(),
        nome:      a.nome      || `Ambiente ${ai + 1}`,
        divisao:   a.divisao   || '',
        area:      a.area      ?? 0,
        popTipo:   a.popTipo   || 'area',
        assentos:  a.assentos  ?? 0,
        popManual: a.popManual ?? 0,
      })),
    })
  })

  return { atualizacoes, erros, timestamp: payloadSE._timestamp || null }
}

// ── Page principal ────────────────────────────────────────────────────
export default function SaidaEmergenciaPage() {
  const { state, dispatch } = useProjeto()
  const { uf, info, ocupacoes } = useNorma()
  const { porEstrutura: medidasPorEstrutura } = useMedidasObrigatorias()
  const seNorma         = getSE(uf)
  const { DISTANCIAS_MAXIMAS } = seNorma

  // Chuveiros automáticos e detecção de incêndio não são configuráveis
  // aqui — vêm das Medidas de Segurança de cada estrutura (Step6):
  // obrigatório pela norma OU habilitado manualmente lá.
  const sistemasPorEst = Object.fromEntries(medidasPorEstrutura.map(pe => [pe.estrutura.id, pe.sistemas]))
  const getTemChuveiros = estId => !!sistemasPorEst[estId]?.sprinklers?.ativo
  const getTemDeteccao  = estId => !!sistemasPorEst[estId]?.deteccao?.ativo

  // Ambientes/acessos vêm do reducer compartilhado (state.pavimentos) — ver
  // `derivarPavimentos`. Recalculado a cada render, então reflete tanto
  // esta aba quanto o que chegar por broadcast de outra.
  const pavimentos = derivarPavimentos(state.pavimentos)
  // Pavimento cujo popup de Acessos e Descargas está aberto — null = fechado.
  // Ambientes, acessos/saídas e piso de descarga são todos editados ali
  // dentro; esta página só lista os pavimentos.
  const [viewPavId,    setViewPavId]    = useState(null)
  // Colapso dos cards é só desta aba/sessão.
  const [importInfo,   setImportInfo]   = useState(null)
  const [importErro,   setImportErro]   = useState(null)
  const [colapsadas,   setColapsadas]   = useState({})
  const [buscando,     setBuscando]     = useState(false)
  const fileInputRef = useRef(null)

  const toggleColapsada = estId => setColapsadas(prev => ({ ...prev, [estId]: !prev[estId] }))

  // Aplica um lote (arquivo ou linha do Supabase) — despacha só os
  // pavimentos resolvidos no lote, preservando o resto (inclusive de outras
  // estruturas) via IMPORT_AMBIENTES_SE.
  const aplicarSaidas = (payloadSE, estruturaId) => {
    try {
      const { atualizacoes, erros, timestamp } = resolverImportacaoSaidas(payloadSE, estruturaId, state.pavimentos)
      if (atualizacoes.size > 0) {
        dispatch({
          type: 'IMPORT_AMBIENTES_SE',
          atualizacoes: [...atualizacoes.entries()].map(([pavimentoId, dados]) => ({ pavimentoId, ambientes: dados.ambientes })),
        })
      }
      return { erros, timestamp }
    } catch (err) {
      return { erros: [err.message || 'Dados inválidos.'], timestamp: null }
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
        const { erros, timestamp } = aplicarSaidas(json?.saidas_emergencia ?? json?.se_import, null)
        setImportErro(erros.length ? erros.join(' ') : null)
        setImportInfo(timestamp)
      } catch (err) {
        setImportErro(err.message || 'Arquivo inválido.')
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  // Busca uma linha por estrutura (cada arquivo Revit sincroniza a sua) e
  // aplica cada uma escopada.
  const handleBuscarRevit = async () => {
    setBuscando(true)
    const { data, error } = await supabase
      .from('revit_syncs_latest').select('estrutura_id, payload').eq('projeto_id', state.id).eq('medida', 'saidas_emergencia')
    setBuscando(false)
    if (error || !data || data.length === 0) {
      setImportErro('Nenhum dado de saídas de emergência sincronizado do Revit ainda para este projeto.')
      return
    }
    const errosGeral = []
    let timestampMaisRecente = null
    for (const row of data) {
      const { erros, timestamp } = aplicarSaidas(row.payload, row.estrutura_id)
      errosGeral.push(...erros)
      if (timestamp && (!timestampMaisRecente || timestamp > timestampMaisRecente)) timestampMaisRecente = timestamp
    }
    setImportErro(errosGeral.length ? errosGeral.join(' ') : null)
    setImportInfo(timestampMaisRecente)
  }

  const viewPav = viewPavId ? state.pavimentos.find(p => p.id === viewPavId) : null

  const dadosPav = pavimentos.map(p => {
    const temChuveiros    = getTemChuveiros(p.estruturaId)
    const temDeteccao     = getTemDeteccao(p.estruturaId)
    const pop             = calcPopPav(p, seNorma.TAXA_POPULACIONAL)
    const nSaidas         = Math.max(1, contarSaidasPavimento(p.acessos))
    const dist            = getDistanciaPavimento(p, nSaidas, temChuveiros, temDeteccao, DISTANCIAS_MAXIMAS)
    const semAcessoCount  = p.ambientes.filter(a => !a.acessoId).length
    return { pav:p, pop, nSaidas, dist, semAcessoCount }
  })

  const porEstrutura = state.estruturas.map(est => ({
    estrutura: est,
    dadosPav: dadosPav.filter(d => d.pav.estruturaId === est.id),
  }))

  const temPavimentos = pavimentos.length > 0

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Medidas de Segurança</div>
              <h2 className="flex items-center gap-2 text-[22px] font-bold text-ink mb-1.5">
                <Icon name={SISTEMA_ICON.saida_emergencia} size={20} color="var(--color-red)" className="shrink-0"/>
                Saídas de Emergência
              </h2>
              <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[600px] m-0">
                Clique em um pavimento para cadastrar os ambientes e montar a árvore de acessos, saídas e escadas/rampas, conforme {info?.nome || 'NT vigente'} / NBR 9077.
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

          {importInfo && (
            <div className="ibox green mb-0">
              <Icon name="check" size={13} color="var(--color-green)" className="shrink-0"/>
              <span className="text-xs">Dados importados do Revit — última exportação: <strong>{importInfo}</strong>. Confira os ambientes e ajuste se necessário.</span>
            </div>
          )}
          {importErro && (
            <div className="ibox red mb-0">
              <Icon name="warn" size={13} color="var(--color-red)" className="shrink-0"/>
              <span className="text-xs">Erro ao importar: {importErro}</span>
            </div>
          )}
        </div>

        {/* Pavimentos */}
        {!temPavimentos ? (
          <div className="p-9 text-center text-ink-faint text-[13px] bg-surface border border-solid border-border rounded-lg">
            Nenhum pavimento configurado. Cadastre os pavimentos da edificação na Etapa 2 (Edificação).
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {porEstrutura.filter(g => g.dadosPav.length > 0).map(({ estrutura, dadosPav: dadosDaEstrutura }) => {
              const aberta = !colapsadas[estrutura.id]
              return (
              <div key={estrutura.id} className="border border-solid border-border rounded-lg bg-surface overflow-hidden transition-colors hover:border-white/20">
                <div
                  className="flex items-center justify-between gap-4 py-3.5 px-5 cursor-pointer select-none"
                  onClick={() => toggleColapsada(estrutura.id)}
                >
                  <div className="text-[13px] font-bold text-ink flex items-center gap-2">
                    <Icon name={aberta ? 'chevD' : 'chevR'} size={13} color="var(--color-ink-faint)" className="shrink-0"/>
                    <Icon name="newbld" size={14} color="var(--color-red)"/> {estrutura.nome}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <SistemaBadge ativo={getTemChuveiros(estrutura.id)} label="Chuveiros automáticos"/>
                    <SistemaBadge ativo={getTemDeteccao(estrutura.id)} label="Detecção de incêndio"/>
                  </div>
                </div>

                {aberta && (
                <div className="px-5 pb-5">
                  <DimTable>
                    <thead><tr><TH>Pavimento</TH><TH center>Amb.</TH><TH center>Pop.</TH><TH center>Saídas</TH><TH right>Dist. máxima</TH><TH/></tr></thead>
                    <tbody>
                      {dadosDaEstrutura.map(({ pav, pop, nSaidas, dist, semAcessoCount }) => (
                        <tr key={pav.id} onClick={() => setViewPavId(pav.id)} className="cursor-pointer transition-colors duration-100 hover:bg-white/[.025]">
                          <TD bold>
                            {pav.nome}
                            {pav.pisoDescarga && <span className="ml-1.5 align-middle text-[9px] py-0.5 px-1.5 rounded bg-amber-dim border border-solid border-amber-border text-amber font-semibold">DESCARGA</span>}
                          </TD>
                          <TD center muted>
                            {pav.ambientes.length}
                            {semAcessoCount > 0 && <div className="text-[9px] text-amber mt-0.5">{semAcessoCount} sem acesso</div>}
                          </TD>
                          <TD center red bold>{pop}</TD>
                          <TD center red bold>{nSaidas}</TD>
                          <td className="py-2.5 px-3.5 text-right text-[13px] border-b border-solid border-border-2 align-middle">
                            {dist!==null ? <Chip val={`${dist} m`} green/> : <span className="text-xs text-ink-faint">Consultar NT</span>}
                          </td>
                          <td className="py-2.5 px-3.5 text-right border-b border-solid border-border-2 align-middle"><Icon name="right" size={13} color="var(--color-ink-faint)"/></td>
                        </tr>
                      ))}
                    </tbody>
                  </DimTable>
                </div>
                )}
              </div>
              )
            })}
          </div>
        )}
      </div>

      {viewPav && <AcessosDescargasView pav={viewPav} seNorma={seNorma} ocupacoes={ocupacoes} dispatch={dispatch} onClose={() => setViewPavId(null)}/>}
    </div>
  )
}
