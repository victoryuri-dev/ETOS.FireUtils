import { useRef, useState } from 'react'
import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import { calcularSinalizacaoPavimento } from '../../data/sinalizacao_calc'
import Icon from '../../components/ui/Icon'

// ── Importação do firedata.json (plugin Revit) ───────────────────────
// Formato esperado (ver comentário completo no final do arquivo):
//   { "sinalizacao": { "_timestamp": "...", "itens": [
//       { "estrutura": "Estrutura 1", "pavimento": "Térreo", "tipoPlaca": "S1", "quantidade": 3 },
//       ...
//   ] } }
//
// "estrutura" e "pavimento" são casados por nome/label contra o que já
// está cadastrado no projeto (Etapa 2) — o plugin não precisa (e não
// consegue) conhecer os IDs internos gerados pelo app. "tipoPlaca" aceita o
// código oficial da placa (ex.: "S1", "E5", case-insensitive) — a chave
// interna do catálogo (ex.: "s1") também é aceita.
function resolverImportacaoSinalizacao(json, estruturas, pavimentos, tiposPlaca) {
  const dados = json?.sinalizacao
  if (!dados?.itens) throw new Error('Chave "sinalizacao.itens" não encontrada no arquivo.')

  const norm = s => (s || '').trim().toLowerCase()
  const resolvidos = []
  const erros = []

  dados.itens.forEach((it, i) => {
    const linha = `Item ${i + 1}`
    const est = estruturas.find(e => norm(e.nome) === norm(it.estrutura))
    if (!est) { erros.push(`${linha}: estrutura "${it.estrutura}" não encontrada no projeto.`); return }

    const pav = pavimentos.find(p => p.estruturaId === est.id && norm(p.label) === norm(it.pavimento))
    if (!pav) { erros.push(`${linha}: pavimento "${it.pavimento}" não encontrado em ${est.nome}.`); return }

    const chaveInformada = norm(it.tipoPlaca)
    const tipoInfo = tiposPlaca.find(t => t.key === chaveInformada || norm(t.codigo) === chaveInformada)
    if (!tipoInfo) { erros.push(`${linha}: placa "${it.tipoPlaca}" não reconhecida.`); return }

    resolvidos.push({
      estruturaId: est.id,
      pavimentoId: pav.id,
      tipoPlaca:   tipoInfo.key,
      quantidade:  parseInt(it.quantidade) || 1,
    })
  })

  return { resolvidos, erros, timestamp: dados._timestamp || null }
}

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
function Chip({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-surface-2 border-border-2 text-ink-muted',
    green:   'bg-green-dim border-green-border text-green',
    amber:   'bg-amber-dim border-amber-border text-amber',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md font-semibold text-xs border border-solid ${tones[tone]}`}>
      {children}
    </span>
  )
}
function EmptyState({ texto }) {
  return (
    <div className="border border-solid border-border rounded-lg py-12 px-6 text-center bg-surface mb-8">
      <Icon name="sign" size={28} className="mx-auto mb-3 block text-ink-faint opacity-40"/>
      <div className="text-[13px] text-ink-faint leading-[1.6] max-w-[420px] mx-auto">{texto}</div>
    </div>
  )
}
function RefLabel({ children }) {
  return <div className="text-[10px] text-ink-faint uppercase tracking-[.06em] mb-1.5">{children}</div>
}
function StepperButton({ onClick, title, children }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className="w-6 h-6 flex items-center justify-center rounded border border-solid border-border-2 text-ink-muted hover:border-red-border hover:text-red transition-colors shrink-0">
      {children}
    </button>
  )
}

// ── Uma categoria de placas dentro de um pavimento (acordeão) ───────────
function CategoriaAccordion({ categoria, tipos, itens, estruturaId, pavimentoId, dispatch, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  const setQuantidade = (tipoPlaca, valorRaw) => {
    const valor = parseInt(valorRaw) || 0
    const item = itens.find(i => i.tipoPlaca === tipoPlaca)
    if (item) {
      if (valor <= 0) dispatch({ type: 'REMOVE_SINALIZACAO', id: item.id })
      else dispatch({ type: 'UPDATE_SINALIZACAO', id: item.id, changes: { quantidade: valor } })
    } else if (valor > 0) {
      dispatch({ type: 'ADD_SINALIZACAO', estruturaId, pavimentoId, tipoPlaca, quantidade: valor })
    }
  }

  const tiposUsados = tipos.filter(t => itens.some(i => i.tipoPlaca === t.key && i.quantidade > 0))

  return (
    <div className="border border-solid border-border rounded-md overflow-hidden mb-3 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full py-2.5 px-3 bg-surface-2 flex items-center gap-2 flex-wrap text-left cursor-pointer"
      >
        <span className="text-[13px] font-semibold text-ink">{categoria.label}</span>
        {tiposUsados.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {tiposUsados.map(t => (
              <span key={t.key} className="inline-block py-0.5 px-1.5 rounded border border-red bg-red text-white text-[10px] font-mono font-semibold">{t.codigo}</span>
            ))}
          </div>
        )}
        <Icon name="chevD" size={14} className={`ml-auto text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>
      {open && (
        <table className="w-full border-collapse">
          <tbody>
            {tipos.map(t => {
              const item = itens.find(i => i.tipoPlaca === t.key)
              const usado = (item?.quantidade || 0) > 0
              return (
                <tr key={t.key}>
                  <td className="py-2 px-3 border-b border-solid border-border-2 w-[104px]">
                    <img src={t.img} alt={t.codigo} className="w-20 h-20 max-w-none object-contain rounded-md"/>
                  </td>
                  <td className="py-2 px-2.5 border-b border-solid border-border-2 w-[56px]">
                    <span className={`inline-block py-0.5 px-1.5 rounded border text-[10px] font-mono font-semibold transition-colors ${usado ? 'bg-red border-red text-white' : 'bg-surface-2 border-border-2 text-ink-muted'}`}>{t.codigo}</span>
                  </td>
                  <td className="py-2 px-2.5 text-[13px] text-ink-muted border-b border-solid border-border-2">
                    {t.label}
                    {t.localInstalacao && <div className="text-[11px] text-ink-faint mt-0.5">{t.localInstalacao}</div>}
                  </td>
                  <td className="py-2 px-2.5 border-b border-solid border-border-2 w-[132px]">
                    {usado ? (
                      <div className="flex items-center gap-1.5 justify-end">
                        <StepperButton title="Remover uma" onClick={() => setQuantidade(t.key, item.quantidade - 1)}>
                          <Icon name="minus" size={12}/>
                        </StepperButton>
                        <input type="number" min="0" value={item.quantidade}
                          onChange={e => setQuantidade(t.key, e.target.value)}
                          className="w-12 text-right px-1.5"/>
                        <StepperButton title="Adicionar uma" onClick={() => setQuantidade(t.key, item.quantidade + 1)}>
                          <Icon name="plus" size={12}/>
                        </StepperButton>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button type="button" onClick={() => setQuantidade(t.key, 1)} title="Adicionar"
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-solid border-border-2 text-ink-faint hover:border-red-border hover:text-red hover:bg-red-dim transition-colors">
                          <Icon name="plus" size={14}/>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ── Card de um pavimento ──────────────────────────────────────────────
function PavimentoCard({ pavimento, estruturaId, itens, tiposPlaca, categorias, dispatch }) {
  const resultado = calcularSinalizacaoPavimento(itens, tiposPlaca)

  return (
    <Card className="mb-4">
      <CardHeader>
        <span className="text-[13px] font-semibold text-ink">{pavimento.label}</span>
        {resultado.quantidadeTotal > 0 && (
          <Chip tone="green">{resultado.tiposCadastrados} tipos · {resultado.quantidadeTotal} placas no total</Chip>
        )}
      </CardHeader>
      <div className="py-3.5 px-[18px]">
        {categorias.map((cat, idx) => (
          <CategoriaAccordion
            key={cat.key}
            categoria={cat}
            tipos={tiposPlaca.filter(t => t.categoria === cat.key)}
            itens={itens.filter(i => tiposPlaca.find(t => t.key === i.tipoPlaca)?.categoria === cat.key)}
            estruturaId={estruturaId} pavimentoId={pavimento.id}
            dispatch={dispatch}
            defaultOpen={idx === 2}
          />
        ))}
      </div>
    </Card>
  )
}

// ── Referência normativa (topo da página) ────────────────────────────
function ReferenciaNormativa({ sinNorma }) {
  const { NOTAS } = sinNorma
  const [open, setOpen] = useState(false)

  return (
    <Card className="mb-8">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full py-3 px-[18px] border-b border-solid border-border bg-surface-2 flex items-center gap-2 text-left"
      >
        <span className="text-[13px] font-semibold text-ink">Parâmetros normativos (NT 20 CBMMA)</span>
        <span className="text-[11px] text-ink-faint">cores, formas e local de instalação dos pictogramas</span>
        <Icon name="chevD" size={14} className={`ml-auto text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>
      {open && (
        <div className="py-3.5 px-[18px] flex flex-col gap-3">
          <div>
            <RefLabel>Categorias</RefLabel>
            <div className="text-[13px] text-ink-muted leading-[1.6]">{NOTAS.geral}</div>
          </div>
          <div className="text-[11px] text-ink-faint leading-[1.6] pt-2 border-t border-solid border-border-2">
            {NOTAS.altura}<br/>{NOTAS.fotoluminescencia}<br/>{NOTAS.quantidade}
          </div>
        </div>
      )}
    </Card>
  )
}

// ── Page Principal ────────────────────────────────────────────────────
export default function SinalizacaoPage() {
  const { state, dispatch } = useProjeto()
  const { sinalizacao: sinNorma } = useNorma()
  const { TIPOS_PLACA, CATEGORIAS } = sinNorma
  const [importInfo, setImportInfo] = useState(null)
  const [importErros, setImportErros] = useState([])
  const fileInputRef = useRef(null)

  const handleImport = e => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target.result)
        const { resolvidos, erros, timestamp } = resolverImportacaoSinalizacao(json, state.estruturas, state.pavimentos, TIPOS_PLACA)
        if (resolvidos.length > 0) dispatch({ type: 'IMPORT_SINALIZACAO', itens: resolvidos })
        setImportInfo({ timestamp, total: resolvidos.length })
        setImportErros(erros)
      } catch (err) {
        setImportInfo(null)
        setImportErros([err.message || 'Arquivo inválido.'])
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[980px] mx-auto pt-8 px-10 pb-20">

        <div className="flex items-start justify-between gap-4 mb-7">
          <div>
            <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-1">Medidas de Segurança</div>
            <h2 className="text-[22px] font-bold text-ink mb-1.5">Sinalização de Emergência</h2>
            <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[600px] m-0">
              Cadastre as placas de sinalização de emergência utilizadas em cada pavimento, conforme a NT 20 CBMMA / NBR 13434 — proibição, alerta, orientação/saída e equipamentos de combate a incêndio.
            </p>
          </div>
          <div className="shrink-0">
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport}/>
            <button className="btn-ghost flex items-center gap-1.5 whitespace-nowrap" onClick={() => fileInputRef.current?.click()}>
              <Icon name="upload" size={13}/>
              Importar do Revit
            </button>
            <div className="text-[10px] text-ink-faint mt-[5px] text-right">firedata.json</div>
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
              {importInfo.total} placa{importInfo.total !== 1 ? 's' : ''} importada{importInfo.total !== 1 ? 's' : ''} do Revit{importInfo.timestamp ? ` — exportação: ${importInfo.timestamp}` : ''}. Esta importação substituiu o cadastro anterior.
            </span>
          </div>
        )}

        <ReferenciaNormativa sinNorma={sinNorma}/>

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
                  itens={state.sinalizacao.filter(i => i.pavimentoId === pav.id)}
                  tiposPlaca={TIPOS_PLACA}
                  categorias={CATEGORIAS}
                  dispatch={dispatch}
                />
              ))}
            </div>
          )
        })}

        {state.estruturas.length === 0 && (
          <EmptyState texto="Nenhuma estrutura cadastrada ainda — configure as estruturas e pavimentos do projeto na Etapa 2."/>
        )}
      </div>
    </div>
  )
}
