// normas/MA/acesso_viatura.js — NT 01/2024 CBMMA, item 5.1 (Anexo A e Anexo B)
//
// Duas partes:
//  1. GATILHO — Anexo A: define SE a edificação precisa de via de acesso
//     dedicada (ou se a via pública já resolve, por estar perto o bastante).
//  2. VIA_ACESSO — item 5.1.1: características mínimas exigidas da via,
//     quando ela é exigida.

export const GATILHO = {
  alturaLimite: 12, // m — separa as duas faixas da tabela do Anexo A
  afastamentoMax: {
    baixa: 20, // altura <= 12m
    alta:  10, // altura > 12m
  },
  condominioSempreExige: true, // condomínios de residências uni/multifamiliares: sempre exige via de acesso
}

export const VIA_ACESSO = {
  larguraMin: 6.0,       // 5.1.1.1
  alturaLivreMin: 4.5,   // 5.1.1.2
  cargaMinKg: 25000,     // 5.1.1.3 — 25 t distribuídas em 2 eixos
  cargaEixos: 2,
  desnivelMaxPct: 5,     // 5.1.1.4 — longitudinal e transversal
  portao: {              // 5.1.1.5
    larguraMin: 4.0,
    alturaMin: 4.5,
  },
  retorno: {              // 5.1.1.6
    extensaoGatilho: 45,  // via com extensão > 45m exige retorno
    tipos: ['circular', 'Y', 'T'],
  },
  distancia: {            // 5.1.1.7
    tipo: 'por_hidrante',  // discrimina a regra: MA condiciona à existência de hidrantes
    semHidrante: 20,
    comHidrante: 10,       // até o hidrante de recalque
  },
}

export const NOTAS = {
  gatilho:   'Anexo A, NT 01/2024 CBMMA — Tabela para dimensionamento de Via de Acesso.',
  largura:   '5.1.1.1',
  alturaLivre: '5.1.1.2',
  carga:     '5.1.1.3',
  desnivel:  '5.1.1.4',
  portao:    '5.1.1.5',
  retorno:   '5.1.1.6',
  semManobra: '5.1.1.6.2',
  distancia: '5.1.1.7',
}
