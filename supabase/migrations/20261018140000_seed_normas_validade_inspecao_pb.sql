-- Semeia normas_dados com o Anexo B da NT 02/2023 CBMPB (prazos de validade
-- das inspeções): risco e validade (anos) por divisão; F-3 com o caso de
-- estádio de futebol. Alimenta o item 3.4 do Memorial Descritivo da PB.
-- Fonte: src/data/normas/PB/validade_inspecao.js.

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('PB', 'validade_inspecao', $j${
  "norma": {
    "numero": "NT 02/2023",
    "nome": "Classificação das Edificações e Áreas de Riscos — Anexo B: prazos de validade das inspeções do CBMPB"
  },
  "tabela_anexo_b": {
    "A-1": {
      "risco": "baixo",
      "validadeAnos": 5
    },
    "A-2": {
      "risco": "baixo",
      "validadeAnos": 5
    },
    "A-3": {
      "risco": "baixo",
      "validadeAnos": 5
    },
    "B-1": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "B-2": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "C-1": {
      "risco": "baixo",
      "validadeAnos": 5
    },
    "C-2": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "C-3": {
      "risco": "alto",
      "validadeAnos": 1
    },
    "D-1": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "D-2": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "D-3": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "D-4": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "E-1": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "E-2": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "E-3": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "E-4": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "E-5": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "E-6": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "F-1": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "F-2": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "F-3": {
      "risco": "medio",
      "validadeAnos": 2,
      "estadioFutebol": {
        "risco": "alto",
        "validadeAnos": 1
      }
    },
    "F-4": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "F-5": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "F-6": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "F-7": {
      "risco": "alto",
      "validadeAnos": 1
    },
    "F-8": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "F-9": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "F-10": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "F-11": {
      "risco": "alto",
      "validadeAnos": 1
    },
    "G-1": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "G-2": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "G-3": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "G-4": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "G-5": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "H-1": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "H-2": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "H-3": {
      "risco": "alto",
      "validadeAnos": 1
    },
    "H-4": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "H-5": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "H-6": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "I-1": {
      "risco": "baixo",
      "validadeAnos": 5
    },
    "I-2": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "I-3": {
      "risco": "alto",
      "validadeAnos": 1
    },
    "J-1": {
      "risco": "baixo",
      "validadeAnos": 5
    },
    "J-2": {
      "risco": "baixo",
      "validadeAnos": 5
    },
    "J-3": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "J-4": {
      "risco": "alto",
      "validadeAnos": 1
    },
    "K-1": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "L-1": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "L-2": {
      "risco": "alto",
      "validadeAnos": 1
    },
    "L-3": {
      "risco": "alto",
      "validadeAnos": 1
    },
    "L-4": {
      "risco": "alto",
      "validadeAnos": 1
    },
    "M-1": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "M-2": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "M-3": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "M-4": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "M-5": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "M-6": {
      "risco": "medio",
      "validadeAnos": 2
    },
    "M-7": {
      "risco": "medio",
      "validadeAnos": 2
    }
  }
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();
