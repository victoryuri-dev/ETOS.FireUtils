import Icon from './Icon'

// Checkbox próprio (botão + ícone) em vez de <input type="checkbox"> nativo
// — o nativo herda a cor de fundo do tema do sistema operacional (fica
// branco em vez de escuro), sem jeito confiável de sobrescrever entre
// navegadores só com CSS.
export default function Checkbox({ checked, onChange, title }) {
  return (
    <button type="button" onClick={e => { e.stopPropagation(); onChange() }} title={title}
      className={`w-[15px] h-[15px] shrink-0 rounded-[3px] border-[1.5px] border-solid bg-transparent flex items-center justify-center transition-colors ${checked ? 'border-ink' : 'border-ink hover:border-red'}`}
    >
      {checked && <Icon name="check" size={10} className="text-ink"/>}
    </button>
  )
}
