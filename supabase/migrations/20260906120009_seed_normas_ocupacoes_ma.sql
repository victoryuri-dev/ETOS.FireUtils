-- Parte de uma migração maior (base normativa central — ver
-- 20260906120002_seed_normas_restantes_ma.sql original) dividida em um
-- arquivo por sistema pra rodar e conferir um de cada vez no SQL Editor
-- do Supabase (o arquivo único de ~235KB/7 mil linhas não deixou nenhuma
-- linha nova gravada, sem erro nenhum reportado — mais fácil de
-- diagnosticar rodando aos pedaços do que investigar o motivo exato).

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('MA', 'ocupacoes', $j${
  "norma": {
    "estado": "MA",
    "nome": "NT 01/2019 CBMMA",
    "desc": "Norma Tecnica de Licenciamento e Fiscalizacao — CBMMA"
  },
  "ocupacoes": {
    "A": {
      "descricao": "Residencial",
      "divisoes": {
        "A-1": "Habitacao unifamiliar",
        "A-2": "Habitacao multifamiliar",
        "A-3": "Habitacao coletiva"
      }
    },
    "B": {
      "descricao": "Servico de Hospedagem",
      "divisoes": {
        "B-1": "Hotel e assemelhado",
        "B-2": "Hotel residencial"
      }
    },
    "C": {
      "descricao": "Comercial",
      "divisoes": {
        "C-1": "Comercio com baixa carga de incendio",
        "C-2": "Comercio com media e alta carga de incendio",
        "C-3": "Shopping centers"
      }
    },
    "D": {
      "descricao": "Servico profissional",
      "divisoes": {
        "D-1": "Local para prestacao de servico profissional ou conducao de negocios e administracao publica em geral",
        "D-2": "Agencia bancaria",
        "D-3": "Servico de reparacao (exceto os classificados em G-4)",
        "D-4": "Laboratorio"
      }
    },
    "E": {
      "descricao": "Educacional e cultura fisica",
      "divisoes": {
        "E-1": "Escola em geral",
        "E-2": "Escola especial",
        "E-3": "Espaco para cultura fisica",
        "E-4": "Centro de treinamento profissional",
        "E-5": "Pre-escola",
        "E-6": "Escola para portadores de deficiencias"
      }
    },
    "F": {
      "descricao": "Local de Reuniao de Publico",
      "divisoes": {
        "F-1": "Local onde ha objeto de valor inestimavel",
        "F-2": "Local religioso e velorio",
        "F-3": "Centro esportivo e de exibicao",
        "F-4": "Estacao e terminal de passageiro",
        "F-5": "Arte cenica e auditorio",
        "F-6": "Clubes sociais e Salao de Festas",
        "F-7": "Eventos temporarios",
        "F-8": "Local para refeicao",
        "F-9": "Recreacao publica",
        "F-10": "Exposicao de objetos ou animais",
        "F-11": "Boates"
      }
    },
    "G": {
      "descricao": "Servico automotivo e assemelhados",
      "divisoes": {
        "G-1": "Garagem sem acesso de publico e sem abastecimento",
        "G-2": "Garagem com acesso de publico e sem abastecimento",
        "G-3": "Local dotado de abastecimento de combustivel",
        "G-4": "Servico de conservacao, manutencao e reparos",
        "G-5": "Hangares",
        "G-6": "Marinas, portos e garagens nauticas"
      }
    },
    "H": {
      "descricao": "Servico de saude e institucional",
      "divisoes": {
        "H-1": "Hospital veterinario e assemelhados",
        "H-2": "Local onde pessoas requerem cuidados especiais por limitacoes fisicas ou mentais",
        "H-3": "Hospital e assemelhado",
        "H-4": "Edificacoes das forcas armadas e policiais",
        "H-5": "Local onde a liberdade das pessoas sofre restricoes",
        "H-6": "Clinica e consultorio medico e odontologico"
      }
    },
    "I": {
      "descricao": "Industria",
      "divisoes": {
        "I-1": "Industria com carga de incendio ate 300 MJ/m²",
        "I-2": "Industria com carga de incendio acima de 300 MJ/m² ate 1.200 MJ/m²",
        "I-3": "Industria com carga de incendio superior a 1.200 MJ/m²"
      }
    },
    "J": {
      "descricao": "Deposito",
      "divisoes": {
        "J-1": "Deposito de material incombustivel",
        "J-2": "Deposito com carga de incendio ate 300 MJ/m²",
        "J-3": "Deposito com carga de incendio acima de 300 MJ/m² ate 1.200 MJ/m²",
        "J-4": "Deposito com carga de incendio superior a 1.200 MJ/m²"
      }
    },
    "K": {
      "descricao": "Energia",
      "divisoes": {
        "K-1": "Central de transmissao e distribuicao de energia"
      }
    },
    "L": {
      "descricao": "Explosivo",
      "divisoes": {
        "L-1": "Comercio",
        "L-2": "Industria",
        "L-3": "Deposito"
      }
    },
    "M": {
      "descricao": "Especial",
      "divisoes": {
        "M-1": "Tunel",
        "M-2": "Liquido ou gas inflamavel ou combustivel",
        "M-3": "Central de comunicacao",
        "M-4": "Canteiro de obras",
        "M-5": "Silos",
        "M-6": "Floresta nativa ou cultivada",
        "M-7": "Patio de conteineres",
        "M-8": "Torres de telefonia movel"
      }
    }
  }
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();
