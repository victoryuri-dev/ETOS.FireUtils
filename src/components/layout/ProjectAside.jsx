import { useMedidasObrigatorias } from '../../hooks/useMedidasObrigatorias'
import { Aside, AsideItem, AsideSection } from './Aside'

// Lista completa de sistemas — mesma ordem do Step7
const SISTEMAS = [
  { key:'acesso_viatura',      icon:'van',                   label:'Acesso de Viatura' },
  { key:'seg_estrutural',      icon:'segEstruturalMedida',   label:'Seg. Estrutural' },
  { key:'compart_vertical',    icon:'stair',                 label:'Compartimentação Vertical' },
  { key:'controle_acabamento', icon:'sign',                  label:'Controle de Acabamento' },
  { key:'saida_emergencia',    icon:'saidaEmergenciaMedida', label:'Saídas de Emergência' },
  { key:'gerenciamento_risco', icon:'warn',                  label:'Gerenciamento de Risco' },
  { key:'brigada',             icon:'shieldAlert',           label:'Brigada de Incêndio' },
  { key:'iluminacao',          icon:'sun',                   label:'Iluminação de Emergência' },
  { key:'sinalizacao',         icon:'sign',                  label:'Sinalização' },
  { key:'extintores',          icon:'extintorMedida',        label:'Extintores' },
  { key:'hidrantes',           icon:'hidranteMedida',        label:'Hidrantes / Mangotinho' },
  { key:'alarme',              icon:'bellElectric',          label:'Alarme de Incêndio' },
  { key:'deteccao',            icon:'detectorMedida',        label:'Detecção de Incêndio' },
  { key:'sprinklers',          icon:'spray',                 label:'Chuveiros Automáticos' },
  { key:'controle_fumaca',     icon:'flame',                 label:'Controle de Fumaça' },
  { key:'central_gas',         icon:'info',                  label:'Central de Gás' },
  { key:'spda',                icon:'warn',                  label:'SPDA' },
]

export default function ProjectAside({ activePage, onNavigate, onSairDoProjeto }) {
  const { sistemas } = useMedidasObrigatorias()

  const enabledSystems = SISTEMAS.filter(s =>
    sistemas[s.key]?.ativo || sistemas[s.key]?.obrigatorio
  )

  return (
    <Aside>
      {/* Saida do projeto. Dentro de um projeto este menu substitui o global,
          entao sem este item a unica volta seria o breadcrumb do header — que
          e discreto demais pra ser a unica saida. */}
      <div className="py-1.5 border-b border-solid border-border shrink-0">
        <AsideItem icon="left" label="Projetos" onClick={onSairDoProjeto}/>
      </div>

      <div className="py-1.5 border-b border-solid border-border shrink-0">
        <AsideItem icon="dash" label="Dashboard"
          ativo={activePage === 'dashboard'} onClick={() => onNavigate('dashboard')}/>
        <AsideItem icon="settings" label="Configuração"
          ativo={activePage === 'config'} onClick={() => onNavigate('config')}/>
      </div>

      <div className="flex-1 overflow-y-auto py-1.5">
        {enabledSystems.length > 0 && (
          <>
            <AsideSection text="Medidas de segurança"/>
            {enabledSystems.map(s => (
              <AsideItem
                key={s.key}
                icon={s.icon}
                label={s.label}
                ativo={activePage === `medida-${s.key}`}
                onClick={() => onNavigate(`medida-${s.key}`)}
              />
            ))}
          </>
        )}

        <div className="border-t border-solid border-border mt-1.5"/>
        <AsideSection text="Documentos"/>
        <AsideItem icon="file" label="Documentos"
          ativo={activePage === 'documentos'} onClick={() => onNavigate('documentos')}/>
      </div>
    </Aside>
  )
}
