// Monta os dados do Anexo B (NT 01 — CBMMA) a partir do estado do projeto,
// para exibicao na pagina de documentos do site. Campos sem fonte de dados
// no app ficam em branco — nunca inventamos valor.

// Mesma lista/ordem do formulario oficial. `key` aponta para state.sistemas —
// quando null, a medida ainda nao e rastreada pelo app.
export const MEDIDAS_ANEXO_B_COL1 = [
  { key: 'acesso_viatura',      label: 'Acesso de viatura às edificações e áreas de risco' },
  { key: null,                  label: 'Isolamento de risco' },
  { key: 'seg_estrutural',      label: 'Segurança estrutural contra incêndio' },
  { key: 'compart_horizontal',  label: 'Compartimentação horizontal' },
  { key: 'compart_vertical',    label: 'Compartimentação vertical' },
  { key: 'controle_acabamento', label: 'Controle de Material de Acabamento e Revestimento' },
  { key: 'saida_emergencia',    label: 'Saídas de emergência' },
  { key: null,                  label: 'Elevador de emergência' },
  { key: 'controle_fumaca',     label: 'Controle de fumaça' },
  { key: 'gerenciamento_risco', label: 'Gerenciamento de Risco' },
  { key: 'brigada',             label: 'Brigada de incêndio' },
]

export const MEDIDAS_ANEXO_B_COL2 = [
  { key: 'iluminacao',  label: 'Iluminação de emergência' },
  { key: 'deteccao',    label: 'Detecção de incêndio' },
  { key: 'alarme',      label: 'Alarme de incêndio' },
  { key: 'sinalizacao', label: 'Sinalização de emergência' },
  { key: 'extintores',  label: 'Extintores' },
  { key: 'hidrantes',   label: 'Hidrantes e mangotinhos' },
  { key: 'sprinklers',  label: 'Chuveiros automáticos' },
  { key: null,          label: 'Sistema de resfriamento' },
  { key: null,          label: 'Sistema de espuma' },
  { key: 'central_gas', label: 'Sistema de gases fixos' },
  { key: null,          label: 'Controle de fontes de ignição' },
]

// `key` aponta para state.riscosEspeciaisPorEstrutura[estruturaId]
export const RISCOS_ESPECIAIS = [
  { key: 'liquidos_inflamaveis', label: 'Armazenamento de líquidos inflamáveis' },
  { key: 'fogos_artificio',      label: 'Armazenamento ou revenda de fogos de artifícios' },
  { key: 'glp',                  label: 'Uso de Gás Liquefeito de Petróleo' },
  { key: 'vasos_pressao',        label: 'Vasos sob pressão (caldeiras)' },
  { key: 'produtos_perigosos',   label: 'Armazenamento de produtos perigosos' },
  { key: 'outros',               label: 'Outros (especificar)' },
]

export function buildAnexoBData(state, sistemas) {
  const divisoesSet = new Set()
  ;(state.pavimentos || []).forEach(p => {
    if (p.divisao) divisoesSet.add(p.divisao)
    p.acess?.forEach(a => { if (a.divisao) divisoesSet.add(a.divisao) })
  })
  const classificacaoOcupacao = [...divisoesSet].sort().join(', ')

  const estruturas     = state.estruturas || []
  const areaTotalSum   = estruturas.reduce((s, e) => s + (parseFloat(e.areaTotal) || 0), 0)
  const alturaNum      = estruturas.reduce((mx, e) => Math.max(mx, parseFloat(e.altura) || 0), 0)
  const subsolosSum    = estruturas.reduce((s, e) => s + (parseInt(e.nSubsolos) || 0), 0)
  const estruturaTipos = [...new Set(estruturas.flatMap(e => Array.isArray(e.estrutura) ? e.estrutura : [e.estrutura]).filter(Boolean))].join(', ')

  const maxQ = Object.values(state.cargaState || {}).flatMap(porEst => Object.values(porEst || {})).reduce((acc, c) => {
    const q = c?.metodo === 'levantamento' ? parseFloat(c?.valorManual) || 0 : c?.cargaIncendio || 0
    return Math.max(acc, q)
  }, 0)

  const marcada = (key) => !!(sistemas?.[key]?.ativo || sistemas?.[key]?.obrigatorio)

  return {
    endereco: state.endereco || '',
    numero: state.numero || '',
    cep: state.cep || '',
    bairro: state.bairro || '',
    municipio: state.cidade || '',
    complemento: state.complemento || '',
    uf: state.uf || '',
    proprietario: state.propNome || '',
    proprietarioDocumento: state.propDocumento || '',
    responsavelUso: state.respRazaoSocial || '',
    responsavelDocumento: state.respCNPJ || '',
    responsavelEmail: state.respEmail || '',
    responsavelFone: state.respTelefone || '',
    razaoSocial: state.respRazaoSocial || '',
    cnpj: state.respCNPJ || '',
    nomeFantasia: state.respFantasia || '',
    cnaePrincipal: [state.cnaePrincipal, state.cnaePrincipalDesc].filter(Boolean).join(' — '),
    classificacaoOcupacao,
    areaTotalConstruida: areaTotalSum ? `${areaTotalSum} m²` : '',
    pavimentosSubsolo: subsolosSum ? String(subsolosSum) : '',
    areaTerreno: state.areaTerreno ? `${state.areaTerreno} m²` : '',
    quantidadePublico: state.quantidadePublico ? String(state.quantidadePublico) : '',
    areaComplementar: state.areaComplementar ? `${state.areaComplementar} m²` : '',
    altura: alturaNum ? `${alturaNum} m` : '',
    cargaIncendio: maxQ ? `${maxQ} MJ/m²` : '',
    // "Forma de apresentacao" — o app so trata processo tecnico novo hoje.
    processoTecnico: true,
    responsavelTecnico: state.rtNome || '',
    rtCpf: state.rtCpf || '',
    rtConselho: state.rtConselho || '',
    rtEmail: state.rtEmail || '',
    rtFone: state.rtTelefone || '',
    estrutura: estruturaTipos,
    cobertura: state.cobertura || '',
    vedacao: state.fachada || '',
    medidasCol1: MEDIDAS_ANEXO_B_COL1.map(m => ({ label: m.label, ativo: m.key ? marcada(m.key) : false })),
    medidasCol2: MEDIDAS_ANEXO_B_COL2.map(m => ({ label: m.label, ativo: m.key ? marcada(m.key) : false })),
    // Anexo B e um formulario unico pra edificacao/area de risco toda —
    // agrega (OR) os riscos especiais marcados em qualquer estrutura, e
    // junta as descricoes de "outros" de todas as que marcaram.
    riscosEspeciais: RISCOS_ESPECIAIS.map(r => {
      const porEstrutura = Object.values(state.riscosEspeciaisPorEstrutura || {})
      const ativo = porEstrutura.some(m => !!m?.[r.key])
      const outrosDesc = r.key === 'outros'
        ? Object.values(state.riscosOutrosDescPorEstrutura || {}).filter(Boolean).join('; ')
        : ''
      return { label: outrosDesc ? `${r.label}: ${outrosDesc}` : r.label, ativo }
    }),
  }
}
