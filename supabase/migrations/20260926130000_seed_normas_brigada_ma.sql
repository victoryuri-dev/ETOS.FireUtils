-- Migra a Brigada de Incêndio (NT 17/2021 CBMMA, Parte 1 — Brigada de
-- Incêndio Orgânica, Anexo A / Tabela A.1) pra base normativa central
-- (normas_dados), mesmo padrão de saída de emergência, extintores,
-- iluminação, sinalização, TRRF, acesso de viatura, medidas de segurança,
-- ocupações, carga de incêndio, NTS e hidrantes (ver as migrações
-- 20260906120001 a 20260906120011 e 20260916120000). Chaves em minúsculo
-- aqui, renomeadas pra SCREAMING_SNAKE_CASE em src/data/normas/index.js
-- (getBrigada) antes de chegar no resto do site — arquivo estático
-- (src/data/normas/MA/brigada_incendio.js) vira só o fallback offline/dev.

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('MA', 'brigada', $j${
  "norma": {
    "estado": "MA",
    "nome": "NT 17/2021 CBMMA",
    "desc": "Brigada de Incêndio — Parte 1: Brigada de Incêndio Orgânica"
  },
  "tabela_a1": [
    {
      "divisoes": [
        "A-1"
      ],
      "grupoLabel": "A - Residencial",
      "descricao": "Habitação unifamiliar",
      "risco": "baixo",
      "isento": true,
      "faixas": null,
      "regraAcima10": null,
      "nivelTreinamento": null,
      "nivelInstalacao": null,
      "notas": []
    },
    {
      "divisoes": [
        "A-2"
      ],
      "grupoLabel": "A - Residencial",
      "descricao": "Habitação multifamiliar",
      "risco": "baixo",
      "isento": false,
      "faixas": null,
      "regraAcima10": "pct_funcionarios_pav",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": []
    },
    {
      "divisoes": [
        "A-3"
      ],
      "grupoLabel": "A - Residencial",
      "descricao": "Habitação coletiva",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        2,
        5
      ]
    },
    {
      "divisoes": [
        "B-1"
      ],
      "grupoLabel": "B – Serviços de hospedagem",
      "descricao": "Hotel e assemelhados",
      "risco": "medio",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "nota8",
      "nivelInstalacao": "nota8",
      "notas": [
        5,
        6,
        8
      ]
    },
    {
      "divisoes": [
        "B-2"
      ],
      "grupoLabel": "B – Serviços de hospedagem",
      "descricao": "Hotel residencial",
      "risco": "medio",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "nota8",
      "nivelInstalacao": "nota8",
      "notas": [
        3,
        5,
        6,
        8
      ]
    },
    {
      "divisoes": [
        "C-1"
      ],
      "grupoLabel": "C - Comercial",
      "descricao": "Comércio",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "C-2"
      ],
      "grupoLabel": "C - Comercial",
      "descricao": "Comércio",
      "risco": "medio",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "nota1",
      "nivelInstalacao": "nota1",
      "notas": [
        1,
        5
      ]
    },
    {
      "divisoes": [
        "C-2"
      ],
      "grupoLabel": "C - Comercial",
      "descricao": "Comércio",
      "risco": "alto",
      "isento": false,
      "faixas": [
        2,
        2,
        3,
        4,
        5
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "nota8",
      "nivelInstalacao": "nota8",
      "notas": [
        5,
        8
      ]
    },
    {
      "divisoes": [
        "C-3"
      ],
      "grupoLabel": "C - Comercial",
      "descricao": "Shopping Centers",
      "risco": "medio",
      "isento": false,
      "faixas": [
        2,
        4,
        5,
        6,
        8
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "nota8",
      "nivelInstalacao": "nota8",
      "notas": [
        5,
        8
      ]
    },
    {
      "divisoes": [
        "D-1"
      ],
      "grupoLabel": "D – Serviço Profissional",
      "descricao": "Local para prestação de serviço profissional ou condução de negócio",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "D-1"
      ],
      "grupoLabel": "D – Serviço Profissional",
      "descricao": "Local para prestação de serviço profissional ou condução de negócio",
      "risco": "medio",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "nota8",
      "nivelInstalacao": "nota8",
      "notas": [
        5,
        8
      ]
    },
    {
      "divisoes": [
        "D-2"
      ],
      "grupoLabel": "D – Serviço Profissional",
      "descricao": "Agência Bancária",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "D-3"
      ],
      "grupoLabel": "D – Serviço Profissional",
      "descricao": "Serviço de reparação (exceto os classificados em G4)",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "D-3"
      ],
      "grupoLabel": "D – Serviço Profissional",
      "descricao": "Serviço de reparação (exceto os classificados em G4)",
      "risco": "medio",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "nota8",
      "nivelInstalacao": "nota8",
      "notas": [
        5,
        8
      ]
    },
    {
      "divisoes": [
        "D-4"
      ],
      "grupoLabel": "D – Serviço Profissional",
      "descricao": "Laboratório",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "D-4"
      ],
      "grupoLabel": "D – Serviço Profissional",
      "descricao": "Laboratório",
      "risco": "medio",
      "isento": false,
      "faixas": [
        2,
        3,
        4,
        5,
        6
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "nota8",
      "nivelInstalacao": "nota8",
      "notas": [
        5,
        8
      ]
    },
    {
      "divisoes": [
        "E-1"
      ],
      "grupoLabel": "E – Educacional e cultura física",
      "descricao": "Escola em geral",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "E-2"
      ],
      "grupoLabel": "E – Educacional e cultura física",
      "descricao": "Escola especial",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "E-3"
      ],
      "grupoLabel": "E – Educacional e cultura física",
      "descricao": "Espaço para cultura física",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "E-4"
      ],
      "grupoLabel": "E – Educacional e cultura física",
      "descricao": "Centro de treinamento profissional",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "E-5"
      ],
      "grupoLabel": "E – Educacional e cultura física",
      "descricao": "Pré-escola",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        2,
        4,
        6,
        8,
        8
      ],
      "regraAcima10": "pct_populacao",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": []
    },
    {
      "divisoes": [
        "E-6"
      ],
      "grupoLabel": "E – Educacional e cultura física",
      "descricao": "Escola para portadores de deficiências",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        2,
        4,
        6,
        6,
        8
      ],
      "regraAcima10": "pct_populacao",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": []
    },
    {
      "divisoes": [
        "F-1"
      ],
      "grupoLabel": "F",
      "descricao": "Local onde há objeto de valor inestimável",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "F-1"
      ],
      "grupoLabel": "F",
      "descricao": "Local onde há objeto de valor inestimável",
      "risco": "alto",
      "isento": false,
      "faixas": [
        2,
        2,
        3,
        4,
        5
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "nota8",
      "nivelInstalacao": "nota8",
      "notas": [
        5,
        8
      ]
    },
    {
      "divisoes": [
        "F-2"
      ],
      "grupoLabel": "F",
      "descricao": "Local religioso e velório",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        2,
        3,
        4,
        5,
        6
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5,
        10
      ]
    },
    {
      "divisoes": [
        "F-3"
      ],
      "grupoLabel": "F",
      "descricao": "Centro esportivo e de exibição",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        2,
        3,
        4,
        5,
        6
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5,
        10
      ]
    },
    {
      "divisoes": [
        "F-4"
      ],
      "grupoLabel": "F",
      "descricao": "Estação e terminal de passageiro",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        2,
        3,
        4,
        5,
        6
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "F-5"
      ],
      "grupoLabel": "F",
      "descricao": "Artes cênicas e auditório",
      "risco": "medio",
      "isento": false,
      "faixas": [
        2,
        3,
        4,
        5,
        6
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "nota8",
      "nivelInstalacao": "nota8",
      "notas": [
        5,
        8
      ]
    },
    {
      "divisoes": [
        "F-6"
      ],
      "grupoLabel": "F",
      "descricao": "Clube social e salão de festa",
      "risco": "medio",
      "isento": false,
      "faixas": [
        2,
        3,
        4,
        5,
        6
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "nota8",
      "nivelInstalacao": "nota8",
      "notas": [
        5,
        8,
        10
      ]
    },
    {
      "divisoes": [
        "F-7"
      ],
      "grupoLabel": "F",
      "descricao": "Instalação Temporária",
      "risco": "medio",
      "isento": false,
      "faixas": null,
      "regraAcima10": "ver_item_5_11_2",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": []
    },
    {
      "divisoes": [
        "F-8"
      ],
      "grupoLabel": "F",
      "descricao": "Local para refeição",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "F-9"
      ],
      "grupoLabel": "F",
      "descricao": "Recreação pública",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "F-10"
      ],
      "grupoLabel": "F",
      "descricao": "Exposição de objetos e animais",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "nota8",
      "nivelInstalacao": "nota8",
      "notas": [
        5,
        8
      ]
    },
    {
      "divisoes": [
        "F-11"
      ],
      "grupoLabel": "F",
      "descricao": "Boate",
      "risco": "medio",
      "isento": false,
      "faixas": [
        2,
        3,
        4,
        5,
        6
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "intermediario",
      "nivelInstalacao": "intermediario",
      "notas": [
        5,
        10
      ]
    },
    {
      "divisoes": [
        "G-1"
      ],
      "grupoLabel": "G – Serviço automotivo",
      "descricao": "Garagem sem acesso de público e sem abastecimento",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "G-2"
      ],
      "grupoLabel": "G – Serviço automotivo",
      "descricao": "Garagem com acesso de público e sem abastecimento",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "G-3"
      ],
      "grupoLabel": "G – Serviço automotivo",
      "descricao": "Local dotado de Abastecimento de combustível",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "G-4"
      ],
      "grupoLabel": "G – Serviço automotivo",
      "descricao": "Serviço de conservação, manutenção e reparos",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "G-5"
      ],
      "grupoLabel": "G – Serviço automotivo",
      "descricao": "Hangares",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "G-6"
      ],
      "grupoLabel": "G – Serviço automotivo",
      "descricao": "Marinas, iates-clubes e garagens náuticas",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "H-1"
      ],
      "grupoLabel": "H – Serviço de saúde e institucional",
      "descricao": "Hospitais veterinários e assemelhados",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "H-2"
      ],
      "grupoLabel": "H – Serviço de saúde e institucional",
      "descricao": "Locais onde pessoas requerem cuidados especiais por limitações físicas ou mentais",
      "risco": "medio",
      "isento": false,
      "faixas": [
        2,
        4,
        5,
        6,
        8
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "nota8",
      "nivelInstalacao": "nota8",
      "notas": [
        5,
        8
      ]
    },
    {
      "divisoes": [
        "H-3"
      ],
      "grupoLabel": "H – Serviço de saúde e institucional",
      "descricao": "Hospital e assemelhado",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        2,
        3,
        4,
        5,
        6
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "H-4"
      ],
      "grupoLabel": "H – Serviço de saúde e institucional",
      "descricao": "Repartição pública, edificações das forças armadas e policiais",
      "risco": "medio",
      "isento": false,
      "faixas": [
        2,
        3,
        4,
        5,
        6
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "H-5"
      ],
      "grupoLabel": "H – Serviço de saúde e institucional",
      "descricao": "Local onde a liberdade das pessoas sofre restrições",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        2,
        3,
        4,
        5,
        6
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "H-6"
      ],
      "grupoLabel": "H – Serviço de saúde e institucional",
      "descricao": "Clínica e consultório médico e odontológico",
      "risco": "medio",
      "isento": false,
      "faixas": [
        2,
        3,
        4,
        5,
        6
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "nota8",
      "nivelInstalacao": "nota8",
      "notas": [
        5,
        8
      ]
    },
    {
      "divisoes": [
        "I-1",
        "I-2",
        "I-3"
      ],
      "grupoLabel": "I - Indústria",
      "descricao": "Indústria",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "I-1",
        "I-2",
        "I-3"
      ],
      "grupoLabel": "I - Indústria",
      "descricao": "Indústria",
      "risco": "medio",
      "isento": false,
      "faixas": [
        2,
        4,
        4,
        5,
        6
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "intermediario",
      "nivelInstalacao": "intermediario",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "I-1",
        "I-2",
        "I-3"
      ],
      "grupoLabel": "I - Indústria",
      "descricao": "Indústria",
      "risco": "alto",
      "isento": false,
      "faixas": [
        2,
        4,
        5,
        7,
        8
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "avancado",
      "nivelInstalacao": "avancado",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "J-1"
      ],
      "grupoLabel": "J - Depósito",
      "descricao": "Depósitos de material incombustível",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "J-2",
        "J-3",
        "J-4"
      ],
      "grupoLabel": "J - Depósito",
      "descricao": "Depósitos",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "J-2",
        "J-3",
        "J-4"
      ],
      "grupoLabel": "J - Depósito",
      "descricao": "Depósitos",
      "risco": "medio",
      "isento": false,
      "faixas": [
        1,
        2,
        3,
        4,
        4
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "intermediario",
      "nivelInstalacao": "intermediario",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "J-2",
        "J-3",
        "J-4"
      ],
      "grupoLabel": "J - Depósito",
      "descricao": "Depósitos",
      "risco": "alto",
      "isento": false,
      "faixas": [
        2,
        4,
        5,
        6,
        8
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "avancado",
      "nivelInstalacao": "avancado",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "K-1"
      ],
      "grupoLabel": "K - Energia",
      "descricao": "Central de transmissão e distribuição de energia",
      "risco": "alto",
      "isento": false,
      "faixas": [
        2,
        4,
        5,
        6,
        8
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "avancado",
      "nivelInstalacao": "avancado",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "L-1"
      ],
      "grupoLabel": "L - Explosivos",
      "descricao": "Comércio",
      "risco": "alto",
      "isento": false,
      "faixas": [
        2,
        4,
        5,
        6,
        8
      ],
      "regraAcima10": "pct_populacao",
      "nivelTreinamento": "avancado",
      "nivelInstalacao": "avancado",
      "notas": []
    },
    {
      "divisoes": [
        "L-2"
      ],
      "grupoLabel": "L - Explosivos",
      "descricao": "Indústria",
      "risco": "alto",
      "isento": false,
      "faixas": [
        2,
        4,
        5,
        6,
        8
      ],
      "regraAcima10": "pct_populacao",
      "nivelTreinamento": "avancado",
      "nivelInstalacao": "avancado",
      "notas": []
    },
    {
      "divisoes": [
        "L-3"
      ],
      "grupoLabel": "L - Explosivos",
      "descricao": "Depósito",
      "risco": "alto",
      "isento": false,
      "faixas": [
        2,
        4,
        5,
        6,
        8
      ],
      "regraAcima10": "pct_populacao",
      "nivelTreinamento": "avancado",
      "nivelInstalacao": "avancado",
      "notas": []
    },
    {
      "divisoes": [
        "M-1"
      ],
      "grupoLabel": "M",
      "descricao": "Túnel",
      "risco": null,
      "isento": false,
      "faixas": null,
      "regraAcima10": "tunel",
      "nivelTreinamento": "avancado",
      "nivelInstalacao": "avancado",
      "notas": [
        9
      ]
    },
    {
      "divisoes": [
        "M-2"
      ],
      "grupoLabel": "M",
      "descricao": "Líquidos inflamáveis, gás inflamáveis ou combustível",
      "risco": "alto",
      "isento": false,
      "faixas": [
        2,
        4,
        6,
        8,
        10
      ],
      "regraAcima10": "maior_cenario",
      "nivelTreinamento": "avancado",
      "nivelInstalacao": "avancado",
      "notas": [
        5,
        7
      ]
    },
    {
      "divisoes": [
        "M-3"
      ],
      "grupoLabel": "M",
      "descricao": "Central de Comunicação e energia",
      "risco": null,
      "isento": false,
      "faixas": [
        2,
        4,
        6,
        8,
        10
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "avancado",
      "nivelInstalacao": "avancado",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "M-4"
      ],
      "grupoLabel": "M",
      "descricao": "Propriedades em transformação",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "M-5"
      ],
      "grupoLabel": "M",
      "descricao": "Silos",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "M-5"
      ],
      "grupoLabel": "M",
      "descricao": "Silos",
      "risco": "medio",
      "isento": false,
      "faixas": [
        2,
        3,
        4,
        5,
        6
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "intermediario",
      "nivelInstalacao": "intermediario",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "M-5"
      ],
      "grupoLabel": "M",
      "descricao": "Silos",
      "risco": "alto",
      "isento": false,
      "faixas": [
        2,
        4,
        5,
        7,
        8
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "avancado",
      "nivelInstalacao": "avancado",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "M-6"
      ],
      "grupoLabel": "M",
      "descricao": "Floresta nativa ou cultivada",
      "risco": "medio",
      "isento": false,
      "faixas": [
        2,
        4,
        5,
        6,
        8
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "intermediario",
      "nivelInstalacao": "intermediario",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "M-7"
      ],
      "grupoLabel": "M",
      "descricao": "Pátio de contêineres",
      "risco": "baixo",
      "isento": false,
      "faixas": [
        1,
        2,
        2,
        2,
        2
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "basico",
      "nivelInstalacao": "basico",
      "notas": [
        5
      ]
    },
    {
      "divisoes": [
        "M-7"
      ],
      "grupoLabel": "M",
      "descricao": "Pátio de contêineres",
      "risco": "medio",
      "isento": false,
      "faixas": [
        2,
        3,
        4,
        5,
        6
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "intermediario",
      "nivelInstalacao": "intermediario",
      "notas": [
        4,
        5
      ],
      "nota4Aplicavel": "treinamento"
    },
    {
      "divisoes": [
        "M-7"
      ],
      "grupoLabel": "M",
      "descricao": "Pátio de contêineres",
      "risco": "alto",
      "isento": false,
      "faixas": [
        2,
        4,
        5,
        7,
        8
      ],
      "regraAcima10": "nota5",
      "nivelTreinamento": "avancado",
      "nivelInstalacao": "avancado",
      "notas": [
        5
      ]
    }
  ],
  "notas_tabela_a1": {
    "1": "Na Divisão C-2, as edificações com menos de 5.000 m² devem atender o nível básico de treinamento e de instalação. Já nas edificações com mais do que 5.000 m², um mínimo de 4 (quatro) brigadistas por turno devem ser treinados no nível intermediário de treinamento/instalações, e os demais brigadistas no nível básico.",
    "2": "Na Divisão A-3, a população fixa com idade acima de 60 anos e abaixo de 18 anos não é considerada no cálculo.",
    "3": "Na Divisão B-2, somente os funcionários da edificação são considerados na composição da brigada de incêndio.",
    "4": "As edificações com altura inferior ou igual a 12 m, com exigência de treinamento intermediário, podem optar pelo nível de treinamento básico de combate a incêndio.",
    "5": "Quando a população fixa for maior que 10 pessoas, será acrescido mais um brigadista para cada grupo de até 20 pessoas para risco baixo, mais um brigadista para cada grupo de até 15 pessoas para risco médio e mais um brigadista para cada grupo de até 10 pessoas para risco alto.",
    "6": "Nas divisões B-1 e B-2, quando os funcionários da edificação não forem distribuídos nos pavimentos, o cálculo será 50% do número total de funcionários existentes na edificação.",
    "7": "Na Divisão M-2, a quantidade mínima de brigadistas deve ser conforme o previsto nesta tabela ou de acordo com a necessidade no cenário de combate ao incêndio, o que for maior.",
    "8": "O cálculo que prevê até 20 brigadistas poderá ser treinado no nível básico. Acima de 20 brigadistas, no mínimo 4 (quatro) brigadistas por turno devem ser treinados no nível intermediário de treinamento/instalações, acrescidos 1 (um) a cada grupo de 20 brigadistas, e os demais brigadistas no nível básico.",
    "9": "Na Divisão M-1, túneis de 200 a 500 m serão necessários 2 brigadistas; de 501 a 1000 m serão necessários 4 brigadistas; e, acima de 1000 m, a análise será através da Comissão Técnica.",
    "10": "Divisões de ocupação com público máximo superior a 250 pessoas deverá adotar o dimensionamento previsto no item 5.11.2."
  },
  "notas_gerais": {
    "a": "A definição do número mínimo de brigadistas deve prever os turnos, a natureza de trabalho e os eventuais afastamentos, sendo que a previsão de brigadistas contempla todas as atividades existentes na edificação, ou seja, se durante o período noturno funcionar alguma atividade deve ser previsto o número mínimo de brigadistas.",
    "b": "A composição da brigada de incêndio deve levar em conta a participação de pessoas de todos os setores, sendo que caso haja diversos turnos de serviço, o número mínimo de brigadistas deve ser calculado em função da população fixa do turno — se durante o período diurno a população fixa for de 80 funcionários, calcula-se o número de brigadistas para essa quantidade e, se durante o período noturno a população fixa for de 20 funcionários, calcula-se o número de brigadistas somente para essa quantidade.",
    "c": "Os bombeiros civis devem ser considerados na composição da brigada de incêndio da edificação, desde que atendam aos parâmetros estabelecidos nesta NT.",
    "d": "A edificação que não for enquadrada em nenhuma das divisões previstas neste anexo deve ser classificada por analogia com o nível de risco mais próximo.",
    "e": "As edificações que não possuírem hidrantes em suas instalações podem optar pelo nível de treinamento básico de combate a incêndio.",
    "f": "Para edificações que possuam riscos especiais (caldeiras, sistemas de GLP, central de distribuição elétrica, produtos perigosos e espaços confinados) a brigada deverá ter formação intermediária."
  },
  "observacoes_transcricao": [
    "M-3 \"Central de Comunicação e energia\": a célula de grau de risco é apresentada em branco no Anexo A original (sem Baixo/Médio/Alto) — tratado aqui como risco não definido; a única linha cadastrada para a divisão M-3 é usada independente do risco calculado do pavimento."
  ]
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();
