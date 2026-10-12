import { useNavigate } from 'react-router-dom'
import { useProjeto } from '../context/ProjetoContext'
import { useAuditoria } from '../context/AuditoriaContext'
import { etapaExibida } from '../data/auditoriaProjeto'
import Icon from '../components/ui/Icon'

export default function AuditoriaPage() {
  const { state, dispatch } = useProjeto()
  const { campos, pendencias, opcionais } = useAuditoria()
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
        <div className={`ibox ${pendencias.length ? 'amber' : 'green'}`} role="status">
          <Icon name={pendencias.length ? 'warn' : 'checkCircle'} size={16}/>
          <span>{pendencias.length ? `${pendencias.length} campo${pendencias.length === 1 ? '' : 's'} obrigatório${pendencias.length === 1 ? '' : 's'} pendente${pendencias.length === 1 ? '' : 's'}.` : 'Todos os campos obrigatórios aplicáveis estão preenchidos.'} {campos.length - pendencias.length} de {campos.length} preenchidos.</span>
        </div>
        <p className="text-xs text-ink-muted mb-6">Esta conferência verifica o preenchimento. A revisão técnica dos dimensionamentos continua sendo realizada nas páginas de cada medida.</p>
        {listas.map(lista => <section key={lista.titulo} className="mb-10" aria-label={lista.titulo}>
          <h2 className="text-lg font-semibold text-ink mb-2">{lista.titulo} <span className="text-xs text-ink-muted font-normal">({lista.itens.length})</span></h2>
          <p className="text-xs text-ink-muted mb-4">{lista.descricao}</p>
          {!lista.itens.length && <p className="text-[13px] text-ink-muted">{lista.obrigatorio ? 'Nenhum campo obrigatório pendente.' : 'Nenhum campo opcional disponível ficou em branco.'}</p>}
        {agrupar(lista.itens).map(([secao,itens]) => (
          <section key={secao} className="mb-7" aria-label={secao}>
            <h3 className="text-base font-semibold text-ink mb-3">{secao} <span className="text-xs text-ink-muted font-normal">({itens.length})</span></h3>
            <ul className="divide-y divide-solid divide-border border-y border-solid border-border">
              {itens.map(campo => <li key={campo.id}>
                <button type="button" onClick={() => corrigir(campo)} className="w-full flex items-center justify-between gap-4 text-left py-3 px-2 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-red rounded-sm">
                  <span className="min-w-0"><span className="block text-[13px] text-ink">{campo.rotulo} {lista.obrigatorio && <span className="req">*</span>}</span>{campo.contexto && <span className="block text-xs text-ink-muted mt-1">{campo.contexto}</span>}</span>
                  <span className="flex items-center gap-1.5 text-xs text-ink-muted shrink-0">Preencher <Icon name="right" size={13}/></span>
                </button>
              </li>)}
            </ul>
          </section>
        ))}
        </section>)}
      </main>
    </div>
  )
}
