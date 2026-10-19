// Conselho profissional do RT (CREA ou CAU): escolhido no perfil / Etapa 3
// para os documentos não ficarem com o ambíguo "CREA/CAU".
export const TIPOS_CONSELHO = ['CREA', 'CAU']

/** "CREA", "CAU" ou, sem escolha, "CREA/CAU". */
export const siglaConselho = state => (TIPOS_CONSELHO.includes(state?.rtConselhoTipo) ? state.rtConselhoTipo : 'CREA/CAU')

/** "CREA 42624-PB" (número com a sigla quando escolhida). */
export function registroComConselho(state) {
  const numero = (state?.rtConselho || '').trim()
  if (!numero) return ''
  const tipo = TIPOS_CONSELHO.includes(state?.rtConselhoTipo) ? state.rtConselhoTipo : ''
  return tipo && !numero.toUpperCase().startsWith(tipo) ? `${tipo} ${numero}` : numero
}
