// memorial/hidrantes.js — texto do memorial descritivo para o Sistema de
// Proteção por Hidrantes e Mangotinhos (NT 22 CBMMA). Narra a classificação
// decidida em state.hidrantes (ver FormularioSistema.jsx) — não recalcula
// nada, só formata o que já foi definido. O dimensionamento hidráulico
// (memorial de cálculo) é responsabilidade do plugin Revit e entra depois.

import { getHidrantes } from '../normas/index'
import { dadosDoTipo } from '../hidrantes_calc'

const LABEL_ACIONAMENTO = { eletrico: 'motor elétrico', combustao: 'motor de combustão interna' }
const LABEL_CONFIG_REDE = { ramal: 'ramal único', malha: 'malha (anel) fechado' }
const LABEL_RECALQUE = {
  coluna_fachada: 'tipo coluna, instalado na fachada',
  embutido_muro: 'embutido em abrigo no muro',
  passeio: 'instalado no passeio público',
}
const LABEL_VALVULA_BLOQUEIO = { gaveta: 'gaveta', gaveta_os_y: 'gaveta de haste ascendente (OS&Y)' }

export function textoMemorialHidrantes(state) {
  const norma = getHidrantes(state.uf)
  const h = state.hidrantes || {}
  const blocos = []

  if (!h.tipo) {
    return {
      titulo: 'Sistema de Proteção por Hidrantes e Mangotinhos',
      blocos: [{ tipo: 'paragrafo', texto: 'Classificação do sistema ainda não definida — pendente de preenchimento pelo responsável técnico.' }],
    }
  }

  const dadosTipo = dadosDoTipo(h.tipo, h.tipoVariante || 0, norma)
  const material = norma.MATERIAIS_TUBULACAO.find(m => m.key === h.redeMaterial)

  blocos.push({
    tipo: 'paragrafo',
    texto: `A edificação será protegida por Sistema de Proteção por Hidrantes e Mangotinhos ${dadosTipo.label}, dimensionado conforme a NT 22/2021 CBMMA, com vazão mínima de ${dadosTipo.vazaoMin} L/min e pressão mínima de ${dadosTipo.pressaoMin} mca na válvula do hidrante mais desfavorável (Tabela 2, NT 22).`,
  })

  if (h.rti) {
    blocos.push({
      tipo: 'campo', label: 'Reserva Técnica de Incêndio (RTI)',
      valor: `${h.rti} m³ — mínimo normativo conforme Tabela 3, NT 22`,
    })
  }

  blocos.push({ tipo: 'titulo2', texto: 'Reservatório' })
  const materialReservatorio = norma.MATERIAIS_RESERVATORIO.find(m => m.key === h.reservatorioMaterial)
  if (materialReservatorio) {
    blocos.push({ tipo: 'paragrafo', texto: `O reservatório de incêndio será construído em ${materialReservatorio.label.toLowerCase()}. A posição (elevado, nível do solo, semienterrado ou subterrâneo) consta no projeto executivo (modelo Revit).` })
  }
  blocos.push({
    tipo: 'paragrafo',
    texto: h.reservatorioExclusivo
      ? 'O reservatório é de uso exclusivo para combate a incêndio.'
      : `O reservatório é compartilhado com o consumo normal da edificação${h.reservatorioVolumeTotal ? `, com volume total de ${h.reservatorioVolumeTotal} m³` : ''}, garantida a reserva efetiva de incêndio permanentemente (item 5.9.1, NT 22).`,
  })

  blocos.push({ tipo: 'titulo2', texto: 'Bomba de Incêndio' })
  if (!h.bombaExiste) {
    blocos.push({ tipo: 'paragrafo', texto: 'O sistema opera sem bomba de incêndio — abastecimento por ação exclusiva da gravidade.' })
  } else {
    const extras = []
    if (h.bombaReforco) extras.push('bomba de reforço (by-pass)')
    if (h.bombaJockey) extras.push('bomba de pressurização (jockey)')
    if (h.bombaReserva) extras.push('bomba reserva')
    blocos.push({
      tipo: 'paragrafo',
      texto: `A bomba de incêndio principal é acionada por ${LABEL_ACIONAMENTO[h.bombaAcionamento]}${extras.length ? `, complementada por ${extras.join(', ')}` : ''}.`,
    })
  }

  blocos.push({ tipo: 'titulo2', texto: 'Rede de Tubulação' })
  blocos.push({
    tipo: 'paragrafo',
    texto: `A rede será executada em ${material?.label.toLowerCase() || '(material não definido)'}${material ? ` (fator C = ${material.fatorC}, Hazen-Williams)` : ''}, configurada em ${LABEL_CONFIG_REDE[h.redeConfiguracao]}, diâmetro nominal mínimo DN65.`,
  })

  blocos.push({ tipo: 'titulo2', texto: 'Dispositivo de Recalque' })
  if (h.recalqueTipo) {
    blocos.push({
      tipo: 'paragrafo',
      texto: `O dispositivo de recalque para uso do Corpo de Bombeiros Militar será ${LABEL_RECALQUE[h.recalqueTipo]}, com ${h.recalqueEntradas === 2 ? '2 entradas (vazão do sistema acima de 1.000 L/min, item 5.3.3)' : '1 entrada'}.`,
    })
    if (h.recalqueTipo === 'passeio' && h.recalqueJustificativaPasseio) {
      blocos.push({ tipo: 'paragrafo', texto: `Justificativa técnica: ${h.recalqueJustificativaPasseio}` })
    }
  }

  blocos.push({ tipo: 'titulo2', texto: 'Abrigos, Mangueiras e Esguichos' })
  blocos.push({
    tipo: 'tabela',
    colunas: ['Componente', 'Especificação'],
    linhas: [
      ['Abrigo', dadosTipo.componentes.abrigo === 'obrigatorio' ? 'Obrigatório' : 'Opcional'],
      ['Mangueira de incêndio', norma.LABEL_MANGUEIRA_INCENDIO[dadosTipo.componentes.mangueiraIncendio] || '—'],
      ['Diâmetro / comprimento', `DN${dadosTipo.mangueiraDn} — ${dadosTipo.mangueiraComprimento} m`],
      ['Esguicho regulável', `DN${dadosTipo.esguicho}`],
      ['Chave para hidrante / engate', dadosTipo.componentes.chaveEngate ? 'Sim' : 'Não'],
      ['Válvula do hidrante', `Globo angular DN${h.valvulaHidranteDn}`],
      ['Válvulas de bloqueio', LABEL_VALVULA_BLOQUEIO[h.valvulaBloqueioTipo] || '—'],
    ],
  })

  if (h.observacoes) {
    blocos.push({ tipo: 'titulo2', texto: 'Observações Complementares' })
    blocos.push({ tipo: 'paragrafo', texto: h.observacoes })
  }

  return { titulo: 'Sistema de Proteção por Hidrantes e Mangotinhos', blocos }
}
