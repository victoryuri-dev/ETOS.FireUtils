// memorial/registry.js — registro central de geradores de texto do memorial
// descritivo. Cada medida registra sua própria função `(state) => { titulo,
// paragrafos }`; o gerador do memorial nunca precisa de um `if` por medida —
// se não há builder para uma medida ativa, a seção é simplesmente omitida.

import { textoMemorialAcessoViatura } from './acesso_viatura'

export const MEMORIAL_BUILDERS = {
  acesso_viatura: textoMemorialAcessoViatura,
  // saida_emergencia, hidrantes, ... entram aqui conforme forem implementadas
}

/**
 * Monta as seções do memorial a partir das medidas ativas/obrigatórias do
 * projeto. `sistemas` é o resultado derivado de useMedidasObrigatorias() —
 * mesma fonte usada pelo Anexo B — não o `state.sistemas` bruto.
 */
export function buildMemorial(state, sistemas) {
  const src = sistemas || state.sistemas || {}
  return Object.entries(src)
    .filter(([, s]) => s.ativo || s.obrigatorio)
    .map(([key]) => MEMORIAL_BUILDERS[key]?.(state, src))
    .filter(Boolean)
}
