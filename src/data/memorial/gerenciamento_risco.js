// memorial/gerenciamento_risco.js — texto do memorial descritivo para
// Gerenciamento de Risco de Incêndio (Plano de Emergência, Anexo B da NT
// 16/2021 CBMMA). Reaproveita buildPlanoEmergenciaData — a MESMA função que
// alimentaria um documento avulso — só que aqui o resultado vira um capítulo
// do Memorial Descritivo em vez de um documento separado: os dados gerais da
// edificação (endereço, estrutura, sistemas, riscos especiais) já aparecem
// nas páginas fixas do memorial (Sobre a Edificação, Caracterização, Medidas
// Aplicadas), então este capítulo só narra o que é específico do Plano de
// Emergência — população/funcionamento, recursos humanos e os responsáveis
// pelos 10 procedimentos básicos do item B.2.
import { buildPlanoEmergenciaData } from '../../utils/planoEmergencia'

export function textoMemorialGerenciamentoRisco(state, sistemas) {
  const d = buildPlanoEmergenciaData(state, sistemas)
  const blocos = [
    {
      tipo: 'paragrafo',
      texto: 'Este capítulo apresenta o Plano de Emergência Contra Incêndio da edificação, conforme o Anexo B da NT 16/2021 CBMMA — Gerenciamento de Risco, complementando as informações gerais da edificação e as medidas de segurança já descritas neste memorial.',
    },
    { tipo: 'titulo2', texto: 'Descrição da Edificação e da População' },
    { tipo: 'campo', label: 'Característica da vizinhança', valor: d.caracteristicaVizinhanca },
    { tipo: 'campo', label: 'Distância do Corpo de Bombeiros Militar', valor: d.distanciaCBM },
    { tipo: 'campo', label: 'Meios de ajuda externa', valor: d.meiosAjudaExterna },
    { tipo: 'campo', label: 'População fixa', valor: d.populacaoFixa },
    { tipo: 'campo', label: 'População flutuante', valor: d.populacaoFlutuante },
    { tipo: 'campo', label: 'Características de funcionamento', valor: d.horarioFuncionamento },
    {
      tipo: 'campo', label: 'Pessoas portadoras de necessidades especiais',
      valor: d.pneQuantidade ? `${d.pneQuantidade} — ${d.pneLocalizacao || 'localização não informada'}` : '',
    },
    { tipo: 'campo', label: 'Rotas de fuga e ponto de encontro', valor: d.pontoEncontro },
  ]

  if (d.riscosDetalhamento) {
    blocos.push({ tipo: 'campo', label: 'Detalhamento dos riscos específicos', valor: d.riscosDetalhamento })
  }

  blocos.push(
    { tipo: 'titulo2', texto: 'Recursos Humanos e Apoio Externo' },
    { tipo: 'campo', label: 'Brigada de incêndio', valor: d.brigadistasQtd ? `${d.brigadistasQtd} membros` : '' },
    { tipo: 'campo', label: 'Brigadistas profissionais', valor: d.brigadistasProfissionaisQtd },
    { tipo: 'campo', label: 'Hospital de referência', valor: d.hospitalReferencia },
    { tipo: 'campo', label: 'Telefone do Corpo de Bombeiros', valor: d.telefoneCBM },
    { tipo: 'titulo2', texto: 'Procedimentos Básicos de Emergência Contra Incêndio' },
    {
      tipo: 'tabela',
      colunas: ['Procedimento', 'Responsável / Descrição'],
      larguras: ['30%', '70%'],
      linhas: [
        ['Alerta', d.meioAlerta],
        ['Análise da situação', d.respAnaliseSituacao],
        ['Apoio externo', `${d.respApoioExterno} · Corpo de Bombeiros: ${d.telefoneCBM}`],
        ['Primeiros socorros', d.hospitalReferencia ? `${d.respPrimeirosSocorros} · Hospital de referência: ${d.hospitalReferencia}` : d.respPrimeirosSocorros],
        ['Eliminar riscos', d.respEliminarRiscos],
        ['Abandono de área', d.respAbandono],
        ['Isolamento de área', d.respIsolamento],
        ['Confinamento do incêndio', d.respConfinamento],
        ['Combate ao incêndio', d.respCombate],
        ['Investigação', d.respInvestigacao],
      ],
    },
  )

  return { titulo: 'Gerenciamento de Risco — Plano de Emergência', blocos }
}
