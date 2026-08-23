import { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

// Gera um ID interno único
export function newIds() {
  return {
    id:        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    createdAt: new Date().toISOString(),
  }
}

// Contador em memória — evita colisão de ID quando várias unidades são
// criadas no mesmo milissegundo (ex.: importação em lote do firedata.json).
let extintorSeq = 0
function idExtintor() {
  extintorSeq += 1
  return `ext-${Date.now().toString(36)}-${extintorSeq}-${Math.random().toString(36).slice(2, 5)}`
}

function novoExtintor(estruturaId, pavimentoId, ambiente) {
  return {
    id: idExtintor(),
    estruturaId, pavimentoId, ambiente: ambiente || '',
    // Capacidade extintora do agente escolhido no projeto — livre para o
    // projetista aumentar, mas sempre nasce preenchida com o mínimo
    // normativo do tipo padrão (pó ABC portátil, item 5.1.1 NT 21 CBMMA).
    tipo: 'po_abc', sobreRodas: false, capacidade: '2-A:20-B:C', quantidade: 1, carga: '',
  }
}

// Mesma lógica de idExtintor — evita colisão entre itens criados no mesmo
// milissegundo (aclaramento e balizamento são adicionados em sequência).
let iluminacaoSeq = 0
function idIluminacao() {
  iluminacaoSeq += 1
  return `ilu-${Date.now().toString(36)}-${iluminacaoSeq}-${Math.random().toString(36).slice(2, 5)}`
}

// Item de iluminação de emergência — granularidade só até pavimento (sem
// ambiente), conforme NT 18 CBMMA / NBR 10898. `categoria` decide o campo
// discriminador ('aclaramento' → tipoEquipamento, 'balizamento' → pontoTipo),
// sempre enviado em `overrides` por quem despacha a ação.
function novoItemIluminacao(estruturaId, pavimentoId, categoria, overrides = {}) {
  return { id: idIluminacao(), estruturaId, pavimentoId, categoria, quantidade: 1, ...overrides }
}

// Mesma lógica de idIluminacao — evita colisão entre especificações
// cadastradas no mesmo milissegundo.
let especEquipSeq = 0
function idEspecEquip() {
  especEquipSeq += 1
  return `spec-${Date.now().toString(36)}-${especEquipSeq}-${Math.random().toString(36).slice(2, 5)}`
}

// Especificação técnica de um equipamento de aclaramento (item 5.2, NBR
// 10898) — um mesmo tipo base (ex.: "Luminária de Emergência 30 LEDs") pode
// ter várias especificações cadastradas (ex.: variantes com fluxo luminoso
// diferente), cada uma virando uma opção própria nos quantitativos por
// pavimento (ver IluminacaoPage.jsx). `preset`, quando informado (ver
// PRESETS_EQUIPAMENTO em normas/MA/iluminacao.js), pré-preenche os campos
// técnicos — sempre editável depois. `identificacao` é livre; quando vazia,
// a tela/memorial mostram um nome padrão calculado (ver nomeEspecificacao
// em iluminacao_calc.js). `id`, quando informado, vem de quem despachou a
// ação (IluminacaoPage.jsx gera o id antes de despachar para poder abrir a
// linha nova já expandida assim que ela aparecer) — sem isso, gera um novo.
function novaEspecificacaoEquipamento(tipoBase, preset, id) {
  return {
    id: id || idEspecEquip(), tipoBase, identificacao: '',
    tipoLampada: preset?.tipoLampada || '',
    potenciaW: preset?.potenciaW || '',
    tensaoV: preset?.tensaoV || '',
    fluxoLuminosoLm: preset?.fluxoLuminosoLm || '',
    autonomia: preset?.autonomia || '',
  }
}

// Mesma lógica de idExtintor/idIluminacao — evita colisão entre placas
// cadastradas no mesmo milissegundo.
let sinalizacaoSeq = 0
function idSinalizacao() {
  sinalizacaoSeq += 1
  return `sin-${Date.now().toString(36)}-${sinalizacaoSeq}-${Math.random().toString(36).slice(2, 5)}`
}

// Item de sinalização de emergência — granularidade só até pavimento (sem
// ambiente), conforme NT 20 CBMMA / NBR 13434. `tipoPlaca` referencia a
// chave do catálogo em normas/MA/sinalizacao.js (TIPOS_PLACA).
function novoItemSinalizacao(estruturaId, pavimentoId, tipoPlaca, quantidade) {
  return { id: idSinalizacao(), estruturaId, pavimentoId, tipoPlaca, quantidade }
}

// Normaliza um estado salvo (localStorage ou payload de LOAD) contra
// INITIAL_STATE — protege objetos aninhados que ganharam campos novos desde
// que o projeto foi salvo (ex.: manobraRetornoOk, iluminacaoSistema.especi-
// ficacoes) de sumirem só porque o resto do objeto salvo já existia. Usada
// tanto na hidratação inicial (boot/F5) quanto na ação 'LOAD' — as duas
// precisam da mesma proteção, senão um estado salvo com o formato antigo
// quebra o reducer (ex.: `especificacoes` inexistente vira `undefined`,
// não iterável).
// Migra projetos salvos antes de cargaState/sistemas/riscosEspeciais virarem
// por-estrutura. Formato antigo: cargaState tinha o codigo da divisao (ex:
// "C-1") como chave direta; sistemas/riscosEspeciais eram um unico objeto
// pro projeto inteiro. Best-effort: joga tudo pra primeira estrutura (cobre
// o caso comum de projeto com uma estrutura so — com mais de uma, o usuario
// precisa reclassificar as demais).
function migrarParaPorEstrutura(saved) {
  const firstEstId = saved.estruturas?.[0]?.id
  const estIds = new Set((saved.estruturas || []).map(e => e.id))

  let cargaState = saved.cargaState || {}
  const cargaKeys = Object.keys(cargaState)
  const cargaFormatoAntigo = cargaKeys.length > 0 && !cargaKeys.some(k => estIds.has(k))
  if (cargaFormatoAntigo && firstEstId) cargaState = { [firstEstId]: cargaState }

  let sistemasPorEstrutura = saved.sistemasPorEstrutura || {}
  if (saved.sistemas && !saved.sistemasPorEstrutura && firstEstId) {
    const ativos = {}
    Object.entries(saved.sistemas).forEach(([k, v]) => { if (v?.ativo) ativos[k] = true })
    if (Object.keys(ativos).length) sistemasPorEstrutura = { [firstEstId]: ativos }
  }

  let riscosEspeciaisPorEstrutura = saved.riscosEspeciaisPorEstrutura || {}
  if (saved.riscosEspeciais && !saved.riscosEspeciaisPorEstrutura && firstEstId) {
    riscosEspeciaisPorEstrutura = { [firstEstId]: saved.riscosEspeciais }
  }

  let riscosOutrosDescPorEstrutura = saved.riscosOutrosDescPorEstrutura || {}
  if (saved.riscosOutrosDesc && !saved.riscosOutrosDescPorEstrutura && firstEstId) {
    riscosOutrosDescPorEstrutura = { [firstEstId]: saved.riscosOutrosDesc }
  }

  return { cargaState, sistemasPorEstrutura, riscosEspeciaisPorEstrutura, riscosOutrosDescPorEstrutura }
}

function hydrateState(saved) {
  return {
    ...INITIAL_STATE,
    ...saved,
    acessoViatura: { ...INITIAL_STATE.acessoViatura, ...(saved.acessoViatura || {}) },
    iluminacaoSistema: { ...INITIAL_STATE.iluminacaoSistema, ...(saved.iluminacaoSistema || {}) },
    ...migrarParaPorEstrutura(saved),
  }
}

// Remove uma chave de um objeto sem mutar o original — usado pra limpar os
// mapas por-estrutura (cargaState, sistemasPorEstrutura, etc.) quando uma
// estrutura e removida.
function semChave(obj, key) {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key))
}

// Valor base de riscosEspeciaisPorEstrutura[estruturaId] — replicado (nao
// referenciado) sempre que uma estrutura ainda nao tem entrada.
const RISCOS_DEFAULT = {
  liquidos_inflamaveis: false, fogos_artificio: false, glp: false,
  vasos_pressao: false, produtos_perigosos: false, outros: false,
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

// Pavimento térreo padrão de uma estrutura recém-criada — toda estrutura
// nasce com nPavimentos:1/nSubsolos:0, então já cadastra este único
// pavimento de saída, em vez de deixar `pavimentos` vazio até o usuário
// mexer nos campos do Step2 (mesmo formato produzido pelo térreo em
// REBUILD_PAVIMENTOS, que o reaproveita ao invés de recriar quando os
// valores mudam).
function pavimentoTerreo(estruturaId) {
  return { id: `${estruturaId}-P1`, estruturaId, tipo:'terreo', label: 'Terreo', grupo: 'E', divisao: 'E-1', cnae: '', cnaeDesc: '', area: '', acess: [] }
}

const INITIAL_STATE = {
  id: '', createdAt: '', saveReady: false,
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
  pavimentos: [pavimentoTerreo('est-1')],
  // Todos por-estrutura: chave = id da estrutura. cargaState guarda, dentro
  // de cada estrutura, o codigo da divisao (ex: "C-1"). sistemasPorEstrutura
  // guarda so o "ativo" manual (opcional habilitado) — o obrigatorio vem do
  // motor de normas (useMedidasObrigatorias). riscosEspeciaisPorEstrutura
  // segue o formato de RISCOS_DEFAULT.
  cargaState: {},
  sistemasPorEstrutura: {},
  riscosEspeciaisPorEstrutura: {},
  riscosOutrosDescPorEstrutura: {},
  extintores: [],
  iluminacao: [],
  sinalizacao: [],
  // Sistema de iluminação de emergência escolhido para o projeto todo (não
  // varia por pavimento) — perguntado antes de liberar as quantidades por
  // pavimento em IluminacaoPage.jsx. `localizacaoFonte` só se aplica a
  // 'central'/'motogerador'. `especificacoes` guarda as especificações
  // técnicas (item 5.2, NBR 10898) cadastradas para os equipamentos de
  // aclaramento — uma lista, pois um mesmo tipo base (ver
  // EQUIPAMENTOS_ACLARAMENTO em normas/MA/iluminacao.js) pode ter mais de
  // uma variante (ex.: fluxos luminosos diferentes).
  iluminacaoSistema: {
    tipo: '', // '' | 'bloco_autonomo' | 'central' | 'motogerador'
    localizacaoFonte: '',
    especificacoes: [],
  },
  // Resposta por pavimento à pergunta "foram aplicadas luminárias de
  // balizamento neste pavimento?" — chave = pavimentoId, valor true/false.
  // Ausente = ainda não respondida (a tela pergunta antes de liberar o
  // checklist de quantidades).
  iluminacaoBalizamentoAplicado: {},
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
  sistemas: {
    // acesso_viatura, seg_estrutural e brigada NAO sao universais: a Tabela 5
    // (simplificado) nunca exige as duas primeiras, e brigada so e exigida
    // para alguns grupos/divisoes (ex: nao exigida para A/B/C/D no
    // simplificado). Por isso partem desmarcadas — quem decide se sao
    // obrigatorias e o motor de normas (useMedidasObrigatorias), nao o seed.
    acesso_viatura:      { obrigatorio: false, ativo: false },
    seg_estrutural:      { obrigatorio: false, ativo: false },
    compart_horizontal:  { obrigatorio: false, ativo: false },
    compart_vertical:    { obrigatorio: false, ativo: false },
    controle_acabamento: { obrigatorio: false, ativo: false },
    saida_emergencia:    { obrigatorio: true,  ativo: true  },
    gerenciamento_risco: { obrigatorio: false, ativo: false },
    brigada:             { obrigatorio: false, ativo: false },
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
    case 'ADD_ESTRUTURA': {
      const est = novaEstrutura(`Estrutura ${state.estruturas.length + 1}`)
      return { ...state, estruturas: [...state.estruturas, est], pavimentos: [...state.pavimentos, pavimentoTerreo(est.id)] }
    }
    case 'REMOVE_ESTRUTURA': {
      if (state.estruturas.length <= 1) return state
      return {
        ...state,
        estruturas: state.estruturas.filter(e => e.id !== action.id),
        pavimentos: state.pavimentos.filter(p => p.estruturaId !== action.id),
        extintores: state.extintores.filter(e => e.estruturaId !== action.id),
        iluminacao: state.iluminacao.filter(i => i.estruturaId !== action.id),
        sinalizacao: state.sinalizacao.filter(s => s.estruturaId !== action.id),
        cargaState: semChave(state.cargaState, action.id),
        sistemasPorEstrutura: semChave(state.sistemasPorEstrutura, action.id),
        riscosEspeciaisPorEstrutura: semChave(state.riscosEspeciaisPorEstrutura, action.id),
        riscosOutrosDescPorEstrutura: semChave(state.riscosOutrosDescPorEstrutura, action.id),
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
      list.push(ter || pavimentoTerreo(estruturaId))
      for (let p = 2; p <= nPav; p++) {
        const id = `${estruturaId}-P${p}`
        list.push(find(id) || { id, estruturaId, tipo:'pav', label: `Pavimento ${p}`, grupo: 'E', divisao: 'E-1', cnae: '', cnaeDesc: '', area: '', acess: [] })
      }
      const idsValidos = new Set(list.map(p => p.id))
      return {
        ...state,
        pavimentos: [...others, ...list],
        extintores: state.extintores.filter(e => e.estruturaId !== estruturaId || idsValidos.has(e.pavimentoId)),
        iluminacao: state.iluminacao.filter(i => i.estruturaId !== estruturaId || idsValidos.has(i.pavimentoId)),
        sinalizacao: state.sinalizacao.filter(s => s.estruturaId !== estruturaId || idsValidos.has(s.pavimentoId)),
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
    // Substitui só o cadastro de extintores das estruturas presentes no
    // lote importado (ver resolverImportacao em ExtintoresPage.jsx) — os
    // itens já chegam com estruturaId/pavimentoId resolvidos contra o
    // projeto atual. Preserva o cadastro das demais estruturas, já que
    // cada arquivo Revit sincroniza uma estrutura por vez.
    case 'IMPORT_EXTINTORES': {
      const estruturasDoLote = new Set(action.itens.map(it => it.estruturaId))
      const preservados = state.extintores.filter(e => !estruturasDoLote.has(e.estruturaId))
      return { ...state, extintores: [...preservados, ...action.itens.map(it => ({ id: idExtintor(), ...it }))] }
    }
    case 'ADD_ILUMINACAO':
      return { ...state, iluminacao: [...state.iluminacao, novoItemIluminacao(action.estruturaId, action.pavimentoId, action.categoria, action.overrides)] }
    case 'UPDATE_ILUMINACAO':
      return { ...state, iluminacao: state.iluminacao.map(i => i.id === action.id ? { ...i, ...action.changes } : i) }
    case 'REMOVE_ILUMINACAO':
      return { ...state, iluminacao: state.iluminacao.filter(i => i.id !== action.id) }
    case 'SET_ILUMINACAO_SISTEMA':
      return { ...state, iluminacaoSistema: { ...state.iluminacaoSistema, ...action.changes } }
    // Switch liga/desliga de um tipo base de equipamento — ligar cria uma
    // especificação default (se ainda não houver nenhuma desse tipo);
    // desligar remove todas as especificações desse tipo e os quantitativos
    // de aclaramento que já as referenciavam em algum pavimento.
    case 'SET_EQUIPAMENTO_USADO': {
      const { tipoBase, usado, preset, id } = action
      const especIds = new Set(state.iluminacaoSistema.especificacoes.filter(s => s.tipoBase === tipoBase).map(s => s.id))
      if (usado) {
        if (especIds.size > 0) return state
        return {
          ...state,
          iluminacaoSistema: {
            ...state.iluminacaoSistema,
            especificacoes: [...state.iluminacaoSistema.especificacoes, novaEspecificacaoEquipamento(tipoBase, preset, id)],
          },
        }
      }
      return {
        ...state,
        iluminacaoSistema: {
          ...state.iluminacaoSistema,
          especificacoes: state.iluminacaoSistema.especificacoes.filter(s => s.tipoBase !== tipoBase),
        },
        iluminacao: state.iluminacao.filter(i => !(i.categoria === 'aclaramento' && especIds.has(i.tipoEquipamento))),
      }
    }
    case 'ADD_ESPECIFICACAO_EQUIPAMENTO':
      return {
        ...state,
        iluminacaoSistema: {
          ...state.iluminacaoSistema,
          especificacoes: [...state.iluminacaoSistema.especificacoes, novaEspecificacaoEquipamento(action.tipoBase, action.preset, action.id)],
        },
      }
    case 'UPDATE_ESPECIFICACAO_EQUIPAMENTO':
      return {
        ...state,
        iluminacaoSistema: {
          ...state.iluminacaoSistema,
          especificacoes: state.iluminacaoSistema.especificacoes.map(s => s.id === action.id ? { ...s, ...action.changes } : s),
        },
      }
    // Remove a especificação e também os quantitativos de aclaramento que já
    // referenciavam ela em algum pavimento — evita item órfão apontando para
    // uma especificação inexistente.
    case 'REMOVE_ESPECIFICACAO_EQUIPAMENTO':
      return {
        ...state,
        iluminacaoSistema: {
          ...state.iluminacaoSistema,
          especificacoes: state.iluminacaoSistema.especificacoes.filter(s => s.id !== action.id),
        },
        iluminacao: state.iluminacao.filter(i => !(i.categoria === 'aclaramento' && i.tipoEquipamento === action.id)),
      }
    case 'ADD_SINALIZACAO':
      return { ...state, sinalizacao: [...state.sinalizacao, novoItemSinalizacao(action.estruturaId, action.pavimentoId, action.tipoPlaca, action.quantidade)] }
    case 'UPDATE_SINALIZACAO':
      return { ...state, sinalizacao: state.sinalizacao.map(s => s.id === action.id ? { ...s, ...action.changes } : s) }
    case 'REMOVE_SINALIZACAO':
      return { ...state, sinalizacao: state.sinalizacao.filter(s => s.id !== action.id) }
    // Substitui todo o cadastro de sinalização pelo lote importado do
    // firedata.json (ver resolverImportacaoSinalizacao em SinalizacaoPage.jsx) —
    // os itens já chegam com estruturaId/pavimentoId resolvidos contra o
    // projeto atual.
    case 'IMPORT_SINALIZACAO':
      return { ...state, sinalizacao: action.itens.map(it => ({ id: idSinalizacao(), ...it })) }
    case 'SET_BALIZAMENTO_APLICADO':
      return { ...state, iluminacaoBalizamentoAplicado: { ...state.iluminacaoBalizamentoAplicado, [action.pavimentoId]: action.valor } }
    case 'SET_ACESSO_VIATURA':
      return { ...state, acessoViatura: { ...state.acessoViatura, ...action.changes } }
    case 'SET_WIZARD':
      return { ...state, configStep: action.step, configUnlocked: action.unlocked }
    case 'SET_CARGA': {
      const { estruturaId, code } = action
      const doEst = state.cargaState[estruturaId] || {}
      return {
        ...state,
        cargaState: {
          ...state.cargaState,
          [estruturaId]: { ...doEst, [code]: { ...(doEst[code] || {}), ...action.changes } },
        },
      }
    }
    case 'INIT_CARGA': {
      const { estruturaId } = action
      const next = { ...(state.cargaState[estruturaId] || {}) }
      action.divisoes.forEach(d => { if (!next[d]) next[d] = { cnae: '', descricao: '', cargaIncendio: null, metodo: 'tabela', valorManual: '' } })
      return { ...state, cargaState: { ...state.cargaState, [estruturaId]: next } }
    }
    case 'TOGGLE_SISTEMA_ESTRUTURA': {
      const { estruturaId, key } = action
      const atual = !!state.sistemasPorEstrutura[estruturaId]?.[key]
      return {
        ...state,
        sistemasPorEstrutura: {
          ...state.sistemasPorEstrutura,
          [estruturaId]: { ...state.sistemasPorEstrutura[estruturaId], [key]: !atual },
        },
      }
    }
    case 'TOGGLE_RISCO_ESTRUTURA': {
      const { estruturaId, key } = action
      const base = state.riscosEspeciaisPorEstrutura[estruturaId] || RISCOS_DEFAULT
      return {
        ...state,
        riscosEspeciaisPorEstrutura: {
          ...state.riscosEspeciaisPorEstrutura,
          [estruturaId]: { ...base, [key]: !base[key] },
        },
      }
    }
    case 'SET_RISCO_OUTROS_DESC':
      return { ...state, riscosOutrosDescPorEstrutura: { ...state.riscosOutrosDescPorEstrutura, [action.estruturaId]: action.value } }
    case 'LOAD':
      return { ...hydrateState(action.payload), saveReady: true }
    case 'NEW_PROJECT': {
      const est = novaEstrutura('Estrutura 1')
      return { ...INITIAL_STATE, id: action.id, createdAt: action.createdAt, estruturas: [est], pavimentos: [pavimentoTerreo(est.id)], saveReady: true }
    }
    default: return state
  }
}

const Ctx = createContext(null)

export function ProjetoProvider({ children }) {
  const { user } = useAuth()
  const saveTimer = useRef(null)
  // Versão conhecida da linha no Postgres — fica FORA do state de propósito.
  // Se fosse parte do state, atualizá-la depois de cada save disparmissão
  // este próprio efeito de novo (state muda → efeito roda → salva de novo,
  // em loop). Quem carrega o projeto (ProjectLayout) informa a versão via
  // `definirVersaoConhecida`; enquanto for null, autosave fica pausado.
  const versaoRef = useRef(null)
  const [conflito, setConflito] = useState(false)

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, (init) => {
    try {
      const s = localStorage.getItem('etos-projeto')
      if (s) {
        const saved = JSON.parse(s)
        // Migração: projetos salvos antes de ter id recebem um novo
        if (!saved.id) Object.assign(saved, newIds())
        return { ...hydrateState(saved), saveReady: true }
      }
    } catch {}
    // Placeholder em branco — sem cache local nenhum ainda pra confirmar
    // que este é de fato o projeto certo. `saveReady` fica false até um
    // LOAD ou NEW_PROJECT confirmar a identidade, pra nunca autosalvar
    // (e sujar o Postgres com) um "projeto fantasma" antes da hora — ver
    // Regra no autosave effect abaixo.
    return { ...init, ...newIds() }
  })

  const definirVersaoConhecida = v => { versaoRef.current = v; setConflito(false) }

  // Autosave: grava instantâneo no localStorage (cache local/offline) e, se
  // houver usuário logado, sincroniza com o Postgres em background — debounced
  // pra não disparar uma escrita remota a cada tecla digitada.
  //
  // A escrita é condicional à versão (compare-and-swap): só grava se a
  // versão que esta aba conhece ainda bate com a do banco. Se não bater,
  // outra sessão salvou por cima enquanto esta editava — em vez de
  // sobrescrever silenciosamente (perdendo a mudança da outra sessão),
  // marca `conflito` e para de tentar salvar até o usuário recarregar.
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

    if (!user || !state.id || !state.saveReady || conflito || versaoRef.current == null) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      const versaoLocal = versaoRef.current
      const { data, error } = await supabase
        .from('projetos')
        .update({ dados: toSave, nome: state.nome || 'Projeto sem nome', version: versaoLocal + 1, updated_at: toSave.updatedAt })
        .eq('id', state.id).eq('user_id', user.id).eq('version', versaoLocal)
        .select('version')

      if (error) { console.error('Falha ao sincronizar projeto com o Supabase:', error.message); return }

      if (!data || data.length === 0) {
        // Nenhuma linha afetada: ou a versão mudou (conflito) ou o projeto
        // ainda não existe no Postgres (primeiro save de um projeto novo).
        const { data: existente } = await supabase.from('projetos').select('id').eq('id', state.id).maybeSingle()
        if (existente) { setConflito(true); return }
        const { error: insertErr } = await supabase.from('projetos').insert({
          id: state.id, user_id: user.id, nome: state.nome || 'Projeto sem nome', dados: toSave, version: 1,
        })
        if (insertErr) console.error('Falha ao criar projeto no Supabase:', insertErr.message)
        else versaoRef.current = 1
        return
      }
      versaoRef.current = data[0].version
    }, 800)
    return () => clearTimeout(saveTimer.current)
  }, [state, user, conflito])

  return (
    <Ctx.Provider value={{ state, dispatch, conflito, definirVersaoConhecida }}>
      {children}
    </Ctx.Provider>
  )
}

export function useProjeto() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useProjeto fora do ProjetoProvider')
  return ctx
}
