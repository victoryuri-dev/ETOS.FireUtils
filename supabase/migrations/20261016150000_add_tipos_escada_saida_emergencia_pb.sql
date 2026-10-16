-- Tipos de escada de emergência por ocupação (Anexo C, Tabela 3 da NT
-- 12/2025 CBMPB) para a Paraíba: acrescenta a chave `tipos_escada` à linha
-- ('PB','saida_emergencia') já existente, sem mexer nas outras chaves.
-- Mesmo formato da linha do MA. Gerado de src/data/normas/PB/saida_emergencia.js
-- (TIPOS_ESCADA). "EP+"/"PF+" (M-1 acima de 12 m) = o tipo indicado e, além
-- dele, consultar normas específicas. Notas da tabela ainda não transcritas.

update public.normas_dados
set dados = dados || jsonb_build_object('tipos_escada', $j$
{
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
    "B": [
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
    "E": [
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
      "PF"
    ],
    "G-4": [
      "NE",
      "NE",
      "EP",
      "PF"
    ],
    "G-5": [
      "NE",
      "NE",
      "EP",
      "PF"
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
    "L": [
      "NE",
      "EP",
      "PF",
      "PF"
    ],
    "M-1": [
      "NE",
      "NE",
      "EP+",
      "PF+"
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
  "notas": {},
  "notas_gerais": [],
  "notas_por_divisao": {}
}
$j$::jsonb),
    versao = versao + 1,
    atualizado_em = now()
where uf = 'PB' and sistema = 'saida_emergencia';
