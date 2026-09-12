// memorial/registry.js — registro central de geradores de texto do memorial
// descritivo. Cada medida registra sua própria função `(state) => { titulo,
// paragrafos }`; o gerador do memorial nunca precisa de um `if` por medida —
// se não há builder para uma medida ativa, a seção é simplesmente omitida.

import { textoMemorialAcessoViatura } from './acesso_viatura'
import { textoMemorialSegEstrutural } from './seg_estrutural'
import { textoMemorialExtintores } from './extintores'
import { textoMemorialIluminacao } from './iluminacao'
import { textoMemorialSinalizacao } from './sinalizacao'
import { textoMemorialGerenciamentoRisco } from './gerenciamento_risco'
import { textoMemorialSaidaEmergencia } from './saida_emergencia'
import { textoMemorialHidrantes } from './hidrantes'

export const MEMORIAL_BUILDERS = {
  acesso_viatura:      textoMemorialAcessoViatura,
  seg_estrutural:      textoMemorialSegEstrutural,
  extintores:          textoMemorialExtintores,
  iluminacao:          textoMemorialIluminacao,
  sinalizacao:         textoMemorialSinalizacao,
  gerenciamento_risco: textoMemorialGerenciamentoRisco,
  saida_emergencia:    textoMemorialSaidaEmergencia,
  hidrantes:           textoMemorialHidrantes,
  // ... entram aqui conforme forem implementadas
}

/**
 * Monta as seções do memorial a partir das medidas ativas/obrigatórias do
 * projeto. `sistemas` é o resultado derivado de useMedidasObrigatorias() —
 * mesma fonte usada pelo Anexo B — não o `state.sistemas` bruto. `porEstrutura`
 * (mesmo hook) só é repassado pra frente — necessário pros builders que
 * precisam de dado por-estrutura (ex.: saida_emergencia.js, pra chuveiros/
 * detecção na distância máxima a percorrer), não pelo agregado do projeto.
 */
export function buildMemorial(state, sistemas, porEstrutura) {
  const src = sistemas || state.sistemas || {}
  return Object.entries(src)
    .filter(([, s]) => s.ativo || s.obrigatorio)
    .map(([key]) => MEMORIAL_BUILDERS[key]?.(state, src, porEstrutura))
    .filter(Boolean)
}
