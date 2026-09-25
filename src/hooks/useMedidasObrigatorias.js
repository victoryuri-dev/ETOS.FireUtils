import { useMemo } from 'react'
import { useProjeto } from '../context/ProjetoContext'
import { getMedidasObrigatorias, getGruposSemDados } from '../data/normas/index'
import { classificarPavimentos, divisoesDaEstrutura } from '../utils/classificacao'
import { alturaEdificacaoBase } from '../data/trrf_calc'

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

// Projeto "apenas dimensionamento" (state.tipoProjeto — ver ProjetoContext.jsx/
// Step6.jsx) só dimensiona esses sistemas — os demais nunca aparecem como
// obrigatórios/ativos aqui, mesmo que a NT 42/2019 os exigiria pra essa
// ocupação/altura/área. Esse é o ÚNICO lugar que decide isso: ProjectAside.jsx
// (menu lateral), memorial/registry.js (buildMemorial) e Step6.jsx (grid de
// medidas) todos leem `sistemas`/`porEstrutura` daqui — sem esse filtro
// central, um sistema sem builder de memorial nem página própria (ex.:
// SPDA) ainda apareceria "obrigatório" no menu e geraria pendência sem
// nenhuma tela pra resolver, num modo pensado pra não pedir esse dado.
const SISTEMAS_DIMENSIONAMENTO = new Set(['saida_emergencia', 'hidrantes', 'sprinklers'])

/**
 * Deriva, a partir das estruturas/pavimentos do projeto, quais medidas de
 * seguranca sao obrigatorias (por estrutura e agregado no projeto), com
 * base na area construida, altura (piso a piso) e ocupacoes de cada
 * estrutura — conforme NT 42/2019 CBMMA.
 */
export function useMedidasObrigatorias() {
  const { state } = useProjeto()
  const dimensionamento = state.tipoProjeto === 'dimensionamento'

  return useMemo(() => {
    const porEstrutura = state.estruturas.map(est => {
      const pavsEst = state.pavimentos.filter(p => p.estruturaId === est.id)
      const areaEstrutura   = parseFloat(est.areaTotal)      || 0
      const alturaEstrutura = alturaEdificacaoBase(est)
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

      // Sistemas desta estrutura: obrigatorio vem da norma (medidas acima).
      // ativo segue o toggle manual quando ele existe (guardado por estrutura
      // em state.sistemasPorEstrutura — cada torre/bloco decide os proprios
      // sistemas, independente das demais); sem toggle manual, segue a norma.
      // Isso permite desativar manualmente um sistema obrigatorio (o
      // usuario decide não instalar, por conta e risco próprios) sem perder
      // o proprio `obrigatorio` — quem le os dois campos pode continuar
      // sinalizando (borda vermelha) que a norma exige mesmo estando
      // desativado.
      const sistemas = {}
      Object.keys(state.sistemas || {}).forEach(k => {
        if (dimensionamento && !SISTEMAS_DIMENSIONAMENTO.has(k)) {
          sistemas[k] = { obrigatorio: false, ativo: false }
          return
        }
        const obrigatorio = !!medidas[k]
        const manual = state.sistemasPorEstrutura[est.id]?.[k]
        const ativo = manual !== undefined ? manual : obrigatorio
        sistemas[k] = { obrigatorio, ativo }
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

    // Agregado do projeto: `obrigatorio` e verdadeiro se a norma exigir em
    // QUALQUER estrutura; `ativo` respeita o toggle manual de cada uma (nao
    // forca mais true so por obrigatorio — uma estrutura pode ter desativado
    // manualmente) — usado por telas que ainda tratam o projeto como um todo
    // (nav lateral, paginas de dimensionamento, Anexo B).
    const sistemas = {}
    Object.keys(state.sistemas || {}).forEach(k => {
      if (dimensionamento && !SISTEMAS_DIMENSIONAMENTO.has(k)) {
        sistemas[k] = { obrigatorio: false, ativo: false }
        return
      }
      const obrigatorio = porEstrutura.some(pe => pe.sistemas[k]?.obrigatorio)
      const ativo = porEstrutura.some(pe => pe.sistemas[k]?.ativo)
      sistemas[k] = { obrigatorio, ativo }
    })

    return { porEstrutura, sistemas }
  }, [state.estruturas, state.pavimentos, state.uf, state.sistemas, state.sistemasPorEstrutura, dimensionamento])
}
