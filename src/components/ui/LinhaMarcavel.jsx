import { CaixaMarcacao } from './Checkbox'
import InfoTip from './InfoTip'

// Linha marcável: a linha inteira é o controle (clique, teclado e foco),
// com respiro próprio e hover; marcada, o texto fica em destaque e a caixa
// vermelha — dá para ver o que está marcado sem ler item por item. `tip`
// (opcional) mostra o texto completo da norma; `children` aparece logo
// abaixo quando a linha está marcada (ex.: a característica do elemento).
// Em lista, envolva as linhas num contêiner com `-mx-2.5` para a caixa
// alinhar com o título do grupo.
export default function LinhaMarcavel({ label, checked, onChange, tip, children }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-start">
        <button type="button" role="checkbox" aria-checked={!!checked} onClick={onChange}
          className={`group flex-1 flex items-start gap-3 text-left bg-transparent border-none rounded-md py-2 px-2.5 cursor-pointer transition-colors duration-150 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-red focus-visible:outline-offset-[-2px] ${checked ? 'text-ink' : 'text-ink-muted'}`}>
          <span className="pt-[3px]"><CaixaMarcacao checked={checked}/></span>
          <span className="text-[13px] leading-[1.5]">{label}</span>
        </button>
        {tip && <span className="pt-2 pr-2.5"><InfoTip text={tip}/></span>}
      </div>
      {checked && children && <div className="pl-[38px] pr-2.5 pb-2">{children}</div>}
    </div>
  )
}
