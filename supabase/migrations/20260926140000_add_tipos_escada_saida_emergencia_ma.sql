-- Tipos de escada de emergência por ocupação (Anexo C, Tabela 3) para o
-- Maranhão: acrescenta a chave `tipos_escada` ao JSON da norma de saída de
-- emergência já semeada (normas_dados, sistema 'saida_emergencia'). Sem
-- mudança de esquema — só dado. O site usa: altura piso a piso da estrutura
-- (faixa) x divisão -> NE / EP / PF / '+' (consultar NT) / '-' (não se
-- aplica). As notas são só exibidas (por divisão + gerais), nunca viram
-- configuração. Fallback offline: src/data/normas/MA/saida_emergencia.js.

update public.normas_dados
set dados = dados || jsonb_build_object('tipos_escada', $j${
  "titulo": "Anexo C — Tabela 3: Tipos de escada de emergência por ocupação",
  "faixas_altura": [
    {
      "id": "ate_6",
      "label": "H ≤ 6 m",
      "min": null,
      "max": 6
    },
    {
      "id": "6_12",
      "label": "6 < H ≤ 12 m",
      "min": 6,
      "max": 12
    },
    {
      "id": "12_30",
      "label": "12 < H ≤ 30 m",
      "min": 12,
      "max": 30
    },
    {
      "id": "acima_30",
      "label": "Acima de 30 m",
      "min": 30,
      "max": null
    }
  ],
  "tipos": {
    "NE": {
      "nome": "Escada não enclausurada",
      "detalhe": "escada comum",
      "rank": 1
    },
    "EP": {
      "nome": "Escada enclausurada protegida",
      "detalhe": "escada protegida",
      "rank": 2
    },
    "PF": {
      "nome": "Escada à prova de fumaça",
      "detalhe": null,
      "rank": 3
    },
    "+": {
      "nome": "Consultar NT, normas ou regulamentos específicos",
      "detalhe": "ocupação não coberta por essa NT",
      "rank": null
    },
    "-": {
      "nome": "Não se aplica",
      "detalhe": null,
      "rank": null
    }
  },
  "tabela": {
    "A-1": [
      "NE",
      "NE",
      "-",
      "-"
    ],
    "A-2": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "A-3": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "B-1": [
      "NE",
      "EP",
      "EP",
      "PF"
    ],
    "B-2": [
      "NE",
      "EP",
      "EP",
      "PF"
    ],
    "C-1": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "C-2": [
      "NE",
      "NE",
      "PF",
      "PF"
    ],
    "C-3": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "D": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "E-1": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "E-2": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "E-3": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "E-4": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "E-5": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "E-6": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "F-1": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "F-2": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "F-3": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "F-4": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "F-5": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "F-6": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "F-7": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "F-8": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "F-9": [
      "NE",
      "EP",
      "EP",
      "PF"
    ],
    "F-10": [
      "NE",
      "EP",
      "EP",
      "PF"
    ],
    "F-11": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "G-1": [
      "NE",
      "NE",
      "EP",
      "EP"
    ],
    "G-2": [
      "NE",
      "NE",
      "EP",
      "EP"
    ],
    "G-3": [
      "NE",
      "NE",
      "EP",
      "EP"
    ],
    "G-4": [
      "NE",
      "NE",
      "EP",
      "EP"
    ],
    "G-5": [
      "NE",
      "NE",
      "EP",
      "EP"
    ],
    "H-1": [
      "NE",
      "NE",
      "EP",
      "EP"
    ],
    "H-2": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "H-3": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "H-4": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "H-5": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "H-6": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "I-1": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "I-2": [
      "NE",
      "NE",
      "PF",
      "PF"
    ],
    "I-3": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "J": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "K": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "L-1": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "L-2": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "L-3": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "M-1": [
      "NE",
      "NE",
      "+",
      "+"
    ],
    "M-2": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "M-3": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "M-4": [
      "NE",
      "NE",
      "NE",
      "NE"
    ],
    "M-5": [
      "NE",
      "EP",
      "PF",
      "PF"
    ]
  },
  "notas": {
    "1": "Em edificações de ocupação do grupo A - divisão A-2, área de pavimento \"N\" (menor ou igual a 750 m²), altura acima de 30 m, contudo não superior a 50 m, a escada poderá ser do tipo EP (Escada Enclausurada Protegida), sendo que acima desta altura (50 m) permanece a escada do tipo PF (Escada Enclausurada à Prova de fumaça);",
    "a": "para o uso desta Tabela, devem ser consultadas as tabelas anteriores desta NT. Para a classificação das Ocupações (Grupos e Divisões), consultar a Tabela 1 do Regulamento de Segurança contra incêndio em vigor.",
    "b": "para as ocupações de divisão F-3, recintos esportivos ou de espetáculos artístico cultural (exceto ginásios e piscinas com ou sem arquibancadas, academias e pista de patinação), deve ser consultada a NT 12;",
    "c": "para a divisões F-3 e F-7, com população total superior a 2.500 pessoas, deve ser consultada a NT 12;",
    "d": "havendo necessidade de duas ou mais escadas de segurança, uma delas pode ser do tipo Aberta Externa (AE), atendendo ao item 5.7.12 desta NT;",
    "e": "para divisões H-2 e H-3, com altura superior a 12 m, além das saídas de emergências por escadas (Tabela 3) deve possuir elevador de emergência (Figura 17)",
    "f": "para divisões H-2, com altura superior a 12 m e H-3, com altura superior a 6 m, além das saídas de emergências por escadas (Tabela 3) deve possuir áreas de refúgio (Figura 25). As áreas de refúgio quando situadas somente em alguns pavimentos de níveis diferentes, seus acessos devem ser ligados por rampa (item 5.5.1.a desta NT). Para as edificações que possuam área de refúgio em todos os pavimentos (exceto pavimento térreo), não há necessidade de rampa interligando os diferentes níveis em acessos às áreas de refúgio;",
    "g": "o número de escadas depende do dimensionamento das saídas pelo cálculo da população (Tabela 1) e distâncias máximas a serem percorridas (Tabela 2);",
    "h": "nas edificações com altura acima de 36 m, independente da nota anterior, é obrigatória a quantidade mínima de duas escadas, exceto para grupo A-2. Nas edificações do grupo A-2, com altura acima de 80 m, independente da nota anterior, é obrigatória a quantidade mínima de duas escadas;",
    "i": "as condições das saídas de emergência em edificações com altura superior a 150 m devem ser analisadas por meio de Comissão Técnica, devido as suas particularidades e risco;",
    "j": "nas escadas abaixo do pavimento de descarga, em subsolos, onde está prevista a escada NE, conforme Tabela 3, esta deve ser enclausurada, dotada de PCF P-90, sem a necessidade de ventilação. Para os subsolos com altura descendentes com profundidade maior que 12 m, e que tenham sua ocupação diferente de estacionamento (garagens – G1e G2), devem ser projetados sistemas de pressurização para as escadas."
  },
  "notas_por_divisao": {
    "A-2": [
      "1"
    ],
    "F-3": [
      "b",
      "c"
    ],
    "F-7": [
      "c"
    ],
    "H-2": [
      "e",
      "f"
    ],
    "H-3": [
      "e",
      "f"
    ]
  },
  "notas_gerais": [
    "a",
    "d",
    "g",
    "h",
    "i",
    "j"
  ]
}$j$::jsonb),
    versao = versao + 1,
    atualizado_em = now()
where sistema = 'saida_emergencia'
  and uf = 'MA';
