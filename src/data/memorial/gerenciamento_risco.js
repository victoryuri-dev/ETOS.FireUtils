// memorial/gerenciamento_risco.js — texto do memorial descritivo para
// Gerenciamento de Risco de Incêndio (Plano de Emergência, Anexo B da NT
// 16/2021 CBMMA). Reaproveita buildPlanoEmergenciaData — a MESMA função que
// alimentaria um documento avulso — só que aqui o resultado vira um capítulo
// do Memorial Descritivo em vez de um documento separado.
//
// Os campos deste capítulo reproduzem EXATAMENTE os itens B.1.1 a B.1.12,
// B.2.1 a B.2.10 e B.3 do Anexo B (modelo de Plano de Emergência) — nem mais
// nem menos — na mesma ordem e com os mesmos rótulos do documento oficial,
// preenchidos automaticamente sempre que o dado já existe em outro lugar do
// projeto (ver utils/planoEmergencia.js).
import { buildPlanoEmergenciaData } from '../../utils/planoEmergencia'

export function textoMemorialGerenciamentoRisco(state, sistemas) {
  const d = buildPlanoEmergenciaData(state, sistemas)

  const riscos = d.riscosAtivos.length ? d.riscosAtivos.join(', ') : ''
  const riscosValor = [riscos, d.riscosDetalhamento].filter(Boolean).join(' — ')
  const sistemasValor = d.sistemasAtivos.join(', ')

  const blocos = [
    {
      tipo: 'paragrafo',
      texto: 'Este capítulo apresenta o Plano de Emergência Contra Incêndio da edificação, reproduzindo os itens B.1 a B.3 do Anexo B da NT 16/2021 CBMMA — Gerenciamento de Risco.',
    },

    { tipo: 'titulo2', texto: 'B.1. Descrição da edificação ou área de risco' },
    { tipo: 'campo', label: 'B.1.1 Identificação da edificação', valor: d.edificacao },
    { tipo: 'campo', label: 'B.1.2 Localização — tipo', valor: d.localizacaoTipo },
    { tipo: 'campo', label: 'B.1.2 Localização — endereço', valor: d.endereco },
    { tipo: 'campo', label: 'B.1.2 Localização — característica da vizinhança', valor: d.caracteristicaVizinhanca },
    { tipo: 'campo', label: 'B.1.2 Localização — distância do Corpo de Bombeiros Militar', valor: d.distanciaCBM },
    { tipo: 'campo', label: 'B.1.2 Localização — meios de ajuda externa', valor: d.meiosAjudaExterna },
    { tipo: 'campo', label: 'B.1.3 Estrutura', valor: d.estrutura },
    {
      tipo: 'tabela',
      colunas: ['B.1.4 Dimensões — área construída', 'Altura', 'Pavimentos', 'Subsolos'],
      linhas: [[d.areaConstruida, d.altura, d.nPavimentos, d.nSubsolos]],
    },
    { tipo: 'campo', label: 'B.1.5 Ocupação', valor: d.ocupacao },
    { tipo: 'campo', label: 'B.1.6 População — fixa', valor: d.populacaoFixa },
    { tipo: 'campo', label: 'B.1.6 População — flutuante', valor: d.populacaoFlutuante },
    { tipo: 'campo', label: 'B.1.7 Características de funcionamento', valor: d.horarioFuncionamento },
    {
      tipo: 'campo', label: 'B.1.8 Pessoas portadoras de necessidades especiais',
      valor: d.pneQuantidade ? `${d.pneQuantidade} — ${d.pneLocalizacao || 'localização não informada'}` : '',
    },
    { tipo: 'campo', label: 'B.1.9 Riscos específicos inerentes à atividade', valor: riscosValor },
    { tipo: 'campo', label: 'B.1.10 Recursos humanos — Brigada de Incêndio', valor: d.brigadistasQtd ? `${d.brigadistasQtd} membros` : '' },
    { tipo: 'campo', label: 'B.1.10 Recursos humanos — Brigadistas Profissionais', valor: d.brigadistasProfissionaisQtd },
    { tipo: 'campo', label: 'B.1.11 Sistemas de Segurança contra Incêndio', valor: sistemasValor },
    { tipo: 'campo', label: 'B.1.12 Rotas de fuga e ponto de encontro', valor: d.pontoEncontro },

    { tipo: 'titulo2', texto: 'B.2. Procedimentos básicos de emergência contra incêndio' },
    { tipo: 'campo', label: 'B.2.1 Alerta', valor: d.meioAlerta },
    { tipo: 'campo', label: 'B.2.2 Análise da situação', valor: d.respAnaliseSituacao },
    { tipo: 'campo', label: 'B.2.3 Apoio externo — responsável', valor: d.respApoioExterno },
    { tipo: 'campo', label: 'B.2.3 Apoio externo — telefone do Corpo de Bombeiros', valor: d.telefoneCBM },
    { tipo: 'campo', label: 'B.2.4 Primeiros socorros — responsável', valor: d.respPrimeirosSocorros },
    { tipo: 'campo', label: 'B.2.4 Hospitais próximos', valor: d.hospitalReferencia },
    { tipo: 'campo', label: 'B.2.5 Eliminar riscos', valor: d.respEliminarRiscos },
    { tipo: 'campo', label: 'B.2.6 Abandono de área', valor: d.respAbandono },
    { tipo: 'campo', label: 'B.2.7 Isolamento de área', valor: d.respIsolamento },
    { tipo: 'campo', label: 'B.2.8 Confinamento do incêndio', valor: d.respConfinamento },
    { tipo: 'campo', label: 'B.2.9 Combate ao incêndio', valor: d.respCombate },
    { tipo: 'campo', label: 'B.2.10 Investigação', valor: d.respInvestigacao },

    { tipo: 'titulo2', texto: 'B.3. Responsabilidade pelo plano' },
    { tipo: 'campo', label: 'Responsável pela empresa (preposto)', valor: d.proprietario },
    { tipo: 'campo', label: 'Responsável pela elaboração do Plano de Emergência', valor: d.responsavelTecnico },
  ]

  return { titulo: 'Gerenciamento de Risco — Plano de Emergência', blocos }
}
