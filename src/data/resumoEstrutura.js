const numero = v => Number(String(v ?? '').trim().replace(',', '.'))
const valido = v => v != null && String(v).trim() !== '' && Number.isFinite(numero(v)) && numero(v) >= 0

export function resumoEstrutura(est) {
  const acima = numero(est.nPavimentos)
  const subsolos = numero(est.nSubsolos || 0)
  const pavimentos = valido(est.nPavimentos) && acima >= 1 ? acima + subsolos : null
  const completo = (acima <= 1 || valido(est.alturaEdificacao)) && (subsolos === 0 || valido(est.profundidadeSubsolo))
  // alturaEdificacao é a distância do piso de descarga ao último piso;
  // alturaPisoPiso legado já contém a soma e não deve ser somado novamente.
  const altura = completo && pavimentos != null ? (acima > 1 ? numero(est.alturaEdificacao) : 0) + (subsolos > 0 ? numero(est.profundidadeSubsolo) : 0) : null
  const faixas = [
    [6, 'II', 'Edificação Baixa'],
    [12, 'III', 'Edificação de Baixa-Média Altura'],
    [23, 'IV', 'Edificação de Média Altura'],
    [30, 'V', 'Edificação Medianamente Alta'],
    [Infinity, 'VI', 'Edificação Alta'],
  ]
  const faixa = pavimentos === 1 ? [0, 'I', 'Edificação Térrea'] : altura == null ? null : faixas.find(([max]) => altura <= max)
  return { pavimentos, altura, classificacao: faixa ? `${faixa[1]} — ${faixa[2]}` : null }
}
