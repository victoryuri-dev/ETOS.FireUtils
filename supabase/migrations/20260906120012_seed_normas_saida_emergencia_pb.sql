-- Semeia normas_dados com a tabela de Saídas de Emergência da Paraíba —
-- NT 12/2025 CBMPB (Portaria nº 006/2025-GCG, DOE nº 18.289 de 12/02/2024),
-- fonte enviada pelo usuário (PDF), mesma reconciliação já feita em
-- src/data/normas/PB/saida_emergencia.js (ver esse arquivo pra detalhes).
--
-- Referência normativa citada pela própria NT 12/2025 (seção 3): Instrução
-- Técnica Nº 11/2019 do CBPMESP — mesma referência do Maranhão (ver
-- 20260906120001_seed_normas_saida_emergencia_ma.sql). Conferido campo a
-- campo: tabela (Anexo A) e distâncias máximas (Anexo B) batem com o
-- Maranhão em toda divisão, com uma única exceção real: grupo C
-- (Comercial) usa 5 m²/pessoa aqui, contra 3 m²/pessoa no MA.
--
-- Não inclui "ocupacoes" — a classificação de grupos/divisões da PB ainda
-- não tem uma NT própria cadastrada nesta base (a NT 12/2025 remete a uma
-- norma técnica de Classificação das Edificações separada, que não temos);
-- src/data/normas/PB/ocupacoes.js usa os códigos do MA só como
-- placeholder local, sem migrar isso pra cá ainda.
insert into public.normas_dados (uf, sistema, dados, versao)
values (
  'PB',
  'saida_emergencia',
  $json$
{
  "sigla": "PB",
  "nome": "Paraíba",
  "corpo": "CBM-PB",
  "norma_saidas": "NT 12/2025 CBMPB / Instrução Técnica Nº 11/2019 CBPMESP",
  "tabela": {
    "A-1": {"A": null, "AD": 60, "ER": 45, "PT": 100, "obs": "2 pessoas por dormitório", "notas": ["C"]},
    "A-2": {"A": null, "AD": 60, "ER": 45, "PT": 100, "obs": "2 pessoas por dormitório", "notas": ["C"]},
    "A-3": {"A": 4, "AD": 60, "ER": 45, "PT": 100, "obs": "2 por dormitório + 1 por 4m² de alojamento", "notas": ["C", "D"]},
    "B-1": {"A": 15, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 15m²", "notas": ["E", "G"]},
    "B-2": {"A": 15, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 15m²", "notas": ["E", "G"]},
    "C-1": {"A": 5, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 5m²", "notas": ["E", "J", "M"]},
    "C-2": {"A": 5, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 5m²", "notas": ["E", "J", "M"]},
    "C-3": {"A": 5, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 5m²", "notas": ["E", "J", "M"]},
    "D-1": {"A": 7, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 7m²", "notas": ["L", "N"]},
    "D-2": {"A": 7, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 7m²", "notas": ["L", "N"]},
    "D-3": {"A": 7, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 7m²", "notas": ["L", "N"]},
    "D-4": {"A": 7, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 7m²", "notas": ["L", "N"]},
    "E-1": {"A": 1.5, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 1,50m² de sala de aula", "notas": ["F", "N"]},
    "E-2": {"A": 1.5, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 1,50m² de sala de aula", "notas": ["F", "N"]},
    "E-3": {"A": 1.5, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 1,50m² de sala de aula", "notas": ["F", "N"]},
    "E-4": {"A": 1.5, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 1,50m² de sala de aula", "notas": ["F", "N"]},
    "E-5": {"A": 1.5, "AD": 30, "ER": 22, "PT": 30, "obs": "1 pessoa por 1,50m² de sala de aula", "notas": ["F", "N"]},
    "E-6": {"A": 1.5, "AD": 30, "ER": 22, "PT": 30, "obs": "1 pessoa por 1,50m² de sala de aula", "notas": ["F", "N"]},
    "F-1": {"A": 3, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 3m²", "notas": ["N"]},
    "F-2": {"A": 1, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por m²", "notas": ["E", "G", "N", "P", "Q"]},
    "F-3": {"A": 0.5, "AD": 100, "ER": 75, "PT": 100, "obs": "2 pessoas por m²", "notas": ["G", "N", "P", "Q"]},
    "F-4": {"A": 3, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 3m²", "notas": ["E", "J", "F", "N"]},
    "F-5": {"A": 1, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por m²", "notas": ["E", "G", "N", "P", "Q"]},
    "F-6": {"A": 0.5, "AD": 100, "ER": 75, "PT": 100, "obs": "2 pessoas por m²", "notas": ["G", "N", "P", "Q"]},
    "F-7": {"A": 0.5, "AD": 100, "ER": 75, "PT": 100, "obs": "2 pessoas por m²", "notas": ["G", "N", "P", "Q"]},
    "F-8": {"A": 1, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por m²", "notas": ["E", "G", "N", "P", "Q"]},
    "F-9": {"A": 0.5, "AD": 100, "ER": 75, "PT": 100, "obs": "2 pessoas por m²", "notas": ["G", "N", "P", "Q"]},
    "F-10": {"A": 3, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 3m²", "notas": ["N"]},
    "F-11": {"A": 0.3333333333333333, "AD": 100, "ER": 75, "PT": 100, "obs": "3 pessoas por m²", "notas": ["E"]},
    "G-1": {"A": null, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 40 vagas", "notas": []},
    "G-2": {"A": null, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 40 vagas", "notas": []},
    "G-3": {"A": null, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 40 vagas", "notas": []},
    "G-4": {"A": 20, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 20m²", "notas": ["E"]},
    "G-5": {"A": 20, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 20m²", "notas": ["E"]},
    "H-1": {"A": 7, "AD": 60, "ER": 45, "PT": 100, "obs": "1 pessoa por 7m²", "notas": ["E"]},
    "H-2": {"A": 4, "AD": 30, "ER": 22, "PT": 30, "obs": "2 por dormitório + 1 por 4m² de alojamento", "notas": ["C", "E"]},
    "H-3": {"A": null, "AD": 30, "ER": 22, "PT": 30, "obs": "1,5 por leito + 1 por 7m² de ambulatório", "notas": ["H"]},
    "H-4": {"A": 7, "AD": 60, "ER": 45, "PT": 100, "obs": "1 pessoa por 7m²", "notas": ["F"]},
    "H-5": {"A": 7, "AD": 60, "ER": 45, "PT": 100, "obs": "1 pessoa por 7m²", "notas": ["F"]},
    "H-6": {"A": 7, "AD": 60, "ER": 45, "PT": 100, "obs": "1 pessoa por 7m²", "notas": ["E"]},
    "I-1": {"A": 10, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 10m²", "notas": []},
    "I-2": {"A": 10, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 10m²", "notas": []},
    "I-3": {"A": 10, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 10m²", "notas": []},
    "J-1": {"A": 30, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 30m²", "notas": ["J"]},
    "J-2": {"A": 30, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 30m²", "notas": ["J"]},
    "J-3": {"A": 30, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 30m²", "notas": ["J"]},
    "J-4": {"A": 30, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 30m²", "notas": ["J"]},
    "K-1": {"A": 10, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 10m²", "notas": []},
    "L-1": {"A": 3, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 3m²", "notas": []},
    "L-2": {"A": 10, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 10m²", "notas": []},
    "L-3": {"A": 10, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 10m²", "notas": []},
    "M-1": {"A": null, "AD": 100, "ER": 75, "PT": 100, "obs": "Consultar normas e regulamentos específicos", "notas": ["I"]},
    "M-3": {"A": 10, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 10m²", "notas": []},
    "M-4": {"A": 4, "AD": 60, "ER": 45, "PT": 100, "obs": "1 pessoa por 4m²", "notas": []},
    "M-5": {"A": 10, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 10m²", "notas": []}
  },
  "notas": {
    "A": "(A) os parâmetros dados nesta tabela são os mínimos aceitáveis para o cálculo da população.",
    "B": "(B) as capacidades das unidades de passagem (1 UP = 0,55 m) em escadas e rampas estendem-se para lanços retos e saída descendente.",
    "C": "(C) em apartamentos de até 2 dormitórios, a sala deve ser considerada como dormitório; em apartamentos maiores (3 e mais dormitórios), as salas, gabinetes e outras dependências que possam ser usadas como dormitórios (inclusive para empregadas) são consideradas como dormitórios. Em apartamentos mínimos, sem divisões em planta, considera-se uma pessoa para cada 6m² de área de pavimento.",
    "D": "(D) alojamento = dormitório coletivo, com mais de 10m².",
    "E": "(E) por \"Área\" entende-se a área do pavimento que abriga a população em foco. Quando discriminado o tipo de área (por ex.: área do alojamento), é a área útil interna da dependência em questão.",
    "F": "(F) auditórios e assemelhados em escolas são considerados nos grupos de ocupação F-5, F-6 e outros, conforme o caso.",
    "G": "(G) as cozinhas e suas áreas de apoio, nas ocupações B, F-6 e F-8, têm sua ocupação admitida como grupo D, isto é, uma pessoa por 7m² de área.",
    "H": "(H) em hospitais e clínicas com internamento (H-3), que tenham pacientes ambulatoriais, acresce-se à área calculada por leito a área de pavimento correspondente ao ambulatório, na base de uma pessoa por 7m².",
    "I": "(I) o símbolo \"+\" indica necessidade de consultar normas e regulamentos específicos (não cobertos por esta NT).",
    "J": "(J) a parte de atendimento ao público de comércio atacadista deve ser considerada como do grupo C.",
    "K": "(K) esta tabela se aplica a todas as edificações, exceto para os locais destinados às divisões F-3 e F-7 com população total superior a 2.500 pessoas, onde deve ser consultada a norma técnica específica de Centros esportivos e de exibição.",
    "L": "(L) para ocupações do tipo Call-center, o cálculo da população é de uma pessoa por 1,5m² de área.",
    "M": "(M) para a área de Lojas adota-se no cálculo \"uma pessoa por 7m² de área\".",
    "N": "(N) para o cálculo da população, será admitido o leiaute dos assentos permanentes apresentado em planta.",
    "O": "(O) para a classificação das ocupações (grupos e divisões), consultar a tabela 1 da norma técnica específica de Classificação das edificações e áreas de risco e exigências das medidas de segurança contra incêndio e controle de pânico.",
    "P": "(P) para a ocupação \"restaurante dançante\" e \"salão de festas\" onde há mesas e cadeiras para refeição e pista de dança, o parâmetro para cálculo de população é de 1 pessoa por 0,67m² de área.",
    "Q": "(Q) para os locais que possuam assento do tipo banco (assento comprido, para várias pessoas, com ou sem encosto), o parâmetro para cálculo de população é de 1 pessoa por 0,50m linear, mediante apresentação de leiaute."
  },
  "larguras_minimas": {
    "LARG_UP": 0.55,
    "AD": 1.2,
    "ER": 1.2,
    "PT": [
      {"n_up": 1, "largura": 0.8, "tipo": "1 folha"},
      {"n_up": 2, "largura": 1.0, "tipo": "1 folha"},
      {"n_up": 3, "largura": 1.5, "tipo": "2 folhas"},
      {"n_up": 4, "largura": 2.0, "tipo": "2 folhas"}
    ]
  },
  "distancias_maximas": {
    "mapa_ocupacao": {
      "A-1": "AB", "A-2": "AB", "A-3": "AB",
      "B-1": "AB", "B-2": "AB",
      "C-1": "CDFG", "C-2": "CDFG", "C-3": "CDFG",
      "D-1": "CDFG", "D-2": "CDFG", "D-3": "CDFG", "D-4": "CDFG",
      "E-1": "CDFG", "E-2": "CDFG", "E-3": "CDFG", "E-4": "CDFG", "E-5": "CDFG", "E-6": "CDFG",
      "F-1": "CDFG", "F-2": "CDFG", "F-3": "CDFG", "F-4": "CDFG", "F-5": "CDFG",
      "F-6": "CDFG", "F-7": "CDFG", "F-8": "CDFG", "F-9": "CDFG", "F-10": "CDFG", "F-11": "CDFG",
      "G-1": "G1G2J2", "G-2": "G1G2J2",
      "G-3": "CDFG", "G-4": "CDFG", "G-5": "CDFG",
      "H-1": "CDFG", "H-2": "CDFG", "H-3": "CDFG", "H-4": "CDFG", "H-5": "CDFG", "H-6": "CDFG",
      "I-1": "I1J1",
      "I-2": "I2I3J3J4", "I-3": "I2I3J3J4",
      "J-1": "G1G2J2",
      "J-2": "G1G2J2",
      "J-3": "I2I3J3J4", "J-4": "I2I3J3J4",
      "K-1": "CDFG",
      "L-1": "CDFG", "L-2": "CDFG", "L-3": "CDFG",
      "M-1": "CDFG", "M-3": "CDFG", "M-4": "CDFG", "M-5": "CDFG"
    },
    "grupos": {
      "AB": {
        "descricao": "A e B",
        "terreo": {
          "sem_chuveiro": {"saida_unica": {"sem_deteccao": 45, "com_deteccao": 55}, "mais_saidas": {"sem_deteccao": 55, "com_deteccao": 65}},
          "com_chuveiro": {"saida_unica": {"sem_deteccao": 60, "com_deteccao": 70}, "mais_saidas": {"sem_deteccao": 80, "com_deteccao": 95}}
        },
        "demais": {
          "sem_chuveiro": {"saida_unica": {"sem_deteccao": 40, "com_deteccao": 45}, "mais_saidas": {"sem_deteccao": 50, "com_deteccao": 60}},
          "com_chuveiro": {"saida_unica": {"sem_deteccao": 55, "com_deteccao": 65}, "mais_saidas": {"sem_deteccao": 75, "com_deteccao": 90}}
        }
      },
      "CDFG": {
        "descricao": "C, D, E, F, G-3, G-4, G-5, H, K, L e M",
        "terreo": {
          "sem_chuveiro": {"saida_unica": {"sem_deteccao": 40, "com_deteccao": 45}, "mais_saidas": {"sem_deteccao": 50, "com_deteccao": 60}},
          "com_chuveiro": {"saida_unica": {"sem_deteccao": 55, "com_deteccao": 65}, "mais_saidas": {"sem_deteccao": 75, "com_deteccao": 90}}
        },
        "demais": {
          "sem_chuveiro": {"saida_unica": {"sem_deteccao": 30, "com_deteccao": 35}, "mais_saidas": {"sem_deteccao": 40, "com_deteccao": 45}},
          "com_chuveiro": {"saida_unica": {"sem_deteccao": 45, "com_deteccao": 55}, "mais_saidas": {"sem_deteccao": 65, "com_deteccao": 75}}
        }
      },
      "I1J1": {
        "descricao": "I-1 e J-1",
        "terreo": {
          "sem_chuveiro": {"saida_unica": {"sem_deteccao": 80, "com_deteccao": 95}, "mais_saidas": {"sem_deteccao": 120, "com_deteccao": 140}},
          "com_chuveiro": {"saida_unica": {"sem_deteccao": null, "com_deteccao": null}, "mais_saidas": {"sem_deteccao": null, "com_deteccao": null}}
        },
        "demais": {
          "sem_chuveiro": {"saida_unica": {"sem_deteccao": 70, "com_deteccao": 80}, "mais_saidas": {"sem_deteccao": 110, "com_deteccao": 130}},
          "com_chuveiro": {"saida_unica": {"sem_deteccao": null, "com_deteccao": null}, "mais_saidas": {"sem_deteccao": null, "com_deteccao": null}}
        }
      },
      "G1G2J2": {
        "descricao": "G-1, G-2 e J-2",
        "terreo": {
          "sem_chuveiro": {"saida_unica": {"sem_deteccao": 50, "com_deteccao": 60}, "mais_saidas": {"sem_deteccao": 60, "com_deteccao": 70}},
          "com_chuveiro": {"saida_unica": {"sem_deteccao": 80, "com_deteccao": 95}, "mais_saidas": {"sem_deteccao": 120, "com_deteccao": 140}}
        },
        "demais": {
          "sem_chuveiro": {"saida_unica": {"sem_deteccao": 45, "com_deteccao": 55}, "mais_saidas": {"sem_deteccao": 55, "com_deteccao": 65}},
          "com_chuveiro": {"saida_unica": {"sem_deteccao": 70, "com_deteccao": 80}, "mais_saidas": {"sem_deteccao": 110, "com_deteccao": 130}}
        }
      },
      "I2I3J3J4": {
        "descricao": "I-2, I-3, J-3 e J-4",
        "terreo": {
          "sem_chuveiro": {"saida_unica": {"sem_deteccao": 40, "com_deteccao": 45}, "mais_saidas": {"sem_deteccao": 50, "com_deteccao": 60}},
          "com_chuveiro": {"saida_unica": {"sem_deteccao": 60, "com_deteccao": 70}, "mais_saidas": {"sem_deteccao": 100, "com_deteccao": 120}}
        },
        "demais": {
          "sem_chuveiro": {"saida_unica": {"sem_deteccao": 30, "com_deteccao": 35}, "mais_saidas": {"sem_deteccao": 40, "com_deteccao": 45}},
          "com_chuveiro": {"saida_unica": {"sem_deteccao": 50, "com_deteccao": 65}, "mais_saidas": {"sem_deteccao": 80, "com_deteccao": 95}}
        }
      }
    }
  }
}
$json$::jsonb,
  1
)
on conflict (uf, sistema) do update
  set dados         = excluded.dados,
      versao         = public.normas_dados.versao + 1,
      atualizado_em  = now();
