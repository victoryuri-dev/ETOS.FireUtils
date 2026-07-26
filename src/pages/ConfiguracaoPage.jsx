import StepsNav from '../components/layout/StepsNav'
import Icon     from '../components/ui/Icon'
import { useWizard } from '../hooks/useWizard'
import { useStepStatus } from '../hooks/useStepStatus'
import Step1 from '../components/steps/Step1'
import Step2 from '../components/steps/Step2'
import Step3 from '../components/steps/Step3'
import Step4 from '../components/steps/Step4'
import Step5 from '../components/steps/Step5'
import Step6 from '../components/steps/Step6'
import Step7 from '../components/steps/Step7'

const STEPS_CONFIG = [
  { label:'Identificacao',       sub:'Local, norma, proprietario e empresa' },
  { label:'Edificacao',          sub:'Tipo, dimensoes, estrutura' },
  { label:'Responsavel tecnico', sub:'Projetista e ART' },
  { label:'Classificacao',       sub:'Ocupacao por pavimento' },
  { label:'Carga de Incendio',   sub:'CNAE e carga por divisao' },
  { label:'Medidas de seguranca',sub:'Sistemas exigidos' },
  { label:'Revisao final',       sub:'Confirmar e salvar' },
]
const STEPS = { 1:Step1, 2:Step2, 3:Step3, 4:Step4, 5:Step5, 6:Step6, 7:Step7 }

export default function ConfiguracaoPage({ onGoDashboard }) {
  const { step, totalSteps, next, prev, goTo, isUnlocked } = useWizard(7)
  const getStatus = useStepStatus()
  const ActiveStep = STEPS[step]

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* StepsNav + conteúdo */}
      <div className="flex flex-1 overflow-hidden">
        <StepsNav
          steps={STEPS_CONFIG}
          current={step}
          isUnlocked={isUnlocked}
          getStatus={getStatus}
          onGo={goTo}
        />
        <div className="flex-1 overflow-y-auto">
          {ActiveStep && <ActiveStep/>}
        </div>
      </div>

      {/* Footer inline — sem position:fixed */}
      <div className="h-[60px] shrink-0 bg-surface border-t border-solid border-border flex items-center justify-between px-12 z-10">
        <div className="text-xs text-ink-faint flex items-center gap-1.5">
          <Icon name="info" size={13}/>
          {step < totalSteps ? `Etapa ${step} de ${totalSteps}` : 'Projeto pronto — revise e confirme.'}
        </div>
        <div className="flex items-center gap-2.5">
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
