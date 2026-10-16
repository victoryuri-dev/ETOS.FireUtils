-- Extintores do MA: acrescenta à linha ('MA','extintores') a capacidade
-- extintora mínima e a distância máxima por risco (classes A e B), que até
-- aqui ficavam fixas no código (extintores_calc.js,
-- CAPACIDADE_MINIMA_POR_RISCO), e a sigla da norma. Mesmos valores; só
-- passam a vir da base. Fonte: src/data/normas/MA/extintores.js.

update public.normas_dados
set dados = dados || $j${
  "norma": {
    "sigla": "NT 21 CBMMA",
    "nome": "Sistema de Proteção por Extintores de Incêndio"
  },
  "capacidade_por_nivel": {
    "baixo": [
      {
        "A": {
          "capacidade": "2-A",
          "distanciaMaxima": 25
        },
        "B": {
          "capacidade": "20-B",
          "distanciaMaxima": 15
        }
      }
    ],
    "medio": [
      {
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
        "A": {
          "capacidade": "4-A",
          "distanciaMaxima": 15
        },
        "B": {
          "capacidade": "80-B",
          "distanciaMaxima": 15
        }
      }
    ]
  }
}$j$::jsonb,
    versao = versao + 1,
    atualizado_em = now()
where uf = 'MA' and sistema = 'extintores';
