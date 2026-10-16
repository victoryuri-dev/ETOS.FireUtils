-- Semeia normas_dados com a norma de extintores da Paraíba (NT 21/2024
-- CBMPB): Tabelas 1 a 5 (portáteis, sobre rodas, níveis de carga e
-- capacidade/distância por nível, classes A e B — o nível III com duas
-- opções). Itens que a NT da PB ainda não teve conferidos usam os valores
-- do MA, por decisão do usuário (ver cabeçalho de
-- src/data/normas/PB/extintores.js, fonte deste seed).

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('PB', 'extintores', $j${
  "altura_instalacao": {
    "suporteParede": {
      "alturaMaxima": 1.6,
      "alturaMinimaBase": 0.2
    },
    "apoiadoPiso": {
      "min": 0.1,
      "max": 0.2
    }
  },
  "area_limite_unidade_unica": {
    "alto": 150,
    "demais": 250
  },
  "capacidade_por_nivel": {
    "baixo": [
      {
        "key": "nivel_I",
        "A": {
          "capacidade": "2-A",
          "distanciaMaxima": 20
        },
        "B": {
          "capacidade": "20-B",
          "distanciaMaxima": 15
        }
      }
    ],
    "medio": [
      {
        "key": "nivel_II",
        "A": {
          "capacidade": "3-A",
          "distanciaMaxima": 20
        },
        "B": {
          "capacidade": "40-B",
          "distanciaMaxima": 15
        }
      }
    ],
    "alto": [
      {
        "key": "nivel_III_3A",
        "A": {
          "capacidade": "3-A",
          "distanciaMaxima": 15
        },
        "B": {
          "capacidade": "40-B",
          "distanciaMaxima": 10
        }
      },
      {
        "key": "nivel_III_4A",
        "A": {
          "capacidade": "4-A",
          "distanciaMaxima": 20
        },
        "B": {
          "capacidade": "80-B",
          "distanciaMaxima": 15
        }
      }
    ]
  },
  "distancia_entrada_escada": 5,
  "distancia_maxima": {
    "portatil": {
      "baixo": 20,
      "medio": 20,
      "alto": 15
    },
    "sobreRodas": {
      "baixo": 35,
      "medio": 30,
      "alto": 20
    },
    "classeD": 20
  },
  "limiares_risco": {
    "baixo": 300,
    "medio": 1200
  },
  "locais_risco_especial": [
    "Casa de caldeira",
    "Casa de bombas",
    "Casa de força elétrica",
    "Casa de máquinas",
    "Galeria de transmissão",
    "Incinerador",
    "Elevador (casa de máquinas)",
    "Ponte rolante",
    "Escada rolante (casa de máquinas)",
    "Quadro de redução para baixa tensão",
    "Transformadores",
    "Contêineres de telefonia"
  ],
  "norma": {
    "sigla": "NT 21/2024 CBMPB",
    "nome": "Sistema de Proteção por Extintores"
  },
  "notas": {
    "minimoPorPavimento": "NT 21/2024 CBMPB — cada pavimento deve possuir no mínimo duas unidades extintoras: uma para incêndio classe A e outra para incêndio classes B e C.",
    "substituicaoABC": "NT 21/2024 CBMPB — o extintor de pó ABC pode substituir qualquer tipo de extintor de classes específicas (A, B ou C).",
    "unidadeUnica": "NT 21/2024 CBMPB — permitida uma única unidade extintora de classe específica por pavimento conforme o risco predominante, dentro do limite de área.",
    "proporcaoSecundario": "NT 21/2024 CBMPB — os extintores devem ser intercalados na proporção de dois para o risco predominante e um para o risco secundário.",
    "combinacaoUnidades": "NT 21/2024 CBMPB — as unidades extintoras devem corresponder a um só extintor; não são aceitas combinações de dois ou mais extintores, exceto espuma mecânica, onde é permitido somar até dois extintores.",
    "classeD": "NT 21/2024 CBMPB — o dimensionamento para classe D deve ser baseado no metal combustível, no tamanho de suas partículas e na área a proteger, conforme recomendação do fabricante do agente extintor.",
    "entradaEscada": "NT 21/2024 CBMPB — deve ser instalado pelo menos um extintor a não mais de 5 m da entrada principal da edificação e das escadas nos demais pavimentos."
  },
  "proporcao_risco_secundario": {
    "predominante": 2,
    "secundario": 1
  },
  "tipos_portatil": [
    {
      "key": "agua",
      "label": "Água",
      "capacidadeMinima": "2-A",
      "classes": [
        "A"
      ]
    },
    {
      "key": "espuma",
      "label": "Espuma mecânica",
      "capacidadeMinima": "2-A:10-B",
      "classes": [
        "A",
        "B"
      ]
    },
    {
      "key": "co2",
      "label": "Dióxido de carbono (CO₂)",
      "capacidadeMinima": "5-B:C",
      "classes": [
        "B",
        "C"
      ]
    },
    {
      "key": "po_bc",
      "label": "Pó químico BC",
      "capacidadeMinima": "20-B:C",
      "classes": [
        "B",
        "C"
      ]
    },
    {
      "key": "po_abc",
      "label": "Pó químico ABC",
      "capacidadeMinima": "2-A:20-B:C",
      "classes": [
        "A",
        "B",
        "C"
      ]
    },
    {
      "key": "halogenado",
      "label": "Compostos halogenados",
      "capacidadeMinima": "5-B:C",
      "classes": [
        "B",
        "C"
      ]
    },
    {
      "key": "k_1a",
      "label": "Classe K — 1-A:K",
      "capacidadeMinima": "1-A:K - 6L",
      "classes": [
        "A",
        "K"
      ]
    },
    {
      "key": "k_2a",
      "label": "Classe K — 2-A:K",
      "capacidadeMinima": "2-A:K - 6L",
      "classes": [
        "A",
        "K"
      ]
    }
  ],
  "tipos_sobre_rodas": [
    {
      "key": "agua",
      "label": "Água",
      "capacidadeMinima": "10-A",
      "classes": [
        "A"
      ]
    },
    {
      "key": "espuma",
      "label": "Espuma mecânica",
      "capacidadeMinima": "6-A:40-B",
      "classes": [
        "A",
        "B"
      ]
    },
    {
      "key": "co2",
      "label": "Dióxido de carbono (CO₂)",
      "capacidadeMinima": "10-B:C",
      "classes": [
        "B",
        "C"
      ]
    },
    {
      "key": "po_bc",
      "label": "Pó químico BC",
      "capacidadeMinima": "80-B:C",
      "classes": [
        "B",
        "C"
      ]
    },
    {
      "key": "po_abc",
      "label": "Pó químico ABC",
      "capacidadeMinima": "6-A:80-B:C",
      "classes": [
        "A",
        "B",
        "C"
      ]
    }
  ]
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();
