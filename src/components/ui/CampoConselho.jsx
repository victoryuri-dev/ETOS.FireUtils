import { TIPOS_CONSELHO } from '../../utils/conselho'

// Conselho (CREA/CAU) + número do registro, lado a lado.
export default function CampoConselho({ tipo, numero, onTipo, onNumero, obrigatorio = null }) {
  return (
    <div className="fg">
      <label>Registro profissional {obrigatorio}</label>
      <div className="flex gap-2">
        <select value={tipo || ''} onChange={onTipo} aria-label="Conselho profissional" className="w-[104px] shrink-0">
          <option value="" disabled>Conselho</option>
          {TIPOS_CONSELHO.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input value={numero} onChange={onNumero} aria-label="Número do registro" className="flex-1 min-w-0"
          placeholder={tipo === 'CAU' ? 'A000000-0' : 'MA00000000/D'}/>
      </div>
    </div>
  )
}
