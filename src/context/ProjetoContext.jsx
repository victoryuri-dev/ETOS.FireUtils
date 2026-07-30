import { createContext, useContext, useReducer, useEffect } from 'react'

// Gera um ID interno único + ID de exibição sequencial
export function newIds() {
  const seq = (parseInt(localStorage.getItem('etos-seq') || '0')) + 1
  localStorage.setItem('etos-seq', String(seq))
  return {
    id:       `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    seqId:    `PRJ-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
  }
}

function novoExtintor(estruturaId, pavimentoId, ambiente) {
  return {
    id: `ext-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    estruturaId, pavimentoId, ambiente: ambiente || '',
    // Capacidade extintora do agente escolhido no projeto — livre para o
    // projetista aumentar, mas sempre nasce preenchida com o mínimo
    // normativo do tipo padrão (pó ABC portátil, item 5.1.1 NT 21 CBMMA).
    tipo: 'po_abc', sobreRodas: false, capacidade: '2-A:20-B:C', quantidade: 1,
  }
}

function novaEstrutura(nome) {
  return {
    id: `est-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    nome,
    areaTotal: '', altura: '', alturaPisoPiso: 0,
    nPavimentos: 1, nSubsolos: 0, profundidadeSubsolo: '',
    estrutura: ['Concreto armado'],
    obsSegEstrutural: '',
  }
}

const INITIAL_STATE = {
  id: '', seqId: '', createdAt: '',
  configStep: 1, configUnlocked: 1,
  nome: '', dataInicio: '', fase: 'Em desenvolvimento',
  endereco: '', numero: '', complemento: '', bairro: '', cidade: '', uf: 'MA', cep: '',
  situacao: 'nova', anoAlvara: '', numeroAlvara: '',
  anoConstrucao: '', situacaoCBM: 'Sem AVCB anterior',
  numeroAVCB: '', validadeAVCB: '', condicoesAtuais: '',
  areaTerreno: '', areaConstruidaTotal: '', quantidadePublico: '', areaComplementar: '',
  areaMaiorPav: '', peDireito: '',
  usoSubsolo: '', coberturaHabitavel: 'Nao',
  compartVertical: 'Sem compartimentacao',
  fachada: 'Convencional', cobertura: 'Laje impermeabilizada',
  estruturas: [{ id: 'est-1', nome: 'Estrutura 1', areaTotal: '', altura: '', alturaPisoPiso: 0, nPavimentos: 1, nSubsolos: 0, profundidadeSubsolo: '', estrutura: ['Concreto armado'], obsSegEstrutural: '' }],
  propNome: '', propDocumento: '', propTelefone: '', propEmail: '',
  respRazaoSocial: '', respFantasia: '', respCNPJ: '', respTelefone: '', respEmail: '',
  cnaePrincipal: '', cnaePrincipalDesc: '',
  rtNome: '', rtCpf: '', rtConselho: '', rtEspecialidade: 'Engenharia Civil',
  rtEmpresa: '', rtEmail: '', rtTelefone: '',
  artNumero: '', artData: '', artTipoServico: 'Projeto', artValorObra: '',
  pavimentos: [],
  cargaState: {},
  extintores: [],
  acessoViatura: {
    afastamentoMeioFio: '', isCondominio: false,
    larguraAdotada: '', alturaLivreAdotada: '',
    cargaConfirmada: false,
    desnivelLongAdotado: '', desnivelTransvAdotado: '',
    temPortao: false, portaoLargura: '', portaoAltura: '',
    extensaoVia: '', tipoRetorno: '', tipoRetornoOutroDesc: '',
    manobraRetornoOk: true, saidaIndepLargura: '', saidaIndepAltura: '',
    distanciaAdotada: '',
  },
  riscosEspeciais: {
    liquidos_inflamaveis: false, fogos_artificio: false, glp: false,
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

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'ADD_ESTRUTURA':
      return { ...state, estruturas: [...state.estruturas, novaEstrutura(`Estrutura ${state.estruturas.length + 1}`)] }
    case 'REMOVE_ESTRUTURA': {
      if (state.estruturas.length <= 1) return state
      return {
        ...state,
        estruturas: state.estruturas.filter(e => e.id !== action.id),
        pavimentos: state.pavimentos.filter(p => p.estruturaId !== action.id),
        extintores: state.extintores.filter(e => e.estruturaId !== action.id),
      }
    }
    case 'RENAME_ESTRUTURA':
      return { ...state, estruturas: state.estruturas.map(e => e.id === action.id ? { ...e, nome: action.nome } : e) }
    case 'SET_ESTRUTURA_FIELD':
      return { ...state, estruturas: state.estruturas.map(e => e.id === action.id ? { ...e, [action.field]: action.value } : e) }
    case 'REBUILD_PAVIMENTOS': {
      const { estruturaId, nPav, nSub } = action
      const own    = state.pavimentos.filter(p => p.estruturaId === estruturaId)
      const others = state.pavimentos.filter(p => p.estruturaId !== estruturaId)
      const find = (id) => own.find(p => p.id === id)
      const list = []
      for (let s = nSub; s >= 1; s--) {
        const id = `${estruturaId}-sub-${s}`
        list.push(find(id) || { id, estruturaId, tipo:'subsolo', label: `Subsolo ${s}`, grupo: 'G', divisao: 'G-1', cnae: '', cnaeDesc: '', area: '', acess: [] })
      }
      const terId = `${estruturaId}-P1`
      const ter = find(terId)
      list.push(ter || { id: terId, estruturaId, tipo:'terreo', label: 'Terreo', grupo: 'E', divisao: 'E-1', cnae: '', cnaeDesc: '', area: '', acess: [] })
      for (let p = 2; p <= nPav; p++) {
        const id = `${estruturaId}-P${p}`
        list.push(find(id) || { id, estruturaId, tipo:'pav', label: `Pavimento ${p}`, grupo: 'E', divisao: 'E-1', cnae: '', cnaeDesc: '', area: '', acess: [] })
      }
      const idsValidos = new Set(list.map(p => p.id))
      return {
        ...state,
        pavimentos: [...others, ...list],
        extintores: state.extintores.filter(e => e.estruturaId !== estruturaId || idsValidos.has(e.pavimentoId)),
      }
    }
    case 'UPDATE_PAV':
      return { ...state, pavimentos: state.pavimentos.map(p => p.id === action.id ? { ...p, ...action.changes } : p) }
    case 'REPLICATE_TERREO': {
      const { estruturaId } = action
      const t = state.pavimentos.find(p => p.estruturaId === estruturaId && p.tipo === 'terreo')
      if (!t) return state
      return {
        ...state,
        pavimentos: state.pavimentos.map(p => (p.estruturaId !== estruturaId || p.id === t.id)
          ? p
          : { ...p, grupo: t.grupo, divisao: t.divisao, cnae: t.cnae, cnaeDesc: t.cnaeDesc, acess: t.acess.map(a => ({...a})) }),
      }
    }
    case 'ADD_ACESS':
      return { ...state, pavimentos: state.pavimentos.map(p => p.id === action.id ? { ...p, acess: [...p.acess, { divisao: 'C-1', cnae: '', cnaeDesc: '', area: '' }] } : p) }
    case 'REMOVE_ACESS':
      return { ...state, pavimentos: state.pavimentos.map(p => p.id === action.id ? { ...p, acess: p.acess.filter((_, i) => i !== action.index) } : p) }
    case 'UPDATE_ACESS':
      return { ...state, pavimentos: state.pavimentos.map(p => p.id === action.id ? { ...p, acess: p.acess.map((a, i) => i === action.index ? { ...a, ...action.changes } : a) } : p) }
    case 'ADD_EXTINTOR':
      return { ...state, extintores: [...state.extintores, novoExtintor(action.estruturaId, action.pavimentoId, action.ambiente)] }
    case 'UPDATE_EXTINTOR':
      return { ...state, extintores: state.extintores.map(e => e.id === action.id ? { ...e, ...action.changes } : e) }
    case 'REMOVE_EXTINTOR':
      return { ...state, extintores: state.extintores.filter(e => e.id !== action.id) }
    case 'RENAME_AMBIENTE_EXTINTOR':
      return {
        ...state,
        extintores: state.extintores.map(e =>
          (e.estruturaId === action.estruturaId && e.pavimentoId === action.pavimentoId && e.ambiente === action.ambienteAntigo)
            ? { ...e, ambiente: action.ambienteNovo } : e),
      }
    case 'REMOVE_AMBIENTE_EXTINTOR':
      return {
        ...state,
        extintores: state.extintores.filter(e =>
          !(e.estruturaId === action.estruturaId && e.pavimentoId === action.pavimentoId && e.ambiente === action.ambiente)),
      }
    case 'SET_ACESSO_VIATURA':
      return { ...state, acessoViatura: { ...state.acessoViatura, ...action.changes } }
    case 'SET_WIZARD':
      return { ...state, configStep: action.step, configUnlocked: action.unlocked }
    case 'SET_CARGA':
      return { ...state, cargaState: { ...state.cargaState, [action.code]: { ...(state.cargaState[action.code] || {}), ...action.changes } } }
    case 'INIT_CARGA': {
      const next = { ...state.cargaState }
      action.divisoes.forEach(d => { if (!next[d]) next[d] = { cnae: '', descricao: '', cargaIncendio: null, metodo: 'tabela', valorManual: '' } })
      return { ...state, cargaState: next }
    }
    case 'TOGGLE_SISTEMA':
      return { ...state, sistemas: { ...state.sistemas, [action.key]: { ...state.sistemas[action.key], ativo: !state.sistemas[action.key].ativo } } }
    case 'TOGGLE_RISCO':
      return { ...state, riscosEspeciais: { ...state.riscosEspeciais, [action.key]: !state.riscosEspeciais[action.key] } }
    case 'LOAD':
      // acessoViatura mesclado a parte: projetos salvos antes de um campo novo
      // existir (ex.: manobraRetornoOk) não podem perder o valor padrão dele
      // só porque o resto do objeto já foi salvo.
      return {
        ...INITIAL_STATE,
        ...action.payload,
        acessoViatura: { ...INITIAL_STATE.acessoViatura, ...(action.payload.acessoViatura || {}) },
      }
    case 'NEW_PROJECT':
      return { ...INITIAL_STATE, id: action.id, seqId: action.seqId, createdAt: action.createdAt, estruturas: [novaEstrutura('Estrutura 1')] }
    default: return state
  }
}

const Ctx = createContext(null)

export function ProjetoProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, (init) => {
    try {
      const s = localStorage.getItem('etos-projeto')
      if (s) {
        const saved = JSON.parse(s)
        // Migração: projetos salvos antes de ter id recebem um novo
        if (!saved.id) Object.assign(saved, newIds())
        return { ...init, ...saved }
      }
    } catch {}
    return { ...init, ...newIds() }
  })

  useEffect(() => {
    const toSave = { ...state, updatedAt: new Date().toISOString() }
    localStorage.setItem('etos-projeto', JSON.stringify(toSave))
    if (state.id) {
      try {
        const raw = localStorage.getItem('etos-projetos')
        const list = raw ? JSON.parse(raw) : {}
        list[state.id] = toSave
        localStorage.setItem('etos-projetos', JSON.stringify(list))
      } catch {}
    }
  }, [state])
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}

export function useProjeto() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useProjeto fora do ProjetoProvider')
  return ctx
}
