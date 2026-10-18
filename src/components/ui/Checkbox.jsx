import Icon from './Icon'

// Caixa de marcação (só o visual): vazia com borda neutra; marcada,
// preenchida de vermelho com o check branco — o estado se lê de relance
// numa lista longa. Usada dentro de linhas clicáveis (o clique e o foco
// ficam na linha inteira, ver Marcador em estados/PB/campos.jsx).
export function CaixaMarcacao({ checked }) {
  return (
    <span aria-hidden="true"
      className={`w-4 h-4 shrink-0 rounded-[4px] border-[1.5px] border-solid flex items-center justify-center transition-[background-color,border-color] duration-150 ${checked ? 'bg-red border-red' : 'bg-transparent border-ink-hint group-hover:border-ink-faint'}`}
    >
      {checked && <Icon name="check" size={11} strokeWidth={3.5} className="text-white"/>}
    </span>
  )
}

// Checkbox próprio (botão + ícone) em vez de <input type="checkbox"> nativo
// — o nativo herda a cor de fundo do tema do sistema operacional (fica
// branco em vez de escuro), sem jeito confiável de sobrescrever entre
// navegadores só com CSS.
export default function Checkbox({ checked, onChange, title }) {
  return (
    <button type="button" role="checkbox" aria-checked={!!checked} onClick={e => { e.stopPropagation(); onChange() }} title={title}
      className="group shrink-0 bg-transparent border-none p-0 cursor-pointer rounded-[4px] focus-visible:outline-2 focus-visible:outline-red focus-visible:outline-offset-2"
    >
      <CaixaMarcacao checked={checked}/>
    </button>
  )
}
