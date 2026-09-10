import { useProjeto } from '../context/ProjetoContext'
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

const STEPS_CONFIG_COMPLETO = [
  { label:'Identificacao',       sub:'Local, norma, proprietario e empresa' },
  { label:'Edificacao',          sub:'Tipo, dimensoes, estrutura' },
  { label:'Responsavel tecnico', sub:'Projetista e ART' },
  { label:'Classificacao',       sub:'Ocupacao por pavimento' },
  { label:'Carga de Incendio',   sub:'CNAE e carga por divisao' },
  { label:'Medidas de seguranca',sub:'Sistemas exigidos' },
  { label:'Revisao final',       sub:'Confirmar e salvar' },
]

// Projeto "apenas dimensionamento" (ver ProjetosPage.jsx/ProjetoContext.jsx
// tipoProjeto) pula Identificacao/Responsavel tecnico (Steps 1 e 3 —
// responsavel pelo uso, localizacao, responsavel tecnico) e Revisao final
// (Step 7) — so o necessario pra dimensionar Saida de Emergencia,
// Hidrantes e Chuveiros Automaticos fica no wizard. "Nome do projeto"
// (unico campo do Step1 que ainda e obrigatorio aqui) entra no topo do
// Step2 nesse modo — ver Step2.jsx.
const STEPS_CONFIG_DIMENSIONAMENTO = [
  { label:'Edificacao',           sub:'Nome, estado, dimensoes, estrutura' },
  { label:'Classificacao',        sub:'Ocupacao por pavimento' },
  { label:'Carga de Incendio',    sub:'CNAE e carga por divisao' },
  { label:'Medidas de seguranca', sub:'Saida de emergencia, hidrantes, chuveiros' },
]

const STEPS = { 1:Step1, 2:Step2, 3:Step3, 4:Step4, 5:Step5, 6:Step6, 7:Step7 }

// Mapeia posicao de exibicao (1..N, a que StepsNav/useWizard enxergam) pra
// chave "real" do Step/status — useStepStatus.js e keyed pelos numeros
// originais de 1 a 7 (2=Edificacao, 4=Classificacao, etc.), entao o modo
// dimensionamento so precisa dizer "na posicao 1, mostra o Step/status 2"
// em vez de duplicar aquela logica com numeros novos.
const ORDEM_COMPLETO = [1, 2, 3, 4, 5, 6, 7]
const ORDEM_DIMENSIONAMENTO = [2, 4, 5, 6]

export default function ConfiguracaoPage({ onGoDashboard }) {
  const { state } = useProjeto()
  const dimensionamento = state.tipoProjeto === 'dimensionamento'
  const STEPS_CONFIG = dimensionamento ? STEPS_CONFIG_DIMENSIONAMENTO : STEPS_CONFIG_COMPLETO
  const ordem = dimensionamento ? ORDEM_DIMENSIONAMENTO : ORDEM_COMPLETO

  const { step, totalSteps, unlocked, next, prev, goTo, isUnlocked } = useWizard(STEPS_CONFIG.length)
  const getStatus = useStepStatus()
  const ActiveStep = STEPS[ordem[step - 1]]

  return (
    <div className="flex flex-1 overflow-hidden">
      <StepsNav
        steps={STEPS_CONFIG.slice(0, unlocked)}
        current={step}
        isUnlocked={isUnlocked}
        getStatus={(n) => getStatus(ordem[n - 1])}
        onGo={goTo}
      />
      <div className="flex-1 overflow-y-auto">
        {ActiveStep && <ActiveStep step={step} totalSteps={totalSteps}/>}

        {/* Navegação do wizard — no fim do formulário, rola junto com o conteúdo */}
        <div className="max-w-[720px] mx-auto px-12 pb-16 -mt-16 flex items-center justify-between border-t border-solid border-border pt-6">
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
    </div>
  )
}
