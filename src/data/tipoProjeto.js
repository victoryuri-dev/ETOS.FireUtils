// tipoProjeto.js — enquadramento do projeto como TÉCNICO ou SIMPLIFICADO.
//
// Os dois tipos existem em todo estado, com nomes e siglas próprios (MA:
// Projeto Técnico / Projeto Técnico Simplificado — PTS; PB: Projeto de
// Segurança contra Incêndio — PCI / Projeto Técnico de Segurança Contra
// Incêndio Simplificado — PCIS). A ferramenta só gera esses dois; outras
// formas de apresentação (projetos de instalação/ocupação temporária etc.)
// ficam fora.
//
// O enquadramento é o mesmo critério que o motor de normas já usa para
// escolher entre a Tabela 5 (simplificada) e a Tabela 6 (getMedidasObrigatorias
// → ehSimplificado): área construída e altura de cada estrutura contra os
// limiares da tabela de medidas do estado. O projeto é simplificado só se
// TODAS as estruturas forem; uma estrutura acima do limite já o torna técnico.

import { getMedidas, ehSimplificado } from './normas/index'
import { alturaEdificacaoBase } from './trrf_calc'

const TIPOS_PROJETO = {
  MA: {
    tecnico:      { sigla: 'PT',   nome: 'Projeto Técnico' },
    simplificado: { sigla: 'PTS',  nome: 'Projeto Técnico Simplificado' },
  },
  PB: {
    tecnico:      { sigla: 'PCI',  nome: 'Projeto de Segurança contra Incêndio' },
    simplificado: { sigla: 'PCIS', nome: 'Projeto Técnico de Segurança Contra Incêndio Simplificado' },
  },
}

/** Nome e sigla de cada tipo no estado (cai no MA para estado sem cadastro). */
export function getTiposProjeto(uf) {
  return TIPOS_PROJETO[uf] ?? TIPOS_PROJETO.MA
}

/** "Projeto Técnico Simplificado (PTS)" */
export function rotuloTipoProjeto(uf, tipo) {
  const t = tipo && getTiposProjeto(uf)[tipo]
  return t ? `${t.nome} (${t.sigla})` : ''
}

// Altura usada no enquadramento: a mesma de useMedidasObrigatorias
// (alturaEdificacaoBase). Edificação de mais de um pavimento sem a altura
// informada fica pendente — alturaEdificacaoBase devolveria 0 e a
// enquadraria como simplificada sem base.
function alturaInformada(est) {
  const nPav = parseInt(est.nPavimentos) || 1
  if (nPav > 1 && (est.alturaEdificacao === '' || est.alturaEdificacao == null)) return null
  return alturaEdificacaoBase(est)
}

/**
 * @returns {{
 *   tipo: 'tecnico'|'simplificado'|null,   // null = falta área/altura de alguma estrutura, ou o estado não tem limiares
 *   limiares: { areaMin, alturaMin, inclusivo? } | null,
 *   porEstrutura: { estrutura, area, altura, tipo }[],
 * }}
 */
export function enquadrarTipoProjeto(uf, estruturas) {
  const limiares = getMedidas(uf)?.LIMIARES ?? null
  const porEstrutura = (estruturas || []).map(est => {
    const area = parseFloat(est.areaTotal)
    const altura = alturaInformada(est)
    const tipo = !limiares || !(area > 0) || altura == null ? null
      : ehSimplificado(limiares, area, altura) ? 'simplificado' : 'tecnico'
    return { estrutura: est, area: area > 0 ? area : null, altura, tipo }
  })
  const tipo = porEstrutura.some(e => e.tipo === 'tecnico') ? 'tecnico'
    : porEstrutura.length > 0 && porEstrutura.every(e => e.tipo === 'simplificado') ? 'simplificado'
    : null
  return { tipo, limiares, porEstrutura }
}
