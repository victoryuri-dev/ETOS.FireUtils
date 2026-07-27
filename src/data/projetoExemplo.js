import { newIds } from '../context/ProjetoContext'

// Projeto de exemplo com todos os campos preenchidos — usado para testes
// manuais rapidos (Anexo B, revisao final, etc.) sem precisar passar pelo
// wizard inteiro toda vez.
export function criarProjetoExemplo() {
  return {
    ...newIds(),
    nome: 'Loja Comercial Centro (exemplo)', dataInicio: '2026-02-01', fase: 'Em desenvolvimento',
    endereco: 'Rua Grande', numero: '123', complemento: 'Sala 2', bairro: 'Centro', cidade: 'Sao Luis', uf: 'MA', cep: '65010-000',
    situacao: 'nova', anoAlvara: '2027', numeroAlvara: '',
    anoConstrucao: '', situacaoCBM: 'Sem AVCB anterior',
    numeroAVCB: '', validadeAVCB: '', condicoesAtuais: '',
    areaTerreno: '300', areaConstruidaTotal: '250', quantidadePublico: '80', areaComplementar: '20',
    areaMaiorPav: '', peDireito: '',
    usoSubsolo: '', coberturaHabitavel: 'Nao',
    compartVertical: 'Sem compartimentacao',
    fachada: 'Alvenaria com revestimento ceramico', cobertura: 'Telha metalica',
    estruturas: [{
      id: 'est-exemplo-1', nome: 'Estrutura 1',
      areaTotal: '250', altura: '6', alturaPisoPiso: 0,
      nPavimentos: 1, nSubsolos: 0, estrutura: 'Concreto armado',
    }],
    propNome: 'Joao da Silva', propDocumento: '123.456.789-00', propTelefone: '(98) 98888-7777', propEmail: 'joao@exemplo.com',
    respRazaoSocial: 'Loja Comercio Exemplo LTDA', respFantasia: 'Loja Exemplo', respCNPJ: '12.345.678/0001-90',
    respTelefone: '(98) 3222-1111', respEmail: 'contato@lojaexemplo.com',
    cnaePrincipal: '4712-1/00', cnaePrincipalDesc: 'Comercio varejista de mercadorias em geral',
    rtNome: 'Maria Engenheira', rtCpf: '987.654.321-00', rtConselho: 'CREA-MA 123456/D', rtEspecialidade: 'Engenharia Civil',
    rtEmpresa: 'Maria Projetos', rtEmail: 'maria@projetos.com', rtTelefone: '(98) 99999-0000',
    artNumero: 'MA20260012345', artData: '2026-01-05', artTipoServico: 'Projeto', artValorObra: 'R$ 150.000,00',
    pavimentos: [{
      id: 'est-exemplo-1-P1', estruturaId: 'est-exemplo-1', tipo: 'terreo', label: 'Terreo',
      grupo: 'C', divisao: 'C-1', cnae: '4712-1/00', cnaeDesc: 'Comercio varejista', area: '250', acess: [],
    }],
    cargaState: {
      'C-1': { cnae: '4712-1/00', descricao: 'Comercio varejista', cargaIncendio: 300, metodo: 'tabela', valorManual: '' },
    },
    riscosEspeciais: {
      liquidos_inflamaveis: false, fogos_artificio: false, glp: true,
      vasos_pressao: false, produtos_perigosos: false, outros: false,
    },
    riscosOutrosDesc: '',
    sistemas: {
      acesso_viatura:      { obrigatorio: true,  ativo: true  },
      seg_estrutural:      { obrigatorio: true,  ativo: true  },
      compart_horizontal:  { obrigatorio: false, ativo: false },
      compart_vertical:    { obrigatorio: false, ativo: false },
      controle_acabamento: { obrigatorio: false, ativo: false },
      saida_emergencia:    { obrigatorio: true,  ativo: true  },
      gerenciamento_risco: { obrigatorio: false, ativo: false },
      brigada:             { obrigatorio: true,  ativo: true  },
      iluminacao:          { obrigatorio: true,  ativo: true  },
      sinalizacao:         { obrigatorio: true,  ativo: true  },
      extintores:          { obrigatorio: true,  ativo: true  },
      hidrantes:           { obrigatorio: false, ativo: false },
      alarme:              { obrigatorio: false, ativo: false },
      deteccao:            { obrigatorio: false, ativo: false },
      sprinklers:          { obrigatorio: false, ativo: false },
      controle_fumaca:     { obrigatorio: false, ativo: false },
      central_gas:         { obrigatorio: false, ativo: false },
      spda:                { obrigatorio: false, ativo: false },
    },
  }
}
