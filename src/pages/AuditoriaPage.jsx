import { useNavigate } from 'react-router-dom'
import { useProjeto } from '../context/ProjetoContext'
import { useAuditoria } from '../context/AuditoriaContext'
import { etapaExibida } from '../data/auditoriaProjeto'
import Icon from '../components/ui/Icon'

export default function AuditoriaPage() {
  const { state, dispatch } = useProjeto()
  const { pendencias, opcionais } = useAuditoria()
  const navigate = useNavigate()
  const opcionaisVazios = opcionais.filter(c => c.pendente)
  const listas = [
    { titulo:'Campos obrigatórios', obrigatorio:true, itens:pendencias, descricao:'Preencha estes campos para avançar e concluir o projeto.' },
    { titulo:'Campos opcionais', obrigatorio:false, itens:opcionaisVazios, descricao:'Você pode preencher estes campos para complementar o projeto. Eles não bloqueiam o avanço.' },
  ]
  const agrupar = itens => {
    const grupos = new Map()
    for (const c of itens) grupos.set(c.secao,[...(grupos.get(c.secao) || []),c])
    return [...grupos]
  }
  const corrigir = campo => {
    let rota = campo.rota
    if (campo.etapa) {
      const step = etapaExibida(campo.etapa,state.tipoProjeto === 'dimensionamento')
      dispatch({ type:'SET_WIZARD',step,unlocked:Math.max(state.configUnlocked || 1,step) })
      rota = `config/${step}`
    }
    navigate(`/projeto/${state.id}/${rota}?audit=${encodeURIComponent(campo.id)}${campo.subetapa ? `&etapa=${campo.subetapa}` : ''}`)
  }
  return (
    <div className="flex-1 overflow-y-auto">
      <main className="max-w-[980px] mx-auto px-6 sm:px-10 pt-8 pb-20">
        <h1 className="text-[22px] font-semibold text-ink mb-2">Auditoria do projeto</h1>
        <p className="text-[13px] text-ink-muted mb-6">Veja os campos obrigatórios pendentes e os campos opcionais que podem complementar o projeto. A lista é atualizada conforme você preenche.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-5">
          {listas.map(lista => (
            <section key={lista.titulo} className="overflow-hidden border border-solid border-border rounded-xl bg-surface shadow-[var(--shadow-sm)]" aria-label={lista.titulo}>
              <header className="flex items-start gap-3 p-5 border-b border-solid border-border-2">
                <span className={`grid place-items-center w-9 h-9 rounded-lg shrink-0 ${lista.obrigatorio ? 'bg-amber-dim text-amber' : 'bg-surface-2 text-ink-muted'}`}>
                  <Icon name={lista.obrigatorio ? 'warn' : 'info'} size={16}/>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="m-0 text-[16px] font-semibold text-ink">{lista.titulo}</h2>
                    <span className="grid place-items-center min-w-7 h-7 px-2 rounded-full bg-surface-2 text-[11px] font-semibold text-ink-muted">{lista.itens.length}</span>
                  </div>
                  <p className="m-0 mt-1.5 text-xs text-ink-muted leading-relaxed">{lista.descricao}</p>
                </div>
              </header>
              <div className="p-4">
                {!lista.itens.length && (
                  <div className="min-h-28 flex flex-col items-center justify-center gap-2 px-4 text-center text-[13px] text-ink-muted">
                    <Icon name={lista.obrigatorio ? 'checkCircle' : 'info'} size={19} className={lista.obrigatorio ? 'text-green' : 'text-ink-faint'}/>
                    <p className="m-0">{lista.obrigatorio ? 'Nenhum campo obrigatório pendente.' : 'Nenhum campo opcional disponível ficou em branco.'}</p>
                  </div>
                )}
                {agrupar(lista.itens).map(([secao,itens], index, groups) => (
                  <section key={secao} className={index < groups.length - 1 ? 'mb-6' : ''} aria-label={secao}>
                    <h3 className="flex items-center justify-between gap-3 m-0 mb-2 px-1 text-[13px] font-semibold text-ink">
                      {secao}<span className="text-[10px] text-ink-faint font-normal">{itens.length}</span>
                    </h3>
                    <ul className="m-0 p-0 list-none divide-y divide-solid divide-border-2 border border-solid border-border rounded-lg overflow-hidden">
                      {itens.map(campo => <li key={campo.id}>
                        <button type="button" onClick={() => corrigir(campo)} className="w-full flex items-center justify-between gap-4 text-left py-3 px-3 bg-transparent hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-red">
                          <span className="min-w-0"><span className="block text-[12px] font-medium text-ink">{campo.rotulo} {lista.obrigatorio && <span className="req">*</span>}</span>{campo.contexto && <span className="block text-[10px] text-ink-muted mt-1 leading-relaxed">{campo.contexto}</span>}</span>
                          <Icon name="right" size={13} className="text-ink-faint shrink-0"/>
                        </button>
                      </li>)}
                    </ul>
                  </section>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
