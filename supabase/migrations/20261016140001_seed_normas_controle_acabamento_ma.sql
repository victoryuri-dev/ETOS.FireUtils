-- Semeia normas_dados com o Controle de Material de Acabamento e
-- Revestimento (CMAR) do Maranhão — NT 10/2021 CBMMA, Tabela B.1 (classes
-- exigidas por divisão e elemento construtivo) e notas. Até aqui só existia
-- no código (src/data/normas/MA/controle_acabamento.js), que agora é só a
-- fonte deste seed — o site lê exclusivamente a base central. Gerado a
-- partir daquele arquivo.

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('MA', 'controle_acabamento', $j${
  "tabela_b1": {
    "A-3": {
      "piso": [
        "I",
        "II-A",
        "III-A",
        "IV-A",
        "V-A"
      ],
      "parede": [
        "I",
        "II-A",
        "III-A",
        "IV-A"
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
        "II-A",
        "III-A"
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
        "II-A",
        "III-A"
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
        "II-A",
        "III-A"
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
        "II-A",
        "III-A"
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
        "II-A",
        "III-A"
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
        "II-A",
        "III-A"
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
        "II-A",
        "III-A"
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
        "II-A",
        "III-A"
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
    "C-1": {
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
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "F-1": {
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
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "F-2": {
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
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "F-3": {
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
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "F-4": {
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
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "F-6": {
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
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "F-8": {
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
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "F-9": {
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
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "F-10": {
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
        "II-A"
      ],
      "fachada": [
        "I",
        "II-A",
        "II-B"
      ]
    },
    "C-2": {
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
    "C-3": {
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
    "F-5": {
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
    "F-7": {
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
    "F-11": {
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
  },
  "notas": {
    "1": null,
    "2": null,
    "3": null,
    "4": null,
    "5": null,
    "6": null,
    "7": null,
    "8": null,
    "9": null
  },
  "norma": {
    "numero": "NT 10/2021",
    "nome": "Controle de Material de Acabamento e Revestimento — CBMMA"
  }
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();
