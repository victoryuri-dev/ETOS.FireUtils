import { Aside, AsideItem } from './Aside'

// Abas de nivel da conta — fora do contexto de um projeto. Adicionar uma
// pagina nova ao menu e acrescentar uma linha aqui e registrar a rota dentro
// do GlobalLayout (ver App.jsx).
export const NAV_GLOBAL = [
  { rota: '/projetos', icon: 'newbld', label: 'Projetos' },
  { rota: '/perfil',   icon: 'user',   label: 'Perfil' },
]

export default function AppAside({ rotaAtiva, onNavigate }) {
  return (
    <Aside>
      <div className="py-1.5">
        {NAV_GLOBAL.map(item => (
          <AsideItem
            key={item.rota}
            icon={item.icon}
            label={item.label}
            ativo={rotaAtiva === item.rota}
            onClick={() => onNavigate(item.rota)}
          />
        ))}
      </div>
    </Aside>
  )
}
