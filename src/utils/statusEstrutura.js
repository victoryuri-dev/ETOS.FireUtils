// Estado de preenchimento de um card de estrutura nas telas de medidas de
// segurança — exibido pelo EstruturaSection (pílula + linha de destaque).
//   pendente  → nada feito / dados ainda não carregados
//   andamento → parcialmente resolvido
//   concluido → tudo resolvido
//   atencao   → resolvido, porém com resultado que exige revisão
export function statusEstrutura(tone, label) {
  return { tone, label }
}

// done/total → pendente (0), andamento (parcial) ou concluído (todos). Com
// total 0 não há o que resolver, então conta como concluído.
export function statusPorProgresso(done, total, { pendente, andamento, concluido }) {
  if (total === 0 || done >= total) return statusEstrutura('concluido', concluido)
  if (done === 0) return statusEstrutura('pendente', pendente)
  return statusEstrutura('andamento', andamento ?? `${done} de ${total}`)
}
