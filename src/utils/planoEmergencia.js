// Monta os dados do Plano de Emergência contra Incêndio (NT 16/2021 CBMMA,
// Anexo B) a partir do estado do projeto. Reaproveita o máximo possível de
// buildAnexoBData (endereço, estrutura, ocupação, área, altura, sistemas
// ativos, riscos especiais, proprietário e responsável técnico) — o usuário
// só complementa em Gerenciamento de Risco (state.planoEmergencia) o que não
// existe em nenhum outro lugar do app. Campos sem valor cadastrado recebem um
// papel/procedimento padrão condizente com o modelo do Anexo B, sempre
// editável na tela de complementação.
import { buildAnexoBData } from './anexoB'

function enderecoCompletoDe(state) {
  const linha = [state.endereco, state.numero].filter(Boolean).join(', ')
  return [linha, state.complemento, state.bairro, [state.cidade, state.uf].filter(Boolean).join(' – '), state.cep]
    .filter(Boolean).join(', ')
}

export function buildPlanoEmergenciaData(state, sistemas) {
  const b = buildAnexoBData(state, sistemas)
  const pe = state.planoEmergencia || {}
  const estruturas = state.estruturas || []
  const nPavimentos = estruturas.reduce((s, e) => s + (parseInt(e.nPavimentos) || 0), 0)
  const nSubsolos = estruturas.reduce((s, e) => s + (parseInt(e.nSubsolos) || 0), 0)

  return {
    edificacao: state.respFantasia || state.respRazaoSocial || state.nome || '',
    endereco: enderecoCompletoDe(state),
    caracteristicaVizinhanca: pe.caracteristicaVizinhanca || '',
    distanciaCBM: pe.distanciaCBM ? `${pe.distanciaCBM} km` : '',
    meiosAjudaExterna: pe.meiosAjudaExterna || '',

    estrutura: b.estrutura,
    areaConstruida: b.areaTotalConstruida,
    altura: b.altura,
    nPavimentos: nPavimentos || '',
    nSubsolos: nSubsolos || '',
    ocupacao: b.classificacaoOcupacao,

    populacaoFixa: pe.populacaoFixa || '',
    populacaoFlutuante: pe.populacaoFlutuante || '',
    horarioFuncionamento: pe.horarioFuncionamento || '',
    pneQuantidade: pe.pneQuantidade || '',
    pneLocalizacao: pe.pneLocalizacao || '',

    riscosAtivos: b.riscosEspeciais.filter(r => r.ativo).map(r => r.label),
    riscosDetalhamento: pe.riscosDetalhamento || '',

    brigadistasQtd: pe.brigadistasQtd || '',
    brigadistasProfissionaisQtd: pe.brigadistasProfissionaisQtd || '',

    sistemasAtivos: [...b.medidasCol1, ...b.medidasCol2].filter(m => m.ativo).map(m => m.label),
    pontoEncontro: pe.pontoEncontro || '',

    meioAlerta: pe.meioAlerta || 'Alarme de incêndio e/ou comunicação verbal aos ocupantes',
    telefoneCBM: pe.telefoneCBM || '193',
    hospitalReferencia: pe.hospitalReferencia || '',
    respAnaliseSituacao: pe.respAnaliseSituacao || 'Brigadista de plantão',
    respApoioExterno: pe.respApoioExterno || 'Brigadista de plantão',
    respPrimeirosSocorros: pe.respPrimeirosSocorros || 'Brigadistas treinados',
    respEliminarRiscos: pe.respEliminarRiscos || 'Equipe de manutenção',
    respAbandono: pe.respAbandono || 'Chefe da Brigada',
    respIsolamento: pe.respIsolamento || 'Brigada de Incêndio',
    respConfinamento: pe.respConfinamento || 'Brigada de Incêndio',
    respCombate: pe.respCombate || 'Brigada de Incêndio',
    respInvestigacao: pe.respInvestigacao || 'Chefe da Brigada',

    proprietario: b.proprietario,
    responsavelTecnico: b.responsavelTecnico,
  }
}
