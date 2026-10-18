-- Semeia normas_dados com o Controle de Materiais de Acabamento e
-- Revestimento da Paraíba (NT 09/2024 CBMPB, Tabela B.1: classes aceitas em
-- piso, parede, teto e fachada por divisão/grupo), transcrita do item 9 do
-- formulário do Memorial Descritivo do CBMPB. Mesmo formato da linha do MA.
-- Fonte: src/data/normas/PB/controle_acabamento.js.

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('PB', 'controle_acabamento', $j${
  "norma": {
    "numero": "NT 09/2024",
    "nome": "Controle de Materiais de Acabamento e Revestimento — CBMPB"
  },
  "notas": {},
  "tabela_b1": {
    "A": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A",
        "III-A"
      ],
      "teto": [
        "I",
        "II-A",
        "III-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "B": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "D": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "E": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "G": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "H": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "I-1": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "J-1": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "J-2": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "C": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "F": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "I-2": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "I-3": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "J-3": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "J-4": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "L-1": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "M-2": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "M-3": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
      ],
      "parede": [
        "I",
        "II-A"
      ],
      "teto": [
        "I",
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    }
  }
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();
