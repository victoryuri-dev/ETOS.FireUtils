-- Padroniza a linha ('PB', 'medidas_seguranca') de normas_dados (NT 04/2023
-- CBMPB, cadastrada direto no banco) no formato que o motor de normas do site
-- lê (src/data/normas/index.js — getMedidasObrigatorias), o mesmo da linha do
-- MA. Não apaga nem altera nenhuma chave existente: só acrescenta.
--
-- 1. tabela_simplificada — a Tabela 5 da PB (tabela5_edificacoesPequenas) está
--    organizada por medida → coluna; o motor lê por grupo/divisão → medida
--    (grupos: { A: { extintores: true, iluminacao: { notaSimp: 1 } } }).
--    Conteúdo GERADO a partir da tabela5_edificacoesPequenas da própria linha:
--    cada coluna vira os grupos/divisões que ela cobre ("A, D, E e G" → grupos
--    A, D, E, G; "F-1_..._F-10" → divisões F-1…F-8 e F-10; "I_J_M-3" → grupos
--    I, J e divisão M-3); true → true; { exigido: true, notaEspecifica: n } →
--    { notaSimp: n }; não exigido → omitido. Grupo K, M (exceto M-3) e L-2/L-3
--    não têm coluna na Tabela 5 — ficam sem dado de propósito (o motor aplica o
--    mínimo de referência e sinaliza para o RT, como a nota "a" da tabela manda
--    ver as tabelas específicas). Se a tabela5 for corrigida, regerar este campo.
--
-- 2. limiares.inclusivo — a Tabela 5 da PB vale para "área menor ou igual a
--    930 m² e altura inferior ou igual a 12,00 m"; sem esta marca o motor
--    compara com "<" (regra do MA) e erraria exatamente nos limites.

update public.normas_dados
set dados = jsonb_set(
              jsonb_set(dados, '{tabela_simplificada}', $j${
  "origem": "Gerada a partir de tabela5_edificacoesPequenas (Tabela 5, NT 04/2023 CBMPB)",
  "grupos": {
    "A": {
      "extintores": true,
      "iluminacao": {
        "notaSimp": 1
      },
      "sinalizacao": true,
      "saida_emergencia": true
    },
    "D": {
      "extintores": true,
      "iluminacao": {
        "notaSimp": 1
      },
      "sinalizacao": true,
      "saida_emergencia": true
    },
    "E": {
      "extintores": true,
      "iluminacao": {
        "notaSimp": 1
      },
      "sinalizacao": true,
      "saida_emergencia": true
    },
    "G": {
      "extintores": true,
      "iluminacao": {
        "notaSimp": 1
      },
      "sinalizacao": true,
      "saida_emergencia": true
    },
    "B": {
      "extintores": true,
      "iluminacao": {
        "notaSimp": 2
      },
      "sinalizacao": true,
      "saida_emergencia": true,
      "controle_acabamento": true
    },
    "C": {
      "extintores": true,
      "iluminacao": {
        "notaSimp": 1
      },
      "sinalizacao": true,
      "saida_emergencia": true
    },
    "I": {
      "extintores": true,
      "iluminacao": true,
      "sinalizacao": true,
      "saida_emergencia": true
    },
    "J": {
      "extintores": true,
      "iluminacao": true,
      "sinalizacao": true,
      "saida_emergencia": true
    }
  },
  "divisoes": {
    "F-1": {
      "brigada": {
        "notaSimp": 4
      },
      "extintores": true,
      "iluminacao": {
        "notaSimp": 3
      },
      "sinalizacao": true,
      "saida_emergencia": true,
      "controle_acabamento": true
    },
    "F-2": {
      "brigada": {
        "notaSimp": 4
      },
      "extintores": true,
      "iluminacao": {
        "notaSimp": 3
      },
      "sinalizacao": true,
      "saida_emergencia": true,
      "controle_acabamento": true
    },
    "F-3": {
      "brigada": {
        "notaSimp": 4
      },
      "extintores": true,
      "iluminacao": {
        "notaSimp": 3
      },
      "sinalizacao": true,
      "saida_emergencia": true,
      "controle_acabamento": true
    },
    "F-4": {
      "brigada": {
        "notaSimp": 4
      },
      "extintores": true,
      "iluminacao": {
        "notaSimp": 3
      },
      "sinalizacao": true,
      "saida_emergencia": true,
      "controle_acabamento": true
    },
    "F-5": {
      "brigada": {
        "notaSimp": 4
      },
      "extintores": true,
      "iluminacao": {
        "notaSimp": 3
      },
      "sinalizacao": true,
      "saida_emergencia": true,
      "controle_acabamento": true
    },
    "F-6": {
      "brigada": {
        "notaSimp": 4
      },
      "extintores": true,
      "iluminacao": {
        "notaSimp": 3
      },
      "sinalizacao": true,
      "saida_emergencia": true,
      "controle_acabamento": true
    },
    "F-7": {
      "brigada": {
        "notaSimp": 4
      },
      "extintores": true,
      "iluminacao": {
        "notaSimp": 3
      },
      "sinalizacao": true,
      "saida_emergencia": true,
      "controle_acabamento": true
    },
    "F-8": {
      "brigada": {
        "notaSimp": 4
      },
      "extintores": true,
      "iluminacao": {
        "notaSimp": 3
      },
      "sinalizacao": true,
      "saida_emergencia": true,
      "controle_acabamento": true
    },
    "F-10": {
      "brigada": {
        "notaSimp": 4
      },
      "extintores": true,
      "iluminacao": {
        "notaSimp": 3
      },
      "sinalizacao": true,
      "saida_emergencia": true,
      "controle_acabamento": true
    },
    "F-9": {
      "brigada": {
        "notaSimp": 4
      },
      "extintores": true,
      "iluminacao": {
        "notaSimp": 3
      },
      "sinalizacao": true,
      "saida_emergencia": true
    },
    "F-11": {
      "brigada": {
        "notaSimp": 4
      },
      "extintores": true,
      "iluminacao": {
        "notaSimp": 3
      },
      "sinalizacao": true,
      "saida_emergencia": true,
      "controle_acabamento": true
    },
    "H-1": {
      "extintores": true,
      "iluminacao": {
        "notaSimp": 1
      },
      "sinalizacao": true,
      "saida_emergencia": true
    },
    "H-4": {
      "extintores": true,
      "iluminacao": {
        "notaSimp": 1
      },
      "sinalizacao": true,
      "saida_emergencia": true
    },
    "H-6": {
      "extintores": true,
      "iluminacao": {
        "notaSimp": 1
      },
      "sinalizacao": true,
      "saida_emergencia": true
    },
    "H-2": {
      "brigada": true,
      "extintores": true,
      "iluminacao": {
        "notaSimp": 1
      },
      "sinalizacao": true,
      "controle_fumaca": {
        "notaSimp": 6
      },
      "saida_emergencia": true,
      "controle_acabamento": {
        "notaSimp": 5
      },
      "gerenciamento_risco": true
    },
    "H-3": {
      "brigada": true,
      "extintores": true,
      "iluminacao": {
        "notaSimp": 1
      },
      "sinalizacao": true,
      "controle_fumaca": {
        "notaSimp": 6
      },
      "saida_emergencia": true,
      "controle_acabamento": {
        "notaSimp": 5
      },
      "gerenciamento_risco": true
    },
    "H-5": {
      "brigada": true,
      "extintores": true,
      "iluminacao": {
        "notaSimp": 1
      },
      "sinalizacao": true,
      "controle_fumaca": {
        "notaSimp": 6
      },
      "saida_emergencia": true,
      "controle_acabamento": {
        "notaSimp": 5
      },
      "gerenciamento_risco": true
    },
    "M-3": {
      "extintores": true,
      "iluminacao": true,
      "sinalizacao": true,
      "saida_emergencia": true
    },
    "L-1": {
      "brigada": true,
      "extintores": true,
      "iluminacao": true,
      "sinalizacao": true,
      "saida_emergencia": true
    }
  },
  "notasEspecificas": {
    "1": "Somente para as edificações com mais de dois pavimentos.",
    "2": "Estão isentos os motéis que não possuam corredores internos de serviços.",
    "3": "Para edificação com lotação superior a 50 pessoas ou edificações com mais de dois pavimentos.",
    "4": "Exigido para lotação superior a 250 pessoas.",
    "5": "Somente para lotação superior a 250 pessoas, conforme NT-09.",
    "6": "Somente para lotação superior a 500 pessoas, nos termos da Norma Técnica específica, podendo ser substituído por chuveiros automáticos de resposta rápida com reserva de incêndio para 30 minutos."
  },
  "notasGerais": {
    "a": "Para o Grupo K (Energia) e M (especiais) ver tabelas específicas.",
    "b": "Para a Divisão G-5 (hangares): prever sistema de drenagem de líquidos nos pisos para bacias de contenção à distância. Não é permitido o armazenamento de líquidos combustíveis ou inflamáveis dentro dos hangares.",
    "c": "Para a Divisão L-1 (Explosivos), atender a NT-01. As divisões L-2 e L-3 somente serão avaliadas pelo Corpo de Bombeiros mediante Comissão Técnica.",
    "d": "Os subsolos das edificações devem ser compartimentados com PCF P-90 em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.",
    "e": "As instalações elétricas, o SPDA e o controle das fontes de ignição devem estar em conformidade com as normas técnicas oficiais.",
    "f": "Observar ainda as exigências para os riscos específicos das respectivas Normas Técnicas.",
    "g": "Depósitos em áreas descobertas, observar as exigências da Tabela 6J.",
    "h": "No cômputo de pavimentos, desconsiderar os pavimentos de subsolo quando destinados a estacionamento de veículos, vestiários e instalações sanitárias, áreas técnicas sem aproveitamento para quaisquer atividades ou permanência humana.",
    "i": "Os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro, etc.) ou controle de fumaça dimensionados conforme Norma Técnica específica.",
    "j": "Para edificações existentes, as adaptações de controle de material de acabamento e revestimento, de saída de emergência e de controle de fumaça, devem atender a NT-16."
  }
}$j$::jsonb, true),
              '{limiares,inclusivo}', 'true'::jsonb, true),
    versao = versao + 1,
    atualizado_em = now()
where uf = 'PB' and sistema = 'medidas_seguranca';
