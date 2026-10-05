import { newIds } from '../context/ProjetoContext'
import { PROCEDIMENTOS_PADRAO } from '../utils/planoEmergencia'

// ID fixo do projeto de exemplo "fixado" — permite checar se ele existe e
// recria-lo sempre que faltar (ex: apos ser excluido), sem duplicar.
export const EXEMPLO_FIXO_ID = 'exemplo-fixo'

// Dados-base do projeto de exemplo com todos os campos preenchidos — usado
// para testes manuais rapidos (Anexo B, revisao final, etc.) sem precisar
// passar pelo wizard inteiro toda vez. TODAS as medidas de seguranca
// disponiveis no app sao ligadas (sistemasPorEstrutura) nas duas estruturas,
// cada uma com dados reais cadastrados na tela correspondente — nao so o
// toggle, pra exercitar o memorial/Anexo B/dashboard por completo.
function dadosExemplo() {
  return {
    nome: 'Loja Comercial Centro (exemplo)', dataInicio: '2026-02-01', fase: 'Em desenvolvimento',
    endereco: 'Rua Grande', numero: '123', complemento: 'Sala 2', bairro: 'Centro', cidade: 'Sao Luis', uf: 'MA', cep: '65010-000',
    situacao: 'nova', numeroAlvara: '',
    anoConstrucao: '', situacaoCBM: 'Sem AVCB anterior',
    numeroAVCB: '', validadeAVCB: '', condicoesAtuais: '',
    areaTerreno: '500', areaConstruidaTotal: '650', quantidadePublico: '80', areaComplementar: '20',
    areaMaiorPav: '250', peDireito: '3',
    usoSubsolo: 'Estacionamento', coberturaHabitavel: 'Nao',
    compartVertical: 'Sem compartimentacao',
    fachada: 'Alvenaria com revestimento ceramico', cobertura: 'Telha metalica',
    estruturas: [
      {
        id: 'est-exemplo-1', nome: 'Estrutura 1',
        areaTotal: '250', altura: '6', alturaPisoPiso: 0,
        nPavimentos: 1, nSubsolos: 0, profundidadeSubsolo: '', alturaEdificacao: '',
        estrutura: ['Concreto armado'],
        obsSegEstrutural: 'Estrutura em concreto armado, TRRF compatível com altura e ocupação C-1 conforme IT/NT de resistência ao fogo vigente.',
        // Compartimentação (ver CompartimentacaoPage.jsx / normas/MA/compartimentacao.js)
        elementosCompartHorizontal: ['parede_corta_fogo', 'porta_corta_fogo'],
        elementosCompartVertical: [],
        condicoesEspeciaisCompartHorizontal: [],
        condicoesEspeciaisCompartVertical: [],
        obsCompartimentacao: 'Parede corta-fogo EI-60 separando o depósito do salão de vendas.',
        isencaoCompartHorizontal: null, isencaoCompartVertical: null,
        // Alarme de incêndio (ver AlarmeIncendioPage.jsx / deteccao_alarme_calc.js)
        alarme: {
          central: 'convencional', centralLocal: 'Recepção/caixa', circuito: '',
          monitoramentoRemoto: false, preAlarme: false, subcentral: false, subcentralQtd: '',
          painelRepetidor: false, painelSinoptico: false,
          fonteAuxiliar: 'bateria de acumuladores', fonteAuxiliarLocal: 'Quadro elétrico, sala de depósito',
          tipoAvisador: '', avisadores: ['sonoro'], semFio: false,
        },
        // Detecção de incêndio (mesmos arquivos acima)
        deteccao: {
          entreforros: false, entreforrosDescricao: '',
          arCondicionado: true,
          tiposDetector: ['fumaca_pontual'],
        },
      },
      {
        id: 'est-exemplo-2', nome: 'Estrutura 2',
        areaTotal: '400', altura: '12', alturaPisoPiso: 6,
        nPavimentos: 3, nSubsolos: 1, profundidadeSubsolo: '3', alturaEdificacao: '3',
        estrutura: ['Estrutura metalica'],
        obsSegEstrutural: 'Estrutura metálica com revestimento contra fogo (argamassa projetada), TRRF compatível com altura e ocupação A-1.',
        elementosCompartHorizontal: ['parede_corta_fogo', 'porta_corta_fogo', 'registro_corta_fogo'],
        elementosCompartVertical: ['enclausuramento_escada', 'selo_corta_fogo'],
        condicoesEspeciaisCompartHorizontal: ['estacionamento_exclusivo'],
        condicoesEspeciaisCompartVertical: [],
        obsCompartimentacao: 'Escada enclausurada e à prova de fumaça atendendo aos três pavimentos acima do térreo.',
        isencaoCompartHorizontal: null, isencaoCompartVertical: null,
        alarme: {
          central: 'enderecavel', centralLocal: 'Portaria principal', circuito: 'A',
          monitoramentoRemoto: true, preAlarme: true, subcentral: true, subcentralQtd: '2',
          painelRepetidor: true, painelSinoptico: false,
          fonteAuxiliar: 'nobreak', fonteAuxiliarLocal: 'Sala técnica do térreo',
          tipoAvisador: '', avisadores: ['sonoro', 'visual', 'audiovisual'], semFio: false,
        },
        deteccao: {
          entreforros: true, entreforrosDescricao: 'Forro em gesso acartonado em todos os pavimentos acima do térreo.',
          arCondicionado: false,
          tiposDetector: ['fumaca_pontual', 'temperatura_pontual'],
        },
      },
    ],
    propNome: 'Joao da Silva', propDocumento: '123.456.789-00', propTelefone: '(98) 98888-7777', propEmail: 'joao@exemplo.com',
    respRazaoSocial: 'Loja Comercio Exemplo LTDA', respFantasia: 'Loja Exemplo', respCNPJ: '12.345.678/0001-90',
    respTelefone: '(98) 3222-1111', respEmail: 'contato@lojaexemplo.com',
    cnaePrincipal: '4712-1/00', cnaePrincipalDesc: 'Comercio varejista de mercadorias em geral',
    rtNome: 'Maria Engenheira', rtCpf: '987.654.321-00', rtConselho: 'CREA-MA 123456/D', rtEspecialidade: 'Engenharia Civil',
    rtEmpresa: 'Maria Projetos', rtEmail: 'maria@projetos.com', rtTelefone: '(98) 99999-0000',
    artNumero: 'MA20260012345', artData: '2026-01-05', artTipoServico: 'Projeto', artValorObra: 'R$ 150.000,00',
    pavimentos: [
      {
        id: 'est-exemplo-1-P1', estruturaId: 'est-exemplo-1', tipo: 'terreo', label: 'Terreo',
        grupo: 'C', divisao: 'C-1', cnae: '4712-1/00', cnaeDesc: 'Comercio varejista', area: '250', acess: [],
        pisoDescarga: true,
        populacaoFixa: '12',
        ambientes: [
          { id: 'amb-ex-1-1', nome: 'Salão de Vendas', divisao: 'C-1', popTipo: 'area', area: 180, assentos: 0, popManual: 0, acessoId: 'acc-ex-1-2', origem: 'manual' },
          { id: 'amb-ex-1-2', nome: 'Depósito de Mercadorias', divisao: 'C-1', popTipo: 'manual', area: 40, assentos: 0, popManual: 2, acessoId: 'acc-ex-1-1', origem: 'manual' },
          { id: 'amb-ex-1-3', nome: 'Copa e Sanitário dos Funcionários', divisao: 'C-1', popTipo: 'manual', area: 30, assentos: 0, popManual: 2, acessoId: 'acc-ex-1-1', origem: 'manual' },
        ],
        acessos: [
          { id: 'acc-ex-1-1', nome: 'Saída Principal', alimentaEm: null, dims: { AD: true, ER: false, PT: true } },
          { id: 'acc-ex-1-2', nome: 'Salão de Vendas', alimentaEm: 'acc-ex-1-1', dims: { AD: true, ER: false, PT: true } },
        ],
        alarme: { acionadores: '1', avisadoresSonoros: '1', avisadoresVisuais: '', avisadoresAudiovisuais: '' },
        deteccao: { tipos: { fumaca_pontual: '4' }, obs: '' },
      },
      {
        id: 'est-exemplo-2-sub-1', estruturaId: 'est-exemplo-2', tipo: 'subsolo', label: 'Subsolo 1',
        grupo: 'G', divisao: 'G-1', cnae: '5223-1/00', cnaeDesc: 'Estacionamento de veiculos', area: '100', acess: [],
        pisoDescarga: false,
        populacaoFixa: '1',
        ambientes: [
          { id: 'amb-ex-2s-1', nome: 'Área de Estacionamento', divisao: 'G-1', popTipo: 'manual', area: 100, assentos: 0, popManual: 1, acessoId: 'acc-ex-2s-1', origem: 'manual' },
        ],
        acessos: [
          { id: 'acc-ex-2s-1', nome: 'Rampa de Acesso', alimentaEm: null, dims: { AD: false, ER: true, PT: true } },
        ],
        alarme: { acionadores: '1', avisadoresSonoros: '1', avisadoresVisuais: '', avisadoresAudiovisuais: '' },
        deteccao: { tipos: { temperatura_pontual: '3' }, obs: 'Detecção por temperatura — área sujeita a poeira e gases de veículos.' },
      },
      {
        id: 'est-exemplo-2-P1', estruturaId: 'est-exemplo-2', tipo: 'terreo', label: 'Terreo',
        grupo: 'A', divisao: 'A-1', cnae: '5590-6/03', cnaeDesc: 'Pensionatos', area: '150', acess: [],
        pisoDescarga: true,
        populacaoFixa: '12',
        ambientes: [
          { id: 'amb-ex-2-1', nome: 'Recepção', divisao: 'A-1', popTipo: 'area', area: 20, assentos: 0, popManual: 0, acessoId: 'acc-ex-2-1', origem: 'manual' },
          { id: 'amb-ex-2-2', nome: 'Dormitórios — Térreo', divisao: 'A-1', popTipo: 'fixo', area: 0, assentos: 10, popManual: 0, acessoId: 'acc-ex-2-2', origem: 'manual' },
          { id: 'amb-ex-2-3', nome: 'Área de Serviço', divisao: 'A-1', popTipo: 'manual', area: 30, assentos: 0, popManual: 2, acessoId: 'acc-ex-2-1', origem: 'manual' },
        ],
        acessos: [
          { id: 'acc-ex-2-1', nome: 'Saída Principal', alimentaEm: null, dims: { AD: true, ER: false, PT: true } },
          { id: 'acc-ex-2-2', nome: 'Corredor de Acesso aos Quartos', alimentaEm: 'acc-ex-2-1', dims: { AD: true, ER: false, PT: true } },
        ],
        alarme: { acionadores: '1', avisadoresSonoros: '1', avisadoresVisuais: '1', avisadoresAudiovisuais: '' },
        deteccao: { tipos: { fumaca_pontual: '5', temperatura_pontual: '1' }, obs: '' },
      },
      {
        id: 'est-exemplo-2-P2', estruturaId: 'est-exemplo-2', tipo: 'pav', label: 'Pavimento 2',
        grupo: 'A', divisao: 'A-1', cnae: '5590-6/03', cnaeDesc: 'Pensionatos', area: '125', acess: [],
        pisoDescarga: false,
        populacaoFixa: '12',
        ambientes: [
          { id: 'amb-ex-2p2-1', nome: 'Dormitórios — Pavimento 2', divisao: 'A-1', popTipo: 'fixo', area: 0, assentos: 12, popManual: 0, acessoId: 'acc-ex-2p2-1', origem: 'manual' },
        ],
        acessos: [
          { id: 'acc-ex-2p2-1', nome: 'Escada 01', alimentaEm: null, dims: { AD: false, ER: true, PT: true } },
        ],
        alarme: { acionadores: '1', avisadoresSonoros: '1', avisadoresVisuais: '1', avisadoresAudiovisuais: '' },
        deteccao: { tipos: { fumaca_pontual: '4' }, obs: '' },
      },
      {
        id: 'est-exemplo-2-P3', estruturaId: 'est-exemplo-2', tipo: 'pav', label: 'Pavimento 3',
        grupo: 'A', divisao: 'A-1', cnae: '5590-6/03', cnaeDesc: 'Pensionatos', area: '125', acess: [],
        pisoDescarga: false,
        populacaoFixa: '12',
        ambientes: [
          { id: 'amb-ex-2p3-1', nome: 'Dormitórios — Pavimento 3', divisao: 'A-1', popTipo: 'fixo', area: 0, assentos: 12, popManual: 0, acessoId: 'acc-ex-2p3-1', origem: 'manual' },
        ],
        acessos: [
          { id: 'acc-ex-2p3-1', nome: 'Escada 01', alimentaEm: null, dims: { AD: false, ER: true, PT: true } },
        ],
        alarme: { acionadores: '1', avisadoresSonoros: '1', avisadoresVisuais: '1', avisadoresAudiovisuais: '' },
        deteccao: { tipos: { fumaca_pontual: '4' }, obs: '' },
      },
    ],
    cargaState: {
      'est-exemplo-1': {
        'C-1': { cnae: '4712-1/00', descricao: 'Comercio varejista', cargaIncendio: 300, metodo: 'tabela', valorManual: '' },
      },
      'est-exemplo-2': {
        'A-1': { cnae: '5590-6/03', descricao: 'Pensionatos', cargaIncendio: 300, metodo: 'tabela', valorManual: '' },
        'G-1': { cnae: '5223-1/00', descricao: 'Estacionamento de veiculos', cargaIncendio: 200, metodo: 'tabela', valorManual: '' },
      },
    },
    // Liga TODAS as medidas de segurança disponíveis no app, nas duas
    // estruturas — ver useMedidasObrigatorias.js (manual !== undefined
    // sempre vence o cálculo normativo de obrigatoriedade).
    sistemasPorEstrutura: {
      'est-exemplo-1': {
        acesso_viatura: true, seg_estrutural: true, compart_horizontal: true, compart_vertical: true,
        controle_acabamento: true, saida_emergencia: true, gerenciamento_risco: true, brigada: true,
        iluminacao: true, sinalizacao: true, extintores: true, hidrantes: true, alarme: true,
        deteccao: true, sprinklers: true, controle_fumaca: true, central_gas: true, spda: true,
      },
      'est-exemplo-2': {
        acesso_viatura: true, seg_estrutural: true, compart_horizontal: true, compart_vertical: true,
        controle_acabamento: true, saida_emergencia: true, gerenciamento_risco: true, brigada: true,
        iluminacao: true, sinalizacao: true, extintores: true, hidrantes: true, alarme: true,
        deteccao: true, sprinklers: true, controle_fumaca: true, central_gas: true, spda: true,
      },
    },
    riscosEspeciaisPorEstrutura: {
      'est-exemplo-1': {
        liquidos_inflamaveis: false, fogos_artificio: false, glp: false,
        vasos_pressao: false, produtos_perigosos: false, outros: false,
      },
      'est-exemplo-2': {
        liquidos_inflamaveis: false, fogos_artificio: false, glp: true,
        vasos_pressao: false, produtos_perigosos: false, outros: false,
      },
    },
    riscosOutrosDescPorEstrutura: {},
    // Extintores (ver ProjetoContext.jsx:novoExtintor / ExtintoresPage.jsx)
    extintores: [
      { id: 'ext-ex-1', estruturaId: 'est-exemplo-1', pavimentoId: 'est-exemplo-1-P1', ambiente: 'Salão de Vendas', tipo: 'po_abc', sobreRodas: false, capacidade: '2-A:20-B:C', quantidade: 2, carga: '6' },
      { id: 'ext-ex-2', estruturaId: 'est-exemplo-1', pavimentoId: 'est-exemplo-1-P1', ambiente: 'Depósito de Mercadorias', tipo: 'co2', sobreRodas: false, capacidade: '5-B:C', quantidade: 1, carga: '' },
      { id: 'ext-ex-3', estruturaId: 'est-exemplo-2', pavimentoId: 'est-exemplo-2-sub-1', ambiente: 'Área de Estacionamento', tipo: 'po_bc', sobreRodas: false, capacidade: '20-B:C', quantidade: 2, carga: '' },
      { id: 'ext-ex-4', estruturaId: 'est-exemplo-2', pavimentoId: 'est-exemplo-2-P1', ambiente: 'Recepção', tipo: 'po_abc', sobreRodas: false, capacidade: '2-A:20-B:C', quantidade: 1, carga: '6' },
      { id: 'ext-ex-5', estruturaId: 'est-exemplo-2', pavimentoId: 'est-exemplo-2-P2', ambiente: 'Corredor', tipo: 'po_abc', sobreRodas: false, capacidade: '2-A:20-B:C', quantidade: 1, carga: '6' },
      { id: 'ext-ex-6', estruturaId: 'est-exemplo-2', pavimentoId: 'est-exemplo-2-P3', ambiente: 'Corredor', tipo: 'po_abc', sobreRodas: false, capacidade: '2-A:20-B:C', quantidade: 1, carga: '6' },
    ],
    // Iluminação de emergência — um único sistema pro projeto todo
    // (iluminacaoMesmoSistema), cada pavimento com sua própria cópia da
    // especificação do equipamento de aclaramento (ver IluminacaoPage.jsx).
    iluminacaoMesmoSistema: true,
    iluminacaoSistema: { tipo: 'bloco_autonomo', localizacaoFonte: '' },
    iluminacaoSistemaPorEstrutura: {},
    iluminacao: [
      { id: 'ilu-ex-1', estruturaId: 'est-exemplo-1', pavimentoId: 'est-exemplo-1-P1', categoria: 'aclaramento', tipoBase: 'bloco_emergencia', identificacao: '', tipoLampada: '2 × 40 LEDs autobrilho', potenciaW: '2× 2', tensaoV: '100-240', fluxoLuminosoLm: '600', autonomia: '>2 horas', quantidade: 4 },
      { id: 'ilu-ex-2', estruturaId: 'est-exemplo-2', pavimentoId: 'est-exemplo-2-sub-1', categoria: 'aclaramento', tipoBase: 'bloco_emergencia', identificacao: '', tipoLampada: '2 × 70 LEDs autobrilho', potenciaW: '2× 7,65', tensaoV: '100-240', fluxoLuminosoLm: '2200', autonomia: '>2 horas', quantidade: 2 },
      { id: 'ilu-ex-3', estruturaId: 'est-exemplo-2', pavimentoId: 'est-exemplo-2-P1', categoria: 'aclaramento', tipoBase: 'luminaria_30leds', identificacao: '', tipoLampada: '30 LEDs SMD', potenciaW: '6', tensaoV: '100-240', fluxoLuminosoLm: '100', autonomia: '3h fluxo máximo / 6h fluxo mínimo', quantidade: 5 },
      { id: 'ilu-ex-4', estruturaId: 'est-exemplo-2', pavimentoId: 'est-exemplo-2-P2', categoria: 'aclaramento', tipoBase: 'luminaria_30leds', identificacao: '', tipoLampada: '30 LEDs SMD', potenciaW: '6', tensaoV: '100-240', fluxoLuminosoLm: '100', autonomia: '3h fluxo máximo / 6h fluxo mínimo', quantidade: 4 },
      { id: 'ilu-ex-5', estruturaId: 'est-exemplo-2', pavimentoId: 'est-exemplo-2-P3', categoria: 'aclaramento', tipoBase: 'luminaria_30leds', identificacao: '', tipoLampada: '30 LEDs SMD', potenciaW: '6', tensaoV: '100-240', fluxoLuminosoLm: '100', autonomia: '3h fluxo máximo / 6h fluxo mínimo', quantidade: 4 },
    ],
    // Sinalização de emergência — agregado por estrutura (ver
    // normas/MA/sinalizacao.js:TIPOS_PLACA pros códigos válidos).
    sinalizacao: [
      { id: 'sin-ex-1', estruturaId: 'est-exemplo-1', tipoPlaca: 's1_d', quantidade: 2 },
      { id: 'sin-ex-2', estruturaId: 'est-exemplo-1', tipoPlaca: 's14', quantidade: 1 },
      { id: 'sin-ex-3', estruturaId: 'est-exemplo-1', tipoPlaca: 'e5', quantidade: 3 },
      { id: 'sin-ex-4', estruturaId: 'est-exemplo-1', tipoPlaca: 'p2', quantidade: 1 },
      { id: 'sin-ex-5', estruturaId: 'est-exemplo-1', tipoPlaca: 'a2', quantidade: 1 },
      { id: 'sin-ex-6', estruturaId: 'est-exemplo-2', tipoPlaca: 's1_e', quantidade: 3 },
      { id: 'sin-ex-7', estruturaId: 'est-exemplo-2', tipoPlaca: 's2_d', quantidade: 2 },
      { id: 'sin-ex-8', estruturaId: 'est-exemplo-2', tipoPlaca: 's17', quantidade: 3 },
      { id: 'sin-ex-9', estruturaId: 'est-exemplo-2', tipoPlaca: 'e5', quantidade: 4 },
      { id: 'sin-ex-10', estruturaId: 'est-exemplo-2', tipoPlaca: 'e2', quantidade: 2 },
      { id: 'sin-ex-11', estruturaId: 'est-exemplo-2', tipoPlaca: 'a5', quantidade: 1 },
    ],
    // Controle de Materiais de Acabamento e Revestimento — CMAR (ver
    // cmar_calc.js/materiaisAcabamento.js; linhas são por divisão×elemento).
    acabamentos: [
      { id: 'cmar-ex-1', estruturaId: 'est-exemplo-1', chave: 'C-1|piso', origem: 'incombustivel', materialId: 'ceramico', materialNome: 'Produto cerâmico (porcelanato, cerâmica, azulejo)', classeAdotada: 'I', fabricante: '', laudoNumero: '', laudoValidade: '', normasEnsaio: '' },
      { id: 'cmar-ex-2', estruturaId: 'est-exemplo-1', chave: 'C-1|parede', origem: 'incombustivel', materialId: 'alvenaria', materialNome: 'Alvenaria', classeAdotada: 'I', fabricante: '', laudoNumero: '', laudoValidade: '', normasEnsaio: '' },
      { id: 'cmar-ex-3', estruturaId: 'est-exemplo-1', chave: 'C-1|teto', origem: 'manual', materialId: '', materialNome: 'Forro modular em PVC', classeAdotada: 'III-A', fabricante: 'Plasbil', laudoNumero: 'LE-2025-0231', laudoValidade: '2028-02-01', normasEnsaio: 'NBR 9442' },
      { id: 'cmar-ex-4', estruturaId: 'est-exemplo-2', chave: 'A-1|piso', origem: 'incombustivel', materialId: 'ceramico', materialNome: 'Produto cerâmico (porcelanato, cerâmica, azulejo)', classeAdotada: 'I', fabricante: '', laudoNumero: '', laudoValidade: '', normasEnsaio: '' },
      { id: 'cmar-ex-5', estruturaId: 'est-exemplo-2', chave: 'A-1|parede', origem: 'incombustivel', materialId: 'alvenaria', materialNome: 'Alvenaria', classeAdotada: 'I', fabricante: '', laudoNumero: '', laudoValidade: '', normasEnsaio: '' },
      { id: 'cmar-ex-6', estruturaId: 'est-exemplo-2', chave: 'A-1|teto', origem: 'ensaiado', materialId: 'teto-gesso-acartonado', materialNome: 'Gesso acartonado', classeAdotada: 'II-A', fabricante: '', laudoNumero: '', laudoValidade: '', normasEnsaio: '' },
      { id: 'cmar-ex-7', estruturaId: 'est-exemplo-2', chave: 'G-1|piso', origem: 'incombustivel', materialId: 'concreto', materialNome: 'Concreto', classeAdotada: 'I', fabricante: '', laudoNumero: '', laudoValidade: '', normasEnsaio: '' },
      { id: 'cmar-ex-8', estruturaId: 'est-exemplo-2', chave: 'G-1|teto', origem: 'incombustivel', materialId: 'concreto', materialNome: 'Concreto', classeAdotada: 'I', fabricante: '', laudoNumero: '', laudoValidade: '', normasEnsaio: '' },
    ],
    notas: [],
    areaCompartimentacaoHorizontal: {},
    // Acesso de Viatura em Edificações (ver AcessoViaturaPage.jsx) —
    // extensão de via curta o bastante pra não exigir retorno (cujas opções
    // dependem de tabela normativa dinâmica).
    acessoViatura: {
      afastamentoMeioFio: '3', isCondominio: false,
      larguraAdotada: '6', alturaLivreAdotada: '4.5',
      cargaConfirmada: true,
      desnivelLongAdotado: '5', desnivelTransvAdotado: '3',
      temPortao: true, portaoLargura: '4', portaoAltura: '3',
      extensaoVia: '25', tipoRetorno: '', tipoRetornoOutroDesc: '',
      manobraRetornoOk: true, saidaIndepLargura: '', saidaIndepAltura: '',
    },
    // Classificação do Sistema de Hidrantes/Mangotinhos (NT 22 CBMMA) —
    // registro único por projeto (ver ProjetoContext.jsx:INITIAL_STATE.hidrantes).
    hidrantes: {
      estruturasSelecionadas: ['est-exemplo-1', 'est-exemplo-2'],
      tipo: '2', tipoVariante: 0, rti: '45',
      reservatorioMaterial: 'Fibra de vidro', reservatorioExclusivo: true, reservatorioVolumeTotal: '12000',
      reservatorioPosicao: 'elevado',
      bombaExiste: true, bombaJockey: true,
      bombaJockeyPotencia: '1', bombaJockeyVazao: '10', bombaJockeyPressao: '100',
      bombaAcionamento: 'eletrico',
      bombaReserva: false, bombaReservaAcionamento: '',
      bombaAlimentaSprinklers: true,
      bombaEficiencia: '70',
      bombaPotenciaAdotada: '15',
      metodoCalculo: 'valvula',
      succaoAltitude: 5, succaoTemperatura: 30,
      redeMaterial: 'Aço galvanizado',
      recalqueTipo: '', recalqueJustificativaPasseio: '', recalqueEntradas: 2,
      valvulaHidranteDn: 65, valvulaBloqueioTipo: 'gaveta',
      observacoes: 'Sistema tipo 2 (NT 22 CBMMA), rede molhada, com reservatório elevado exclusivo.',
      dimensionamento: null,
    },
    // Complementa o Plano de Emergência / Gerenciamento de Risco (NT 16/2021
    // CBMMA, Anexo B) — ver GerenciamentoRiscoPage.jsx.
    planoEmergencia: {
      localizacaoTipo: 'Urbana',
      caracteristicaVizinhanca: 'Área comercial consolidada, com edificações comerciais e residenciais multifamiliares no entorno imediato.',
      distanciaCBM: '3.5', meiosAjudaExterna: 'Posto de Bombeiros',
      populacaoFlutuante: '35',
      horarioFuncionamento: 'Segunda a sábado, das 08h às 18h; pensionato com ocupação 24 horas.',
      pneTemPessoas: true, pneDescricao: 'Pensionato dispõe de 1 dormitório adaptado no pavimento térreo, próximo à saída principal.',
      riscosLocalizacaoPorEstrutura: {
        'est-exemplo-2': { glp: 'Botijões de GLP armazenados em área ventilada externa, afastada das saídas, no subsolo.' },
      },
      brigadistasProfissionaisQtd: '0',
      telefoneCBM: '193', hospitalReferencia: 'Hospital Municipal Djalma Marques (Socorrão I)',
      ...PROCEDIMENTOS_PADRAO,
    },
    // Campo legado — só a lista de chaves importa (useMedidasObrigatorias lê
    // Object.keys(state.sistemas) pra saber quais medidas existem; o
    // obrigatorio/ativo de cada uma vem de sistemasPorEstrutura, acima).
    sistemas: {
      acesso_viatura:      { obrigatorio: true,  ativo: true  },
      seg_estrutural:      { obrigatorio: true,  ativo: true  },
      compart_horizontal:  { obrigatorio: true,  ativo: true  },
      compart_vertical:    { obrigatorio: true,  ativo: true  },
      controle_acabamento: { obrigatorio: true,  ativo: true  },
      saida_emergencia:    { obrigatorio: true,  ativo: true  },
      gerenciamento_risco: { obrigatorio: true,  ativo: true  },
      brigada:             { obrigatorio: true,  ativo: true  },
      iluminacao:          { obrigatorio: true,  ativo: true  },
      sinalizacao:         { obrigatorio: true,  ativo: true  },
      extintores:          { obrigatorio: true,  ativo: true  },
      hidrantes:           { obrigatorio: true,  ativo: true  },
      alarme:              { obrigatorio: true,  ativo: true  },
      deteccao:            { obrigatorio: true,  ativo: true  },
      sprinklers:          { obrigatorio: true,  ativo: true  },
      controle_fumaca:     { obrigatorio: true,  ativo: true  },
      central_gas:         { obrigatorio: true,  ativo: true  },
      spda:                { obrigatorio: true,  ativo: true  },
    },
  }
}

// Copia avulsa do exemplo, com ID novo a cada clique em "Projeto de teste" —
// varias podem coexistir, e cada uma pode ser excluida definitivamente.
export function criarProjetoExemplo() {
  return { ...newIds(), ...dadosExemplo() }
}

// Copia "fixada", com ID sempre igual (EXEMPLO_FIXO_ID) — usada para garantir
// que sempre exista pelo menos um projeto de exemplo na lista. Se o usuario
// excluir essa copia, ela reaparece no proximo carregamento da pagina.
export function criarProjetoExemploFixo() {
  return {
    ...dadosExemplo(),
    id: EXEMPLO_FIXO_ID,
    createdAt: new Date().toISOString(),
    exemploFixo: true,
  }
}
