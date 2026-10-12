// Endereços publicados em https://cbm.ssp.ma.gov.br/legislacao-tecnica/
// Conferidos em 12/10/2026. Fallback exclusivo do Maranhão.
const base = 'https://cbm.ssp.ma.gov.br/wp-content/uploads/2021/03/'
const norma = (titulo, arquivo) => ({ titulo, url: base + arquivo })
const compart = norma('NT 09', 'NT_09-COMPARTIMENTACAO-HORIZONTAL-E-VERTICAL.pdf')
const deteccaoAlarme = norma('NT 19', 'NT_19-SISTEMA-DE-DETECCAO-E-ALARME-DE-INCENDIO.pdf')
export const LINKS_NORMAS_MA = {
  portal: 'https://cbm.ssp.ma.gov.br/legislacao-tecnica/',
  medidas: {
    acesso_viatura: [norma('NT 06', 'NT_06-ACESSO-DE-VIATURAS-NAS-EDIFICACOES-E-AREAS-DE-RISCO.pdf')],
    seg_estrutural: [norma('NT 08', 'NT_08-SEGURANCA-ESTRUTURAL-CONTRA-INCENDIO.pdf')],
    compart_horizontal: [compart], compart_vertical: [compart],
    controle_acabamento: [norma('NT 10', 'NT_10-CONTROLE-DE-MATERIAL-DE-ACABAMENTO-E-REVESTIMENTO.pdf')],
    saida_emergencia: [norma('NT 11', 'NT_11-SAIDA-DE-EMERGENCIA.pdf')],
    carga_incendio: [norma('NT 14', 'NT_14-CARGA-DE-INCENDIO.pdf')],
    controle_fumaca: [norma('NT 15 — Parte 1', 'NT_15-1-CONTROLE-DE-FUMACA-PARTE-1.pdf')],
    gerenciamento_risco: [norma('NT 16', 'NT_16-GERENCIAMENTO-DE-RISCO.pdf')],
    brigada: [{ titulo: 'NT 17 — Parte 1', url: 'https://cbm.ssp.ma.gov.br/wp-content/uploads/2023/05/NT_17-Brigada-de-Incendio-Parte-1-Brigada-de-Incendio-Organica-com-capa.pdf' }],
    iluminacao: [norma('NT 18', 'NT_18-ILUMINACAO-DE-EMERGENCIA.pdf')],
    alarme: [deteccaoAlarme], deteccao: [deteccaoAlarme],
    sinalizacao: [norma('NT 20', 'NT_20-SINALIZACAO-DE-EMERGENCIA.pdf')],
    extintores: [norma('NT 21', 'NT_21-SISTEMA-DE-PROTECAO-POR-EXTINTORES.pdf')],
    hidrantes: [norma('NT 22', 'NT_22-SISTEMA-DE-PROTECAO-POR-HIDRANTES-E-MANGOTINHOS.pdf')],
    sprinklers: [norma('NT 23', 'NT_23-SISTEMA-DE-PROTECAO-POR-CHUVEIROS-AUTOMATICOS.pdf')],
    central_gas: [norma('NT 28', 'NT_28-MANIPULACAO-ARMAZENAMENTO-COMERCIALIZACAO-E-UTILIZACAO-DE-GAS-LIQUEFEITO-DE-PETROLEO-GLP.pdf')],
  },
}
