import { useNavigate, useParams } from 'react-router-dom'
import { useProjeto } from '../../context/ProjetoContext'
import FormSection from '../../components/ui/FormSection'
import Icon from '../../components/ui/Icon'
import { SISTEMA_ICON } from '../../data/sistemasIcons'

// Complementa o Plano de Emergência (NT 16/2021 CBMMA, Anexo B) com os poucos
// dados que ainda não existem em outro lugar do projeto — endereço, área,
// altura, população total, sistemas instalados e riscos especiais já vêm da
// Configuração e são usados direto na hora de montar o documento (ver
// utils/planoEmergencia.js). Nenhum campo aqui é obrigatório: em branco, o
// documento usa um papel/procedimento padrão condizente com o modelo oficial.
const PROCEDIMENTOS = [
  { key: 'meioAlerta',              label: 'Alerta — como a emergência é avisada',        placeholder: 'Ex.: alarme manual por botoeira' },
  { key: 'respAnaliseSituacao',     label: 'Análise da situação',                          placeholder: 'Ex.: Brigadista de plantão' },
  { key: 'respApoioExterno',        label: 'Apoio externo — quem aciona o Corpo de Bombeiros', placeholder: 'Ex.: Brigadista de plantão' },
  { key: 'respPrimeirosSocorros',   label: 'Primeiros socorros',                           placeholder: 'Ex.: Brigadistas treinados' },
  { key: 'respEliminarRiscos',      label: 'Eliminar riscos — corte de energia/gás',       placeholder: 'Ex.: Equipe de manutenção' },
  { key: 'respAbandono',            label: 'Abandono de área',                             placeholder: 'Ex.: Chefe da Brigada' },
  { key: 'respIsolamento',          label: 'Isolamento de área',                           placeholder: 'Ex.: Brigada de Incêndio' },
  { key: 'respConfinamento',        label: 'Confinamento do incêndio',                     placeholder: 'Ex.: Brigada de Incêndio' },
  { key: 'respCombate',             label: 'Combate ao incêndio',                          placeholder: 'Ex.: Brigada de Incêndio' },
  { key: 'respInvestigacao',        label: 'Investigação pós-emergência',                  placeholder: 'Ex.: Chefe da Brigada' },
]

export default function GerenciamentoRiscoPage() {
  const { state, dispatch } = useProjeto()
  const navigate = useNavigate()
  const { id } = useParams()
  const pe = state.planoEmergencia
  const set = changes => dispatch({ type: 'SET_PLANO_EMERGENCIA', changes })

  const temRiscoEspecial = Object.values(state.riscosEspeciaisPorEstrutura || {})
    .some(r => Object.values(r || {}).some(Boolean))

  return (
    <div className="flex-1 overflow-y-auto"><div className="max-w-[820px] mx-auto px-12 pt-[34px] pb-24">

      <div className="mb-[26px]">
        <div className="text-[11px] text-red uppercase tracking-[.08em] font-semibold mb-[5px]">
          Medidas de segurança
        </div>
        <h2 className="flex items-center gap-2 text-[22px] font-semibold text-ink mb-[5px]">
          <Icon name={SISTEMA_ICON.gerenciamento_risco} size={20} color="var(--color-red)" className="shrink-0"/>
          Gerenciamento de Risco de Incêndio
        </h2>
        <p className="text-[13px] text-ink-faint leading-[1.6] max-w-[640px] m-0">
          Plano de Emergência Contra Incêndio conforme NT 16/2021 CBMMA (Anexo B).
        </p>
      </div>

      <div className="ibox blue">
        <Icon name="info" size={14} color="rgba(80,140,220,.85)" className="shrink-0"/>
        <span>
          Endereço, estrutura, área, altura, ocupação, sistemas de segurança e riscos especiais já cadastrados na
          Configuração do projeto entram automaticamente no Plano de Emergência. Complete aqui só o que falta.
        </span>
      </div>

      <FormSection title="Edificação e funcionamento" description="Vizinhança, apoio externo e características de uso — item B.1 do Anexo B.">
        <div className="g2 mb-3">
          <div className="fg">
            <label>Característica da vizinhança</label>
            <input value={pe.caracteristicaVizinhanca} onChange={e => set({ caracteristicaVizinhanca: e.target.value })}
              placeholder="Ex.: alta concentração de edificações comerciais"/>
          </div>
          <div className="fg">
            <label>Distância do Corpo de Bombeiros (km)</label>
            <input type="number" value={pe.distanciaCBM} onChange={e => set({ distanciaCBM: e.target.value })}/>
          </div>
        </div>
        <div className="fg mb-3">
          <label>Meios de ajuda externa</label>
          <input value={pe.meiosAjudaExterna} onChange={e => set({ meiosAjudaExterna: e.target.value })}
            placeholder="Ex.: Plano de Auxílio Mútuo (PAM), brigada de empresa vizinha etc."/>
        </div>
        <div className="g2 mb-3">
          <div className="fg">
            <label>População fixa</label>
            <input type="number" value={pe.populacaoFixa} onChange={e => set({ populacaoFixa: e.target.value })}
              placeholder={state.quantidadePublico ? `Ex.: ${state.quantidadePublico}` : ''}/>
          </div>
          <div className="fg">
            <label>População flutuante</label>
            <input type="number" value={pe.populacaoFlutuante} onChange={e => set({ populacaoFlutuante: e.target.value })}/>
          </div>
        </div>
        <div className="fg mb-3">
          <label>Características de funcionamento</label>
          <input value={pe.horarioFuncionamento} onChange={e => set({ horarioFuncionamento: e.target.value })}
            placeholder="Ex.: horário comercial, 08h às 18h, segunda a sexta"/>
        </div>
        <div className="g2 mb-3">
          <div className="fg">
            <label>Pessoas c/ necessidades especiais — quantidade</label>
            <input type="number" value={pe.pneQuantidade} onChange={e => set({ pneQuantidade: e.target.value })}/>
          </div>
          <div className="fg">
            <label>Localização</label>
            <input value={pe.pneLocalizacao} onChange={e => set({ pneLocalizacao: e.target.value })} placeholder="Ex.: térreo"/>
          </div>
        </div>
        <div className="fg">
          <label>Rotas de fuga e ponto de encontro</label>
          <input value={pe.pontoEncontro} onChange={e => set({ pontoEncontro: e.target.value })}
            placeholder="Ex.: estacionamento externo, em frente à portaria principal"/>
        </div>
      </FormSection>

      {temRiscoEspecial && (
        <FormSection title="Detalhamento dos riscos especiais" description="Os riscos marcados na Configuração já entram no documento — descreva aqui onde ficam localizados.">
          <div className="fg">
            <textarea value={pe.riscosDetalhamento} onChange={e => set({ riscosDetalhamento: e.target.value })}
              placeholder="Ex.: cabine primária e caldeira elétrica no 1º subsolo"/>
          </div>
        </FormSection>
      )}

      <FormSection title="Recursos humanos e apoio externo" description="Brigada, hospital de referência e telefone de emergência — item B.1.10 do Anexo B.">
        <div className="g3">
          <div className="fg">
            <label>Brigadistas (nº de membros)</label>
            <input type="number" value={pe.brigadistasQtd} onChange={e => set({ brigadistasQtd: e.target.value })}/>
          </div>
          <div className="fg">
            <label>Brigadistas profissionais</label>
            <input type="number" value={pe.brigadistasProfissionaisQtd} onChange={e => set({ brigadistasProfissionaisQtd: e.target.value })}/>
          </div>
          <div className="fg">
            <label>Telefone do Corpo de Bombeiros</label>
            <input value={pe.telefoneCBM} onChange={e => set({ telefoneCBM: e.target.value })}/>
          </div>
        </div>
        <div className="fg mt-3">
          <label>Hospital de referência</label>
          <input value={pe.hospitalReferencia} onChange={e => set({ hospitalReferencia: e.target.value })}
            placeholder="Ex.: Hospital Municipal, a 2 km"/>
        </div>
      </FormSection>

      <FormSection title="Responsáveis pelos procedimentos de emergência" description="Quem faz o quê em cada etapa — item B.2 do Anexo B. Deixe em branco para usar um papel padrão.">
        <div className="flex flex-col">
          {PROCEDIMENTOS.map(p => (
            <div key={p.key} className="grid grid-cols-[1fr_1.2fr] gap-4 items-center py-2 border-b border-solid border-border last:border-b-0">
              <label className="text-xs text-ink-muted m-0">{p.label}</label>
              <input value={pe[p.key]} onChange={e => set({ [p.key]: e.target.value })} placeholder={p.placeholder}/>
            </div>
          ))}
        </div>
      </FormSection>

      <button className="btn-primary" onClick={() => navigate(`/projeto/${id}/documentos`, { state: { abrir: 'plano-emergencia' } })}>
        <Icon name="file" size={13}/> Ver Plano de Emergência
      </button>

    </div></div>
  )
}
