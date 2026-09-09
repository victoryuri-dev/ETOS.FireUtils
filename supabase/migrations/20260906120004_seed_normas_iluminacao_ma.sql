-- Parte de uma migração maior (base normativa central — ver
-- 20260906120002_seed_normas_restantes_ma.sql original) dividida em um
-- arquivo por sistema pra rodar e conferir um de cada vez no SQL Editor
-- do Supabase (o arquivo único de ~235KB/7 mil linhas não deixou nenhuma
-- linha nova gravada, sem erro nenhum reportado — mais fácil de
-- diagnosticar rodando aos pedaços do que investigar o motivo exato).

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('MA', 'iluminacao', $j${
  "autonomia_minima_horas": 1,
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
    "balizamento": 3,
    "aclaramento_normal": 5,
    "aclaramento_risco": 10
  },
  "notas": {
    "aclaramento": "NBR 10898 — a iluminação de aclaramento deve garantir o reconhecimento de obstáculos e o trajeto até a saída, com iluminância mínima de 5 lux nos ambientes em geral e 10 lux em áreas de risco elevado ou grande concentração de público, respeitada a uniformidade máxima de 40:1.",
    "balizamento": "NBR 10898 — todo ponto de mudança de direção, mudança de nível, porta de saída, equipamento de combate a incêndio e interseção de corredores deve possuir luminária de balizamento própria, com iluminância mínima de 3 lux no eixo do percurso.",
    "autonomia": "Autonomia mínima da bateria de 1 hora, conforme NBR 10898. Ocupações específicas podem exigir autonomia estendida — confirmar contra a NT 18 CBMMA vigente.",
    "tempoResposta": "O sistema deve entrar em plena operação em no máximo 5 segundos após a falta de energia da rede normal."
  },
  "pontos_balizamento": [
    {
      "key": "mudanca_direcao",
      "label": "Mudança de direção"
    },
    {
      "key": "escada",
      "label": "Escada / mudança de nível"
    },
    {
      "key": "porta_saida",
      "label": "Porta de saída"
    },
    {
      "key": "equipamento",
      "label": "Equipamento de combate a incêndio (extintor, hidrante, alarme)"
    },
    {
      "key": "intersecao",
      "label": "Interseção de corredores"
    },
    {
      "key": "outro",
      "label": "Outro ponto de risco"
    }
  ],
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
  "tempo_resposta_max_s": 5,
  "tipos_sistema": [
    {
      "key": "bloco_autonomo",
      "label": "Bloco autônomo",
      "descricao": "Luminária com bateria e circuito de acionamento próprios — não depende de central."
    },
    {
      "key": "central",
      "label": "Sistema centralizado",
      "descricao": "Central de baterias alimentando luminárias por circuito elétrico dedicado e exclusivo."
    },
    {
      "key": "motogerador",
      "label": "Grupo motogerador",
      "descricao": "Gerador a combustão — sistema complementar; não substitui a autonomia de bateria da iluminação de emergência."
    }
  ]
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();
