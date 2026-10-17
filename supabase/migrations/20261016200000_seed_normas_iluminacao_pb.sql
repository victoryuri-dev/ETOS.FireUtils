-- Semeia normas_dados com a Iluminação de Emergência da Paraíba (NT 18/2024
-- CBMPB): tipos de sistema (itens 5.1–5.3), iluminância mínima de 3 lux em
-- locais planos e 5 lux com desnível (item 6.2), espaçamento 15 m / 7,5 m
-- (5.4.1), tensão máxima 30 V (6.3) e notas. Uniformidade e tempo de
-- resposta da NBR 10898; autonomia de 2 h pelo formulário do CBMPB. Mesmo
-- formato da linha do MA. Fonte: src/data/normas/PB/iluminacao.js.

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('PB', 'iluminacao', $j${
  "autonomia_minima_horas": 2,
  "campos_equipamento": [
    {
      "key": "tipoLampada",
      "label": "Tipo de lâmpada"
    },
    {
      "key": "potenciaW",
      "label": "Potência",
      "unidade": "W"
    },
    {
      "key": "tensaoV",
      "label": "Tensão",
      "unidade": "V"
    },
    {
      "key": "fluxoLuminosoLm",
      "label": "Fluxo luminoso nominal",
      "unidade": "lm"
    },
    {
      "key": "autonomia",
      "label": "Autonomia"
    }
  ],
  "distancia_maxima_parede_m": 7.5,
  "distancia_maxima_pontos_m": 15,
  "equipamentos_aclaramento": [
    {
      "key": "luminaria_30leds",
      "label": "Luminária de Emergência 30 LEDs"
    },
    {
      "key": "bloco_emergencia",
      "label": "Bloco de Iluminação de Emergência"
    }
  ],
  "iluminancia_minima": {
    "aclaramento_normal": 3,
    "aclaramento_risco": 5
  },
  "norma": {
    "sigla": "NT 18/2024 CBMPB"
  },
  "notas": {
    "aclaramento": "Item 6.2, NT 18/2024 CBMPB — nível mínimo de iluminamento de 3 lux em locais planos (corredores, halls, áreas de refúgio) e 5 lux em locais com desnível (escadas ou passagens com obstáculos).",
    "espacamento": "Item 5.4.1 a) — a distância máxima entre os pontos de iluminação de aclaramento não deve ultrapassar 15 m, e entre o ponto e a parede, 7,5 m; outro distanciamento pode ser adotado desde que atenda à NBR 10898.",
    "isencaoSalas": "Item 5.4.1 b) — salas com área igual ou inferior a 50 m² e população inferior a 50 pessoas estão isentas, desde que as saídas sejam diretas para o corredor.",
    "balizamento": "Item 5.4.2 — a luminária de balizamento que atenda 3 lux dispensa a de aclaramento no mesmo local; acima das portas de saída em ambientes fechados com lotação superior a 100 pessoas nas ocupações F-3, F-5, F-6, F-7, F-10 e F-11, as luminárias devem ser de balizamento, permanentemente acesas durante a utilização do ambiente.",
    "tensao": "Item 6.3 — tensão máxima de 30 V nas luminárias de aclaramento e balizamento em áreas com carga de incêndio, exceto blocos autônomos; em instalações existentes, sem como reduzir a tensão, admite-se interruptor diferencial de 30 mA com disjuntor termomagnético de 10 A (item 6.4).",
    "tubulacao": "Item 6.1 — em instalação aparente, tubulação e caixas de passagem metálicas ou em PVC rígido antichama (NBR 15465).",
    "autonomia": "Autonomia mínima do sistema de 2 horas (NBR 10898/2023, conforme o formulário do memorial do CBMPB).",
    "tempoResposta": "O sistema deve entrar em plena operação em no máximo 5 segundos após a falta de energia da rede normal (NBR 10898)."
  },
  "presets_equipamento": [
    {
      "key": "luminaria_30leds_100lm",
      "tipoBase": "luminaria_30leds",
      "label": "30 LEDs SMD — 100 lm",
      "tipoLampada": "30 LEDs SMD",
      "potenciaW": "6",
      "tensaoV": "100-240",
      "fluxoLuminosoLm": "100",
      "autonomia": "3h fluxo máximo / 6h fluxo mínimo"
    },
    {
      "key": "bloco_2200lm",
      "tipoBase": "bloco_emergencia",
      "label": "2200 lm",
      "tipoLampada": "2 × 70 LEDs autobrilho",
      "potenciaW": "2× 7,65",
      "tensaoV": "100-240",
      "fluxoLuminosoLm": "2200",
      "autonomia": ">2 horas"
    },
    {
      "key": "bloco_1200lm",
      "tipoBase": "bloco_emergencia",
      "label": "1200 lm",
      "tipoLampada": "2 × 35 LEDs autobrilho",
      "potenciaW": "2× 4,4",
      "tensaoV": "100-240",
      "fluxoLuminosoLm": "1200",
      "autonomia": ">2 horas"
    },
    {
      "key": "bloco_600lm",
      "tipoBase": "bloco_emergencia",
      "label": "600 lm",
      "tipoLampada": "2 × 40 LEDs autobrilho",
      "potenciaW": "2× 2",
      "tensaoV": "100-240",
      "fluxoLuminosoLm": "600",
      "autonomia": ">2 horas"
    },
    {
      "key": "bloco_400lm",
      "tipoBase": "bloco_emergencia",
      "label": "400 lm",
      "tipoLampada": "2 × 40 LEDs autobrilho",
      "potenciaW": "2× 1,4",
      "tensaoV": "100-240",
      "fluxoLuminosoLm": "400",
      "autonomia": ">3 horas"
    }
  ],
  "razao_uniformidade_max": 40,
  "rotulos_iluminancia": {
    "aclaramento_normal": "Locais planos (corredores, halls, áreas de refúgio)",
    "aclaramento_risco": "Locais com desnível (escadas, passagens com obstáculos)"
  },
  "tempo_resposta_max_s": 5,
  "tensao_maxima_v": 30,
  "tipos_sistema": [
    {
      "key": "bloco_autonomo",
      "label": "Bloco autônomo",
      "descricao": "Luminária com bateria própria (chumbo-ácido selada ou níquel-cádmio, isenta de manutenção — item 5.3)."
    },
    {
      "key": "central",
      "label": "Sistema centralizado com baterias",
      "descricao": "Fonte e comandos em local não acessível ao público, sem risco de incêndio e ventilado (item 5.2)."
    },
    {
      "key": "ups",
      "label": "Sistema centralizado por UPS",
      "descricao": "UPS (no-break) exclusiva para a iluminação de emergência, com transformador isolador e aterramento (NBR 10898/2023 — item 13.3 do formulário do CBMPB)."
    },
    {
      "key": "motogerador",
      "label": "Grupo motogerador (GMG)",
      "descricao": "Com tempo de comutação acima do da NBR 10898, exige também sistema centralizado por bateria ou bloco autônomo (item 5.1.5)."
    }
  ]
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();
