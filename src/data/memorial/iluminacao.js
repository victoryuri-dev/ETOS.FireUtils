// memorial/iluminacao.js — texto do memorial descritivo para o Sistema de
// Iluminação de Emergência (NT 18 CBMMA / NBR 10898). Usa o MESMO calc puro
// (iluminacao_calc.js) que alimenta a tela de dimensionamento — o texto
// nunca duplica a lógica de conformidade, só narra o resultado.
//
// Retorna `blocos` (tabelas/listas/campos) em vez de parágrafos corridos —
// mesmo padrão do memorial de Extintores.

import { getIluminacao } from '../normas/index'
import { nomeEspecificacao } from '../iluminacao_calc'

// Assinatura técnica de um item de aclaramento — mesmo tipoBase + mesmos
// valores nos campos técnicos (CAMPOS_EQUIPAMENTO) conta como "o mesmo
// equipamento", mesmo cadastrado em pavimentos/estruturas diferentes (cada
// um com sua cópia independente, ver IluminacaoPage.jsx). `identificacao`
// (texto livre) fica de fora de propósito — não é característica técnica,
// só um apelido.
function assinaturaEquipamento(item, CAMPOS_EQUIPAMENTO) {
  return [item.tipoBase, ...CAMPOS_EQUIPAMENTO.map(c => item[c.key] || '')].join('|')
}

// Rótulo de um grupo de itens tecnicamente equivalentes — usa a
// identificação de algum deles, se houver, senão o nome padrão calculado
// (ver nomeEspecificacao).
function rotuloGrupo(itensDoGrupo, norma) {
  const base = norma.EQUIPAMENTOS_ACLARAMENTO.find(eq => eq.key === itensDoGrupo[0].tipoBase)
  const comIdentificacao = itensDoGrupo.find(i => i.identificacao)
  return nomeEspecificacao(comIdentificacao || itensDoGrupo[0], base?.label || itensDoGrupo[0].tipoBase)
}

// Matriz pavimento x equipamento (em vez de uma tabela por pavimento) —
// só entram como coluna os equipamentos com ao menos 1 unidade cadastrada
// em algum pavimento desta estrutura, pra não poluir com colunas zeradas
// quando pavimentos diferentes usam especificações diferentes. Agrupa por
// assinatura técnica — dois pavimentos usando "o mesmo modelo" (cadastrado
// cada um na sua cópia independente) viram uma coluna só.
function tabelaAclaramento(pavs, itensPorPav, CAMPOS_EQUIPAMENTO, norma) {
  const todosOsItens = pavs.flatMap(p => itensPorPav.get(p.id))
  const porAssinatura = new Map()
  todosOsItens.forEach(item => {
    const assinatura = assinaturaEquipamento(item, CAMPOS_EQUIPAMENTO)
    if (!porAssinatura.has(assinatura)) porAssinatura.set(assinatura, [])
    porAssinatura.get(assinatura).push(item)
  })

  const colunas = [...porAssinatura.entries()]
    .filter(([, itens]) => itens.some(i => (i.quantidade || 0) > 0))
    .map(([assinatura, itens]) => ({ assinatura, label: rotuloGrupo(itens, norma) }))
  if (colunas.length === 0) return null

  return {
    tipo: 'tabela',
    colunas: ['Pavimento', ...colunas.map(c => c.label)],
    linhas: pavs.map(p => {
      const itens = itensPorPav.get(p.id)
      return [p.label, ...colunas.map(c => {
        const item = itens.find(i => assinaturaEquipamento(i, CAMPOS_EQUIPAMENTO) === c.assinatura)
        return String(item?.quantidade || 0)
      })]
    }),
  }
}

// Parágrafo narrando o sistema adotado — mesmo texto usado tanto no bloco
// global (projeto todo, quando `mesmoSistema`) quanto por estrutura (quando
// cada edificação escolhe o seu). `sujeito` troca só a abertura da frase.
function paragrafoSistema(sistema, TIPOS_SISTEMA, sujeito) {
  const tipoSistemaInfo = TIPOS_SISTEMA.find(t => t.key === sistema.tipo)
  if (!tipoSistemaInfo) {
    return { tipo: 'paragrafo', texto: `O sistema de iluminação de emergência utilizado ${sujeito} ainda não foi definido pelo responsável técnico.` }
  }
  const precisaLocalizacao = sistema.tipo === 'central' || sistema.tipo === 'motogerador'
  return {
    tipo: 'paragrafo',
    texto: `O sistema adotado ${sujeito} é do tipo ${tipoSistemaInfo.label.toLowerCase()}.` +
      (precisaLocalizacao
        ? ` A fonte do sistema (${sistema.tipo === 'motogerador' ? 'grupo motogerador' : 'central de baterias'}) está localizada em ${sistema.localizacaoFonte || 'local a definir pelo responsável técnico'}.`
        : ''),
  }
}

// Tabela global de características dos equipamentos de aclaramento — uma
// seção só, antes de todas as edificações, com uma linha por equipamento
// tecnicamente distinto (ver assinaturaEquipamento) entre TODOS os itens do
// projeto (qualquer pavimento, de qualquer estrutura), agregando a
// quantidade total instalada. Qtd vem sempre na primeira coluna.
function tabelaCaracteristicasGlobal(state, norma, CAMPOS_EQUIPAMENTO) {
  const itens = (state.iluminacao || []).filter(i => i.categoria === 'aclaramento')
  if (itens.length === 0) return null

  const porAssinatura = new Map()
  itens.forEach(item => {
    const assinatura = assinaturaEquipamento(item, CAMPOS_EQUIPAMENTO)
    if (!porAssinatura.has(assinatura)) porAssinatura.set(assinatura, [])
    porAssinatura.get(assinatura).push(item)
  })

  if (porAssinatura.size === 0) return null

  return {
    tipo: 'tabela',
    colunas: ['Qtd', 'Equipamento', ...CAMPOS_EQUIPAMENTO.map(c => c.unidade ? `${c.label} (${c.unidade})` : c.label)],
    linhas: [...porAssinatura.values()].map(itensDoGrupo => [
      String(itensDoGrupo.reduce((soma, i) => soma + (parseInt(i.quantidade) || 0), 0)),
      rotuloGrupo(itensDoGrupo, norma),
      ...CAMPOS_EQUIPAMENTO.map(c => itensDoGrupo[0][c.key] || '—'),
    ]),
  }
}

function blocosDaEstrutura(est, pavs, itensDaEstrutura, sistemaDaEstrutura, norma, CAMPOS_EQUIPAMENTO, TIPOS_SISTEMA, mesmoSistema) {
  const itensPorPav = new Map(pavs.map(p => [p.id, itensDaEstrutura.filter(i => i.pavimentoId === p.id && i.categoria === 'aclaramento')]))

  const blocos = [{ tipo: 'titulo2', texto: est.nome }]

  if (!mesmoSistema) blocos.push(paragrafoSistema(sistemaDaEstrutura, TIPOS_SISTEMA, 'nesta edificação'))

  const tabAclar = tabelaAclaramento(pavs, itensPorPav, CAMPOS_EQUIPAMENTO, norma)
  blocos.push(tabAclar || { tipo: 'paragrafo', texto: `Nenhuma luminária de aclaramento cadastrada em ${est.nome}.` })

  return blocos
}

export function textoMemorialIluminacao(state) {
  const norma = getIluminacao(state.uf)
  const { ILUMINANCIA_MINIMA, RAZAO_UNIFORMIDADE_MAX, AUTONOMIA_MINIMA_HORAS, TEMPO_RESPOSTA_MAX_S, TIPOS_SISTEMA, CAMPOS_EQUIPAMENTO } = norma
  const mesmoSistema = state.iluminacaoMesmoSistema !== false

  const blocos = [{
    tipo: 'paragrafo',
    texto: `A iluminação de emergência deve garantir iluminância mínima de ${ILUMINANCIA_MINIMA.aclaramento_normal} lux nos ambientes em geral (${ILUMINANCIA_MINIMA.aclaramento_risco} lux em áreas de risco elevado ou grande concentração de público), com uniformidade máxima de ${RAZAO_UNIFORMIDADE_MAX}:1, autonomia mínima de bateria de ${AUTONOMIA_MINIMA_HORAS} hora e tempo de resposta de no máximo ${TEMPO_RESPOSTA_MAX_S} segundos após a falta de energia da rede normal (NBR 10898 / NT 18 CBMMA).`,
  }]

  // Só entra um parágrafo global sobre o sistema quando o projeto usa um
  // único sistema pra todas as edificações — caso contrário, cada estrutura
  // narra o seu próprio sistema (ver blocosDaEstrutura).
  if (mesmoSistema) blocos.push(paragrafoSistema(state.iluminacaoSistema || {}, TIPOS_SISTEMA, 'no projeto'))

  // Seção única com as características de todos os equipamentos de
  // aclaramento do projeto, antes de entrar nas edificações — cada pavimento
  // cadastra sua própria cópia da especificação (ver IluminacaoPage.jsx),
  // mas o memorial não repete a mesma luminária em várias tabelas: agrupa
  // pela assinatura técnica e soma a quantidade total instalada.
  const tabCaractGlobal = tabelaCaracteristicasGlobal(state, norma, CAMPOS_EQUIPAMENTO)
  if (tabCaractGlobal) {
    blocos.push({ tipo: 'titulo2', texto: 'Características dos Equipamentos de Aclaramento' })
    blocos.push(tabCaractGlobal)
  }

  const blocosPavimentos = (state.estruturas || []).flatMap(est => {
    const pavs = (state.pavimentos || []).filter(p => p.estruturaId === est.id)
    if (pavs.length === 0) return []
    const itensDaEstrutura = (state.iluminacao || []).filter(i => pavs.some(p => p.id === i.pavimentoId))
    const sistemaDaEstrutura = mesmoSistema ? (state.iluminacaoSistema || {}) : (state.iluminacaoSistemaPorEstrutura?.[est.id] || {})
    return blocosDaEstrutura(est, pavs, itensDaEstrutura, sistemaDaEstrutura, norma, CAMPOS_EQUIPAMENTO, TIPOS_SISTEMA, mesmoSistema)
  })

  if (blocosPavimentos.length === 0) {
    blocosPavimentos.push({ tipo: 'paragrafo', texto: 'Não há itens de iluminação de emergência cadastrados ainda — pendente de definição pelo responsável técnico.' })
  }

  return { titulo: 'Sistema de Iluminação de Emergência', blocos: [...blocos, ...blocosPavimentos] }
}
