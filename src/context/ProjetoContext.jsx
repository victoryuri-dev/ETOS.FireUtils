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

function novaEstrutura(nome) {
  return {
    id: `est-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    nome,
    areaTotal: '', altura: '', alturaPisoPiso: 0,
    nPavimentos: 1, nSubsolos: 0,
    estrutura: 'Concreto armado',
  }
}

const INITIAL_STATE = {
  id: '', seqId: '', createdAt: '',
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
  estruturas: [{ id: 'est-1', nome: 'Estrutura 1', areaTotal: '', altura: '', alturaPisoPiso: 0, nPavimentos: 1, nSubsolos: 0, estrutura: 'Concreto armado' }],
  propNome: '', propDocumento: '', propTelefone: '', propEmail: '',
  respRazaoSocial: '', respFantasia: '', respCNPJ: '', respTelefone: '', respEmail: '',
  cnaePrincipal: '', cnaePrincipalDesc: '',
  rtNome: '', rtCpf: '', rtConselho: '', rtEspecialidade: 'Engenharia Civil',
  rtEmpresa: '', rtEmail: '', rtTelefone: '',
  artNumero: '', artData: '', artTipoServico: 'Projeto', artValorObra: '',
  pavimentos: [],
  cargaState: {},
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
      return { ...state, pavimentos: [...others, ...list] }
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
      return { ...INITIAL_STATE, ...action.payload }
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
