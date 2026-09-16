-- Migra o Sistema de Hidrantes/Mangotinhos (NT 22/2021 CBMMA) pra base
-- normativa central (normas_dados) — até aqui era o único sistema que
-- ainda só existia como arquivo estático empacotado (src/data/normas/MA/
-- hidrantes.js), sem cair pra Supabase como os demais (saída de
-- emergência, extintores, iluminação, sinalização, TRRF, acesso de
-- viatura, medidas de segurança, ocupações, carga de incêndio, NTS —
-- ver as migrações 20260906120001 a 20260906120011). Mesmo padrão das
-- outras: chaves em minúsculo aqui, renomeadas pra SCREAMING_SNAKE_CASE
-- em src/data/normas/index.js (getHidrantes) antes de chegar no resto do
-- site.

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('MA', 'hidrantes', $j${
  "norma": {
    "estado": "MA",
    "nome": "NT 22/2021 CBMMA",
    "desc": "Sistema de Proteção por Hidrantes e Mangotinhos"
  },
  "referencia_pressao_vazao": "valvula",
  "tipos_sistema": {
    "1": {
      "label": "Tipo 1 — Mangotinho",
      "expedicoes": "simples",
      "vazaoMin": 100,
      "pressaoMin": 80,
      "variantes": [
        { "esguicho": 25, "mangueiraDn": 25, "mangueiraComprimento": 30, "pressaoMin": 80 }
      ]
    },
    "2": {
      "label": "Tipo 2",
      "expedicoes": "simples",
      "vazaoMin": 150,
      "pressaoMin": 30,
      "variantes": [
        { "esguicho": 40, "mangueiraDn": 40, "mangueiraComprimento": 30, "pressaoMin": 30 }
      ]
    },
    "3": {
      "label": "Tipo 3",
      "expedicoes": "simples",
      "vazaoMin": 200,
      "pressaoMin": 40,
      "variantes": [
        { "esguicho": 40, "mangueiraDn": 40, "mangueiraComprimento": 30, "pressaoMin": 40 }
      ]
    },
    "4": {
      "label": "Tipo 4",
      "expedicoes": "simples",
      "vazaoMin": 300,
      "pressaoMin": 65,
      "variantes": [
        { "esguicho": 40, "mangueiraDn": 40, "mangueiraComprimento": 30, "pressaoMin": 65 },
        { "esguicho": 60, "mangueiraDn": 65, "mangueiraComprimento": 30, "pressaoMin": 30 }
      ]
    },
    "5": {
      "label": "Tipo 5",
      "expedicoes": "duplo",
      "vazaoMin": 600,
      "pressaoMin": 60,
      "variantes": [
        { "esguicho": 65, "mangueiraDn": 65, "mangueiraComprimento": 30, "pressaoMin": 60 }
      ]
    }
  },
  "componentes_por_tipo": {
    "1": { "abrigo": "opcional", "mangueiraIncendio": null, "chaveEngate": false, "esguichoAvulso": false, "mangueiraSemirrigida": true },
    "2": { "abrigo": "obrigatorio", "mangueiraIncendio": "tipo1_residencial_ou_tipo2", "chaveEngate": true, "esguichoAvulso": true, "mangueiraSemirrigida": false },
    "3": { "abrigo": "obrigatorio", "mangueiraIncendio": "tipo2_3_4_ou_5", "chaveEngate": true, "esguichoAvulso": true, "mangueiraSemirrigida": false },
    "4": { "abrigo": "obrigatorio", "mangueiraIncendio": "tipo2_3_4_ou_5", "chaveEngate": true, "esguichoAvulso": true, "mangueiraSemirrigida": false },
    "5": { "abrigo": "obrigatorio", "mangueiraIncendio": "tipo2_3_4_ou_5", "chaveEngate": true, "esguichoAvulso": true, "mangueiraSemirrigida": false }
  },
  "label_mangueira_incendio": {
    "tipo1_residencial_ou_tipo2": "Tipo 1 (residencial) ou Tipo 2 (demais ocupações)",
    "tipo2_3_4_ou_5": "Tipo 2, 3, 4 ou 5"
  },
  "faixas_area": [
    { "max": 2500, "label": "Até 2.500 m²" },
    { "min": 2500, "max": 5000, "label": "Acima de 2.500 até 5.000 m²" },
    { "min": 5000, "max": 10000, "label": "Acima de 5.000 até 10.000 m²" },
    { "min": 10000, "max": 20000, "label": "Acima de 10.000 até 20.000 m²" },
    { "min": 20000, "max": 50000, "label": "Acima de 20.000 até 50.000 m²" },
    { "min": 50000, "label": "Acima de 50.000 m²" }
  ],
  "tabela3": [
    { "col1": { "tipo1": { "rti": 6 },  "tipo2": { "rti": 8 } },  "col2": { "tipo": 3, "rti": 12 },  "col3": { "tipo": 4, "rti": 28 },  "col4": { "tipo": 4, "rti": 32 } },
    { "col1": { "tipo1": { "rti": 8 },  "tipo2": { "rti": 12 } }, "col2": { "tipo": 3, "rti": 18 },  "col3": { "tipo": 4, "rti": 32 },  "col4": { "tipo": 4, "rti": 48 } },
    { "col1": { "tipo1": { "rti": 12 }, "tipo2": { "rti": 18 } }, "col2": { "tipo": 3, "rti": 25 },  "col3": { "tipo": 4, "rti": 48 },  "col4": { "tipo": 5, "rti": 64 } },
    { "col1": { "tipo1": { "rti": 18 }, "tipo2": { "rti": 25 } }, "col2": { "tipo": 3, "rti": 35 },  "col3": { "tipo": 4, "rti": 64 },  "col4": { "tipo": 5, "rti": 96 } },
    { "col1": { "tipo1": { "rti": 25 }, "tipo2": { "rti": 35 } }, "col2": { "tipo": 3, "rti": 48 },  "col3": { "tipo": 4, "rti": 96 },  "col4": { "tipo": 5, "rti": 120 } },
    { "col1": { "tipo1": { "rti": 35 }, "tipo2": { "rti": 48 } }, "col2": { "tipo": 3, "rti": 70 },  "col3": { "tipo": 4, "rti": 120 }, "col4": { "tipo": 5, "rti": 180 } }
  ],
  "divisoes_coluna": {
    "A-2": 1, "A-3": 1, "C-1": 1, "D-2": 1,
    "E-1": 1, "E-2": 1, "E-3": 1, "E-4": 1, "E-5": 1, "E-6": 1,
    "F-2": 1, "F-3": 1, "F-4": 1, "F-8": 1,
    "G-1": 1, "G-2": 1, "G-3": 1, "G-4": 1,
    "H-1": 1, "H-2": 1, "H-3": 1, "H-5": 1, "H-6": 1,
    "I-1": 1, "J-1": 1, "M-3": 1,
    "B-1": 2, "B-2": 2, "C-3": 2,
    "F-5": 2, "F-6": 2, "F-7": 2, "F-9": 2, "F-10": 2, "F-11": 2,
    "H-4": 2, "K-1": 2,
    "L-1": 3, "M-1": 3,
    "G-5": 4, "I-3": 4, "J-4": 4, "L-2": 4, "L-3": 4, "M-7": 4
  },
  "divisoes_por_carga": {
    "D-1": [{ "max": 300, "coluna": 1 }, { "min": 300, "coluna": 2 }],
    "D-3": [{ "max": 300, "coluna": 1 }, { "min": 300, "coluna": 2 }],
    "D-4": [{ "max": 300, "coluna": 1 }, { "min": 300, "coluna": 2 }],
    "F-1": [{ "max": 300, "coluna": 1 }, { "min": 300, "coluna": 2 }],
    "J-2": [{ "max": 300, "coluna": 1 }, { "min": 300, "coluna": 2 }],
    "C-2": [{ "max": 1000, "coluna": 2 }, { "min": 1000, "coluna": 3 }],
    "I-2": [{ "max": 800, "coluna": 2 }, { "min": 800, "coluna": 3 }],
    "J-3": [{ "max": 300, "coluna": 1 }, { "min": 300, "max": 800, "coluna": 2 }, { "min": 800, "coluna": 3 }]
  },
  "materiais_tubulacao": [
    { "key": "ferro_fundido_sem_revest", "label": "Ferro fundido ou dúctil sem revestimento interno", "fatorC": 100 },
    { "key": "aco_preto_seco", "label": "Aço preto (sistema de tubo seco)", "fatorC": 100 },
    { "key": "aco_preto_molhado", "label": "Aço preto (sistema de tubo molhado)", "fatorC": 120 },
    { "key": "galvanizado", "label": "Galvanizado", "fatorC": 120 },
    { "key": "plastico", "label": "Plástico (PVC/PEAD)", "fatorC": 150 },
    { "key": "ferro_fundido_com_cimento", "label": "Ferro fundido ou dúctil com revestimento interno de cimento", "fatorC": 140 },
    { "key": "cobre", "label": "Cobre", "fatorC": 150 }
  ],
  "materiais_reservatorio": [
    { "key": "concreto_armado", "label": "Concreto armado" },
    { "key": "alvenaria", "label": "Alvenaria" },
    { "key": "fibra_vidro", "label": "Fibra de vidro" },
    { "key": "aco", "label": "Aço (metálico)" },
    { "key": "polietileno", "label": "Polietileno" },
    { "key": "outro", "label": "Outro" }
  ],
  "tipos_recalque": [
    { "key": "coluna_fachada", "label": "Coluna na fachada" },
    { "key": "embutido_muro", "label": "Embutido em abrigo no muro" },
    { "key": "passeio", "label": "Passeio público (exige justificativa técnica de impossibilidade)" }
  ],
  "configuracoes_rede": [
    { "key": "ramal", "label": "Ramal único" },
    { "key": "malha", "label": "Malha (anel) fechado" }
  ],
  "acionamentos_bomba": [
    { "key": "eletrico", "label": "Motor elétrico" },
    { "key": "combustao", "label": "Motor de combustão interna" }
  ],
  "bomba_reserva_por_risco": {
    "medio": { "obrigatoria": true, "tipo": "Bomba elétrica acoplada a motor elétrico" },
    "alto": { "obrigatoria": true, "tipo": "Bomba elétrica ligada a gerador de emergência, ou bomba acoplada a motor de combustão interna" }
  },
  "vazao_limite_recalque_duplo": 1000,
  "altitudes_succao": [
    { "altitude": 0, "ha": 10.33 },
    { "altitude": 500, "ha": 9.72 },
    { "altitude": 1000, "ha": 9.15 },
    { "altitude": 1500, "ha": 8.61 }
  ],
  "temperaturas_succao": [
    { "temperatura": 10, "hvp": 0.125 },
    { "temperatura": 15, "hvp": 0.174 },
    { "temperatura": 20, "hvp": 0.239 },
    { "temperatura": 25, "hvp": 0.323 },
    { "temperatura": 30, "hvp": 0.433 },
    { "temperatura": 35, "hvp": 0.573 },
    { "temperatura": 40, "hvp": 0.752 }
  ],
  "altitude_succao_padrao": 0,
  "temperatura_succao_padrao": 30,
  "hidrantes_simultaneos": 2,
  "hidrantes_simultaneos_ref": "NT 22 itens 5.8.3 / 5.8.8",
  "v_max_tubulacao": 5.0,
  "v_max_tubulacao_ref": "NT 22 item 5.8.13",
  "v_max_succao_positiva": 3.0,
  "v_max_succao_negativa": 2.0,
  "v_max_succao_ref": "NT 22 item 5.8.12",
  "tolerancia_equilibrio_mca": 0.50,
  "tolerancia_equilibrio_mca_ref": "NT 22/2021 - CBMMA",
  "npshd_fator_vazao": 1.5,
  "npshd_ref": "NT 22 item 5.8.16"
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();
