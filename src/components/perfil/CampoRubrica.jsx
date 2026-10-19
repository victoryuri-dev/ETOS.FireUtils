import { useRef, useState } from 'react'
import Icon from '../ui/Icon'
import { usePerfil } from '../../hooks/usePerfil'
import { lerRubrica } from '../../utils/rubricaImagem'

// Carregar / trocar / remover a rubrica do RT. Grava direto no perfil, então
// vale para todos os projetos (perfil e memorial da PB usam este mesmo campo).
// `compacto`: só os botões, para a barra do documento.
export default function CampoRubrica({ compacto = false }) {
  const { perfil, salvarRubrica } = usePerfil()
  const inputRef = useRef(null)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState(null)
  const rubrica = perfil?.rubrica || ''

  const aoEscolher = async e => {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    setErro(null)
    setOcupado(true)
    try {
      const r = await salvarRubrica(await lerRubrica(arquivo))
      if (!r.ok) setErro(r.erro)
    } catch (err) {
      setErro(err.message)
    }
    setOcupado(false)
  }
  const remover = async () => {
    setOcupado(true)
    const r = await salvarRubrica('')
    if (!r.ok) setErro(r.erro)
    setOcupado(false)
  }

  const botoes = (
    <div className="flex items-center gap-1.5">
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={aoEscolher}/>
      <button type="button" className="btn-ghost" onClick={() => inputRef.current?.click()} disabled={ocupado || !perfil}
        title="A rubrica fica no seu perfil e vale para todos os projetos">
        {ocupado ? <Icon name="spinner" size={13} className="animate-spin"/> : <Icon name="upload" size={13}/>}
        {rubrica ? 'Trocar rubrica' : 'Carregar rubrica'}
      </button>
      {rubrica && (
        <button type="button" className="btn-ghost px-2" onClick={remover} disabled={ocupado} aria-label="Remover rubrica" title="Remover rubrica">
          <Icon name="trash" size={13}/>
        </button>
      )}
    </div>
  )

  if (compacto) {
    return (
      <div className="flex items-center gap-2">
        {botoes}
        {erro && <span className="text-xs text-red" role="alert">{erro}</span>}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="h-[72px] w-[216px] rounded-md border border-solid border-border bg-white flex items-center justify-center overflow-hidden">
        {rubrica
          ? <img src={rubrica} alt="Rubrica carregada" className="max-h-full max-w-full object-contain"/>
          : <span className="text-xs text-[#85858f]">Sem rubrica</span>}
      </div>
      {botoes}
      <span className="text-[11px] text-ink-faint">PNG com fundo transparente fica melhor. Usada no quadro &quot;Rubrica&quot; das folhas do memorial — vale para todos os projetos.</span>
      {erro && <span className="text-xs text-red" role="alert">{erro}</span>}
    </div>
  )
}
