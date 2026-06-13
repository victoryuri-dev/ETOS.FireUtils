import StepsNav from '../components/layout/StepsNav'
import Icon     from '../components/ui/Icon'
import { useWizard } from '../hooks/useWizard'
import Step1 from '../components/steps/Step1'
import Step2 from '../components/steps/Step2'
import Step3 from '../components/steps/Step3'
import Step4 from '../components/steps/Step4'
import Step5 from '../components/steps/Step5'
import Step6 from '../components/steps/Step6'
import Step7 from '../components/steps/Step7'
import Step8 from '../components/steps/Step8'

const STEPS_CONFIG = [
  { label:'Identificacao',       sub:'Nome, local, norma' },
  { label:'Edificacao',          sub:'Tipo, dimensoes, estrutura' },
  { label:'Proprietario e uso',  sub:'Responsavel e empresa' },
  { label:'Responsavel tecnico', sub:'Projetista e ART' },
  { label:'Classificacao',       sub:'Ocupacao por pavimento' },
  { label:'Carga de Incendio',   sub:'CNAE e carga por divisao' },
  { label:'Medidas de seguranca',sub:'Sistemas exigidos' },
  { label:'Revisao final',       sub:'Confirmar e salvar' },
]
const STEPS = { 1:Step1, 2:Step2, 3:Step3, 4:Step4, 5:Step5, 6:Step6, 7:Step7, 8:Step8 }

export default function ConfiguracaoPage({ onGoDashboard }) {
  const { step, totalSteps, next, prev, goTo, isUnlocked, isDone } = useWizard(8)
  const ActiveStep = STEPS[step]

  return (
    <div style={{ display:'flex', flex:1, flexDirection:'column', overflow:'hidden' }}>

      {/* StepsNav + conteúdo */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <StepsNav
          steps={STEPS_CONFIG}
          current={step}
          isUnlocked={isUnlocked}
          isDone={isDone}
          onGo={goTo}
        />
        <div style={{ flex:1, overflowY:'auto' }}>
          {ActiveStep && <ActiveStep/>}
        </div>
      </div>

      {/* Footer inline — sem position:fixed */}
      <div style={{
        height:60, flexShrink:0,
        background:'var(--surface)', borderTop:'.5px solid var(--border)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 48px', zIndex:10,
      }}>
        <div style={{ fontSize:12, color:'var(--text-faint)', display:'flex', alignItems:'center', gap:6 }}>
          <Icon name="info" size={13}/>
          {step < totalSteps ? `Etapa ${step} de ${totalSteps}` : 'Projeto pronto — revise e confirme.'}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {step > 1 && (
            <button className="btn-ghost" onClick={prev}>
              <Icon name="left" size={13}/> Voltar
            </button>
          )}
          {step < totalSteps
            ? <button className="btn-primary" onClick={next}>
                Proximo <Icon name="right" size={13}/>
              </button>
            : <button className="btn-success" onClick={onGoDashboard}>
                <Icon name="save" size={13}/> Salvar e ver resumo
              </button>
          }
        </div>
      </div>

    </div>
  )
}
