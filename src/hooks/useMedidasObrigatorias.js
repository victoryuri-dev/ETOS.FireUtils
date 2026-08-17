import { useMemo } from 'react'
import { useProjeto } from '../context/ProjetoContext'
import { getMedidasObrigatorias, getGruposSemDados } from '../data/normas/index'
import { classificarPavimentos, divisoesDaEstrutura } from '../utils/classificacao'

// Inverso do abaixo: mesmo que a tabela da norma marque como obrigatoria pra
// a ocupacao/altura, o usuario decide se instala (fica sempre habilitavel/
// desabilitavel manualmente em Configuracao, nunca travada como "Obrigatorio").
const SEMPRE_OPCIONAL = ['central_gas']

// Conjunto minimo de referencia aplicado quando a norma ainda nao tem dados
// cadastrados (Tabela 5 simplificada ou Tabela 6 normal) para algum grupo de
// ocupacao presente na estrutura — evita que o motor "esconda" exigencias por
// falta de dado. Deve ser confirmado manualmente com o CBMMA nesses casos.
// acesso_viatura/seg_estrutural entram aqui so como fallback: quando ha dado
// cadastrado (Tabela 5 ou 6), a propria tabela decide (ex: Tabela 5 nao exige
// nenhuma das duas; Tabela 6 do F-7 nao exige seg_estrutural).
const BASELINE_QUANDO_FALTA_DADO = [
  'acesso_viatura', 'seg_estrutural', 'saida_emergencia', 'brigada', 'iluminacao', 'sinalizacao', 'extintores',
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
      if (gruposFaltantes.length > 0) {
        BASELINE_QUANDO_FALTA_DADO.forEach(k => { medidas[k] = true })
      }
      // Vence por ultimo: nunca trava como obrigatoria, mesmo que a tabela
      // da norma ou o baseline de grupo-sem-dados tenham marcado true acima.
      SEMPRE_OPCIONAL.forEach(k => { medidas[k] = false })

      // Sistemas desta estrutura: obrigatorio vem da norma (medidas acima);
      // ativo soma o toggle manual (opcional habilitado) guardado por
      // estrutura em state.sistemasPorEstrutura — cada torre/bloco decide
      // seus proprios sistemas opcionais, independente das demais.
      const sistemas = {}
      Object.keys(state.sistemas || {}).forEach(k => {
        const obrigatorio = !!medidas[k]
        const ativoManual = !!state.sistemasPorEstrutura[est.id]?.[k]
        sistemas[k] = { obrigatorio, ativo: obrigatorio || ativoManual }
      })

      return {
        estrutura: est,
        areaEstrutura,
        alturaEstrutura,
        divisoes,
        classificacao,
        simplificado: resultado?.simplificado ?? null,
        gruposFaltantes,
        medidas,
        sistemas,
      }
    })

    // Agregado do projeto: uma medida e obrigatoria/ativa se for em QUALQUER
    // estrutura — usado por telas que ainda tratam o projeto como um todo
    // (nav lateral, paginas de dimensionamento, Anexo B).
    const sistemas = {}
    Object.keys(state.sistemas || {}).forEach(k => {
      const obrigatorio = porEstrutura.some(pe => pe.sistemas[k]?.obrigatorio)
      const ativo = obrigatorio || porEstrutura.some(pe => pe.sistemas[k]?.ativo)
      sistemas[k] = { obrigatorio, ativo }
    })

    return { porEstrutura, sistemas }
  }, [state.estruturas, state.pavimentos, state.uf, state.sistemas, state.sistemasPorEstrutura])
}
