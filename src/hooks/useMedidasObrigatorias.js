import { useMemo } from 'react'
import { useProjeto } from '../context/ProjetoContext'
import { getMedidasObrigatorias, getGruposSemDados } from '../data/normas/index'
import { classificarPavimentos, divisoesDaEstrutura } from '../utils/classificacao'

// Exigidas por regra geral da norma (nao condicionadas a ocupacao) — nao
// aparecem nas tabelas de medidas por divisao/grupo (nem na simplificada
// nem na normal), entao o motor nunca as encontraria. Sempre obrigatorias,
// independente do resultado do motor.
const SEMPRE_OBRIGATORIO = ['acesso_viatura', 'seg_estrutural']

// Conjunto minimo de referencia aplicado quando a norma ainda nao tem dados
// cadastrados (Tabela 6 / processo normal) para algum grupo de ocupacao
// presente na estrutura — evita que o motor "esconda" exigencias por falta
// de dado. Deve ser confirmado manualmente com o CBMMA nesses casos.
const BASELINE_QUANDO_FALTA_DADO = [
  'saida_emergencia', 'brigada', 'iluminacao', 'sinalizacao', 'extintores',
]

/**
 * Deriva, a partir das estruturas/pavimentos do projeto, quais medidas de
 * seguranca sao obrigatorias (por estrutura e agregado no projeto), com
 * base na area construida, altura (piso a piso) e ocupacoes de cada
 * estrutura — conforme NT 42/2019 CBMMA.
 */
export function useMedidasObrigatorias() {
  const { state } = useProjeto()

  return useMemo(() => {
    const porEstrutura = state.estruturas.map(est => {
      const pavsEst = state.pavimentos.filter(p => p.estruturaId === est.id)
      const areaEstrutura   = parseFloat(est.areaTotal)      || 0
      const alturaEstrutura = parseFloat(est.alturaPisoPiso) || 0
      const divisoes = divisoesDaEstrutura(pavsEst)
      const classificacao = classificarPavimentos(pavsEst, areaEstrutura)

      let resultado = null
      let gruposFaltantes = []
      if (divisoes.length > 0) {
        resultado = getMedidasObrigatorias(state.uf, divisoes, alturaEstrutura, areaEstrutura)
        gruposFaltantes = getGruposSemDados(state.uf, divisoes, alturaEstrutura, areaEstrutura)
      }

      const medidas = {}
      Object.entries(resultado?.medidas || {}).forEach(([k, v]) => { medidas[k] = !!v.obrigatorio })
      if (divisoes.length > 0) {
        SEMPRE_OBRIGATORIO.forEach(k => { medidas[k] = true })
      }
      if (gruposFaltantes.length > 0) {
        BASELINE_QUANDO_FALTA_DADO.forEach(k => { medidas[k] = true })
      }

      return {
        estrutura: est,
        areaEstrutura,
        alturaEstrutura,
        divisoes,
        classificacao,
        simplificado: resultado?.simplificado ?? null,
        gruposFaltantes,
        medidas,
      }
    })

    // Agregado do projeto: uma medida e obrigatoria se for obrigatoria em
    // QUALQUER estrutura.
    const agregado = {}
    porEstrutura.forEach(pe => {
      Object.entries(pe.medidas).forEach(([k, v]) => { if (v) agregado[k] = true })
    })

    const sistemas = {}
    Object.keys(state.sistemas || {}).forEach(k => {
      const obrigatorio = !!agregado[k]
      sistemas[k] = { obrigatorio, ativo: obrigatorio || !!state.sistemas[k]?.ativo }
    })

    return { porEstrutura, sistemas }
  }, [state.estruturas, state.pavimentos, state.uf, state.sistemas])
}
