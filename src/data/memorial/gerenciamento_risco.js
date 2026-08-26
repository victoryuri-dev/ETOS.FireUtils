// memorial/gerenciamento_risco.js — texto do memorial descritivo para
// Gerenciamento de Risco de Incêndio (Plano de Emergência, Anexo B da NT
// 16/2021 CBMMA). Reaproveita buildPlanoEmergenciaData — a MESMA função que
// alimentaria um documento avulso — só que aqui o resultado vira um capítulo
// do Memorial Descritivo em vez de um documento separado.
//
// As seções B.1 (Descrição da edificação) e B.2 (Procedimentos) são listas
// com marcadores — cada campo é um item `{ label, valor }` (rótulo em
// negrito, valor normal, igual ao bloco 'campo'), e os compostos (Localização,
// Estrutura e Dimensões, População, Riscos, Recursos humanos/materiais, Apoio
// externo, Primeiros socorros) ganham uma sub-lista aninhada em `sub` (ver
// suporte a isso no bloco 'lista' de MemorialDescritivoPage.jsx). A tabela de
// dimensões por estrutura é o único conteúdo que não cabe numa sub-lista, por
// isso entra como bloco próprio logo depois do item "Estrutura e Dimensões",
// partindo a seção B.1 em duas listas.
import { buildPlanoEmergenciaData } from '../../utils/planoEmergencia'

export function textoMemorialGerenciamentoRisco(state, sistemas) {
  const d = buildPlanoEmergenciaData(state, sistemas)

  const multiplasEstruturas = d.riscosPorEstrutura.length > 1
  const itensRiscos = d.riscosPorEstrutura.map(r => ({
    label: multiplasEstruturas ? `Riscos específicos — ${r.estrutura}` : 'Riscos específicos inerentes à atividade',
    valor: '',
    // Sem localização informada, é só o nome do risco (sem ":" solto) — ver
    // combinação anterior no histórico do arquivo.
    sub: r.riscos.map(x => x.localizacao ? { label: x.label, valor: x.localizacao } : { texto: x.label }),
  }))

  const itensDescricaoParte1 = [
    { label: 'Identificação da edificação', valor: d.edificacao },
    {
      label: 'Localização', valor: d.localizacaoTipo,
      sub: [
        { label: 'Endereço', valor: d.endereco },
        { label: 'Característica da vizinhança', valor: d.caracteristicaVizinhanca },
        { label: 'Distância do Corpo de Bombeiros Militar', valor: d.distanciaCBM },
        { label: 'Meios de ajuda externa', valor: d.meiosAjudaExterna },
      ],
    },
    { label: 'Estrutura e Dimensões', valor: '', sub: [{ label: 'Área do terreno', valor: d.areaTerreno }] },
  ]

  const itensDescricaoParte2 = [
    { label: 'Ocupação', valor: d.ocupacao },
    {
      label: 'População', valor: '',
      sub: [{ label: 'Fixa', valor: d.populacaoFixa }, { label: 'Flutuante', valor: d.populacaoFlutuante }],
    },
    { label: 'Características de funcionamento', valor: d.horarioFuncionamento },
    // Sem descrição, é só a afirmação (sem negrito nem ":" soltos); com
    // descrição, "Existem pessoas...:" vira o rótulo em negrito do item.
    ...(d.pneTemPessoas ? [
      d.pneDescricao
        ? { label: 'Existem pessoas portadoras de necessidades especiais', valor: d.pneDescricao }
        : { texto: 'Existem pessoas portadoras de necessidades especiais' },
    ] : []),
    ...itensRiscos,
    {
      label: 'Recursos humanos', valor: '',
      sub: [
        { label: 'Brigada de Incêndio', valor: d.brigadistasQtd ? `${d.brigadistasQtd} membros` : '' },
        { label: 'Brigadistas Profissionais', valor: d.brigadistasProfissionaisQtd },
      ],
    },
    { label: 'Recursos materiais', valor: '', sub: d.sistemasAtivos },
  ]

  const itensProcedimentos = [
    { label: 'Alerta', valor: d.meioAlerta },
    { label: 'Análise da situação', valor: d.respAnaliseSituacao },
    {
      label: 'Apoio externo', valor: d.respApoioExterno,
      sub: [{ label: 'Telefone do Corpo de Bombeiros', valor: d.telefoneCBM }],
    },
    {
      label: 'Primeiros socorros e hospitais próximos', valor: d.respPrimeirosSocorros,
      sub: [{ label: 'Hospital de referência', valor: d.hospitalReferencia }],
    },
    { label: 'Eliminar riscos', valor: d.respEliminarRiscos },
    { label: 'Abandono de área', valor: d.respAbandono },
    { label: 'Isolamento de área', valor: d.respIsolamento },
    { label: 'Confinamento do incêndio', valor: d.respConfinamento },
    { label: 'Combate ao incêndio', valor: d.respCombate },
    { label: 'Investigação', valor: d.respInvestigacao },
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
    { tipo: 'lista', itens: itensProcedimentos },

    { tipo: 'titulo2', texto: 'Responsabilidade pelo plano' },
    { tipo: 'campo', label: 'Responsável pela empresa (preposto)', valor: d.proprietario },
    { tipo: 'campo', label: 'Responsável pela elaboração do Plano de Emergência', valor: d.responsavelTecnico },
  ]

  return { titulo: 'Gerenciamento de Risco — Plano de Emergência', blocos }
}
