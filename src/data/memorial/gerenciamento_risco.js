// memorial/gerenciamento_risco.js — texto do memorial descritivo para
// Gerenciamento de Risco de Incêndio (Plano de Emergência, Anexo B da NT
// 16/2021 CBMMA). Reaproveita buildPlanoEmergenciaData — a MESMA função que
// alimentaria um documento avulso — só que aqui o resultado vira um capítulo
// do Memorial Descritivo em vez de um documento separado.
//
// A seção "Descrição da edificação ou área de risco" (item B.1) é uma única
// lista com marcadores — cada campo é um item, e os compostos (Localização,
// Estrutura e Dimensões, População, Riscos, Recursos humanos/materiais) viram
// um item com sub-lista aninhada (ver suporte a `{ texto, sub }` no bloco
// 'lista' de MemorialDescritivoPage.jsx). A tabela de dimensões por estrutura
// é o único conteúdo que não cabe numa sub-lista, por isso entra como bloco
// próprio logo depois do item "Estrutura e Dimensões", partindo a seção B.1
// em duas listas.
import { buildPlanoEmergenciaData } from '../../utils/planoEmergencia'

export function textoMemorialGerenciamentoRisco(state, sistemas) {
  const d = buildPlanoEmergenciaData(state, sistemas)

  const multiplasEstruturas = d.riscosPorEstrutura.length > 1
  const itensRiscos = d.riscosPorEstrutura.map(r => ({
    texto: multiplasEstruturas ? `Riscos específicos — ${r.estrutura}` : 'Riscos específicos inerentes à atividade',
    sub: r.riscos.map(x => x.localizacao ? `${x.label}: ${x.localizacao}` : x.label),
  }))

  const itensDescricaoParte1 = [
    `Identificação da edificação: ${d.edificacao}`,
    {
      texto: `Localização: ${d.localizacaoTipo}`,
      sub: [
        `Endereço: ${d.endereco}`,
        `Característica da vizinhança: ${d.caracteristicaVizinhanca}`,
        `Distância do Corpo de Bombeiros Militar: ${d.distanciaCBM}`,
        `Meios de ajuda externa: ${d.meiosAjudaExterna}`,
      ],
    },
    { texto: 'Estrutura e Dimensões', sub: [`Área do terreno: ${d.areaTerreno}`] },
  ]

  const itensDescricaoParte2 = [
    `Ocupação: ${d.ocupacao}`,
    { texto: 'População', sub: [`Fixa: ${d.populacaoFixa}`, `Flutuante: ${d.populacaoFlutuante}`] },
    `Características de funcionamento: ${d.horarioFuncionamento}`,
    ...(d.pneTemPessoas ? [d.pneDescricao ? `Existem pessoas portadoras de necessidades especiais: ${d.pneDescricao}` : 'Existem pessoas portadoras de necessidades especiais'] : []),
    ...itensRiscos,
    {
      texto: 'Recursos humanos',
      sub: [
        `Brigada de Incêndio: ${d.brigadistasQtd ? `${d.brigadistasQtd} membros` : ''}`,
        `Brigadistas Profissionais: ${d.brigadistasProfissionaisQtd}`,
      ],
    },
    { texto: 'Recursos materiais', sub: d.sistemasAtivos },
  ]

  const blocos = [
    {
      tipo: 'paragrafo',
      texto: 'Este capítulo apresenta o Plano de Emergência Contra Incêndio da edificação, conforme o Anexo B da NT 16/2021 CBMMA — Gerenciamento de Risco.',
    },

    { tipo: 'titulo2', texto: 'Descrição da edificação ou área de risco' },
    { tipo: 'lista', itens: itensDescricaoParte1 },
    {
      tipo: 'tabela',
      colunas: ['Estrutura', 'Tipo', 'Área construída', 'Altura', 'Pavimentos', 'Subsolos'],
      linhas: d.estruturas.map(e => [e.nome, e.tipo, e.areaConstruida, e.altura, e.nPavimentos, e.nSubsolos]),
    },
    { tipo: 'lista', itens: itensDescricaoParte2 },

    { tipo: 'titulo2', texto: 'Procedimentos básicos de emergência contra incêndio' },
    { tipo: 'campo', label: 'Alerta', valor: d.meioAlerta },
    { tipo: 'campo', label: 'Análise da situação', valor: d.respAnaliseSituacao },
    { tipo: 'campo', label: 'Apoio externo', valor: d.respApoioExterno },
    { tipo: 'campo', label: 'Telefone do Corpo de Bombeiros', valor: d.telefoneCBM },
    { tipo: 'campo', label: 'Primeiros socorros e hospitais próximos', valor: d.respPrimeirosSocorros },
    { tipo: 'campo', label: 'Hospital de referência', valor: d.hospitalReferencia },
    { tipo: 'campo', label: 'Eliminar riscos', valor: d.respEliminarRiscos },
    { tipo: 'campo', label: 'Abandono de área', valor: d.respAbandono },
    { tipo: 'campo', label: 'Isolamento de área', valor: d.respIsolamento },
    { tipo: 'campo', label: 'Confinamento do incêndio', valor: d.respConfinamento },
    { tipo: 'campo', label: 'Combate ao incêndio', valor: d.respCombate },
    { tipo: 'campo', label: 'Investigação', valor: d.respInvestigacao },

    { tipo: 'titulo2', texto: 'Responsabilidade pelo plano' },
    { tipo: 'campo', label: 'Responsável pela empresa (preposto)', valor: d.proprietario },
    { tipo: 'campo', label: 'Responsável pela elaboração do Plano de Emergência', valor: d.responsavelTecnico },
  ]

  return { titulo: 'Gerenciamento de Risco — Plano de Emergência', blocos }
}
