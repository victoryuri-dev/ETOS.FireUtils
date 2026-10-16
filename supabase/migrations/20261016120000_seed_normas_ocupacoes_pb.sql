-- Semeia normas_dados com a classificação das edificações da Paraíba quanto
-- à natureza da ocupação — NT 04/2023 CBMPB. Rótulos transcritos do item 3.1
-- do formulário "Memorial Descritivo do Projeto de Segurança Contra Incêndio"
-- do CBMPB (modelo enviado pelo usuário, PDF), que reproduz a tabela da NT
-- 04/2023. Mesmo conteúdo de src/data/normas/PB/ocupacoes.js (fallback
-- offline/dev) — gerado a partir dele, não editar só um dos dois.
--
-- Só o sistema 'ocupacoes' (norma + ocupacoes). O mapa de CNAEs
-- ('carga_incendio', NT 02/2023 CBMPB) ainda não foi levantado: até lá a
-- carga de incêndio de projetos da PB é informada por levantamento.

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('PB', 'ocupacoes', $j${
  "norma": {
    "estado": "PB",
    "nome": "NT 04/2023 CBMPB",
    "desc": "Norma Técnica de Classificação das Edificações e Áreas de Risco — CBMPB"
  },
  "ocupacoes": {
    "A": {
      "descricao": "Residencial",
      "divisoes": {
        "A-1": "Habitação unifamiliar",
        "A-2": "Multifamiliar",
        "A-3": "Coletivo"
      }
    },
    "B": {
      "descricao": "Serviço de Hospedagem",
      "divisoes": {
        "B-1": "Hotel",
        "B-2": "Hotel residencial"
      }
    },
    "C": {
      "descricao": "Comercial",
      "divisoes": {
        "C-1": "Comércio com carga de incêndio nível I",
        "C-2": "Comercio com carga de incêndio nível II e III",
        "C-3": "Central de Compras"
      }
    },
    "D": {
      "descricao": "Serviço Profissional",
      "divisoes": {
        "D-1": "Serviço profissional ou condução de negócios",
        "D-2": "Agência bancária",
        "D-3": "Serviço de reparação",
        "D-4": "Laboratório"
      }
    },
    "E": {
      "descricao": "Escola e Cultura Física",
      "divisoes": {
        "E-1": "Escola em geral",
        "E-2": "Escola especial",
        "E-3": "Espaço para cultura física",
        "E-4": "Centro de treinamento profissional",
        "E-5": "Pré-escola",
        "E-6": "Escola para portadores de deficiências"
      }
    },
    "F": {
      "descricao": "Local de Reunião de público",
      "divisoes": {
        "F-1": "Local onde há objeto de valor inestimável",
        "F-2": "Local religioso e velório",
        "F-3": "Centro esportivo e de exibição",
        "F-4": "Estação e terminal de passageiro",
        "F-5": "Arte cênica e auditório",
        "F-6": "Clube social e Salão de festas",
        "F-7": "Instalação temporária",
        "F-8": "Local de refeição",
        "F-9": "Recreação pública",
        "F-10": "Exposição de objetos e animais",
        "F-11": "Boate"
      }
    },
    "G": {
      "descricao": "Serviços automotivos e assemelhados",
      "divisoes": {
        "G-1": "Garagem sem acesso ao público",
        "G-2": "Garagem com acesso ao público",
        "G-3": "Local dotado de abastecimento de combustível",
        "G-4": "Serviço de conservação, manutenção e reparos",
        "G-5": "Hangar"
      }
    },
    "H": {
      "descricao": "Serviço de saúde e Institucional",
      "divisoes": {
        "H-1": "Hospital veterinário",
        "H-2": "Local onde pessoas requerem cuidados especiais por limitações físicas ou mentais",
        "H-3": "Hospital",
        "H-4": "Repartição pública",
        "H-5": "Local com liberdade das pessoas sofre restrições",
        "H-6": "Clínicas e consultório médico e odontológico"
      }
    },
    "I": {
      "descricao": "Indústria",
      "divisoes": {
        "I-1": "Indústria com carga de incêndio Nível I",
        "I-2": "Indústria com carga de incêndio Nível II",
        "I-3": "Indústria com carga de incêndio Nível III"
      }
    },
    "J": {
      "descricao": "Depósito",
      "divisoes": {
        "J-1": "Depósitos de material incombustível",
        "J-2": "Depósitos com carga de incêndio Nível I",
        "J-3": "Depósitos com carga de incêndio Nível II",
        "J-4": "Depósitos com carga de incêndio Nível III"
      }
    },
    "K": {
      "descricao": "Energia",
      "divisoes": {
        "K-1": "Central de transmissão e distribuição de energia"
      }
    },
    "L": {
      "descricao": "Explosivo",
      "divisoes": {
        "L-1": "Comércio",
        "L-2": "Indústria",
        "L-3": "Depósito",
        "L-4": "Show Pirotécnico"
      }
    },
    "M": {
      "descricao": "Especial",
      "divisoes": {
        "M-1": "Túnel",
        "M-2": "Tanques ou Parques de Tanques",
        "M-3": "Central de comunicação",
        "M-4": "Canteiro de obras",
        "M-5": "Silos",
        "M-6": "Floresta nativa ou cultivada",
        "M-7": "Pátio de Contêineres"
      }
    }
  }
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();
