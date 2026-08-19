// Switch liga/desliga compacto — mesmo estilo usado em Iluminacao de
// Emergencia (equipamentos de aclaramento) e agora tambem na Etapa 2
// (soma automatica da area construida).
export default function SwitchToggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="shrink-0 cursor-pointer bg-transparent border-none p-0">
      <div className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${checked ? 'bg-red' : 'bg-border'}`}>
        <div className={`absolute top-0.5 ${checked ? 'left-[18px]' : 'left-0.5'} w-4 h-4 rounded-full bg-white transition-[left] duration-200`}/>
      </div>
    </button>
  )
}
