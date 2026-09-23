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
import { textoMemorialCalculoHidrantes } from './hidrantesCalculo'

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

// Ordem das secoes de medidas no documento — a mesma da tabela de medidas de
// seguranca da NT 01 (ver normas/MA/medidas.js), que e a ordem em que o Corpo
// de Bombeiros le o projeto. E deliberada e fica aqui porque e uma decisao do
// documento: antes as secoes saiam na ordem de iteracao do objeto `sistemas`,
// ou seja, na ordem em que as chaves foram inseridas — o que calhasse.
const ORDEM_SECOES = [
  'acesso_viatura',
  'seg_estrutural',
  'compart_horizontal',
  'compart_vertical',
  'controle_acabamento',
  'saida_emergencia',
  'gerenciamento_risco',
  'brigada',
  'iluminacao',
  'sinalizacao',
  'extintores',
  'hidrantes',
  'alarme',
  'deteccao',
  'sprinklers',
  'controle_fumaca',
  'central_gas',
]

/**
 * Monta as seções do memorial a partir das medidas ativas/obrigatórias do
 * projeto. `sistemas` é o resultado derivado de useMedidasObrigatorias() —
 * mesma fonte usada pelo Anexo B — não o `state.sistemas` bruto. `porEstrutura`
 * (mesmo hook) só é repassado pra frente — necessário pros builders que
 * precisam de dado por-estrutura (ex.: saida_emergencia.js, pra chuveiros/
 * detecção na distância máxima a percorrer), não pelo agregado do projeto.
 *
 * As seções saem na ordem de ORDEM_SECOES, não na ordem em que as medidas
 * aparecem em `sistemas`.
 *
 * O memorial de cálculo (marcha hidráulica) de Hidrantes é sempre a
 * ÚLTIMA folha do documento — narra o dimensionamento feito pelo plugin
 * Revit (ver memorial/hidrantesCalculo.js), então só faz sentido depois de
 * toda a parte descritiva, fora da ordem acima.
 */
export function buildMemorial(state, sistemas, porEstrutura) {
  const src = sistemas || state.sistemas || {}
  const ativa = key => !!(src[key]?.ativo || src[key]?.obrigatorio)

  // Uma medida com builder que ninguem lembrou de colocar em ORDEM_SECOES
  // entra no fim, em vez de sumir do documento sem aviso — omitir uma secao
  // inteira de um documento legal e caro demais pra depender de memoria.
  const restantes = Object.keys(MEMORIAL_BUILDERS).filter(k => !ORDEM_SECOES.includes(k))

  const secoes = [...ORDEM_SECOES, ...restantes]
    .filter(ativa)
    .map(key => MEMORIAL_BUILDERS[key]?.(state, src, porEstrutura))
    .filter(Boolean)

  if (src.hidrantes?.ativo || src.hidrantes?.obrigatorio) {
    secoes.push(textoMemorialCalculoHidrantes(state))
  }

  return secoes
}
