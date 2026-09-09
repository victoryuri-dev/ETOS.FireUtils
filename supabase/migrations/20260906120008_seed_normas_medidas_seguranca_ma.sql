-- Parte de uma migração maior (base normativa central — ver
-- 20260906120002_seed_normas_restantes_ma.sql original) dividida em um
-- arquivo por sistema pra rodar e conferir um de cada vez no SQL Editor
-- do Supabase (o arquivo único de ~235KB/7 mil linhas não deixou nenhuma
-- linha nova gravada, sem erro nenhum reportado — mais fácil de
-- diagnosticar rodando aos pedaços do que investigar o motivo exato).

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('MA', 'medidas_seguranca', $j${
  "limiares": {
    "areaMin": 750,
    "alturaMin": 12
  },
  "medidas": {
    "A": {
      "notasGerais": {
        "a": "Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.",
        "b": "Observar ainda as exigências das respectivas Normas Técnicas.",
        "c": "Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.",
        "d": "Medidas de segurança obrigatórias somente para áreas comuns e guarita."
      },
      "medidas": {
        "acesso_viatura": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "seg_estrutural": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "compart_horizontal": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "compart_vertical": {
          "divisoes": [
            "A-2",
            "A-3"
          ],
          "alturaMin": 23
        },
        "controle_acabamento": {
          "divisoes": [
            "A-2",
            "A-3"
          ],
          "alturaMin": 12
        },
        "saida_emergencia": [
          {
            "divisoes": [
              "A-1"
            ],
            "alturaMin": null,
            "notaGeral": "d"
          },
          {
            "divisoes": [
              "A-2",
              "A-3"
            ],
            "alturaMin": null
          }
        ],
        "gerenciamento_risco": {
          "divisoes": [],
          "alturaMin": null
        },
        "brigada": {
          "divisoes": [
            "A-2",
            "A-3"
          ],
          "alturaMin": null
        },
        "iluminacao": [
          {
            "divisoes": [
              "A-1"
            ],
            "alturaMin": null,
            "notaGeral": "d"
          },
          {
            "divisoes": [
              "A-2",
              "A-3"
            ],
            "alturaMin": null
          }
        ],
        "sinalizacao": [
          {
            "divisoes": [
              "A-1"
            ],
            "alturaMin": null,
            "notaGeral": "d"
          },
          {
            "divisoes": [
              "A-2",
              "A-3"
            ],
            "alturaMin": null
          }
        ],
        "extintores": [
          {
            "divisoes": [
              "A-1"
            ],
            "alturaMin": null,
            "notaGeral": "d"
          },
          {
            "divisoes": [
              "A-2",
              "A-3"
            ],
            "alturaMin": null
          }
        ],
        "hidrantes": {
          "divisoes": [
            "A-2",
            "A-3"
          ],
          "alturaMin": null
        },
        "alarme": [
          {
            "divisoes": [
              "A-2",
              "A-3"
            ],
            "alturaMin": null,
            "alturaMax": 30
          },
          {
            "divisoes": [
              "A-2",
              "A-3"
            ],
            "alturaMin": 30
          }
        ],
        "deteccao": {
          "divisoes": [],
          "alturaMin": null
        },
        "sprinklers": {
          "divisoes": [],
          "alturaMin": null
        },
        "controle_fumaca": {
          "divisoes": [],
          "alturaMin": null
        },
        "central_gas": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "spda": {
          "divisoes": [],
          "alturaMin": null
        }
      }
    },
    "B": {
      "notasEspecificas": {
        "1": "A área máxima de compartimentação deve abranger as áreas dos pavimentos e mezaninos interligados sem compartimentação.",
        "2": "Devem ser atendidas somente as regras específicas de compartimentação entre unidades autônomas.",
        "3": "Pode ser substituída por sistemas de chuveiros automáticos.",
        "4": "Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos.",
        "5": "Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.",
        "6": "Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos até 90 metros de altura, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações, sendo que para altura superior deve-se, adicionalmente, adotar as soluções contidas na NT específica de compartimentação.",
        "7": "Deve haver elevador de emergência para alturas acima de 60 metros.",
        "8": "Inclui Bombeiro Profissional Civil conforme NT específica.",
        "9": "Os acionadores manuais devem ser instalados nas áreas de circulação.",
        "10": "Estão isentos os motéis que não possuam corredores internos de serviço.",
        "11": "Os detectores de incêndio devem ser instalados em todos os quartos.",
        "12": "Acima de 90 metros de altura conforme critérios de norma específica.",
        "13": "Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais."
      },
      "notasGerais": {
        "a": "Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.",
        "b": "Observar ainda as exigências das respectivas Normas Técnicas.",
        "c": "Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.), ou controle de fumaça dimensionados conforme o disposto em NT específica."
      },
      "medidas": {
        "acesso_viatura": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "seg_estrutural": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "compart_horizontal": {
          "divisoes": "todas",
          "alturaMin": null,
          "notaEspecifica": [
            2,
            3,
            4
          ]
        },
        "compart_vertical": {
          "divisoes": "todas",
          "alturaMin": 12,
          "notaEspecifica": [
            5,
            6
          ]
        },
        "controle_acabamento": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "saida_emergencia": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "gerenciamento_risco": {
          "divisoes": "todas",
          "alturaMin": 23
        },
        "brigada": {
          "divisoes": "todas",
          "alturaMin": null,
          "notaEspecifica": 8
        },
        "iluminacao": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "sinalizacao": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "extintores": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "hidrantes": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "alarme": {
          "divisoes": "todas",
          "alturaMin": null,
          "notaEspecifica": 9
        },
        "deteccao": {
          "divisoes": "todas",
          "alturaMin": null,
          "notaEspecifica": [
            10,
            11
          ]
        },
        "sprinklers": {
          "divisoes": "todas",
          "alturaMin": 23
        },
        "controle_fumaca": {
          "divisoes": "todas",
          "alturaMin": 90,
          "notaEspecifica": 12
        },
        "espuma": {
          "divisoes": [],
          "alturaMin": null
        },
        "central_gas": {
          "divisoes": "todas",
          "alturaMin": null,
          "notaEspecifica": 13
        },
        "spda": {
          "divisoes": [],
          "alturaMin": null
        }
      }
    },
    "C": {
      "notasEspecificas": {
        "1": "A área máxima de compartimentação deve abranger as áreas dos pavimentos e mezaninos interligados sem compartimentação.",
        "2": "Pode ser substituída por sistemas de chuveiros automáticos.",
        "3": "Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos.",
        "4": "Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.",
        "5": "Deve haver controle de fumaça nos átrios, podendo ser dimensionados como sendo padronizados conforme NT específica.",
        "6": "Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos até 90 metros de altura, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações, sendo que para altura superior deve-se, adicionalmente, adotar as soluções contidas na NT específica de compartimentação.",
        "7": "Deve haver elevador de emergência para alturas acima de 60 metros.",
        "8": "Para edificações de divisão C-3 (Shopping Centers).",
        "9": "Inclui Bombeiro Profissional Civil conforme NT específica.",
        "10": "Somente para áreas de depósitos superiores a 750 m², ou para as edificações com área superiores a 3.000 m².",
        "11": "Acima de 90 metros de altura conforme critérios de NT específica.",
        "12": "Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica."
      },
      "notasGerais": {
        "a": "Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.",
        "b": "Observar ainda as exigências das respectivas Normas Técnicas.",
        "c": "Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica."
      },
      "medidas": {
        "acesso_viatura": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "seg_estrutural": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "compart_horizontal": {
          "divisoes": "todas",
          "alturaMin": null,
          "notaEspecifica": [
            2,
            3
          ]
        },
        "compart_vertical": {
          "divisoes": "todas",
          "alturaMin": 12,
          "notaEspecifica": [
            4,
            5,
            6
          ]
        },
        "controle_acabamento": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "saida_emergencia": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "gerenciamento_risco": [
          {
            "divisoes": [
              "C-3"
            ],
            "alturaMin": null,
            "alturaMax": 12,
            "notaEspecifica": 8
          },
          {
            "divisoes": "todas",
            "alturaMin": 23
          }
        ],
        "brigada": {
          "divisoes": "todas",
          "alturaMin": null,
          "notaEspecifica": 9
        },
        "iluminacao": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "sinalizacao": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "extintores": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "hidrantes": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "alarme": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "deteccao": {
          "divisoes": "todas",
          "alturaMin": null,
          "notaEspecifica": 10
        },
        "sprinklers": {
          "divisoes": "todas",
          "alturaMin": 23
        },
        "controle_fumaca": {
          "divisoes": "todas",
          "alturaMin": 90,
          "notaEspecifica": 11
        },
        "espuma": {
          "divisoes": [],
          "alturaMin": null
        },
        "central_gas": {
          "divisoes": "todas",
          "alturaMin": null,
          "notaEspecifica": 12
        },
        "spda": {
          "divisoes": [],
          "alturaMin": null
        }
      }
    },
    "D": {
      "notasEspecificas": {
        "1": "A área máxima de compartimentação deve abranger as áreas dos pavimentos e mezaninos interligados sem compartimentação.",
        "2": "Pode ser substituída por sistemas de chuveiros automáticos.",
        "3": "Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos.",
        "4": "Pode ser substituída por sistema detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.",
        "5": "Deve haver controle de fumaça nos átrios, podendo ser dimensionados como sendo padronizados conforme NT específica.",
        "6": "Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.",
        "7": "Deve haver elevador de emergência para alturas acima de 60 metros.",
        "8": "Acima de 90 m de altura conforme critério da NT específica.",
        "9": "Inclui Bombeiro Profissional Civil conforme NT específica.",
        "10": "Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica."
      },
      "notasGerais": {
        "a": "Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.",
        "b": "Observar ainda as exigências das respectivas Normas Técnicas.",
        "c": "Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica."
      },
      "medidas": {
        "acesso_viatura": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "seg_estrutural": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "compart_horizontal": {
          "divisoes": "todas",
          "alturaMin": null,
          "notaEspecifica": [
            2,
            3
          ]
        },
        "compart_vertical": {
          "divisoes": "todas",
          "alturaMin": 12,
          "notaEspecifica": [
            4,
            5,
            6
          ]
        },
        "controle_acabamento": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "saida_emergencia": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "gerenciamento_risco": {
          "divisoes": "todas",
          "alturaMin": 90,
          "notaEspecifica": 8
        },
        "brigada": {
          "divisoes": "todas",
          "alturaMin": null,
          "notaEspecifica": 9
        },
        "iluminacao": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "sinalizacao": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "extintores": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "hidrantes": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "alarme": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "deteccao": {
          "divisoes": "todas",
          "alturaMin": 12
        },
        "sprinklers": {
          "divisoes": "todas",
          "alturaMin": 30
        },
        "controle_fumaca": {
          "divisoes": "todas",
          "alturaMin": 90,
          "notaEspecifica": 8
        },
        "espuma": {
          "divisoes": [],
          "alturaMin": null
        },
        "central_gas": {
          "divisoes": "todas",
          "alturaMin": null,
          "notaEspecifica": 10
        },
        "spda": {
          "divisoes": [],
          "alturaMin": null
        }
      }
    },
    "E": {
      "notasEspecificas": {
        "1": "A área máxima de compartimentação deve abranger as áreas dos pavimentos e mezaninos interligados sem compartimentação.",
        "2": "Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos.",
        "3": "A compartimentação vertical será considerada para as fachadas e selagens dos shafts e dutos de instalações.",
        "4": "Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, até 90 m de altura, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações, sendo que para altura superior deve-se, adicionalmente, adotar as soluções contidas na NT específica.",
        "5": "Deve haver elevador de emergência para alturas acima de 60 metros.",
        "6": "Inclui Bombeiro Profissional Civil conforme NT específica.",
        "7": "Acima de 90 m de altura conforme critério da NT específica.",
        "8": "Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica."
      },
      "notasGerais": {
        "a": "Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.",
        "b": "Observar ainda as exigências das respectivas Normas Técnicas.",
        "c": "Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.",
        "d": "Os locais destinados a laboratórios devem ter proteção em função dos produtos utilizados."
      },
      "medidas": {
        "acesso_viatura": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "seg_estrutural": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "compart_horizontal": {
          "divisoes": "todas",
          "alturaMin": 23,
          "notaEspecifica": 2
        },
        "compart_vertical": {
          "divisoes": "todas",
          "alturaMin": 12,
          "notaEspecifica": [
            3,
            4
          ]
        },
        "controle_acabamento": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "saida_emergencia": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "gerenciamento_risco": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "brigada": {
          "divisoes": "todas",
          "alturaMin": null,
          "notaEspecifica": 6
        },
        "iluminacao": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "sinalizacao": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "extintores": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "hidrantes": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "alarme": {
          "divisoes": "todas",
          "alturaMin": null
        },
        "deteccao": {
          "divisoes": "todas",
          "alturaMin": 12
        },
        "sprinklers": {
          "divisoes": "todas",
          "alturaMin": 30
        },
        "controle_fumaca": {
          "divisoes": "todas",
          "alturaMin": 90,
          "notaEspecifica": 7
        },
        "espuma": {
          "divisoes": [],
          "alturaMin": null
        },
        "central_gas": {
          "divisoes": "todas",
          "alturaMin": null,
          "notaEspecifica": 8
        },
        "spda": {
          "divisoes": [],
          "alturaMin": null
        }
      }
    },
    "F": {
      "F1_F2": {
        "notasEspecificas": {
          "1": "Pode ser substituída por sistema detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.",
          "2": "Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.",
          "3": "Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, até 90 m de altura, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações, sendo que para altura superior deve-se, adicionalmente, adotar as soluções contidas na NT específica.",
          "4": "A compartimentação vertical será considerada para as fachadas e selagens dos shafts e dutos de instalações.",
          "5": "Deve haver elevador de emergência para alturas acima de 60 metros.",
          "6": "Somente para locais com público acima de 1.000 pessoas.",
          "7": "Inclui Bombeiro Profissional Civil conforme NT específica.",
          "8": "Para os locais onde haja carga de incêndio como depósitos, escritórios, cozinhas, pisos técnicos, casa de máquinas e etc, e nos locais de reunião de público onde houver teto ou forro falso com revestimento combustível.",
          "9": "Acima de 90 m de altura conforme critério da NT específica.",
          "10": "Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica."
        },
        "notasGerais": {
          "a": "Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.",
          "b": "Observar ainda as exigências das respectivas Normas Técnicas.",
          "c": "Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica."
        },
        "medidas": {
          "F-1": {
            "acesso_viatura": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "seg_estrutural": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "compart_horizontal": {
              "divisoes": [],
              "alturaMin": null
            },
            "compart_vertical": {
              "divisoes": "todas",
              "alturaMin": 12,
              "notaEspecifica": [
                1,
                2,
                3
              ]
            },
            "controle_acabamento": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "saida_emergencia": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "gerenciamento_risco": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 6
            },
            "brigada": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 7
            },
            "iluminacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "sinalizacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "extintores": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "hidrantes": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "alarme": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "deteccao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "sprinklers": {
              "divisoes": "todas",
              "alturaMin": 30
            },
            "controle_fumaca": {
              "divisoes": "todas",
              "alturaMin": 90,
              "notaEspecifica": 9
            },
            "espuma": {
              "divisoes": [],
              "alturaMin": null
            },
            "central_gas": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 10
            },
            "spda": {
              "divisoes": [],
              "alturaMin": null
            }
          },
          "F-2": {
            "acesso_viatura": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "seg_estrutural": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "compart_horizontal": {
              "divisoes": [],
              "alturaMin": null
            },
            "compart_vertical": {
              "divisoes": "todas",
              "alturaMin": 12,
              "notaEspecifica": [
                4,
                2,
                3
              ]
            },
            "controle_acabamento": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "saida_emergencia": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "gerenciamento_risco": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 6
            },
            "brigada": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 7
            },
            "iluminacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "sinalizacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "extintores": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "hidrantes": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "alarme": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "deteccao": {
              "divisoes": "todas",
              "alturaMin": 12,
              "notaEspecifica": 8
            },
            "sprinklers": {
              "divisoes": "todas",
              "alturaMin": 30
            },
            "controle_fumaca": {
              "divisoes": "todas",
              "alturaMin": 90,
              "notaEspecifica": 9
            },
            "espuma": {
              "divisoes": [],
              "alturaMin": null
            },
            "central_gas": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 10
            },
            "spda": {
              "divisoes": [],
              "alturaMin": null
            }
          }
        }
      },
      "F3_F4_F9": {
        "notasEspecificas": {
          "1": "A compartimentação vertical será considerada para as fachadas e selagens dos shafts e dutos de instalações.",
          "2": "Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações. Para estação metroferroviária fica dispensado o sistema de chuveiros automáticos.",
          "3": "Deve haver elevador de emergência para alturas acima de 60 metros.",
          "4": "Somente para a divisão F-3.",
          "5": "Somente para locais com público acima de 1.000 pessoas.",
          "6": "Inclui Bombeiro Profissional Civil conforme NT específica.",
          "7": "Para os locais onde haja carga de incêndio como depósitos, escritórios, cozinhas, pisos técnicos, casa de máquinas e etc, e nos locais de reunião de público onde houver teto ou forro falso com revestimento combustível.",
          "8": "Não exigido nas arquibancadas. Nas áreas internas, verificar exigências conforme o uso ou ocupação específica. Para a divisão F-3, verificar também NT específica de centro de eventos e exibição.",
          "9": "Exigido para áreas edificadas superiores a 10.000 m², exceto para estação metroferroviária. Nas áreas internas, verificar exigências conforme o uso ou ocupação específica. Para estação metroferroviária, onde houver áreas internas ocupadas por uso distinto de F-4, devem ser protegidas por sistemas de chuveiros automáticos de resposta rápida, podendo ser interligado à rede de hidrantes pressurizada.",
          "10": "Acima de 90 m de altura conforme critério da NT específica.",
          "11": "Será exigido para todas as estações metroferroviárias subterrâneas, conforme critério da NT específica.",
          "12": "Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica."
        },
        "notasGerais": {
          "a": "Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.",
          "b": "Observar ainda as exigências das respectivas Normas Técnicas.",
          "c": "Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.",
          "d": "A altura das edificações subterrâneas da divisão F-4 será medida do piso mais baixo ao piso mais alto ocupado.",
          "e": "Os locais de comércio ou atividades distintas das divisões F-3, F-4 e F-9 terão as medidas de proteção conforme suas respectivas ocupações."
        },
        "medidas": {
          "F-3_F-9": {
            "acesso_viatura": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "seg_estrutural": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "compart_horizontal": {
              "divisoes": [],
              "alturaMin": null
            },
            "compart_vertical": {
              "divisoes": "todas",
              "alturaMin": 12,
              "notaEspecifica": [
                1,
                2
              ]
            },
            "controle_acabamento": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "saida_emergencia": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "gerenciamento_risco": {
              "divisoes": [
                "F-3"
              ],
              "alturaMin": null,
              "notaEspecifica": 4
            },
            "brigada": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 6
            },
            "iluminacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "sinalizacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "extintores": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "hidrantes": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "alarme": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "deteccao": {
              "divisoes": "todas",
              "alturaMin": 12,
              "notaEspecifica": 7
            },
            "sprinklers": {
              "divisoes": "todas",
              "alturaMin": 12,
              "notaEspecifica": 8
            },
            "controle_fumaca": {
              "divisoes": "todas",
              "alturaMin": 90,
              "notaEspecifica": 10
            },
            "espuma": {
              "divisoes": [],
              "alturaMin": null
            },
            "central_gas": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 12
            },
            "spda": {
              "divisoes": [],
              "alturaMin": null
            }
          },
          "F-4": {
            "acesso_viatura": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "seg_estrutural": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "compart_horizontal": {
              "divisoes": [],
              "alturaMin": null
            },
            "compart_vertical": {
              "divisoes": "todas",
              "alturaMin": 12,
              "notaEspecifica": [
                1,
                2
              ]
            },
            "controle_acabamento": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "saida_emergencia": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "gerenciamento_risco": [
              {
                "divisoes": "todas",
                "alturaMin": null,
                "alturaMax": 30,
                "notaEspecifica": 5
              },
              {
                "divisoes": "todas",
                "alturaMin": 30
              }
            ],
            "brigada": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 6
            },
            "iluminacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "sinalizacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "extintores": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "hidrantes": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "alarme": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "deteccao": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 7
            },
            "sprinklers": [
              {
                "divisoes": "todas",
                "alturaMin": null,
                "alturaMax": 12,
                "notaEspecifica": 9
              },
              {
                "divisoes": "todas",
                "alturaMin": 23
              }
            ],
            "controle_fumaca": {
              "divisoes": "todas",
              "alturaMin": 0,
              "notaEspecifica": [
                11,
                10
              ]
            },
            "espuma": {
              "divisoes": [],
              "alturaMin": null
            },
            "central_gas": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 12
            },
            "spda": {
              "divisoes": [],
              "alturaMin": null
            }
          }
        }
      },
      "F5_F6_F8": {
        "notasEspecificas": {
          "1": "A área máxima de compartimentação deve abranger as áreas dos pavimentos e mezaninos interligados sem compartimentação.",
          "2": "Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos.",
          "3": "Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.",
          "4": "Deve haver elevador de emergência para alturas acima de 60 metros.",
          "5": "Somente para locais com público acima de 1.000 pessoas.",
          "6": "Inclui Bombeiro Profissional Civil conforme NT específica.",
          "7": "Para os locais onde haja carga de incêndio como depósitos, escritórios, cozinhas, pisos técnicos, casa de máquinas e etc, e nos locais de reunião de público onde houver teto ou forro falso com revestimento combustível.",
          "8": "Acima de 90 m de altura conforme critério da NT específica.",
          "9": "Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica."
        },
        "notasGerais": {
          "a": "Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.",
          "b": "Observar ainda as exigências das respectivas Normas Técnicas.",
          "c": "Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.",
          "d": "Nos locais de concentração de público, antes do início de cada evento, é obrigatória a explanação ao público da localização das saídas de emergência bem como dos sistemas de segurança existentes no local."
        },
        "medidas": {
          "F-5_F-6": {
            "acesso_viatura": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "seg_estrutural": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "compart_horizontal": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 1
            },
            "compart_vertical": {
              "divisoes": "todas",
              "alturaMin": 12,
              "notaEspecifica": 3
            },
            "controle_acabamento": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "saida_emergencia": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "gerenciamento_risco": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 5
            },
            "brigada": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 6
            },
            "iluminacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "sinalizacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "extintores": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "hidrantes": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "alarme": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "deteccao": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 7
            },
            "sprinklers": {
              "divisoes": "todas",
              "alturaMin": 30
            },
            "controle_fumaca": {
              "divisoes": "todas",
              "alturaMin": 90,
              "notaEspecifica": 8
            },
            "espuma": {
              "divisoes": [],
              "alturaMin": null
            },
            "central_gas": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 9
            },
            "spda": {
              "divisoes": [],
              "alturaMin": null
            }
          },
          "F-8": {
            "acesso_viatura": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "seg_estrutural": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "compart_horizontal": {
              "divisoes": "todas",
              "alturaMin": 12,
              "notaEspecifica": 1
            },
            "compart_vertical": {
              "divisoes": "todas",
              "alturaMin": 12,
              "notaEspecifica": 3
            },
            "controle_acabamento": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "saida_emergencia": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "gerenciamento_risco": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 5
            },
            "brigada": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 6
            },
            "iluminacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "sinalizacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "extintores": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "hidrantes": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "alarme": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "deteccao": {
              "divisoes": "todas",
              "alturaMin": 12
            },
            "sprinklers": {
              "divisoes": "todas",
              "alturaMin": 30
            },
            "controle_fumaca": {
              "divisoes": "todas",
              "alturaMin": 90,
              "notaEspecifica": 8
            },
            "espuma": {
              "divisoes": [],
              "alturaMin": null
            },
            "central_gas": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 9
            },
            "spda": {
              "divisoes": [],
              "alturaMin": null
            }
          }
        }
      },
      "F7_F10": {
        "notasEspecificas": {
          "1": "A área máxima de compartimentação deve abranger as áreas dos pavimentos e mezaninos interligados sem compartimentação.",
          "2": "Pode ser substituída por sistema e chuveiros automáticos.",
          "3": "Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.",
          "4": "Deve haver elevador de emergência para alturas acima de 60 metros.",
          "5": "Somente para locais com público acima de 1.000 pessoas.",
          "6": "Inclui Bombeiro Profissional Civil conforme NT específica.",
          "7": "Acima de 90 m de altura conforme critério da NT específica.",
          "8": "Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica."
        },
        "notasGerais": {
          "a": "Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.",
          "b": "Observar ainda as exigências das respectivas Normas Técnicas.",
          "c": "Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.",
          "d": "A divisão F-7 com altura superior a 6 metros será submetida à Comissão Técnica para definição das medidas de segurança contra incêndio."
        },
        "medidas": {
          "F-7": {
            "acesso_viatura": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "seg_estrutural": {
              "divisoes": [],
              "alturaMin": null
            },
            "compart_horizontal": {
              "divisoes": [],
              "alturaMin": null
            },
            "compart_vertical": {
              "divisoes": [],
              "alturaMin": null
            },
            "controle_acabamento": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "saida_emergencia": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "gerenciamento_risco": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 5
            },
            "brigada": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 6
            },
            "iluminacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "sinalizacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "extintores": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "hidrantes": {
              "divisoes": [],
              "alturaMin": null
            },
            "alarme": {
              "divisoes": [],
              "alturaMin": null
            },
            "deteccao": {
              "divisoes": [],
              "alturaMin": null
            },
            "sprinklers": {
              "divisoes": [],
              "alturaMin": null
            },
            "controle_fumaca": {
              "divisoes": [],
              "alturaMin": null
            },
            "espuma": {
              "divisoes": [],
              "alturaMin": null
            },
            "central_gas": {
              "divisoes": [],
              "alturaMin": null
            },
            "spda": {
              "divisoes": [],
              "alturaMin": null
            }
          },
          "F-10": {
            "acesso_viatura": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "seg_estrutural": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "compart_horizontal": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 2
            },
            "compart_vertical": {
              "divisoes": "todas",
              "alturaMin": 12,
              "notaEspecifica": 3
            },
            "controle_acabamento": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "saida_emergencia": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "gerenciamento_risco": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 5
            },
            "brigada": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 6
            },
            "iluminacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "sinalizacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "extintores": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "hidrantes": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "alarme": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "deteccao": {
              "divisoes": "todas",
              "alturaMin": 6
            },
            "sprinklers": {
              "divisoes": "todas",
              "alturaMin": 23
            },
            "controle_fumaca": {
              "divisoes": "todas",
              "alturaMin": 90,
              "notaEspecifica": 7
            },
            "espuma": {
              "divisoes": [],
              "alturaMin": null
            },
            "central_gas": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 8
            },
            "spda": {
              "divisoes": [],
              "alturaMin": null
            }
          }
        }
      },
      "F11": {
        "notasEspecificas": {
          "1": "A área máxima de compartimentação deve abranger as áreas dos pavimentos e mezaninos interligados sem compartimentação.",
          "2": "Pode ser substituída por sistema de detecção de incêndio e chuveiros automáticos.",
          "3": "Pode ser substituída por sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos, exceto para as compartimentações das fachadas e selagens dos shafts e dutos de instalações.",
          "4": "Somente para locais com público acima de 1.000 pessoas.",
          "5": "Inclui Bombeiro Profissional Civil conforme NT específica.",
          "6": "Para os locais onde haja carga de incêndio como depósitos, escritórios, cozinhas, pisos técnicos, casa de máquinas e etc, e nos locais de reunião de público onde houver teto ou forro falso com revestimento combustível.",
          "7": "Para lotação superior a 3.000 pessoas.",
          "8": "Somente para lotação superior a 500 pessoas, nos termos da edificação sem janelas de NT específica, podendo ser substituído por chuveiros automáticos de resposta rápida com reserva de incêndio para 30 minutos.",
          "9": "Acima de 90 m de altura conforme critério da NT específica.",
          "10": "Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica."
        },
        "notasGerais": {
          "a": "Os subsolos das edificações devem ser compartimentados em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7.",
          "b": "Observar ainda as exigências das respectivas Normas Técnicas.",
          "c": "Todos os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça dimensionados conforme o disposto em NT específica.",
          "d": "Nos locais de concentração de público, antes do início de cada evento, é obrigatória a explanação ao público da localização das saídas de emergência bem como dos sistemas de segurança existentes no local."
        },
        "medidas": {
          "F-11": {
            "acesso_viatura": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "seg_estrutural": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "compart_horizontal": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": [
                2,
                3
              ]
            },
            "compart_vertical": {
              "divisoes": "todas",
              "alturaMin": 12,
              "notaEspecifica": 3
            },
            "controle_acabamento": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "saida_emergencia": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "gerenciamento_risco": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 4
            },
            "brigada": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 5
            },
            "iluminacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "sinalizacao": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "extintores": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "hidrantes": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "alarme": {
              "divisoes": "todas",
              "alturaMin": null
            },
            "deteccao": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 6
            },
            "sprinklers": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 7
            },
            "controle_fumaca": [
              {
                "divisoes": "todas",
                "alturaMin": null,
                "notaEspecifica": 8
              },
              {
                "divisoes": "todas",
                "alturaMin": 90,
                "notaEspecifica": 9
              }
            ],
            "espuma": {
              "divisoes": [],
              "alturaMin": null
            },
            "central_gas": {
              "divisoes": "todas",
              "alturaMin": null,
              "notaEspecifica": 10
            },
            "spda": {
              "divisoes": [],
              "alturaMin": null
            }
          }
        }
      }
    }
  },
  "notas_especificas": {
    "A": {
      "compart_horizontal": "Devem ser atendidas somente as regras específicas de compartimentação entre unidades autônomas.",
      "compart_vertical": "Pode ser substituída por sistema de controle de fumaça somente nos átrios.",
      "saida_emergencia": "Deve haver elevador de emergência para altura maior que 80 metros.",
      "alarme": "O sistema de alarme pode ser setorizado na central junto à portaria, desde que tenha vigilância 24h.",
      "central_gas": "Para as divisões A-1 e A-3, é permitido o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos desde que o recipiente esteja localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Para a divisão A-2, deverão ser atendidas as normas brasileiras oficiais de distribuição interna não sendo permitido o uso de recipientes dentro das unidades autônomas."
    }
  },
  "tabela_simplificada": {
    "notasEspecificas": {
      "1": "Quando houver o uso de recipiente de 32 L (13kg) de GLP em cozinhas e assemelhados para cocção de alimentos o recipiente deve estar localizado em área externa e ventilada no pavimento térreo conforme normas brasileiras oficiais. Nas demais situações, adotar sistema de distribuição interna de GLP conforme NBR específica.",
      "2": "Somente com lotação superior a 250 pessoas conforme item 5.4 da NT 10.",
      "3": "Será exigido Controle de Fumaça para edificações superioras a 500 pessoas nos termos da edificação sem janela da NT 15, podendo ser substituído por chuveiros automáticos de resposta rápida com reserva de incêndio para 30 min.",
      "4": "Apenas para as ocupações do grupo E."
    },
    "notasGerais": {
      "a": "Para o Grupo K (Energia) e M (especiais) ver tabelas específicas.",
      "b": "Para a Divisão G-5 (hangares): prever sistema de drenagem de líquidos nos pisos para bacias de contenção à distância. Não é permitido o armazenamento de líquidos combustíveis ou inflamáveis dentro dos hangares.",
      "c": "Para a Divisão L-1 (Explosivos, Fogos de Artifício), atender a NT-30.",
      "d": "As Divisões L-2 e L-3 somente serão avaliadas pelo Corpo de Bombeiros mediante Comissão Técnica.",
      "e": "Os subsolos das edificações devem ser compartimentados com PCF P-90 em relação aos demais pisos contíguos. Para subsolos ocupados ver Tabela 7 da NT 01.",
      "f": "Observar ainda as exigências para os riscos específicos das respectivas Normas Técnicas.",
      "g": "Depósitos em áreas descobertas, observar as exigências da Tabela 6J.",
      "h": "No cômputo de pavimentos, desconsiderar os pavimentos de subsolo quando destinados a estacionamento de veículos, vestiários e instalações sanitárias, áreas técnicas sem aproveitamento para quaisquer atividades ou permanência humana.",
      "i": "Os pavimentos ocupados devem possuir aberturas para o exterior (por exemplo: janelas, painéis de vidro etc.) ou controle de fumaça, dimensionados conforme o disposto na NT-15.",
      "j": "Para edificações existentes, as adaptações de controle de material de acabamento e revestimento, de saídas de emergência e de controle de fumaça, devem atender a NT-43."
    },
    "grupos": {
      "A": {
        "saida_emergencia": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "B": {
        "controle_acabamento": true,
        "saida_emergencia": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "C": {
        "saida_emergencia": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "D": {
        "saida_emergencia": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "E": {
        "saida_emergencia": true,
        "gerenciamento_risco": {
          "notaSimp": 4
        },
        "brigada": {
          "notaSimp": 4
        },
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "F": {
        "controle_acabamento": {
          "notaSimp": 2
        },
        "saida_emergencia": true,
        "brigada": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "G": {
        "saida_emergencia": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "H": {
        "saida_emergencia": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "I": {
        "saida_emergencia": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "J": {
        "saida_emergencia": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "L": {
        "controle_acabamento": true,
        "saida_emergencia": true,
        "brigada": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      }
    },
    "divisoes": {
      "F-9": {
        "saida_emergencia": true,
        "brigada": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "F-11": {
        "controle_acabamento": {
          "notaSimp": 2
        },
        "saida_emergencia": true,
        "gerenciamento_risco": true,
        "brigada": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "H-2": {
        "controle_acabamento": true,
        "saida_emergencia": true,
        "gerenciamento_risco": true,
        "brigada": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "H-3": {
        "controle_acabamento": true,
        "saida_emergencia": true,
        "gerenciamento_risco": true,
        "brigada": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "H-5": {
        "controle_acabamento": true,
        "saida_emergencia": true,
        "gerenciamento_risco": true,
        "brigada": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      },
      "M-3": {
        "saida_emergencia": true,
        "iluminacao": true,
        "sinalizacao": true,
        "extintores": true,
        "central_gas": {
          "notaSimp": 1
        }
      }
    }
  }
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();
