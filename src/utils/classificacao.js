// Classificacao derivada de um conjunto de pavimentos (uma estrutura) —
// ocupacao principal/mista e ocupacoes subsidiarias, conforme regra dos 10%
// da area construida da propria estrutura.
export function classificarPavimentos(pavimentos, areaEstrutura) {
  const threshold = areaEstrutura * 0.10

  const principaisDivs = [...new Set(pavimentos.map(p => p.divisao).filter(Boolean))]

  const subsidiariasRaw = []
  pavimentos.forEach(p => {
    p.acess.forEach(a => {
      if (!a.divisao) return
      const area    = parseFloat(a.area) || 0
      const isMista = areaEstrutura > 0 && area > threshold
      subsidiariasRaw.push({ divisao: a.divisao, isMista })
    })
  })

  const principaisSet = new Set(principaisDivs)
  const mistasExtra   = [...new Set(subsidiariasRaw.filter(s => s.isMista && !principaisSet.has(s.divisao)).map(s => s.divisao))]
  const subsidiarias  = [...new Set(subsidiariasRaw.filter(s => !s.isMista && !principaisSet.has(s.divisao)).map(s => s.divisao))]
  const edificacaoMista = principaisDivs.length > 1 || mistasExtra.length > 0
  const mistaDivs     = [...principaisSet, ...mistasExtra]
  const temOcupacoes  = principaisDivs.length > 0

  return { principaisDivs, subsidiarias, edificacaoMista, mistaDivs, temOcupacoes, subsidiariasRaw }
}

// Todas as divisoes presentes numa estrutura (principal + subsidiarias),
// sem distincao de mista/subsidiaria — usado para alimentar o motor de
// medidas de seguranca obrigatorias, que deve considerar toda ocupacao
// presente na estrutura.
export function divisoesDaEstrutura(pavimentos) {
  return [...new Set(
    pavimentos.flatMap(p => [p.divisao, ...p.acess.map(a => a.divisao)]).filter(Boolean)
  )]
}
