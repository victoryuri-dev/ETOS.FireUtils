// Monta os dados do Plano de Emergência contra Incêndio (NT 16/2021 CBMMA,
// Anexo B) a partir do estado do projeto. Reaproveita o máximo possível de
// buildAnexoBData (endereço, estrutura, ocupação, área, altura, sistemas
// ativos, riscos especiais, proprietário e responsável técnico) — o usuário
// só complementa em Gerenciamento de Risco (state.planoEmergencia) o que não
// existe em nenhum outro lugar do app. Campos sem valor cadastrado recebem um
// papel/procedimento padrão condizente com o modelo do Anexo B, sempre
// editável na tela de complementação.
import { buildAnexoBData, RISCOS_ESPECIAIS } from './anexoB'

// Texto padrão dos 10 procedimentos básicos (item B.2 do Anexo B) — adaptado
// de um exemplo prático genérico de plano de emergência, servindo de ponto de
// partida editável. Nasce preenchido em todo projeto novo (INITIAL_STATE em
// ProjetoContext.jsx) e cai aqui de novo só como rede de segurança (projeto
// salvo antes desta mudança, com o campo ainda vazio).
export const PROCEDIMENTOS_PADRAO = {
  meioAlerta: 'Ao ser detectado um princípio de incêndio, o alarme de incêndio manual deve ser acionado por meio de botoeira, tipo quebra-vidro. Deve-se ligar para o Corpo de Bombeiros (Fone 193).',
  respAnaliseSituacao: 'Após identificação do setor sinistrado pelo painel da central de alarme, o alarme deve ser desligado e o brigadista de plantão deve comparecer ao local para análise final da emergência.\n\nNota: sempre que houver uma suspeita de princípio de incêndio (por calor, cheiro, fumaça ou outros meios), esta deverá ser investigada. Nunca deve ser subestimada uma suspeita.',
  respApoioExterno: 'Um brigadista deve acionar o Corpo de Bombeiros, informando:\n- nome e número do telefone utilizado;\n- endereço completo da edificação e pontos de referência que facilitem a localização;\n- características do incêndio;\n- quantidade e estado das eventuais vítimas;\n- quando houver vítima grave e o incêndio já estiver controlado, informar a existência de heliponto, caso a edificação possua, para eventual resgate por helicóptero.\n\nNota: o mesmo brigadista que acionou o Corpo de Bombeiros preferencialmente deve orientá-los quando da sua chegada sobre as condições e acessos, e apresentá-los ao Chefe da Brigada.',
  respPrimeirosSocorros: 'Os primeiros socorros devem ser prestados às eventuais vítimas, conforme treinamento específico dado aos brigadistas. Em caso de necessidade, encaminhar a vítima ao hospital de referência previamente definido para a edificação.',
  respEliminarRiscos: 'Caso necessário, deve ser providenciado o corte da energia elétrica (parcial ou total) e o fechamento das válvulas das tubulações. O corte geral deve ser executado pelo pessoal da manutenção, que deve estar à disposição do Chefe da Brigada.',
  respAbandono: 'Caso seja necessário abandonar a edificação, deve ser acionado novamente o alarme de incêndio para que se inicie o abandono geral. Os ocupantes do setor sinistrado, que já devem estar cientes da emergência, devem ser os primeiros a se deslocar, em fila e sem tumulto, após o primeiro toque, com um brigadista liderando a fila e outro encerrando a mesma. Antes do abandono definitivo do setor, um ou dois brigadistas devem verificar se não ficaram ocupantes retardatários e providenciar o fechamento de portas e/ou janelas, se possível. Cada pessoa portadora de deficiência física, permanente ou temporária, deve ser acompanhada por dois brigadistas ou voluntários, previamente designados pelo Chefe da Brigada. Todos os demais ocupantes, após soar o primeiro alarme, devem parar o que estiverem fazendo, pegar apenas seus documentos pessoais e se agruparem em fila organizada e direcionada à saída de emergência. Após o segundo toque do alarme, os ocupantes devem iniciar o deslocamento, dando preferência às demais filas quando cruzarem com as mesmas (como numa rotatória de trânsito), até deixarem a edificação e se dirigirem ao ponto de encontro previamente definido.',
  respIsolamento: 'A área sinistrada deve ser isolada fisicamente, de modo a garantir os trabalhos de emergência e evitar que pessoas não autorizadas adentrem ao local.',
  respConfinamento: 'O incêndio deve ser confinado de modo a evitar a sua propagação e consequências.',
  respCombate: 'Os demais brigadistas devem iniciar, se necessário e/ou possível, o combate ao fogo sob comando de brigadista profissional, podendo ser auxiliados por outros ocupantes, desde que devidamente treinados, capacitados e protegidos. O combate ao incêndio deve ser efetuado conforme treinamento específico dado aos brigadistas.',
  respInvestigacao: 'Após o controle total da emergência e a volta à normalidade, incluindo a liberação da edificação pelas autoridades, o Chefe da Brigada deve iniciar o processo de investigação e elaborar um relatório, por escrito, sobre o sinistro e as ações de controle, para as devidas providências e/ou investigação.',
}

function enderecoCompletoDe(state) {
  const linha = [state.endereco, state.numero].filter(Boolean).join(', ')
  return [linha, state.complemento, state.bairro, [state.cidade, state.uf].filter(Boolean).join(' – '), state.cep]
    .filter(Boolean).join(', ')
}

// Riscos especiais marcados na Configuração são por estrutura, e cada risco
// marcado tem sua própria localização (ex.: "vasos sob pressão" no 1º
// subsolo, "GLP" na cobertura) — em vez de um texto único juntando todos os
// riscos da estrutura. Só entram estruturas com pelo menos um risco marcado.
function riscosPorEstruturaDe(state, pe) {
  const riscosPorEst = state.riscosEspeciaisPorEstrutura || {}
  const outrosDescPorEst = state.riscosOutrosDescPorEstrutura || {}
  const localizacaoPorEst = pe.riscosLocalizacaoPorEstrutura || {}
  return (state.estruturas || [])
    .map(est => {
      const marcados = riscosPorEst[est.id] || {}
      const localizacoes = localizacaoPorEst[est.id] || {}
      const riscos = RISCOS_ESPECIAIS
        .filter(r => !!marcados[r.key])
        .map(r => ({
          key: r.key,
          label: (r.key === 'outros' && outrosDescPorEst[est.id]) ? `${r.label}: ${outrosDescPorEst[est.id]}` : r.label,
          localizacao: localizacoes[r.key] || '',
        }))
      return { estrutura: est.nome, riscos }
    })
    .filter(r => r.riscos.length > 0)
}

export function buildPlanoEmergenciaData(state, sistemas) {
  const b = buildAnexoBData(state, sistemas)
  const pe = state.planoEmergencia || {}
  const estruturas = state.estruturas || []
  const nPavimentos = estruturas.reduce((s, e) => s + (parseInt(e.nPavimentos) || 0), 0)
  const nSubsolos = estruturas.reduce((s, e) => s + (parseInt(e.nSubsolos) || 0), 0)

  return {
    edificacao: state.respFantasia || state.respRazaoSocial || state.nome || '',
    localizacaoTipo: pe.localizacaoTipo || 'Urbana',
    endereco: enderecoCompletoDe(state),
    caracteristicaVizinhanca: pe.caracteristicaVizinhanca || '',
    distanciaCBM: pe.distanciaCBM ? `${pe.distanciaCBM} km` : '',

    estrutura: b.estrutura,
    areaConstruida: b.areaTotalConstruida,
    areaTerreno: b.areaTerreno,
    altura: b.altura,
    nPavimentos: nPavimentos || '',
    nSubsolos: nSubsolos || '',
    ocupacao: b.classificacaoOcupacao,

    populacaoFixa: pe.populacaoFixa || '',
    populacaoFlutuante: pe.populacaoFlutuante || '',
    horarioFuncionamento: pe.horarioFuncionamento || '',
    pneTemPessoas: !!pe.pneTemPessoas,
    pneDescricao: pe.pneTemPessoas ? (pe.pneDescricao || 'Sim') : '',

    riscosPorEstrutura: riscosPorEstruturaDe(state, pe),

    brigadistasQtd: pe.brigadistasQtd || '',
    brigadistasProfissionaisQtd: pe.brigadistasProfissionaisQtd || '',

    sistemasAtivos: [...b.medidasCol1, ...b.medidasCol2].filter(m => m.ativo).map(m => m.label),

    meioAlerta: pe.meioAlerta || PROCEDIMENTOS_PADRAO.meioAlerta,
    telefoneCBM: pe.telefoneCBM || '193',
    hospitalReferencia: pe.hospitalReferencia || '',
    respAnaliseSituacao: pe.respAnaliseSituacao || PROCEDIMENTOS_PADRAO.respAnaliseSituacao,
    respApoioExterno: pe.respApoioExterno || PROCEDIMENTOS_PADRAO.respApoioExterno,
    respPrimeirosSocorros: pe.respPrimeirosSocorros || PROCEDIMENTOS_PADRAO.respPrimeirosSocorros,
    respEliminarRiscos: pe.respEliminarRiscos || PROCEDIMENTOS_PADRAO.respEliminarRiscos,
    respAbandono: pe.respAbandono || PROCEDIMENTOS_PADRAO.respAbandono,
    respIsolamento: pe.respIsolamento || PROCEDIMENTOS_PADRAO.respIsolamento,
    respConfinamento: pe.respConfinamento || PROCEDIMENTOS_PADRAO.respConfinamento,
    respCombate: pe.respCombate || PROCEDIMENTOS_PADRAO.respCombate,
    respInvestigacao: pe.respInvestigacao || PROCEDIMENTOS_PADRAO.respInvestigacao,

    proprietario: b.proprietario,
    responsavelTecnico: b.responsavelTecnico,
  }
}
