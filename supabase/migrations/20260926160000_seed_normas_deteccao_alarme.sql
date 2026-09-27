-- Norma de Sistema de Detecção e Alarme de Incêndio (base comum às medidas
-- 'alarme' e 'deteccao') — MA (NT 19/2021 CBMMA) e GO (NT 19/2022 CBMGO), pra
-- base normativa central (normas_dados, sistema 'deteccao_alarme').
--
-- O que muda entre os estados fica dentro do próprio JSON: números de item
-- (`itens`), altura/limite do avisador, exceções do acionador (F-6 em GO),
-- prazos de manutenção, comissionamento (MA) etc. O site lê pelo getter
-- getDeteccaoAlarme (src/data/normas/index.js); o arquivo estático
-- src/data/normas/MA/deteccao_alarme.js é só o fallback offline/dev.
-- Chaves em minúsculo aqui, renomeadas pra MAIÚSCULO no site.

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('MA', 'deteccao_alarme', $j${
  "norma": {
    "uf": "MA",
    "sigla": "NT 19/2021 CBMMA",
    "nome": "Sistema de Detecção e Alarme de Incêndio",
    "orgao": "Corpo de Bombeiros Militar do Estado do Maranhão (CBMMA)",
    "lei": "Lei nº 11.390, de 21 de dezembro de 2020 (Regulamento de Segurança Contra Incêndio das Edificações e Áreas de Risco do Estado do Maranhão)",
    "base_tecnica": "NBR 17240",
    "complementares": [
      "NT 01 — Procedimentos administrativos",
      "NT 03 — Terminologia de segurança contra incêndio",
      "NT 04 — Símbolos gráficos para projeto de segurança contra incêndio",
      "NT 41 — Inspeção visual em instalações elétricas de baixa tensão"
    ]
  },
  "referencias": [
    {
      "codigo": "NBR 17240",
      "titulo": "Sistemas de detecção e alarme de incêndio — projeto, instalação, comissionamento e manutenção de sistemas de detecção e alarme de incêndio — Requisitos"
    },
    {
      "codigo": "NBR ISO 7240-1",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 1: Generalidades e definições"
    },
    {
      "codigo": "NBR ISO 7240-2",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 2: Equipamentos de controle e de indicação"
    },
    {
      "codigo": "NBR ISO 7240-3",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 3: Dispositivo de alarme sonoro"
    },
    {
      "codigo": "NBR ISO 7240-4",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 4: Fontes de alimentação"
    },
    {
      "codigo": "NBR ISO 7240-5",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 5: Detectores pontuais de temperatura"
    },
    {
      "codigo": "NBR ISO 7240-7",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 7: Detectores pontuais de fumaça utilizando dispersão de luz ou ionização"
    },
    {
      "codigo": "NBR ISO 7240-11",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 11: Acionadores manuais"
    },
    {
      "codigo": "NBR ISO 7240-13",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 13: Avaliação de compatibilidade dos componentes do sistema"
    },
    {
      "codigo": "NBR ISO 7240-20",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 20: Detectores de fumaça por aspiração"
    },
    {
      "codigo": "NBR ISO 7240-23",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 23: Dispositivos de alarme visual"
    },
    {
      "codigo": "NBR ISO 7240-25",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 25: Componentes utilizando meios de transmissão por rádio"
    }
  ],
  "alimentacao": {
    "fontes_min": 2,
    "principal": "rede elétrica da edificação",
    "auxiliar": [
      "bateria de acumuladores",
      "nobreak",
      "gerador"
    ],
    "autonomia_supervisao_h": 24,
    "autonomia_alarme_min": 15,
    "autonomia_alarme_alternativa": "ou o tempo necessário para o abandono da edificação",
    "tensao_ensaio_vcc": [
      24,
      32
    ]
  },
  "central": {
    "alarme_geral_audivel_toda_edificacao": true,
    "alarme_sem_interferir_comunicacao_verbal": false,
    "pre_alarme_retardo_max_min": 2,
    "pre_alarme_exige_brigada": true,
    "subcentral_retardo_max_min": 2,
    "painel_esquema_obrigatorio": true,
    "interface_altura_recomendada_m": null,
    "sinalizacao_padrao": {
      "alarme": "vermelha",
      "falha": "amarela",
      "funcionamento": "verde"
    },
    "area_livre_frontal_m2": 1,
    "tipos": [
      {
        "key": "convencional",
        "label": "Convencional"
      },
      {
        "key": "enderecavel",
        "label": "Endereçável"
      }
    ],
    "locais": [
      {
        "key": "portaria",
        "label": "Portaria principal"
      },
      {
        "key": "sala_seguranca",
        "label": "Sala de segurança"
      },
      {
        "key": "sala_controle",
        "label": "Sala de controle"
      },
      {
        "key": "entrada",
        "label": "Entrada da edificação"
      }
    ]
  },
  "acionador": {
    "distancia_max_m": 30,
    "altura_min_m": 0.9,
    "altura_max_m": 1.35,
    "um_por_pavimento": true,
    "obrigatorio_com_deteccao": true,
    "excecoes": [],
    "cor": null,
    "preferencia_junto_hidrantes": true,
    "area_cobertura_estimada_m2": 900,
    "area_cobertura_criterio": "Estimativa de projeto: quadrado de lado igual à distância máxima de percurso (percurso ortogonal), de modo que nenhum ponto exceda a distância máxima ao acionador mais próximo. Confirmar em planta."
  },
  "avisador": {
    "limite_dba": 105,
    "altura_min_m": 2.2,
    "altura_max_m": 3.5,
    "minimo_por_pavimento": 1,
    "visual_reuniao_publico": true,
    "tempo_atuacao_max_s": 30,
    "visibilidade_m": 15
  },
  "fiacao": {
    "norma": "NBR 17240",
    "protecao_calor": "NT 41 — Inspeção visual em instalações elétricas de baixa tensão",
    "protecao_calor_resistencia_min": null
  },
  "entreforros": {
    "obrigatorio_com_deteccao": true
  },
  "sem_fio": {
    "anexos": [
      "A",
      "B"
    ],
    "certificacao_laboratorio": false
  },
  "complementares": [
    "interfone",
    "rede de rádio"
  ],
  "detectores": {
    "tipos": {
      "fumaca_pontual": {
        "label": "Detector pontual de fumaça",
        "area_max_m2": 81,
        "lado_m": 9,
        "raio_m": 6.3,
        "altura_max_m": 8,
        "viga_max_sem_reducao_m": 0.2,
        "trocas_ar_max_sem_reducao": 8,
        "afastamento_parede_min_m": 0.15,
        "parede_faixa_teto_m": [
          0.15,
          0.3
        ],
        "indicacao": "Ambientes em geral, com materiais cuja combustão inicial gera fumaça. Em ambientes com vapor, gases ou muitas partículas em suspensão, avaliar outros tipos de detector.",
        "por_area": true,
        "item": "NBR 17240 (adotada pelo item 5.1 da NT 19/2021 CBMMA)"
      },
      "temperatura_pontual": {
        "label": "Detector pontual de temperatura",
        "area_max_m2": 36,
        "lado_m": 6,
        "raio_m": 4.2,
        "altura_max_m": 5,
        "viga_max_sem_reducao_m": 0.2,
        "afastamento_parede_min_m": 0.15,
        "parede_faixa_teto_m": [
          0.15,
          0.3
        ],
        "indicacao": "Ambientes com materiais que geram muito calor e pouca fumaça no início da combustão, ou com vapor, gases e partículas onde detectores de fumaça dariam alarmes indesejados.",
        "por_area": true,
        "item": "NBR 17240 (adotada pelo item 5.1 da NT 19/2021 CBMMA)"
      },
      "fumaca_linear": {
        "label": "Detector linear de fumaça (feixe de luz)",
        "dist_emissor_receptor_max_m": 100,
        "dist_entre_feixes_max_m": 15,
        "dist_parede_max_m": 7.5,
        "dist_parede_ponto_rigido_max_m": 3.75,
        "dist_teto_recomendada_m": [
          0.3,
          1.0
        ],
        "indicacao": "Locais cuja altura de cobertura prejudique o sensoriamento dos detectores pontuais e pontos em que não se recomenda o uso de detectores sobre equipamentos.",
        "por_area": false,
        "item": "NBR 17240 (adotada pelo item 5.1 da NT 19/2021 CBMMA)"
      },
      "temperatura_linear": {
        "label": "Detector linear de temperatura (cabo)",
        "indicacao": "Aplicações localizadas, junto ou em contato com o material protegido (bandejas de cabos, esteiras rolantes e similares); comprimento e raio de cobertura conforme o fabricante.",
        "por_area": false,
        "item": "NBR 17240 (adotada pelo item 5.1 da NT 19/2021 CBMMA)"
      },
      "chama": {
        "label": "Detector de chama",
        "reducao_extremos_campo_visao_pct": 50,
        "indicacao": "Áreas onde a chama possa surgir rapidamente (hangares, áreas petroquímicas, armazenagem de inflamáveis, gás combustível, cabines de pintura) e áreas abertas ou semiabertas.",
        "por_area": false,
        "item": "NBR 17240 (adotada pelo item 5.1 da NT 19/2021 CBMMA)"
      }
    },
    "reducao_viga": [
      {
        "min_m": 0.21,
        "max_m": 0.6,
        "fator": 0.6667,
        "texto": "dois terços"
      },
      {
        "min_m": 0.6,
        "max_m": null,
        "fator": 0.5,
        "texto": "metade"
      }
    ],
    "temperatura_teto": [
      {
        "teto_max_c": 47,
        "atuacao_c": [
          57,
          79
        ]
      },
      {
        "teto_max_c": 69,
        "atuacao_c": [
          80,
          121
        ]
      },
      {
        "teto_max_c": 111,
        "atuacao_c": [
          122,
          162
        ]
      },
      {
        "teto_max_c": 152,
        "atuacao_c": [
          163,
          204
        ]
      },
      {
        "teto_max_c": 194,
        "atuacao_c": [
          205,
          259
        ]
      },
      {
        "teto_max_c": 249,
        "atuacao_c": [
          260,
          302
        ]
      }
    ],
    "espacamento_altura_temperatura": [
      {
        "altura_m": 5.0,
        "espacamento_m": 6.0
      },
      {
        "altura_m": 6.0,
        "espacamento_m": 5.6
      },
      {
        "altura_m": 7.0,
        "espacamento_m": 5.2
      },
      {
        "altura_m": 8.0,
        "espacamento_m": 4.8
      },
      {
        "altura_m": 9.0,
        "espacamento_m": 4.4
      },
      {
        "altura_m": 10.0,
        "espacamento_m": 4.0
      }
    ],
    "regras": [
      "Um ambiente deve ser protegido em toda a sua extensão pelo mesmo tipo de detector; é permitida proteção adicional de outro tipo em determinada área.",
      "Em locais com altura superior a 8 m, os detectores pontuais de fumaça devem ser instalados em níveis de no máximo 8 m.",
      "Detectores instalados em dutos ou retornos de ar são complementares e não substituem os que protegem a área.",
      "Evitar detectores pontuais a menos de 1,50 m dos pontos de insuflamento de ar; o sistema deve funcionar com e sem ventilação ligada."
    ],
    "fonte": "NBR 17240, adotada pelo item 5.1 da NT 19/2021 CBMMA (a NT não reproduz as tabelas de cobertura)"
  },
  "comissionamento": {
    "item": "6.1",
    "detector_termico_teste": "gerador de ar quente que produza, próximo ao detector, temperatura 10% superior à nominal, com operação em no máximo 90 s",
    "detector_fumaca_alarme_max_s": 30,
    "detector_fumaca_retardo_max_s": 60,
    "acionador_ativacao_central_max_s": 15,
    "falha_circuito_sinalizada_max_min": 2,
    "avisador_atuacao_max_s": 30,
    "tempo_resposta_sinalizacao_max_s": 30,
    "falha_sinalizacao_max_min": 2,
    "fonte_principal_teste_min": 10,
    "documentos": "certificados de entrega de obra e aceitação do sistema, com termo de garantia, assinados pelo instalador e pelo cliente ou seu representante",
    "relatorio": "Anexo A (e Anexo B para sistemas sem fio), encaminhado ao CBMMA por ocasião da vistoria"
  },
  "manutencao": {
    "periodicidade_preventiva_max_meses": null,
    "art_instalacao": false,
    "relatorio_disponivel_edificacao": true,
    "texto": "A manutenção preventiva e corretiva deve ser realizada por técnicos habilitados e treinados, e o relatório de manutenção periódica estabelecido pela NBR 17240 deve permanecer disponível na edificação para verificação no ato da vistoria."
  },
  "itens": {
    "alimentacao": "5.3",
    "teste_indicadores": "5.4",
    "vigilancia": "5.5",
    "alarme_geral": "5.6",
    "pre_alarme": "5.6.1",
    "acionador_distancia": "5.7",
    "acionador_altura": "5.8",
    "acionador_hidrantes": "5.8",
    "acionador_pavimento": "5.9",
    "acionador_com_deteccao": "5.10",
    "avisador_visual": "5.11",
    "avisador_reuniao": "5.12",
    "entreforros": "5.13",
    "protecao_calor": "5.14",
    "fiacao": "5.15",
    "leds_acionadores": "5.16",
    "painel_esquema": "5.17",
    "complementares": "5.18",
    "leds_saidas": "5.19",
    "torres_residenciais": "5.20",
    "central_local": "5.21",
    "deteccao_linear": "5.22",
    "subcentral": "5.23",
    "sem_fio": "5.24",
    "comissionamento": "6.1",
    "manutencao": "7",
    "projeto": "5.1",
    "simbolos": "5.2"
  },
  "notas_por_divisao": {
    "A": [
      {
        "item": "5.20",
        "texto": "Em edifícios residenciais com mais de uma torre, a setorização do sistema de alarme (nota 3 da Tabela 6A da NT 01) refere-se à inexigência da central no hall dos térreos das torres, desde que cada torre e seus acionadores estejam ligados a uma única central, na portaria da própria edificação com vigilância 24 horas, com fonte autônoma de duração mínima de 60 minutos."
      }
    ]
  },
  "notas_gerais": [
    {
      "item": "5.6.1",
      "texto": "Em locais de grande concentração de pessoas, o alarme geral pode ser precedido de pré-alarme na sala de segurança, com temporizador de no máximo 2 minutos, desde que exista brigada de incêndio; o alarme geral continua obrigatório para toda a edificação."
    },
    {
      "item": "5.11",
      "texto": "Onde não seja possível ouvir o alarme geral (atividade sonora intensa, nível acima de 105 dBA ou uso de protetores auriculares) são obrigatórios avisadores visuais e sonoros, instalados a 2,2 m a 3,5 m do piso acabado."
    },
    {
      "item": "5.12",
      "texto": "Em locais de reunião de público com situação acústica elevada (casas de show, danceterias, salões de baile etc.), avisadores visuais são obrigatórios quando houver exigência de detecção ou alarme."
    },
    {
      "item": "5.13",
      "texto": "Havendo exigência de detecção, são obrigatórios detectores nos entreforros e entrepisos que contenham instalações com materiais combustíveis."
    },
    {
      "item": "5.23",
      "texto": "Edificações ou áreas protegidas por subcentral devem estar interligadas à central supervisionadora, com sinal simultâneo de alarme; o alarme geral soa em 2 minutos se não houver ação junto à central."
    }
  ]
}$j$::jsonb, 1),
  ('GO', 'deteccao_alarme', $j${
  "norma": {
    "uf": "GO",
    "sigla": "NT 19/2022 CBMGO",
    "nome": "Sistemas de Detecção e Alarme de Incêndio",
    "orgao": "Corpo de Bombeiros Militar do Estado de Goiás (CBMGO)",
    "lei": "Lei nº 15.802, de 11 de setembro de 2006 (Código Estadual de Segurança Contra Incêndio e Pânico)",
    "base_tecnica": "NBR 17240",
    "complementares": [
      "NT 01 — Procedimentos administrativos",
      "NT 03 — Terminologia de segurança contra incêndio",
      "NT 04 — Símbolos gráficos para projeto de segurança contra incêndio",
      "Instrução Técnica nº 19/2019 — CBPMESP"
    ],
    "versao": "Atualizada pela Portaria nº 426, de 24 de agosto de 2022"
  },
  "referencias": [
    {
      "codigo": "NBR 17240",
      "titulo": "Sistemas de detecção e alarme de incêndio — projeto, instalação, comissionamento e manutenção de sistemas de detecção e alarme de incêndio — Requisitos"
    },
    {
      "codigo": "NBR ISO 7240-1",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 1: Generalidades e definições"
    },
    {
      "codigo": "NBR ISO 7240-2",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 2: Equipamentos de controle e de indicação"
    },
    {
      "codigo": "NBR ISO 7240-3",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 3: Dispositivo de alarme sonoro"
    },
    {
      "codigo": "NBR ISO 7240-4",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 4: Fontes de alimentação"
    },
    {
      "codigo": "NBR ISO 7240-5",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 5: Detectores pontuais de temperatura"
    },
    {
      "codigo": "NBR ISO 7240-7",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 7: Detectores pontuais de fumaça utilizando dispersão de luz ou ionização"
    },
    {
      "codigo": "NBR ISO 7240-11",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 11: Acionadores manuais"
    },
    {
      "codigo": "NBR ISO 7240-13",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 13: Avaliação de compatibilidade dos componentes do sistema"
    },
    {
      "codigo": "NBR ISO 7240-20",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 20: Detectores de fumaça por aspiração"
    },
    {
      "codigo": "NBR ISO 7240-23",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 23: Dispositivos de alarme visual"
    },
    {
      "codigo": "NBR ISO 7240-25",
      "titulo": "Sistemas de detecção e alarme de incêndio — Parte 25: Componentes utilizando meios de transmissão por rádio"
    }
  ],
  "alimentacao": {
    "fontes_min": 2,
    "principal": "rede elétrica da edificação",
    "auxiliar": [
      "bateria de acumuladores",
      "nobreak",
      "gerador"
    ],
    "autonomia_supervisao_h": 24,
    "autonomia_alarme_min": 15,
    "autonomia_alarme_alternativa": "ou o tempo necessário para o abandono da edificação",
    "tensao_ensaio_vcc": [
      24,
      32
    ]
  },
  "central": {
    "alarme_geral_audivel_toda_edificacao": true,
    "alarme_sem_interferir_comunicacao_verbal": true,
    "pre_alarme_retardo_max_min": 2,
    "pre_alarme_exige_brigada": true,
    "subcentral_retardo_max_min": null,
    "painel_esquema_obrigatorio": true,
    "interface_altura_recomendada_m": {
      "em_pe": [
        1.4,
        1.6
      ],
      "sentada": [
        1.1,
        1.2
      ]
    },
    "sinalizacao_padrao": {
      "alarme": "vermelha",
      "falha": "amarela",
      "funcionamento": "verde"
    },
    "area_livre_frontal_m2": 1,
    "tipos": [
      {
        "key": "convencional",
        "label": "Convencional"
      },
      {
        "key": "enderecavel",
        "label": "Endereçável"
      }
    ],
    "locais": [
      {
        "key": "portaria",
        "label": "Portaria principal"
      },
      {
        "key": "sala_seguranca",
        "label": "Sala de segurança"
      },
      {
        "key": "sala_controle",
        "label": "Sala de controle"
      },
      {
        "key": "entrada",
        "label": "Entrada da edificação"
      }
    ]
  },
  "acionador": {
    "distancia_max_m": 30,
    "altura_min_m": 0.9,
    "altura_max_m": 1.35,
    "um_por_pavimento": true,
    "obrigatorio_com_deteccao": true,
    "excecoes": [
      {
        "divisoes": [
          "F-6"
        ],
        "texto": "nas áreas de público o acionador manual é opcional; é obrigatório nas demais áreas"
      }
    ],
    "cor": "vermelha",
    "preferencia_junto_hidrantes": true,
    "area_cobertura_estimada_m2": 900,
    "area_cobertura_criterio": "Estimativa de projeto: quadrado de lado igual à distância máxima de percurso (percurso ortogonal), de modo que nenhum ponto exceda a distância máxima ao acionador mais próximo. Confirmar em planta."
  },
  "avisador": {
    "limite_dba": null,
    "altura_min_m": null,
    "altura_max_m": null,
    "minimo_por_pavimento": 1,
    "visual_reuniao_publico": true,
    "tempo_atuacao_max_s": 30,
    "visibilidade_m": 15
  },
  "fiacao": {
    "norma": "NBR 17240",
    "protecao_calor": "resistência mínima de 60 minutos",
    "protecao_calor_resistencia_min": 60
  },
  "entreforros": {
    "obrigatorio_com_deteccao": true
  },
  "sem_fio": {
    "anexos": [],
    "certificacao_laboratorio": true
  },
  "complementares": [
    "interfone",
    "rede de rádio"
  ],
  "detectores": {
    "tipos": {
      "fumaca_pontual": {
        "label": "Detector pontual de fumaça",
        "area_max_m2": 81,
        "lado_m": 9,
        "raio_m": 6.3,
        "altura_max_m": 8,
        "viga_max_sem_reducao_m": 0.2,
        "trocas_ar_max_sem_reducao": 8,
        "afastamento_parede_min_m": 0.15,
        "parede_faixa_teto_m": [
          0.15,
          0.3
        ],
        "indicacao": "Ambientes em geral, com materiais cuja combustão inicial gera fumaça. Em ambientes com vapor, gases ou muitas partículas em suspensão, avaliar outros tipos de detector.",
        "por_area": true,
        "item": "6.1"
      },
      "temperatura_pontual": {
        "label": "Detector pontual de temperatura",
        "area_max_m2": 36,
        "lado_m": 6,
        "raio_m": 4.2,
        "altura_max_m": 5,
        "viga_max_sem_reducao_m": 0.2,
        "afastamento_parede_min_m": 0.15,
        "parede_faixa_teto_m": [
          0.15,
          0.3
        ],
        "indicacao": "Ambientes com materiais que geram muito calor e pouca fumaça no início da combustão, ou com vapor, gases e partículas onde detectores de fumaça dariam alarmes indesejados.",
        "por_area": true,
        "item": "6.2"
      },
      "fumaca_linear": {
        "label": "Detector linear de fumaça (feixe de luz)",
        "dist_emissor_receptor_max_m": 100,
        "dist_entre_feixes_max_m": 15,
        "dist_parede_max_m": 7.5,
        "dist_parede_ponto_rigido_max_m": 3.75,
        "dist_teto_recomendada_m": [
          0.3,
          1.0
        ],
        "indicacao": "Locais cuja altura de cobertura prejudique o sensoriamento dos detectores pontuais e pontos em que não se recomenda o uso de detectores sobre equipamentos.",
        "por_area": false,
        "item": "6.4"
      },
      "temperatura_linear": {
        "label": "Detector linear de temperatura (cabo)",
        "indicacao": "Aplicações localizadas, junto ou em contato com o material protegido (bandejas de cabos, esteiras rolantes e similares); comprimento e raio de cobertura conforme o fabricante.",
        "por_area": false,
        "item": "6.5"
      },
      "chama": {
        "label": "Detector de chama",
        "reducao_extremos_campo_visao_pct": 50,
        "indicacao": "Áreas onde a chama possa surgir rapidamente (hangares, áreas petroquímicas, armazenagem de inflamáveis, gás combustível, cabines de pintura) e áreas abertas ou semiabertas.",
        "por_area": false,
        "item": "6.3"
      }
    },
    "reducao_viga": [
      {
        "min_m": 0.21,
        "max_m": 0.6,
        "fator": 0.6667,
        "texto": "dois terços"
      },
      {
        "min_m": 0.6,
        "max_m": null,
        "fator": 0.5,
        "texto": "metade"
      }
    ],
    "temperatura_teto": [
      {
        "teto_max_c": 47,
        "atuacao_c": [
          57,
          79
        ]
      },
      {
        "teto_max_c": 69,
        "atuacao_c": [
          80,
          121
        ]
      },
      {
        "teto_max_c": 111,
        "atuacao_c": [
          122,
          162
        ]
      },
      {
        "teto_max_c": 152,
        "atuacao_c": [
          163,
          204
        ]
      },
      {
        "teto_max_c": 194,
        "atuacao_c": [
          205,
          259
        ]
      },
      {
        "teto_max_c": 249,
        "atuacao_c": [
          260,
          302
        ]
      }
    ],
    "espacamento_altura_temperatura": [
      {
        "altura_m": 5.0,
        "espacamento_m": 6.0
      },
      {
        "altura_m": 6.0,
        "espacamento_m": 5.6
      },
      {
        "altura_m": 7.0,
        "espacamento_m": 5.2
      },
      {
        "altura_m": 8.0,
        "espacamento_m": 4.8
      },
      {
        "altura_m": 9.0,
        "espacamento_m": 4.4
      },
      {
        "altura_m": 10.0,
        "espacamento_m": 4.0
      }
    ],
    "regras": [
      "Um ambiente deve ser protegido em toda a sua extensão pelo mesmo tipo de detector; é permitida proteção adicional de outro tipo em determinada área.",
      "Em locais com altura superior a 8 m, os detectores pontuais de fumaça devem ser instalados em níveis de no máximo 8 m.",
      "Detectores instalados em dutos ou retornos de ar são complementares e não substituem os que protegem a área.",
      "Evitar detectores pontuais a menos de 1,50 m dos pontos de insuflamento de ar; o sistema deve funcionar com e sem ventilação ligada."
    ],
    "fonte": "NT 19/2022 CBMGO, item 6"
  },
  "comissionamento": null,
  "manutencao": {
    "periodicidade_preventiva_max_meses": 3,
    "art_instalacao": true,
    "relatorio_disponivel_edificacao": false,
    "texto": "A periodicidade das manutenções preventivas não pode ultrapassar três meses; o usuário final é responsável pela manutenção preventiva e corretiva. Por ocasião do pedido de inspeção deve ser apresentada ART do responsável técnico pela instalação, garantindo que os detectores foram instalados conforme a NBR 17240."
  },
  "itens": {
    "alimentacao": "5.3",
    "teste_indicadores": "5.4",
    "vigilancia": "5.5",
    "alarme_geral": "5.6",
    "pre_alarme": "5.6.1",
    "acionador_altura": "5.7",
    "acionador_distancia": "5.8",
    "acionador_hidrantes": "5.9",
    "acionador_pavimento": "5.10",
    "acionador_com_deteccao": "5.11",
    "avisador_visual": "5.12",
    "avisador_reuniao": "5.18",
    "entreforros": "5.13",
    "protecao_calor": "5.14",
    "fiacao": "5.15",
    "leds_acionadores": "5.16",
    "painel_esquema": "5.17",
    "complementares": "5.19",
    "leds_saidas": "5.20",
    "deteccao_linear": "5.21",
    "central_altura": "5.22",
    "manutencao": "5.23",
    "art": "5.24",
    "sem_fio": "5.25",
    "projeto": "5.1",
    "simbolos": "5.2"
  },
  "notas_por_divisao": {
    "F-6": [
      {
        "item": "5.11",
        "texto": "Nas ocupações da divisão F-6, o acionador manual é opcional nas áreas de público e obrigatório nas demais áreas."
      }
    ]
  },
  "notas_gerais": [
    {
      "item": "5.6",
      "texto": "O alarme geral deve ser audível em toda a edificação, sem interferir na comunicação verbal."
    },
    {
      "item": "5.12",
      "texto": "Onde não seja possível ouvir o alarme geral, devido à atividade sonora intensa, são obrigatórios avisadores visuais e sonoros."
    },
    {
      "item": "5.13",
      "texto": "Havendo exigência de detecção, são obrigatórios detectores nos entreforros e entrepisos que contenham instalações com materiais combustíveis."
    },
    {
      "item": "5.14",
      "texto": "Os elementos de proteção contra calor que contenham a fiação do sistema devem ter resistência mínima de 60 minutos."
    },
    {
      "item": "5.24",
      "texto": "Deve ser apresentada ao Corpo de Bombeiros ART do responsável técnico pela instalação, garantindo que os detectores foram instalados conforme a NBR 17240."
    }
  ]
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();
