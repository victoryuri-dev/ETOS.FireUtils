// Observações complementares por estrutura e por medida de segurança —
// campo livre padrão no fim do bloco de cada estrutura nas páginas de medida
// (components/ui/ObservacoesComplementares.jsx). Vão para o memorial do MA
// dentro do contexto da própria estrutura e, no formulário da PB, todas
// listadas no campo de observações da seção da medida.
//
// Segurança estrutural e compartimentação já tinham o próprio campo na
// estrutura antes deste padrão (obsSegEstrutural, obsCompartimentacao) e
// continuam nele — projetos salvos não perdem nada. As demais medidas
// guardam em `estrutura.observacoes[medida]`.
const CAMPO_PROPRIO = {
  seg_estrutural: 'obsSegEstrutural',
  compart_horizontal: 'obsCompartimentacao',
  compart_vertical: 'obsCompartimentacao',
}

export const ROTULO_OBSERVACOES = 'Observações complementares'

/** Texto como digitado (para o campo de edição). */
export function observacaoBruta(est, medida) {
  const campo = CAMPO_PROPRIO[medida]
  return (campo ? est?.[campo] : est?.observacoes?.[medida]) || ''
}

/** Texto da observação de `medida` na estrutura ('' quando vazia). */
export function observacaoDaEstrutura(est, medida) {
  return observacaoBruta(est, medida).trim()
}

/** Action do reducer que grava a observação de `medida` na estrutura. */
export function acaoObservacao(est, medida, valor) {
  const campo = CAMPO_PROPRIO[medida]
  return campo
    ? { type: 'SET_ESTRUTURA_FIELD', id: est.id, field: campo, value: valor }
    : { type: 'SET_ESTRUTURA_FIELD', id: est.id, field: 'observacoes', value: { ...(est.observacoes || {}), [medida]: valor } }
}

/** Observações de `medida` de todas as estruturas, para um campo único (ex.:
 *  formulário da PB): só o texto com uma estrutura; "Nome: texto" por linha
 *  com mais de uma. */
export function observacoesDoProjeto(estruturas, medida) {
  const lista = (estruturas || []).map(est => ({ est, texto: observacaoDaEstrutura(est, medida) })).filter(o => o.texto)
  if ((estruturas || []).length <= 1) return lista.map(o => o.texto).join('\n')
  return lista.map(o => `${o.est.nome}: ${o.texto}`).join('\n')
}

/** Bloco do memorial (MA) com a observação de `medida` da estrutura — vai
 *  dentro do trecho da própria estrutura; [] quando não há texto. */
export function blocoObservacao(est, medida) {
  const valor = observacaoDaEstrutura(est, medida)
  return valor ? [{ tipo: 'campo', label: ROTULO_OBSERVACOES, valor }] : []
}
