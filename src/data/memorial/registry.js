// memorial/registry.js — registro central de geradores de texto do memorial
// descritivo. Cada medida registra sua própria função `(state) => { titulo,
// paragrafos }`; o gerador do memorial nunca precisa de um `if` por medida —
// se não há builder para uma medida ativa, a seção é simplesmente omitida.

import { textoMemorialAcessoViatura } from './acesso_viatura'
import { textoMemorialSegEstrutural } from './seg_estrutural'
import { textoMemorialCompartHorizontal, textoMemorialCompartVertical } from './compartimentacao'
import { textoMemorialExtintores } from './extintores'
import { textoMemorialIluminacao } from './iluminacao'
import { textoMemorialSinalizacao } from './sinalizacao'

export const MEMORIAL_BUILDERS = {
  acesso_viatura:     textoMemorialAcessoViatura,
  seg_estrutural:     textoMemorialSegEstrutural,
  compart_horizontal: textoMemorialCompartHorizontal,
  compart_vertical:   textoMemorialCompartVertical,
  extintores:         textoMemorialExtintores,
  iluminacao:         textoMemorialIluminacao,
  sinalizacao:        textoMemorialSinalizacao,
  // saida_emergencia, hidrantes, ... entram aqui conforme forem implementadas
}

/**
 * Monta as seções do memorial a partir das medidas ativas/obrigatórias do
 * projeto. `sistemas` é o resultado derivado de useMedidasObrigatorias() —
 * mesma fonte usada pelo Anexo B — não o `state.sistemas` bruto. `porEstrutura`
 * (também de useMedidasObrigatorias()) é repassado a quem precisar da
 * obrigatoriedade por estrutura, não só a agregada do projeto (ex.:
 * compartimentação, quando a exigência varia entre estruturas do projeto).
 */
export function buildMemorial(state, sistemas, porEstrutura) {
  const src = sistemas || state.sistemas || {}
  return Object.entries(src)
    .filter(([, s]) => s.ativo || s.obrigatorio)
    .map(([key]) => MEMORIAL_BUILDERS[key]?.(state, src, porEstrutura))
    .filter(Boolean)
}
