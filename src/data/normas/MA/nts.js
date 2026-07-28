// normas/MA/nts.js — mapeamento de Instrucoes Tecnicas do CBMMA usado na
// secao "Sobre a Legislacao" do memorial descritivo, para listar as NTs
// aplicaveis ao projeto (item 5 do memorial).

// Sempre presentes, independente das medidas do projeto.
export const NTS_PADRAO_MA = [
  { numero: 'NT 01', nome: 'Procedimentos administrativos e medidas de segurança' },
  { numero: 'NT 03', nome: 'Terminologia de segurança contra incêndio e emergências' },
  { numero: 'NT 04', nome: 'Símbolos gráficos para projetos de segurança contra incêndio e emergências' },
]

// A classificacao da carga de incendio fundamenta a definicao de quais
// sistemas sao obrigatorios (useMedidasObrigatorias), por isso acompanha
// todo projeto mesmo nao sendo um "sistema" com toggle proprio.
export const NT_CARGA_INCENDIO = { numero: 'NT 14', nome: 'Carga de incêndio' }

// chave = mesma chave de state.sistemas / useMedidasObrigatorias().
// Sistemas sem NT confirmada ainda nao entram aqui (ver nota abaixo) e por
// isso nao aparecem na lista da legislacao ate serem adicionados.
// compart_horizontal/compart_vertical e alarme/deteccao compartilham a mesma
// NT (09 e 19, respectivamente) — a lista da Introducao remove duplicatas.
export const NTS_POR_SISTEMA = {
  acesso_viatura:      { numero: 'NT 06', nome: 'Acesso de viaturas nas edificações e áreas de risco' },
  seg_estrutural:      { numero: 'NT 08', nome: 'Segurança estrutural contra incêndio' },
  compart_horizontal:  { numero: 'NT 09', nome: 'Compartimentação horizontal e vertical' },
  compart_vertical:    { numero: 'NT 09', nome: 'Compartimentação horizontal e vertical' },
  controle_acabamento: { numero: 'NT 10', nome: 'Controle de material de acabamento e revestimento' },
  saida_emergencia:    { numero: 'NT 11', nome: 'Saída de emergência' },
  gerenciamento_risco: { numero: 'NT 16', nome: 'Gerenciamento de risco' },
  brigada:             { numero: 'NT 17', nome: 'Brigada de Incêndio' },
  iluminacao:          { numero: 'NT 18', nome: 'Iluminação de emergência' },
  alarme:              { numero: 'NT 19', nome: 'Sistema de detecção e alarme de incêndio' },
  deteccao:            { numero: 'NT 19', nome: 'Sistema de detecção e alarme de incêndio' },
  sinalizacao:         { numero: 'NT 20', nome: 'Sinalização de Emergência' },
  extintores:          { numero: 'NT 21', nome: 'Sistema de proteção por extintores' },
  hidrantes:           { numero: 'NT 22', nome: 'Sistema de hidrantes e mangotinhos' },
  sprinklers:          { numero: 'NT 23', nome: 'Sistema de proteção por chuveiros automáticos' },
  central_gas:         { numero: 'NT 28', nome: 'Manipulação, armazenamento, comercialização e utilização de Gás Liquefeito de Petróleo (GLP)' },
  controle_fumaca:     { numero: 'NT 15', nome: 'Controle de Fumaça' },
  // spda nao tem NT propria do CBMMA — segue direto a norma brasileira.
  spda:                { numero: 'NBR 5419', nome: 'Proteção de estruturas contra descargas atmosféricas' },
}
