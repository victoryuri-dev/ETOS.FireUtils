// memorial/gerenciamento_risco.js — texto do memorial descritivo para
// Gerenciamento de Risco de Incêndio (Plano de Emergência, Anexo B da NT
// 16/2021 CBMMA). Reaproveita buildPlanoEmergenciaData — a MESMA função que
// alimentaria um documento avulso — só que aqui o resultado vira um capítulo
// do Memorial Descritivo em vez de um documento separado.
//
// Os campos deste capítulo seguem os itens B.1 e B.2 do Anexo B (modelo de
// Plano de Emergência), na mesma ordem do documento oficial, com alguns itens
// simplificados ou removidos a pedido (ex.: sem "meios de ajuda externa" e
// sem "rotas de fuga/ponto de encontro" — ver histórico do arquivo).
// Preenchidos automaticamente sempre que o dado já existe em outro lugar do
// projeto (ver utils/planoEmergencia.js). Os rótulos ficam sem a numeração
// B.x.y — é só referência interna da norma, não ajuda o leitor do memorial.
import { buildPlanoEmergenciaData } from '../../utils/planoEmergencia'

export function textoMemorialGerenciamentoRisco(state, sistemas) {
  const d = buildPlanoEmergenciaData(state, sistemas)

  const riscos = d.riscosAtivos.length ? d.riscosAtivos.join(', ') : ''
  const riscosValor = [riscos, d.riscosDetalhamento].filter(Boolean).join(' — ')
  const sistemasValor = d.sistemasAtivos.join(', ')

  const blocos = [
    {
      tipo: 'paragrafo',
      texto: 'Este capítulo apresenta o Plano de Emergência Contra Incêndio da edificação, conforme o Anexo B da NT 16/2021 CBMMA — Gerenciamento de Risco.',
    },

    { tipo: 'titulo2', texto: 'Descrição da edificação ou área de risco' },
    { tipo: 'campo', label: 'Identificação da edificação', valor: d.edificacao },
    { tipo: 'campo', label: 'Localização — tipo', valor: d.localizacaoTipo },
    { tipo: 'campo', label: 'Localização — endereço', valor: d.endereco },
    { tipo: 'campo', label: 'Localização — característica da vizinhança', valor: d.caracteristicaVizinhanca },
    { tipo: 'campo', label: 'Localização — distância do Corpo de Bombeiros Militar', valor: d.distanciaCBM },
    { tipo: 'campo', label: 'Estrutura', valor: d.estrutura },
    {
      tipo: 'tabela',
      colunas: ['Dimensões — área construída', 'Altura', 'Pavimentos', 'Subsolos'],
      linhas: [[d.areaConstruida, d.altura, d.nPavimentos, d.nSubsolos]],
    },
    { tipo: 'campo', label: 'Ocupação', valor: d.ocupacao },
    { tipo: 'campo', label: 'População — fixa', valor: d.populacaoFixa },
    { tipo: 'campo', label: 'População — flutuante', valor: d.populacaoFlutuante },
    { tipo: 'campo', label: 'Características de funcionamento', valor: d.horarioFuncionamento },
    { tipo: 'campo', label: 'Pessoas portadoras de necessidades especiais', valor: d.pneTemPessoas ? d.pneDescricao : 'Não' },
    { tipo: 'campo', label: 'Riscos específicos inerentes à atividade', valor: riscosValor },
    { tipo: 'campo', label: 'Recursos humanos — Brigada de Incêndio', valor: d.brigadistasQtd ? `${d.brigadistasQtd} membros` : '' },
    { tipo: 'campo', label: 'Recursos humanos — Brigadistas Profissionais', valor: d.brigadistasProfissionaisQtd },
    { tipo: 'campo', label: 'Sistemas de Segurança contra Incêndio', valor: sistemasValor },

    { tipo: 'titulo2', texto: 'Procedimentos básicos de emergência contra incêndio' },
    { tipo: 'campo', label: 'Alerta', valor: d.meioAlerta },
    { tipo: 'campo', label: 'Análise da situação', valor: d.respAnaliseSituacao },
    { tipo: 'campo', label: 'Apoio externo — responsável', valor: d.respApoioExterno },
    { tipo: 'campo', label: 'Apoio externo — telefone do Corpo de Bombeiros', valor: d.telefoneCBM },
    { tipo: 'campo', label: 'Primeiros socorros — responsável', valor: d.respPrimeirosSocorros },
    { tipo: 'campo', label: 'Hospitais próximos', valor: d.hospitalReferencia },
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
