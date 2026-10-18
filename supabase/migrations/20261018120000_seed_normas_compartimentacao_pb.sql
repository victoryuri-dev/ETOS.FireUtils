-- Semeia normas_dados com a Compartimentação Horizontal e Vertical da
-- Paraíba (NT 36/2024 CBMPB — Anexo B: área máxima de compartimentação por
-- divisão × tipo de edificação, nota específica 1 e notas genéricas a–c).
-- Mesmo formato da linha do MA; "sem teto" gravado como "Infinity" e área
-- definida pela Comissão Técnica como "CTD". TRRF mínimos, elementos,
-- condições especiais e substituições: valores do MA, a conferir com a NT 36
-- (ver cabeçalho de src/data/normas/PB/compartimentacao.js, fonte deste seed).

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('PB', 'compartimentacao', $j${
  "classes_tipo_edificacao": [
    {
      "classe": "I",
      "nome": "Edificação térrea",
      "min": 0,
      "max": 0
    },
    {
      "classe": "II",
      "nome": "Edificação baixa",
      "min": 0,
      "max": 6
    },
    {
      "classe": "III",
      "nome": "Edificação de baixa-média altura",
      "min": 6,
      "max": 12
    },
    {
      "classe": "IV",
      "nome": "Edificação de média altura",
      "min": 12,
      "max": 23
    },
    {
      "classe": "V",
      "nome": "Edificação medianamente alta",
      "min": 23,
      "max": 30
    },
    {
      "classe": "VI",
      "nome": "Edificação alta",
      "min": 30,
      "max": "Infinity"
    }
  ],
  "condicoes_especiais_horizontal": [
    {
      "key": "estacionamento_exclusivo",
      "ref": "5.5.1",
      "label": "Área exclusiva de estacionamento de veículos",
      "texto": "Área destinada exclusivamente a estacionamento de veículos — compartimentação horizontal dispensada."
    },
    {
      "key": "unidades_autonomas_ei60",
      "ref": "5.5.2",
      "label": "Unidades autônomas com parede EI-60",
      "texto": "Grupos A (A-2/A-3), B e H (H-2/H-3): paredes entre unidades autônomas e áreas comuns com TRRF mínimo de 60 min (EI-60), independente do TRRF da edificação — dispensável se houver chuveiros automáticos (item 5.5.4)."
    },
    {
      "key": "subsolo_pcf_p90",
      "ref": "5.5.7",
      "label": "Subsolo com PCF P-90",
      "texto": "Escadas/rampas de circulação vindas de subsolo compartimentadas com PCF P-90 (EI-90) em relação aos demais pisos, independente da área máxima."
    },
    {
      "key": "drywall_acima_6_5m",
      "ref": "5.5.10",
      "label": "Drywall acima de 6,5 m",
      "texto": "Parede de drywall com altura acima de 6,5 m — exige atestado do fabricante e ART/documento de responsabilidade técnica da instalação."
    }
  ],
  "condicoes_especiais_vertical": [
    {
      "key": "interligacao_ate_3_pavimentos",
      "ref": "6.5.1",
      "label": "Interligação de até 3 pavimentos",
      "texto": "Interligação de até 3 pavimentos consecutivos acima do térreo por átrios, escadas, rampas ou escadas rolantes, desde que a soma das áreas desses pavimentos não ultrapasse a área máxima de compartimentação."
    },
    {
      "key": "subsolo_dutos_shafts",
      "ref": "6.5.2",
      "label": "Dutos/shafts do subsolo compartimentados",
      "texto": "Dutos e shafts de instalações dos subsolos compartimentados integralmente em relação ao térreo, piso de descarga e demais pisos elevados, independente da área máxima."
    },
    {
      "key": "subsolo_pcf_p90",
      "ref": "6.5.3",
      "label": "Subsolo com PCF P-90",
      "texto": "Escadas/rampas de circulação vindas de subsolo compartimentadas com PCF P-90 (EI-90) em relação aos demais pisos, independente da área máxima."
    },
    {
      "key": "dispositivo_enrolar_sprinklers",
      "ref": "7.1",
      "label": "Dispositivo de enrolar + chuveiros automáticos",
      "texto": "Dispositivos automatizados de enrolar corta-fogo só podem substituir portas/vedadores em edificações protegidas por chuveiros automáticos, nas situações do item 7.1 (interligação de até 2 pavimentos, pavimento de estacionamento, ou ampliação de edificação existente)."
    }
  ],
  "elementos_compart_horizontal": [
    {
      "key": "parede_corta_fogo",
      "label": "Parede corta-fogo (EI)"
    },
    {
      "key": "porta_corta_fogo",
      "label": "Porta corta-fogo (EI)"
    },
    {
      "key": "vedador_corta_fogo",
      "label": "Vedador corta-fogo (EI)"
    },
    {
      "key": "registro_corta_fogo",
      "label": "Registro corta-fogo — damper (EI)"
    },
    {
      "key": "selo_corta_fogo",
      "label": "Selo corta-fogo (EI)"
    },
    {
      "key": "dispositivo_enrolar",
      "label": "Dispositivo automatizado de enrolar corta-fogo (EI)"
    },
    {
      "key": "afastamento_horizontal",
      "label": "Afastamento horizontal entre aberturas"
    }
  ],
  "elementos_compart_vertical": [
    {
      "key": "entrepiso_corta_fogo",
      "label": "Entrepiso corta-fogo (EI)"
    },
    {
      "key": "enclausuramento_escada",
      "label": "Enclausuramento de escadas (parede e porta corta-fogo)"
    },
    {
      "key": "enclausuramento_elevador",
      "label": "Enclausuramento de poços de elevador/monta-carga"
    },
    {
      "key": "selo_corta_fogo",
      "label": "Selo corta-fogo (EI) — prumadas de instalações"
    },
    {
      "key": "registro_corta_fogo",
      "label": "Registro corta-fogo — damper (EI)"
    },
    {
      "key": "vedador_corta_fogo",
      "label": "Vedador corta-fogo (EI)"
    },
    {
      "key": "separacao_fachada",
      "label": "Separação de fachada entre pavimentos (antepara vertical/horizontal)"
    },
    {
      "key": "selagem_perimetral",
      "label": "Selagem perimetral corta-fogo (EI)"
    },
    {
      "key": "dispositivo_enrolar",
      "label": "Dispositivo automatizado de enrolar corta-fogo (EI)"
    }
  ],
  "norma": {
    "sigla": "NT 36/2024 CBMPB",
    "nome": "Compartimentação Horizontal e Compartimentação Vertical"
  },
  "notas_gerais_area_maxima": {
    "a": "Observar os casos permitidos de substituição da compartimentação de áreas por sistema de chuveiros automáticos, acrescidos, em alguns casos, do sistema de detecção de incêndio, conforme tabelas de exigências da norma técnica específica de Classificação das edificações e áreas de risco e exigências das medidas de segurança contra incêndio, explosão e controle de pânico.",
    "b": "Os locais assinalados com traço ( – ) estão dispensados de áreas máximas de compartimentação, mantendo a compartimentação vertical, de acordo com as tabelas de exigências da norma técnica específica de Classificação das edificações e áreas de risco e exigências das medidas de segurança contra incêndio, explosão e controle de pânico.",
    "c": "A inexistência de compartimentação vertical implica na somatória das áreas dos pavimentos para fins de cálculo da área máxima compartimentada."
  },
  "nota_area_maxima_m2": "A área máxima de compartimentação para edificações do grupo M-2 pode ser substituída quando a edificação for protegida por sistema de chuveiro automático de água ou de espuma, conforme norma específica de Segurança contra Incêndio para líquidos combustíveis e inflamáveis.",
  "substituicoes_compartimentacao": [
    {
      "key": "sprinklers",
      "label": "Chuveiros automáticos",
      "sistemas": [
        "sprinklers"
      ],
      "texto": "Sistema de chuveiros automáticos"
    },
    {
      "key": "deteccao_sprinklers",
      "label": "Detecção de incêndio + Chuveiros automáticos",
      "sistemas": [
        "deteccao",
        "sprinklers"
      ],
      "texto": "Sistema de detecção de incêndio e chuveiros automáticos"
    },
    {
      "key": "fumaca_deteccao_sprinklers",
      "label": "Controle de fumaça + Detecção + Chuveiros automáticos",
      "sistemas": [
        "controle_fumaca",
        "deteccao",
        "sprinklers"
      ],
      "texto": "Sistema de controle de fumaça, detecção de incêndio e chuveiros automáticos"
    }
  ],
  "tabela_area_maxima": [
    {
      "divisoes": [
        "A-1",
        "A-2",
        "A-3"
      ],
      "t1": null,
      "t2": null,
      "t3": null,
      "t4": null,
      "t5": null,
      "t6": null
    },
    {
      "divisoes": [
        "B-1",
        "B-2"
      ],
      "t1": null,
      "t2": 5000,
      "t3": 4000,
      "t4": 3000,
      "t5": 2000,
      "t6": 1500
    },
    {
      "divisoes": [
        "C-1",
        "C-2"
      ],
      "t1": 5000,
      "t2": 3000,
      "t3": 2000,
      "t4": 2000,
      "t5": 1500,
      "t6": 1500
    },
    {
      "divisoes": [
        "C-3"
      ],
      "t1": 5000,
      "t2": 2500,
      "t3": 1500,
      "t4": 1000,
      "t5": 2000,
      "t6": 2000
    },
    {
      "divisoes": [
        "D-1",
        "D-2",
        "D-3",
        "D-4"
      ],
      "t1": 5000,
      "t2": 2500,
      "t3": 1500,
      "t4": 1000,
      "t5": 800,
      "t6": 2000
    },
    {
      "divisoes": [
        "E-1",
        "E-2",
        "E-3",
        "E-4",
        "E-5",
        "E-6"
      ],
      "t1": null,
      "t2": null,
      "t3": null,
      "t4": null,
      "t5": 1500,
      "t6": 2000
    },
    {
      "divisoes": [
        "F-1",
        "F-2",
        "F-3",
        "F-4",
        "F-7",
        "F-9"
      ],
      "t1": null,
      "t2": null,
      "t3": null,
      "t4": null,
      "t5": null,
      "t6": null
    },
    {
      "divisoes": [
        "F-5",
        "F-6"
      ],
      "t1": 5000,
      "t2": 4000,
      "t3": 3000,
      "t4": 2000,
      "t5": 1000,
      "t6": 1500
    },
    {
      "divisoes": [
        "F-8"
      ],
      "t1": null,
      "t2": null,
      "t3": null,
      "t4": 2000,
      "t5": 1000,
      "t6": 1500
    },
    {
      "divisoes": [
        "F-10",
        "F-11"
      ],
      "t1": 5000,
      "t2": 2500,
      "t3": 1500,
      "t4": 1000,
      "t5": 1000,
      "t6": 1000
    },
    {
      "divisoes": [
        "G-1",
        "G-2",
        "G-3",
        "G-5"
      ],
      "t1": null,
      "t2": null,
      "t3": null,
      "t4": null,
      "t5": null,
      "t6": null
    },
    {
      "divisoes": [
        "G-4"
      ],
      "t1": 10000,
      "t2": 5000,
      "t3": 3000,
      "t4": 2000,
      "t5": 1000,
      "t6": 1000
    },
    {
      "divisoes": [
        "H-1",
        "H-2",
        "H-4",
        "H-5"
      ],
      "t1": null,
      "t2": null,
      "t3": null,
      "t4": null,
      "t5": null,
      "t6": null
    },
    {
      "divisoes": [
        "H-3"
      ],
      "t1": null,
      "t2": 5000,
      "t3": 3000,
      "t4": 2000,
      "t5": 1500,
      "t6": 1000
    },
    {
      "divisoes": [
        "H-6"
      ],
      "t1": 5000,
      "t2": 2500,
      "t3": 1500,
      "t4": 1000,
      "t5": 800,
      "t6": 2000
    },
    {
      "divisoes": [
        "I-1"
      ],
      "t1": null,
      "t2": 10000,
      "t3": 5000,
      "t4": 3000,
      "t5": 1500,
      "t6": 2000
    },
    {
      "divisoes": [
        "I-2"
      ],
      "t1": null,
      "t2": 10000,
      "t3": 5000,
      "t4": 3000,
      "t5": 2000,
      "t6": 2000
    },
    {
      "divisoes": [
        "I-3"
      ],
      "t1": 7500,
      "t2": 5000,
      "t3": 3000,
      "t4": 2000,
      "t5": 1500,
      "t6": 1500
    },
    {
      "divisoes": [
        "J-1"
      ],
      "t1": null,
      "t2": null,
      "t3": null,
      "t4": null,
      "t5": null,
      "t6": null
    },
    {
      "divisoes": [
        "J-2"
      ],
      "t1": 10000,
      "t2": 5000,
      "t3": 3000,
      "t4": 1500,
      "t5": 2000,
      "t6": 1500
    },
    {
      "divisoes": [
        "J-3",
        "J-4"
      ],
      "t1": 4000,
      "t2": 3000,
      "t3": 2000,
      "t4": 2500,
      "t5": 1500,
      "t6": 1000
    },
    {
      "divisoes": [
        "L-1"
      ],
      "t1": 100,
      "t2": "CTD",
      "t3": "CTD",
      "t4": "CTD",
      "t5": "CTD",
      "t6": "CTD"
    },
    {
      "divisoes": [
        "L-2",
        "L-3"
      ],
      "t1": "CTD",
      "t2": "CTD",
      "t3": "CTD",
      "t4": "CTD",
      "t5": "CTD",
      "t6": "CTD"
    },
    {
      "divisoes": [
        "K-1"
      ],
      "t1": 5000,
      "t2": 3000,
      "t3": 2000,
      "t4": 1000,
      "t5": 500,
      "t6": 500
    },
    {
      "divisoes": [
        "M-1"
      ],
      "t1": "CTD",
      "t2": "CTD",
      "t3": "CTD",
      "t4": "CTD",
      "t5": "CTD",
      "t6": "CTD"
    },
    {
      "divisoes": [
        "M-2"
      ],
      "t1": 1000,
      "t2": 500,
      "t3": 500,
      "t4": 300,
      "t5": 300,
      "t6": 200
    },
    {
      "divisoes": [
        "M-3"
      ],
      "t1": 5000,
      "t2": 3000,
      "t3": 2000,
      "t4": 1000,
      "t5": 500,
      "t6": 500
    },
    {
      "divisoes": [
        "M-4",
        "M-5",
        "M-6",
        "M-7"
      ],
      "t1": 750,
      "t2": "CTD",
      "t3": "CTD",
      "t4": "CTD",
      "t5": "CTD",
      "t6": "CTD"
    }
  ],
  "trrf_escada_rampa_subsolo": 90,
  "trrf_minimo_duto_sem_registro": 120,
  "trrf_minimo_enclausuramento_escada_elevador": 120,
  "trrf_minimo_parede_compartimentacao": 60,
  "trrf_minimo_selagem_prumadas": 60,
  "trrf_porta_escada_com_antecamara": 60,
  "trrf_porta_escada_sem_antecamara": 90,
  "trrf_reducao_maxima_aberturas": 30
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();
