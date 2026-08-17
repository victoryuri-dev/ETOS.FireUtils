import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import Icon from '../ui/Icon'
import FormSection from '../ui/FormSection'
const getLbl = q => q<=300?'Baixo — Classe I':q<=1200?'Medio — Classe II':'Alto — Classe III/IV'
export default function Step7() {
  const {state}=useProjeto()
  const {ocupacoes,cnaesDiv}=useNorma()
  const maxQ=Object.values(state.cargaState).flatMap(porEst=>Object.values(porEst||{})).reduce((acc,c)=>{
    const q = c?.metodo==='levantamento' ? parseFloat(c?.valorManual)||0 : c?.cargaIncendio||0
    return Math.max(acc,q)
  },0)
  const getDivLabel = code => { const g=code?.charAt(0); return (ocupacoes[g]?.divisoes||{})[code]||code }
  return (
    <div className="max-w-[720px] mx-auto px-12 pt-[34px] pb-24">
      <div className="mb-8">
        <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]">Etapa 7 de 7</div>
        <h2 className="text-[22px] font-semibold text-ink mb-[5px]">Revisao e confirmacao</h2>
        <p className="text-[13px] text-ink-faint leading-[1.6]">Verifique todos os dados antes de salvar.</p>
      </div>
      <div className="ibox green mb-6"><Icon name="check" size={14} color="var(--color-green)" className="shrink-0"/><span>Confirme e salve para iniciar os dimensionamentos.</span></div>
      {[
        {t:'Identificacao', rows:[['Nome',state.nome||'—'],['Cidade',state.cidade||'—'],['Estado','Maranhao (MA)'],['Norma','NT 42/2019 CBMMA']]},
        {t:'Edificacao', rows:[['Situacao',state.situacao==='nova'?'Edificacao nova':'Edificacao existente']]},
        {t:'Risco',rows:[['Carga representativa',maxQ?maxQ+' MJ/m2 — '+getLbl(maxQ):'—']]},
      ].map(({t,rows})=>(
        <FormSection key={t} title={t}>
          <table className="w-full border-collapse">
            <tbody>
              {rows.map(([k,v])=>(
                <tr key={k} className="border-b border-solid border-border-2">
                  <td className="py-2.5 text-[13px] text-ink-faint w-[42%]">{k}</td>
                  <td className="py-2.5 text-[13px] text-ink font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormSection>
      ))}

      <FormSection title="Estruturas">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-solid border-border-2">
              <th className="py-2 text-[11px] text-ink-faint text-left font-medium">Estrutura</th>
              <th className="py-2 text-[11px] text-ink-faint text-left font-medium">Area</th>
              <th className="py-2 text-[11px] text-ink-faint text-left font-medium">Altura</th>
              <th className="py-2 text-[11px] text-ink-faint text-left font-medium">Pavimentos</th>
              <th className="py-2 text-[11px] text-ink-faint text-left font-medium">Sistema construtivo</th>
            </tr>
          </thead>
          <tbody>
            {state.estruturas.map(est => (
              <tr key={est.id} className="border-b border-solid border-border-2">
                <td className="py-2.5 text-[13px] text-ink font-medium">{est.nome}</td>
                <td className="py-2.5 text-[13px] text-ink">{est.areaTotal ? est.areaTotal+' m2' : '—'}</td>
                <td className="py-2.5 text-[13px] text-ink">{est.altura ? est.altura+' m' : '—'}</td>
                <td className="py-2.5 text-[13px] text-ink">{est.nPavimentos} pav.{est.nSubsolos ? ` + ${est.nSubsolos} subsolo${est.nSubsolos!==1?'s':''}` : ''}</td>
                <td className="py-2.5 text-[13px] text-ink">{(Array.isArray(est.estrutura) ? est.estrutura : [est.estrutura]).filter(Boolean).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </FormSection>

      <FormSection title="Classificacao por pavimento">
        {state.pavimentos.map(p=>{
          const est = state.estruturas.find(e => e.id === p.estruturaId)
          const label = state.estruturas.length > 1 && est ? `${est.nome} — ${p.label}` : p.label
          return (
            <div key={p.id} className="py-1 border-b border-solid border-border-2 text-[13px]">
              <span className="text-ink-faint w-[140px] inline-block">{label}</span>
              {getDivLabel(p.divisao)}
              {p.cnae&&<span className="ml-2 font-mono text-[11px] text-red">{p.cnae}</span>}
            </div>
          )
        })}
      </FormSection>
    </div>
  )
}
