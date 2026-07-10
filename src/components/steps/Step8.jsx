import { useProjeto } from '../../context/ProjetoContext'
import { useNorma } from '../../hooks/useNorma'
import Icon from '../ui/Icon'
const getLbl = q => q<=300?'Baixo — Classe I':q<=1200?'Medio — Classe II':'Alto — Classe III/IV'
export default function Step8() {
  const {state}=useProjeto()
  const {ocupacoes,cnaesDiv}=useNorma()
  const maxQ=Object.values(state.cargaState).reduce((acc,c)=>{
    const q = c?.metodo==='levantamento' ? parseFloat(c?.valorManual)||0 : c?.cargaIncendio||0
    return Math.max(acc,q)
  },0)
  const getDivLabel = code => { const g=code?.charAt(0); return (ocupacoes[g]?.divisoes||{})[code]||code }
  return (
    <div style={{maxWidth:720,margin:'0 auto',padding:'34px 48px 96px'}}>
      <div style={{marginBottom:26}}>
        <div style={{fontSize:11,color:'var(--red)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600,marginBottom:5}}>Etapa 8 de 8</div>
        <h2 style={{fontSize:22,fontWeight:600,color:'var(--text)',marginBottom:5}}>Revisao e confirmacao</h2>
        <p style={{fontSize:13,color:'var(--text-faint)',lineHeight:1.6}}>Verifique todos os dados antes de salvar.</p>
      </div>
      <div className="ibox green"><Icon name="check" size={14} color="var(--green)" style={{flexShrink:0}}/><span>Confirme e salve para iniciar os dimensionamentos.</span></div>
      {[
        {t:'Identificacao', rows:[['Nome',state.nome||'—'],['Cidade',state.cidade||'—'],['Estado','Maranhao (MA)'],['Norma','NT 42/2019 CBMMA']]},
        {t:'Edificacao', rows:[['Situacao',state.situacao==='nova'?'Edificacao nova':'Edificacao existente'],['Area construida',state.areaTotal?state.areaTotal+' m2':'—'],['Altura / Pavimentos',(state.altura?state.altura+' m':'—')+' / '+state.nPavimentos+' pavimentos']]},
        {t:'Risco',rows:[['Carga representativa',maxQ?maxQ+' MJ/m2 — '+getLbl(maxQ):'—']]},
      ].map(({t,rows})=>(
        <div key={t} style={{marginBottom:26}}>
          <div style={{fontSize:11,fontWeight:500,color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12,paddingBottom:8,borderBottom:'.5px solid var(--border)'}}>{t}</div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <tbody>
              {rows.map(([k,v])=>(
                <tr key={k} style={{borderBottom:'.5px solid var(--border-2)'}}>
                  <td style={{padding:'9px 0',fontSize:13,color:'var(--text-faint)',width:'42%'}}>{k}</td>
                  <td style={{padding:'9px 0',fontSize:13,color:'var(--text)',fontWeight:500}}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <div style={{marginBottom:26}}>
        <div style={{fontSize:11,fontWeight:500,color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12,paddingBottom:8,borderBottom:'.5px solid var(--border)'}}>Classificacao por pavimento</div>
        {state.pavimentos.map(p=>(
          <div key={p.id} style={{padding:'4px 0',borderBottom:'.5px solid var(--border-2)',fontSize:13}}>
            <span style={{color:'var(--text-faint)',width:140,display:'inline-block'}}>{p.label}</span>
            {getDivLabel(p.divisao)}
            {p.cnae&&<span style={{marginLeft:8,fontFamily:'monospace',fontSize:11,color:'var(--red)'}}>{p.cnae}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}