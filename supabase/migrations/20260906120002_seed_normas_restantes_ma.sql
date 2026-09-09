-- Migra pra normas_dados os sistemas normativos restantes do site
-- (extintores, iluminação, sinalização, TRRF, acesso de viatura, medidas
-- de segurança, ocupações, carga de incêndio por CNAE, NTs) que até aqui
-- só existiam como arquivo estático em src/data/normas/MA/*.js — mesmo
-- motivo da migração anterior de saída de emergência (evitar a mesma
-- tabela normativa mantida à mão duas vezes, uma em JS, sem nenhuma
-- garantia de que ficam iguais).
--
-- Convenção de chaves: cada export SCREAMING_SNAKE_CASE do módulo JS vira
-- uma chave em minúsculo dentro de "dados" (ex.: DISTANCIA_MAXIMA ->
-- distancia_maxima) — ver o adaptador genérico em src/data/normas/index.js
-- (renomearDaBaseCentral). 'sinalizacao' tira o campo "img" de cada item
-- de tipos_placa (é um módulo de imagem do bundler, não dá pra serializar
-- em JSON; o pictograma continua vindo do bundle local, casado pelo
-- "key" de volta no adaptador). 'trrf' grava Infinity (classes_subsolo,
-- S2 = sem teto) como a string "Infinity" pelo mesmo motivo (JSON não
-- tem Infinity), desfeito também no adaptador.
--
-- ocupacoes.js vira DUAS linhas (não uma) porque mistura duas coisas de
-- natureza bem diferente: a definição de grupos/divisões (pequena,
-- estável — sistema 'ocupacoes') e a base de CNAEs por divisão (grande,
-- mais sujeita a correção pontual — sistema 'carga_incendio'); separadas,
-- corrigir um CNAE não implica reescrever/revalidar a tabela de divisões
-- inteira (e vice-versa).

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('MA', 'extintores', $j${
  "altura_instalacao": {
    "suporteParede": {
      "alturaMaxima": 1.6,
      "alturaMinimaBase": 0.2
    },
    "apoiadoPiso": {
      "min": 0.1,
      "max": 0.2
    }
  },
  "area_limite_unidade_unica": {
    "alto": 150,
    "demais": 250
  },
  "distancia_entrada_escada": 5,
  "distancia_maxima": {
    "portatil": {
      "baixo": 25,
      "medio": 20,
      "alto": 15
    },
    "sobreRodas": {
      "baixo": 35,
      "medio": 30,
      "alto": 20
    },
    "classeD": 20
  },
  "limiares_risco": {
    "baixo": 300,
    "medio": 1200
  },
  "locais_risco_especial": [
    "Casa de caldeira",
    "Casa de bombas",
    "Casa de força elétrica",
    "Casa de máquinas",
    "Galeria de transmissão",
    "Incinerador",
    "Elevador (casa de máquinas)",
    "Ponte rolante",
    "Escada rolante (casa de máquinas)",
    "Quadro de redução para baixa tensão",
    "Transformadores",
    "Contêineres de telefonia"
  ],
  "notas": {
    "minimoPorPavimento": "Item 5.2.1.4, NT 21 CBMMA — cada pavimento deve possuir no mínimo duas unidades extintoras: uma para incêndio classe A e outra para incêndio classes B e C.",
    "substituicaoABC": "Item 5.2.1.4.1, NT 21 CBMMA — o extintor de pó ABC pode substituir qualquer tipo de extintor de classes específicas (A, B ou C).",
    "unidadeUnica": "Item 5.2.1.4.2, NT 21 CBMMA — permitida uma única unidade extintora de classe específica por pavimento conforme o risco predominante, dentro do limite de área.",
    "proporcaoSecundario": "Item 5.2.1.5, NT 21 CBMMA — os extintores devem ser intercalados na proporção de dois para o risco predominante e um para o risco secundário.",
    "combinacaoUnidades": "Item 5.2.1.8, NT 21 CBMMA — as unidades extintoras devem corresponder a um só extintor; não são aceitas combinações de dois ou mais extintores, exceto espuma mecânica, onde é permitido somar até dois extintores.",
    "classeD": "Item 5.1.3, NT 21 CBMMA — o dimensionamento para classe D deve ser baseado no metal combustível, no tamanho de suas partículas e na área a proteger, conforme recomendação do fabricante do agente extintor.",
    "entradaEscada": "Item 5.2.1.9.2, NT 21 CBMMA — deve ser instalado pelo menos um extintor a não mais de 5 m da entrada principal da edificação e das escadas nos demais pavimentos."
  },
  "proporcao_risco_secundario": {
    "predominante": 2,
    "secundario": 1
  },
  "tipos_portatil": [
    {
      "key": "agua",
      "label": "Água",
      "capacidadeMinima": "2-A",
      "classes": [
        "A"
      ]
    },
    {
      "key": "espuma",
      "label": "Espuma mecânica",
      "capacidadeMinima": "2-A:10-B",
      "classes": [
        "A",
        "B"
      ]
    },
    {
      "key": "co2",
      "label": "Dióxido de carbono (CO₂)",
      "capacidadeMinima": "5-B:C",
      "classes": [
        "B",
        "C"
      ]
    },
    {
      "key": "po_bc",
      "label": "Pó químico BC",
      "capacidadeMinima": "20-B:C",
      "classes": [
        "B",
        "C"
      ]
    },
    {
      "key": "po_abc",
      "label": "Pó químico ABC",
      "capacidadeMinima": "2-A:20-B:C",
      "classes": [
        "A",
        "B",
        "C"
      ]
    },
    {
      "key": "halogenado",
      "label": "Compostos halogenados",
      "capacidadeMinima": "5-B:C",
      "classes": [
        "B",
        "C"
      ]
    }
  ],
  "tipos_sobre_rodas": [
    {
      "key": "agua",
      "label": "Água",
      "capacidadeMinima": "10-A",
      "classes": [
        "A"
      ]
    },
    {
      "key": "espuma",
      "label": "Espuma mecânica",
      "capacidadeMinima": "6-A:40-B",
      "classes": [
        "A",
        "B"
      ]
    },
    {
      "key": "co2",
      "label": "Dióxido de carbono (CO₂)",
      "capacidadeMinima": "10-B:C",
      "classes": [
        "B",
        "C"
      ]
    },
    {
      "key": "po_bc",
      "label": "Pó químico BC",
      "capacidadeMinima": "80-B:C",
      "classes": [
        "B",
        "C"
      ]
    },
    {
      "key": "po_abc",
      "label": "Pó químico ABC",
      "capacidadeMinima": "6-A:80-B:C",
      "classes": [
        "A",
        "B",
        "C"
      ]
    }
  ]
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();

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

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('MA', 'sinalizacao', $j${
  "categorias": [
    {
      "key": "proibicao",
      "label": "Sinalização de Proibição"
    },
    {
      "key": "alerta",
      "label": "Sinalização de Alerta"
    },
    {
      "key": "orientacao",
      "label": "Sinalização de Orientação e Saída de Emergência"
    },
    {
      "key": "equipamentos",
      "label": "Sinalização de Equipamentos de Combate a Incêndio"
    }
  ],
  "notas": {
    "geral": "NBR 13434 (partes 1 a 3) — as placas de sinalização de emergência seguem cores, formas e pictogramas padronizados por categoria: proibição (fundo branco, faixa/círculo vermelho), alerta (fundo amarelo, faixa preta), orientação e saída (fundo verde) e equipamentos de combate a incêndio (fundo vermelho).",
    "altura": "Salvo indicação específica em contrário, as placas de equipamento e o número do pavimento devem ser instalados a 1,80 m de altura em relação ao piso acabado.",
    "fotoluminescencia": "As placas de orientação, saída de emergência e equipamentos devem ser fotoluminescentes, garantindo visibilidade mesmo na falta de energia elétrica.",
    "quantidade": "A quantidade de placas de orientação e saída de emergência decorre diretamente do dimensionamento das rotas de fuga feito em Saída de Emergência (NT 14 CBMMA) — cadastre aqui as placas efetivamente utilizadas no projeto."
  },
  "tipos_placa": [
    {
      "key": "p1",
      "codigo": "P1",
      "categoria": "proibicao",
      "label": "Proibido fumar",
      "localInstalacao": "Ambientes e áreas onde é proibido fumar"
    },
    {
      "key": "p2",
      "codigo": "P2",
      "categoria": "proibicao",
      "label": "Proibido produzir chama",
      "localInstalacao": "Áreas com risco de incêndio onde é proibido produzir chama"
    },
    {
      "key": "a2",
      "codigo": "A2",
      "categoria": "alerta",
      "label": "Cuidado, risco de incêndio",
      "localInstalacao": "Áreas ou equipamentos com risco de incêndio"
    },
    {
      "key": "a3",
      "codigo": "A3",
      "categoria": "alerta",
      "label": "Cuidado, risco de explosão",
      "localInstalacao": "Áreas ou equipamentos com risco de explosão"
    },
    {
      "key": "a5",
      "codigo": "A5",
      "categoria": "alerta",
      "label": "Cuidado, risco de choque elétrico",
      "localInstalacao": "Quadros, casas de máquinas e áreas com risco de choque elétrico"
    },
    {
      "key": "s1",
      "codigo": "S1",
      "categoria": "orientacao",
      "label": "Saída de emergência — seta à direita",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s2",
      "codigo": "S2",
      "categoria": "orientacao",
      "label": "Saída de emergência — seta à esquerda",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s3",
      "codigo": "S3",
      "categoria": "orientacao",
      "label": "Saída de emergência — seta em frente",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s4",
      "codigo": "S4",
      "categoria": "orientacao",
      "label": "Saída de emergência — seta diagonal superior direita",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s5",
      "codigo": "S5",
      "categoria": "orientacao",
      "label": "Saída de emergência — seta diagonal superior esquerda",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s6",
      "codigo": "S6",
      "categoria": "orientacao",
      "label": "Saída de emergência — seta diagonal inferior direita",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s7",
      "codigo": "S7",
      "categoria": "orientacao",
      "label": "Saída de emergência — seta diagonal inferior esquerda",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s8",
      "codigo": "S8",
      "categoria": "orientacao",
      "label": "Saída de emergência — descer escada (seta inferior direita)",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s9",
      "codigo": "S9",
      "categoria": "orientacao",
      "label": "Saída de emergência — descer escada (seta inferior esquerda)",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s10",
      "codigo": "S10",
      "categoria": "orientacao",
      "label": "Saída de emergência — subir escada (seta superior esquerda)",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s11",
      "codigo": "S11",
      "categoria": "orientacao",
      "label": "Saída de emergência — subir escada (seta superior direita)",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s12",
      "codigo": "S12",
      "categoria": "orientacao",
      "label": "Saída de emergência — texto \"SAÍDA\"",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s13",
      "codigo": "S13",
      "categoria": "orientacao",
      "label": "Saída de emergência — \"SAÍDA\" com seta à direita",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s14",
      "codigo": "S14",
      "categoria": "orientacao",
      "label": "Saída de emergência — \"SAÍDA\" (sem seta)",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s15",
      "codigo": "S15",
      "categoria": "orientacao",
      "label": "Rota de fuga acessível — seta à direita",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s16",
      "codigo": "S16",
      "categoria": "orientacao",
      "label": "Saída de emergência acessível — \"SAÍDA\" com seta à direita",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s17",
      "codigo": "S17",
      "categoria": "orientacao",
      "label": "Número do pavimento",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "A 1,80 m de altura, instalada junto à parede, sobre o patamar de acesso de cada pavimento"
    },
    {
      "key": "s18",
      "codigo": "S18",
      "categoria": "orientacao",
      "label": "Instrução de abertura da porta corta-fogo por barra antipânico",
      "localInstalacao": "Indicação da forma de acionamento da barra antipânico instalada sobre a porta corta-fogo"
    },
    {
      "key": "e2",
      "codigo": "E2",
      "categoria": "equipamentos",
      "label": "Acionador manual de alarme de incêndio",
      "localInstalacao": "A 1,80 m de altura, imediatamente acima do equipamento sinalizado"
    },
    {
      "key": "e3",
      "codigo": "E3",
      "categoria": "equipamentos",
      "label": "Comando manual da bomba de incêndio",
      "localInstalacao": "A 1,80 m de altura, imediatamente acima do equipamento sinalizado"
    },
    {
      "key": "e5",
      "codigo": "E5",
      "categoria": "equipamentos",
      "label": "Extintor de incêndio",
      "localInstalacao": "A 1,80 m de altura, imediatamente acima do equipamento sinalizado"
    },
    {
      "key": "e6",
      "codigo": "E6",
      "categoria": "equipamentos",
      "label": "Mangotinho",
      "localInstalacao": "A 1,80 m de altura, imediatamente acima do equipamento sinalizado"
    },
    {
      "key": "e7",
      "codigo": "E7",
      "categoria": "equipamentos",
      "label": "Abrigo de mangueira e hidrante",
      "localInstalacao": "A 1,80 m de altura, imediatamente acima do equipamento sinalizado"
    },
    {
      "key": "e8",
      "codigo": "E8",
      "categoria": "equipamentos",
      "label": "Hidrante de incêndio",
      "localInstalacao": "A 1,80 m de altura, imediatamente acima do equipamento sinalizado"
    },
    {
      "key": "e9",
      "codigo": "E9",
      "categoria": "equipamentos",
      "label": "Coleção de equipamentos de combate a incêndio",
      "localInstalacao": "A 1,80 m de altura, imediatamente acima do equipamento sinalizado"
    },
    {
      "key": "e10",
      "codigo": "E10",
      "categoria": "equipamentos",
      "label": "Válvula de controle do sistema de chuveiros automáticos",
      "localInstalacao": "A 1,80 m de altura, imediatamente acima do equipamento sinalizado"
    },
    {
      "key": "e11",
      "codigo": "E11",
      "categoria": "equipamentos",
      "label": "Extintor de incêndio tipo carreta",
      "localInstalacao": "A 1,80 m de altura, imediatamente acima do equipamento sinalizado"
    },
    {
      "key": "e17",
      "codigo": "E17",
      "categoria": "equipamentos",
      "label": "Sinalização de solo para equipamentos de combate a incêndio (hidrantes e extintores)",
      "localInstalacao": "Usada para indicar a localização dos equipamentos de combate a incêndio e alarme, para evitar a sua obstrução"
    }
  ]
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('MA', 'trrf', $j${
  "classes_altura": [
    {
      "classe": "P1",
      "min": 0,
      "max": 6
    },
    {
      "classe": "P2",
      "min": 6,
      "max": 12
    },
    {
      "classe": "P3",
      "min": 12,
      "max": 23
    },
    {
      "classe": "P4",
      "min": 23,
      "max": 30
    },
    {
      "classe": "P5",
      "min": 30,
      "max": 80
    },
    {
      "classe": "P6",
      "min": 80,
      "max": 120
    },
    {
      "classe": "P7",
      "min": 120,
      "max": 150
    },
    {
      "classe": "P8",
      "min": 150,
      "max": 250
    }
  ],
  "classes_subsolo": [
    {
      "classe": "S1",
      "min": 0,
      "max": 10
    },
    {
      "classe": "S2",
      "min": 10,
      "max": "Infinity"
    }
  ],
  "divisoes_sem_ocupacao_subsolo": [
    "G-1"
  ],
  "metodologia_por_material": {
    "Concreto armado": {
      "norma": "ABNT NBR 15200",
      "metodologia": "método tabular do tempo requerido de resistência ao fogo (TRRF) para estruturas de concreto"
    },
    "Estrutura metalica": {
      "norma": "ABNT NBR 14432 / NBR 15200",
      "metodologia": "dimensionamento em situação de incêndio com determinação da temperatura crítica dos elementos metálicos, podendo ser adotado revestimento contra fogo (TRF) quando necessário"
    },
    "Alvenaria estrutural": {
      "norma": "ABNT NBR 15575 / NBR 14432",
      "metodologia": "verificação da resistência ao fogo dos elementos de alvenaria estrutural conforme ensaios ou método tabular aplicável"
    },
    "Madeira": {
      "norma": "ABNT NBR 7190",
      "metodologia": "método do tempo de carbonização para dimensionamento de elementos estruturais de madeira em situação de incêndio"
    }
  },
  "notas_anexo_b": {
    "naoEnquadrado": "Nota 1, Anexo B da NT 01 CBMMA — casos não enquadrados na tabela serão definidos pelo SSCI do Corpo de Bombeiros.",
    "naoRegressao": "Item 5.12 da NT 01 CBMMA — o TRRF dos subsolos e sobressolos não pode ser inferior ao TRRF dos pavimentos situados acima do solo.",
    "industriaDeposito": "Nota 3, Anexo B — para indústria ou depósito com inflamáveis, considerar as divisões I-3 e J-4, respectivamente.",
    "alturaEdificacao": "Item 4.31, NT 03 CBMMA (Terminologia) — altura da edificação: do piso de descarga ao piso do último pavimento habitado, excluindo áticos, casas de máquinas, barrilete e reservatórios. Quando o subsolo tiver ocupação diferente de estacionamento de veículos, vestiário ou instalação sanitária sem uso ou permanência humana, a medição passa a partir do piso do subsolo mais baixo ocupado."
  },
  "tabela_trrf": [
    {
      "grupo": "A",
      "divisoes": [
        "A-1",
        "A-2",
        "A-3"
      ],
      "s2": 90,
      "s1": 60,
      "p1": 30,
      "p2": 30,
      "p3": 60,
      "p4": 90,
      "p5": 120,
      "p6": 120,
      "p7": 150,
      "p8": 180
    },
    {
      "grupo": "B",
      "divisoes": [
        "B-1",
        "B-2"
      ],
      "s2": 90,
      "s1": 60,
      "p1": 30,
      "p2": 60,
      "p3": 60,
      "p4": 90,
      "p5": 120,
      "p6": 150,
      "p7": 180,
      "p8": 180
    },
    {
      "grupo": "C",
      "divisoes": [
        "C-1",
        "C-2",
        "C-3"
      ],
      "s2": 90,
      "s1": 60,
      "p1": 60,
      "p2": 60,
      "p3": 60,
      "p4": 90,
      "p5": 120,
      "p6": 150,
      "p7": 150,
      "p8": 180
    },
    {
      "grupo": "D",
      "divisoes": [
        "D-1",
        "D-2",
        "D-3",
        "D-4"
      ],
      "s2": 90,
      "s1": 60,
      "p1": 30,
      "p2": 60,
      "p3": 60,
      "p4": 90,
      "p5": 120,
      "p6": 120,
      "p7": 150,
      "p8": 180
    },
    {
      "grupo": "E",
      "divisoes": [
        "E-1",
        "E-2",
        "E-3",
        "E-4",
        "E-5",
        "E-6"
      ],
      "s2": 90,
      "s1": 60,
      "p1": 30,
      "p2": 30,
      "p3": 60,
      "p4": 90,
      "p5": 120,
      "p6": 150,
      "p7": 150,
      "p8": 180
    },
    {
      "grupo": "F",
      "divisoes": [
        "F-1",
        "F-2",
        "F-5",
        "F-6",
        "F-8",
        "F-10",
        "F-11"
      ],
      "s2": 90,
      "s1": 60,
      "p1": 60,
      "p2": 60,
      "p3": 60,
      "p4": 90,
      "p5": 120,
      "p6": 150,
      "p7": 180,
      "p8": null
    },
    {
      "grupo": "F",
      "divisoes": [
        "F-3",
        "F-4",
        "F-7"
      ],
      "s2": 90,
      "s1": 60,
      "p1": "A.2.3.3",
      "p2": 30,
      "p3": 60,
      "p4": 60,
      "p5": 90,
      "p6": 120,
      "p7": null,
      "p8": null
    },
    {
      "grupo": "F",
      "divisoes": [
        "F-9"
      ],
      "s2": 90,
      "s1": 60,
      "p1": 30,
      "p2": 60,
      "p3": 90,
      "p4": 120,
      "p5": null,
      "p6": null,
      "p7": null,
      "p8": null
    },
    {
      "grupo": "G",
      "divisoes": [
        "G-1",
        "G-2",
        "G-3",
        "G-4",
        "G-5"
      ],
      "nota": "nao_abertos_lateralmente",
      "s2": 90,
      "s1": 60,
      "p1": 30,
      "p2": 60,
      "p3": 60,
      "p4": 90,
      "p5": 120,
      "p6": 120,
      "p7": 150,
      "p8": 180
    },
    {
      "grupo": "G",
      "divisoes": [
        "G-1",
        "G-2"
      ],
      "nota": "abertos_lateralmente",
      "s2": 90,
      "s1": 60,
      "p1": 30,
      "p2": 30,
      "p3": 30,
      "p4": 60,
      "p5": 90,
      "p6": 120,
      "p7": null,
      "p8": 150
    },
    {
      "grupo": "H",
      "divisoes": [
        "H-1",
        "H-4"
      ],
      "s2": 90,
      "s1": 60,
      "p1": 30,
      "p2": 30,
      "p3": 30,
      "p4": 60,
      "p5": 120,
      "p6": 150,
      "p7": 180,
      "p8": 180
    },
    {
      "grupo": "H",
      "divisoes": [
        "H-2",
        "H-3",
        "H-5",
        "H-6"
      ],
      "s2": 90,
      "s1": 60,
      "p1": 30,
      "p2": 60,
      "p3": 60,
      "p4": 90,
      "p5": 120,
      "p6": 150,
      "p7": 180,
      "p8": 180
    },
    {
      "grupo": "I",
      "divisoes": [
        "I-1"
      ],
      "s2": 90,
      "s1": 60,
      "p1": 30,
      "p2": 30,
      "p3": 30,
      "p4": 60,
      "p5": 120,
      "p6": null,
      "p7": null,
      "p8": null
    },
    {
      "grupo": "I",
      "divisoes": [
        "I-2"
      ],
      "s2": 120,
      "s1": 90,
      "p1": 30,
      "p2": 30,
      "p3": 60,
      "p4": 90,
      "p5": 120,
      "p6": null,
      "p7": null,
      "p8": null
    },
    {
      "grupo": "I",
      "divisoes": [
        "I-3"
      ],
      "s2": 120,
      "s1": 90,
      "p1": 60,
      "p2": 60,
      "p3": 90,
      "p4": 120,
      "p5": 120,
      "p6": null,
      "p7": null,
      "p8": null
    },
    {
      "grupo": "J",
      "divisoes": [
        "J-1"
      ],
      "s2": 60,
      "s1": 30,
      "p1": "A.2.3.4",
      "p2": 30,
      "p3": 30,
      "p4": 60,
      "p5": 60,
      "p6": null,
      "p7": null,
      "p8": null
    },
    {
      "grupo": "J",
      "divisoes": [
        "J-2"
      ],
      "s2": 90,
      "s1": 60,
      "p1": 30,
      "p2": 30,
      "p3": 60,
      "p4": 60,
      "p5": null,
      "p6": null,
      "p7": null,
      "p8": null
    },
    {
      "grupo": "J",
      "divisoes": [
        "J-3"
      ],
      "s2": 90,
      "s1": 60,
      "p1": 60,
      "p2": 60,
      "p3": 60,
      "p4": 120,
      "p5": 120,
      "p6": null,
      "p7": null,
      "p8": null
    },
    {
      "grupo": "J",
      "divisoes": [
        "J-4"
      ],
      "s2": 120,
      "s1": 90,
      "p1": 60,
      "p2": 60,
      "p3": 90,
      "p4": 120,
      "p5": null,
      "p6": null,
      "p7": null,
      "p8": null
    },
    {
      "grupo": "L",
      "divisoes": [
        "L-1",
        "L-2",
        "L-3"
      ],
      "s2": 120,
      "s1": 120,
      "p1": 120,
      "p2": null,
      "p3": null,
      "p4": null,
      "p5": null,
      "p6": null,
      "p7": null,
      "p8": null
    },
    {
      "grupo": "M",
      "divisoes": [
        "M-1"
      ],
      "s2": 150,
      "s1": 150,
      "p1": 150,
      "p2": null,
      "p3": null,
      "p4": null,
      "p5": null,
      "p6": null,
      "p7": null,
      "p8": null
    },
    {
      "grupo": "M",
      "divisoes": [
        "M-2"
      ],
      "s2": 120,
      "s1": null,
      "p1": 120,
      "p2": 120,
      "p3": null,
      "p4": null,
      "p5": null,
      "p6": null,
      "p7": null,
      "p8": null
    },
    {
      "grupo": "M",
      "divisoes": [
        "M-5"
      ],
      "s2": 120,
      "s1": 90,
      "p1": 60,
      "p2": 60,
      "p3": 90,
      "p4": 120,
      "p5": 120,
      "p6": null,
      "p7": null,
      "p8": null
    },
    {
      "grupo": "M",
      "divisoes": [
        "M-3"
      ],
      "s2": 120,
      "s1": 90,
      "p1": 90,
      "p2": 90,
      "p3": 90,
      "p4": 120,
      "p5": 120,
      "p6": 120,
      "p7": 150,
      "p8": null
    },
    {
      "grupo": "K",
      "divisoes": [
        "K-1"
      ],
      "s2": 120,
      "s1": 90,
      "p1": 90,
      "p2": 90,
      "p3": 90,
      "p4": 120,
      "p5": 120,
      "p6": 120,
      "p7": 150,
      "p8": null
    }
  ]
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('MA', 'acesso_viatura', $j${
  "gatilho": {
    "alturaLimite": 12,
    "afastamentoMax": {
      "baixa": 20,
      "alta": 10
    },
    "condominioSempreExige": true
  },
  "notas": {
    "gatilho": "Anexo A, NT 06/2021 CBMMA — Tabela para dimensionamento de Via de Acesso.",
    "largura": "5.1.1.1",
    "alturaLivre": "5.1.1.2",
    "carga": "5.1.1.3",
    "desnivel": "5.1.1.4",
    "portao": "5.1.1.5",
    "retorno": "5.1.1.6",
    "semManobra": "5.1.1.6.2",
    "distancia": "5.1.1.7"
  },
  "via_acesso": {
    "larguraMin": 6,
    "alturaLivreMin": 4.5,
    "cargaMinKg": 25000,
    "cargaEixos": 2,
    "desnivelMaxPct": 5,
    "portao": {
      "larguraMin": 4,
      "alturaMin": 4.5
    },
    "retorno": {
      "extensaoGatilho": 45,
      "tipos": [
        "circular",
        "Y",
        "T"
      ]
    },
    "distancia": {
      "tipo": "por_hidrante",
      "semHidrante": 20,
      "comHidrante": 10
    }
  }
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();

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

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('MA', 'carga_incendio', $j${
  "cargadeincendio": {
    "A-1": {
      "5590-6/03": {
        "descricao": "Pensionatos",
        "cargaIncendio": 300
      }
    },
    "A-2": {
      "8112-5/00": {
        "descricao": "Condomínios prediais; Apartamentos",
        "cargaIncendio": 300
      }
    },
    "A-3": {
      "-": {
        "descricao": "Casas térreas ou sobrados",
        "cargaIncendio": 300
      }
    },
    "B-1": {
      "5510-8/01": {
        "descricao": "Hotéis",
        "cargaIncendio": 500
      },
      "5510-8/03": {
        "descricao": "Motéis",
        "cargaIncendio": 500
      },
      "5590-6/01": {
        "descricao": "Albergues, exceto assistenciais",
        "cargaIncendio": 300
      },
      "5590-6/02": {
        "descricao": "Camping",
        "cargaIncendio": 300
      },
      "8112-5/00": {
        "descricao": "Alojamentos estudantis",
        "cargaIncendio": 300
      }
    },
    "B-2": {
      "5510-8/02": {
        "descricao": "Apart-hoteis",
        "cargaIncendio": 500
      }
    },
    "*": {
      "5590-6/99": {
        "descricao": "Outros alojamentos não especificados anteriormente",
        "cargaIncendio": 500
      },
      "9329-8/99": {
        "descricao": "Outras atividades de recreação e lazer não especificadas anteriormente",
        "cargaIncendio": 600
      }
    },
    "C-1": {
      "-": {
        "descricao": "Bijuteria, metal ou vidro – Artigos.",
        "cargaIncendio": 300
      },
      "0122-9/00": {
        "descricao": "Floricultura",
        "cargaIncendio": 80
      },
      "4511-1/01": {
        "descricao": "Automóveis, camionetas e utilitários novos (comércio a varejo)",
        "cargaIncendio": 200
      },
      "4511-1/02": {
        "descricao": "Automóveis, camionetas e utilitários usados (comércio a varejo)",
        "cargaIncendio": 200
      },
      "4511-1/03": {
        "descricao": "Automóveis, camionetas e utilitárias novas e usadas (comércio por atacado)",
        "cargaIncendio": 200
      },
      "4511-1/04": {
        "descricao": "Caminhões novos e usados (comércio por atacado)",
        "cargaIncendio": 200
      },
      "4511-1/05": {
        "descricao": "Reboques e semi-reboques novos e usados (comércio por atacado)",
        "cargaIncendio": 200
      },
      "4511-1/06": {
        "descricao": "Ônibus e micro-ônibus novos e usados (comércio por atacado)",
        "cargaIncendio": 200
      },
      "4512-9/01": {
        "descricao": "Automóveis (representantes comerciais e agentes do comércio de veículos automotores)",
        "cargaIncendio": 200
      },
      "4512-9/02": {
        "descricao": "Automóveis (comércio sob consignação de veículos automotores)",
        "cargaIncendio": 200
      },
      "4530-7/01": {
        "descricao": "Automóveis – Peças e acessórios novos para veículos automotores (comércio por atacado)",
        "cargaIncendio": 200
      },
      "4530-7/03": {
        "descricao": "Automóveis – Peças e acessórios novos para veículos automotores (comércio a varejo)",
        "cargaIncendio": 200
      },
      "4530-7/04": {
        "descricao": "Automóveis – Peças e acessórios usados para veículos automotores (comércio a varejo)",
        "cargaIncendio": 200
      },
      "4530-7/06": {
        "descricao": "Automóveis – Peças e acessórios novos e usadas para veículos automotores (representantes comerciais e agentes do comércio)",
        "cargaIncendio": 200
      },
      "4541-2/01": {
        "descricao": "Motocicletas e motonetas (comércio por atacado)",
        "cargaIncendio": 200
      },
      "4541-2/02": {
        "descricao": "Motocicletas e motonetas – peças e acessórios (comércio por atacado)",
        "cargaIncendio": 200
      },
      "4541-2/03": {
        "descricao": "Motocicletas e motonetas novas (comércio a varejo)",
        "cargaIncendio": 200
      },
      "4541-2/04": {
        "descricao": "Motocicletas e motonetas usadas (comércio a varejo)",
        "cargaIncendio": 200
      },
      "4541-2/05": {
        "descricao": "Motocicletas e motonetas – peças e acessórios (comércio a varejo)",
        "cargaIncendio": 200
      },
      "4542-1/01": {
        "descricao": "Motocicletas e motonetas, peças e acessórios (representantes comerciais e agentes do comércio)",
        "cargaIncendio": 200
      },
      "4542-1/02": {
        "descricao": "Motocicletas e motonetas (comércio sob consignação)",
        "cargaIncendio": 200
      },
      "4615-0/00": {
        "descricao": "Eletrodomésticos, móveis e artigos de uso doméstico (representantes comerciais e agentes do comércio)",
        "cargaIncendio": 300
      },
      "4634-6/01": {
        "descricao": "Carnes bovinas e suínas e derivados (comércio atacadista)",
        "cargaIncendio": 40
      },
      "4634-6/02": {
        "descricao": "Aves abatidas e derivadas (comércio atacadista)",
        "cargaIncendio": 40
      },
      "4634-6/99": {
        "descricao": "Carnes e derivados de outros animais (comércio atacadista)",
        "cargaIncendio": 40
      },
      "4649-4/01": {
        "descricao": "Aparelhos e equipamentos elétricos de uso pessoal e doméstico (comércio atacadista)",
        "cargaIncendio": 300
      },
      "4649-4/02": {
        "descricao": "Aparelhos eletrônicos de uso pessoal e doméstico (comércio atacadista)",
        "cargaIncendio": 300
      },
      "4672-9/00": {
        "descricao": "Ferragens e ferramentas (comércio atacadista)",
        "cargaIncendio": 300
      },
      "4674-5/00": {
        "descricao": "Cimento (comércio atacadista)",
        "cargaIncendio": 300
      },
      "4679-6/02": {
        "descricao": "Mármores e granitos (comércio atacadista)",
        "cargaIncendio": 300
      },
      "4679-6/03": {
        "descricao": "Vidros, espelhos e vitrais (comércio atacadista)",
        "cargaIncendio": 300
      },
      "4685-1/00": {
        "descricao": "Produtos siderúrgicos e metalúrgicos, exceto para construção (comércio atacadista)",
        "cargaIncendio": 300
      },
      "4722-9/01": {
        "descricao": "Carnes – açougues (comércio varejista)",
        "cargaIncendio": 40
      },
      "4724-5/00": {
        "descricao": "Máquinas, equipamentos, embarcações e aeronaves (representantes comerciais e agentes do comércio); Verduras frescas",
        "cargaIncendio": 200
      },
      "4744-0/01": {
        "descricao": "Ferragens e ferramentas (comércio varejista)",
        "cargaIncendio": 300
      },
      "4753-9/00": {
        "descricao": "Eletrodomésticos e equipamentos de áudio e vídeo (comércio varejista)",
        "cargaIncendio": 300
      },
      "4774-1/00": {
        "descricao": "Óptica – Artigos (comércio varejista)",
        "cargaIncendio": 300
      },
      "4783-1/02": {
        "descricao": "Relojoaria – Artigos (comércio varejista)",
        "cargaIncendio": 300
      },
      "4789-0/01": {
        "descricao": "Suvenires, bijuterias e artesanatos (comércio varejista)",
        "cargaIncendio": 200
      },
      "4789-0/02": {
        "descricao": "Plantas e flores naturais (comércio varejista)",
        "cargaIncendio": 80
      },
      "4789-0/03": {
        "descricao": "Objetos de arte (comércio varejista)",
        "cargaIncendio": 600
      },
      "4789-0/09": {
        "descricao": "Armas e munições (comércio varejista)",
        "cargaIncendio": 300
      },
      "7711-0/00": {
        "descricao": "Automóvel - Locação sem condutor",
        "cargaIncendio": 200
      },
      "7719-5/01": {
        "descricao": "Embarcações - Locação sem tripulação, exceto para fins recreativos",
        "cargaIncendio": 200
      },
      "7719-5/02": {
        "descricao": "Aeronaves - Locação sem tripulação",
        "cargaIncendio": 200
      },
      "7732-2/02": {
        "descricao": "Andaimes (aluguel)",
        "cargaIncendio": 300
      }
    },
    "C-2": {
      "4530-7/02": {
        "descricao": "Pneumáticos e câmaras-de-ar (comércio por atacado)",
        "cargaIncendio": 800
      },
      "4530-7/05": {
        "descricao": "Pneumáticos e câmaras-de-ar (comércio a varejo)",
        "cargaIncendio": 800
      },
      "4612-5/00": {
        "descricao": "Combustíveis, minerais, produtos siderúrgicos e químicos (representantes comerciais e agentes do comércio)",
        "cargaIncendio": 1000
      },
      "4616-8/00": {
        "descricao": "Têxteis, vestuário, calçados e artigos de viagem (representantes comerciais e agentes do comércio)",
        "cargaIncendio": 600
      },
      "4617-6/00": {
        "descricao": "Produtos alimentícios, bebidas e fumo (representantes comerciais e agentes do comércio)",
        "cargaIncendio": 400
      },
      "4621-4/00": {
        "descricao": "Café em grão (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4623-0/01": {
        "descricao": "Animais vivos (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4623-1/02": {
        "descricao": "Couros, lãs, peles e outros subprodutos não-comestíveis de origem animal (comércio atacadista)",
        "cargaIncendio": 800
      },
      "4623-1/03": {
        "descricao": "Algodão (comércio atacadista)",
        "cargaIncendio": 600
      },
      "4623-1/05": {
        "descricao": "Cacau em baga (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4623-1/09": {
        "descricao": "Alimentos para animais (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4632-0/01": {
        "descricao": "Cereais e leguminosas beneficiados (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4632-0/02": {
        "descricao": "Farinhas, amidos e féculas (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4632-0/03": {
        "descricao": "Cereais e leguminosas beneficiados, farinhas, amidos e féculas, com atividade de fracionamento e acondicionamento associada (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4633-8/02": {
        "descricao": "Aves vivas e ovos (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4633-8/03": {
        "descricao": "Coelhos e outros pequenos animais vivos para alimentação (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4635-4/01": {
        "descricao": "Água mineral (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4635-4/02": {
        "descricao": "Cerveja, chope e refrigerante (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4635-4/03": {
        "descricao": "Bebidas com atividade de fracionamento e acondicionamento associada (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4636-2/02": {
        "descricao": "Cigarros, cigarrilhas e charutos (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4637-1/01": {
        "descricao": "Café torrado, moído e solúvel (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4637-1/02": {
        "descricao": "Açúcar (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4637-1/03": {
        "descricao": "Óleos e gorduras (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4637-1/05": {
        "descricao": "Massas alimentícias (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4637-1/07": {
        "descricao": "Chocolates, confeitos, balas, bombons e semelhantes (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4637-1/99": {
        "descricao": "Produtos alimentícios não especificados anteriormente (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4639-7/01": {
        "descricao": "Produtos alimentícios em geral (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4639-7/02": {
        "descricao": "Produtos alimentícios em geral, com atividade de fracionamento e acondicionamento associada (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4641-9/01": {
        "descricao": "Tecidos (comércio atacadista)",
        "cargaIncendio": 600
      },
      "4641-9/02": {
        "descricao": "Cama, mesa e banho – Artigos (comércio atacadista)",
        "cargaIncendio": 600
      },
      "4641-9/03": {
        "descricao": "Armarinho – Artigos (comércio atacadista)",
        "cargaIncendio": 600
      },
      "4642-7/01": {
        "descricao": "Vestuário e acessórios, exceto profissionais e de segurança – Artigos (comércio atacadista)",
        "cargaIncendio": 600
      },
      "4643-5/01": {
        "descricao": "Calçados (comércio atacadista)",
        "cargaIncendio": 500
      },
      "4643-5/02": {
        "descricao": "Bolsas, malas e artigos de viagem (comércio atacadista)",
        "cargaIncendio": 500
      },
      "4645-1/02": {
        "descricao": "Próteses e artigos de ortopedia (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4645-1/03": {
        "descricao": "Produtos odontológicos (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4646-0/01": {
        "descricao": "Cosméticos e produtos de perfumaria (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4646-0/02": {
        "descricao": "Produtos de higiene pessoal (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4647-8/01": {
        "descricao": "Escritório e de papelaria – Artigos (comércio atacadista)",
        "cargaIncendio": 700
      },
      "4649-4/03": {
        "descricao": "Bicicletas, triciclos e outros veículos recreativos (comércio atacadista)",
        "cargaIncendio": 500
      },
      "4649-4/05": {
        "descricao": "Tapeçaria; persianas e cortinas – Artigos (comércio atacadista)",
        "cargaIncendio": 600
      },
      "4649-4/07": {
        "descricao": "Filmes, CDs, DVDs, fitas e discos (comércio atacadista)",
        "cargaIncendio": 700
      },
      "4649-4/08": {
        "descricao": "Produtos de higiene, limpeza e conservação domiciliar (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4649-4/09": {
        "descricao": "Produtos de higiene, limpeza e conservação domiciliar, com atividade de fracionamento e acondicionamento associada (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4649-4/99": {
        "descricao": "Aparelhos, equipamentos e artigos de uso pessoal e doméstico não especificados anteriormente (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4651-6/01": {
        "descricao": "Equipamentos de informática (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4651-6/02": {
        "descricao": "Suprimentos para informática (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4652-4/00": {
        "descricao": "Componentes eletrônicos e equipamentos de telefonia e comunicação (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4662-1/00": {
        "descricao": "Máquinas, equipamentos para terraplenagem, mineração e construção; partes e peças",
        "cargaIncendio": 400
      },
      "4664-8/00": {
        "descricao": "Máquinas, aparelhos e equipamentos para uso odonto-médico-hospitalar; partes e peças (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4669-9/01": {
        "descricao": "Bombas e compressores; partes e peças (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4673-7/00": {
        "descricao": "Material elétrico (comércio atacadista)",
        "cargaIncendio": 800
      },
      "4679-6/01": {
        "descricao": "Tintas, vernizes e similares (comércio atacadista)",
        "cargaIncendio": 1000
      },
      "4679-6/04": {
        "descricao": "Materiais de construção não especificados anteriormente (comércio atacadista)",
        "cargaIncendio": 800
      },
      "4679-6/99": {
        "descricao": "Materiais de construção em geral (comércio atacadista)",
        "cargaIncendio": 800
      },
      "4683-4/00": {
        "descricao": "Defensivos agrícolas, adubos, fertilizantes e corretivos do solo (comércio atacadista)",
        "cargaIncendio": 1000
      },
      "4684-2/99": {
        "descricao": "Produtos químicos e petroquímicos não especificados anteriormente (comércio atacadista)",
        "cargaIncendio": 1000
      },
      "4686-9/02": {
        "descricao": "Embalagens (comércio atacadista)",
        "cargaIncendio": 800
      },
      "4689-3/01": {
        "descricao": "Produtos da extração mineral, exceto combustíveis (comércio atacadista)",
        "cargaIncendio": 300
      },
      "4689-3/02": {
        "descricao": "Fios e fibras têxteis (comércio atacadista)",
        "cargaIncendio": 600
      },
      "4689-3/99": {
        "descricao": "Outros produtos não especificados anteriormente (comércio atacadista)",
        "cargaIncendio": 600
      },
      "4693-1/00": {
        "descricao": "Mercadorias em geral, sem predominância de alimentos ou insumos agropecuários (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4711-3/02": {
        "descricao": "Supermercados",
        "cargaIncendio": 400
      },
      "4721-1/04": {
        "descricao": "Doces, balas, bombons e semelhantes (comércio varejista)",
        "cargaIncendio": 400
      },
      "4723-7/00": {
        "descricao": "Bebidas (comércio varejista)",
        "cargaIncendio": 700
      },
      "4729-6/01": {
        "descricao": "Tabacaria",
        "cargaIncendio": 400
      },
      "4729-6/99": {
        "descricao": "Produtos alimentícios em geral ou especializado em produtos alimentícios não especificados anteriormente",
        "cargaIncendio": 400
      },
      "4741-5/00": {
        "descricao": "Tintas e materiais para pintura (comércio varejista)",
        "cargaIncendio": 1000
      },
      "4742-3/00": {
        "descricao": "Material elétrico (comércio varejista)",
        "cargaIncendio": 800
      },
      "4744-0/03": {
        "descricao": "Materiais hidráulicos (comércio varejista)",
        "cargaIncendio": 800
      },
      "4744-0/04": {
        "descricao": "Cal, areia, pedra britada, tijolos e telhas (comércio varejista)",
        "cargaIncendio": 800
      },
      "4744-0/05": {
        "descricao": "Materiais de construção não especificados anteriormente (comércio varejista)",
        "cargaIncendio": 800
      },
      "4744-0/99": {
        "descricao": "Materiais de construção em geral (comércio varejista)",
        "cargaIncendio": 800
      },
      "4751-2/00": {
        "descricao": "Equipamentos e suprimentos de informática (comércio varejista)",
        "cargaIncendio": 400
      },
      "4752-1/00": {
        "descricao": "Equipamentos de telefonia e comunicação (comércio varejista)",
        "cargaIncendio": 400
      },
      "4754-7/01": {
        "descricao": "Móveis (comércio varejista)",
        "cargaIncendio": 400
      },
      "4754-7/02": {
        "descricao": "Colchoaria – Artigos (comércio varejista)",
        "cargaIncendio": 500
      },
      "4755-5/01": {
        "descricao": "Tecidos (comércio varejista)",
        "cargaIncendio": 600
      },
      "4755-5/02": {
        "descricao": "Armarinho – Artigos (comércio varejista)",
        "cargaIncendio": 600
      },
      "4755-5/03": {
        "descricao": "Cama, mesa e banho – Artigos (comércio varejista)",
        "cargaIncendio": 600
      },
      "4759-8/01": {
        "descricao": "Tapeçaria, cortinas e persianas – Artigos (comércio varejista)",
        "cargaIncendio": 600
      },
      "4759-8/99": {
        "descricao": "Artigos de uso doméstico não especificados anteriormente (comércio varejista)",
        "cargaIncendio": 600
      },
      "4762-8/00": {
        "descricao": "Discos, CDs, DVDs e fitas (comércio varejista)",
        "cargaIncendio": 700
      },
      "4763-6/01": {
        "descricao": "Brinquedos e artigos recreativos (comércio varejista)",
        "cargaIncendio": 500
      },
      "4763-6/02": {
        "descricao": "Esporte – Artigos esportivos (comércio varejista)",
        "cargaIncendio": 800
      },
      "4763-6/03": {
        "descricao": "Bicicletas e triciclos; peças e acessórios (comércio varejista)",
        "cargaIncendio": 500
      },
      "4763-6/04": {
        "descricao": "Caça, pesca e camping – Artigos (comércio varejista)",
        "cargaIncendio": 800
      },
      "4763-6/05": {
        "descricao": "Embarcações e outros veículos recreativos; peças e acessórios (comércio varejista)",
        "cargaIncendio": 500
      },
      "4771-7/01": {
        "descricao": "Drogarias (incluindo depósitos); Produtos farmacêuticos, sem manipulação de fórmulas (comércio varejista)",
        "cargaIncendio": 1000
      },
      "4771-7/02": {
        "descricao": "Produtos farmacêuticos, com manipulação de fórmulas (comércio varejista)",
        "cargaIncendio": 1000
      },
      "4771-7/03": {
        "descricao": "Produtos farmacêuticos homeopáticos (comércio varejista)",
        "cargaIncendio": 1000
      },
      "4772-5/00": {
        "descricao": "Cosméticos, produtos de perfumaria e de higiene pessoal (comércio varejista)",
        "cargaIncendio": 400
      },
      "4773-3/00": {
        "descricao": "Artigos médicos e ortopédicos (comércio varejista)",
        "cargaIncendio": 400
      },
      "4781-4/00": {
        "descricao": "Vestuário e acessórios – Artigos (comércio varejista)",
        "cargaIncendio": 600
      },
      "4782-2/01": {
        "descricao": "Calçados (comércio varejista)",
        "cargaIncendio": 500
      },
      "4782-2/02": {
        "descricao": "Viagem – Artigos (comércio varejista)",
        "cargaIncendio": 800
      },
      "4785-7/01": {
        "descricao": "Antiguidades (comércio varejista)",
        "cargaIncendio": 700
      },
      "4785-7/99": {
        "descricao": "Outros artigos usados (comércio varejista)",
        "cargaIncendio": 700
      },
      "4789-0/04": {
        "descricao": "Animais vivos e de artigos e alimentos para animais de estimação (comércio varejista)",
        "cargaIncendio": 400
      },
      "4789-0/05": {
        "descricao": "Produtos saneantes domissanitários (comércio varejista)",
        "cargaIncendio": 400
      },
      "4789-0/07": {
        "descricao": "Equipamentos para escritório (comércio varejista)",
        "cargaIncendio": 700
      },
      "4789-0/08": {
        "descricao": "Máquinas, aparelhos e equipamentos para uso agropecuário; partes e peças (comércio atacadista)",
        "cargaIncendio": 400
      },
      "4789-0/99": {
        "descricao": "Outros produtos não especificados anteriormente (comércio varejista)",
        "cargaIncendio": 400
      },
      "7721-7/00": {
        "descricao": "Equipamentos recreativos e esportivos (aluguel)",
        "cargaIncendio": 500
      },
      "7722-5/00": {
        "descricao": "Fitas de vídeo, DVDs e similares (aluguel)",
        "cargaIncendio": 700
      },
      "7723-3/00": {
        "descricao": "Objetos do vestuário, joias e acessórios (aluguel)",
        "cargaIncendio": 400
      },
      "7729-2/02": {
        "descricao": "Móveis, utensílios e aparelhos de uso doméstico e pessoal; instrumentos musicais (aluguel)",
        "cargaIncendio": 200
      },
      "7729-2/03": {
        "descricao": "Material médico e paramédico (aluguel)",
        "cargaIncendio": 800
      },
      "7729-2/99": {
        "descricao": "Objetos pessoais e domésticos não especificados anteriormente (aluguel)",
        "cargaIncendio": 400
      },
      "7729/01": {
        "descricao": "Aparelhos de jogos eletrônicos (aluguel)",
        "cargaIncendio": 400
      },
      "7739-0/02": {
        "descricao": "Equipamentos científicos, médicos e hospitalares, sem operador (aluguel)",
        "cargaIncendio": 400
      }
    },
    "D-1": {
      "-": {
        "descricao": "Telecomunicação – Centrais telefônicas",
        "cargaIncendio": 100
      },
      "0990-4/01": {
        "descricao": "Minério de ferro (atividades de apoio à extração)",
        "cargaIncendio": 700
      },
      "0990-4/02": {
        "descricao": "Minerais metálicos não-ferrosos (atividades de apoio à extração)",
        "cargaIncendio": 700
      },
      "4211-1/02": {
        "descricao": "Sistema de prevenção contra incêndio (instalação)",
        "cargaIncendio": 700
      },
      "4212-0/00": {
        "descricao": "Obras de arte especiais (construção)",
        "cargaIncendio": 700
      },
      "4213-8/00": {
        "descricao": "Obras de urbanização - ruas, praças e calçadas",
        "cargaIncendio": 700
      },
      "4221-9/02": {
        "descricao": "Estações e redes de distribuição de energia elétrica (construção)",
        "cargaIncendio": 700
      },
      "4221-9/03": {
        "descricao": "Estações e redes de distribuição de energia elétrica (manutenção)",
        "cargaIncendio": 700
      },
      "4221-9/04": {
        "descricao": "Telecomunicação – Estações e redes de telecomunicações (construção)",
        "cargaIncendio": 700
      },
      "4221-9/05": {
        "descricao": "Telecomunicação – Estações e redes de telecomunicações (manutenção)",
        "cargaIncendio": 700
      },
      "4222-7/02": {
        "descricao": "Obras de irrigação",
        "cargaIncendio": 700
      },
      "4291-0/00": {
        "descricao": "Obras portuárias, marítimas e fluviais",
        "cargaIncendio": 700
      },
      "4292-8/01": {
        "descricao": "Estruturas metálicas (montagem)",
        "cargaIncendio": 700
      },
      "4292-8/02": {
        "descricao": "Obras de montagem industrial",
        "cargaIncendio": 700
      },
      "4299-5/01": {
        "descricao": "Instalações esportivas e recreativas (construção)",
        "cargaIncendio": 700
      },
      "4299-5/99": {
        "descricao": "Outras obras de engenharia civil não especificada anteriormente",
        "cargaIncendio": 700
      },
      "4311-8/02": {
        "descricao": "Preparação de canteiro e limpeza de terreno",
        "cargaIncendio": 700
      },
      "4312-6/00": {
        "descricao": "Perfurações e sondagens",
        "cargaIncendio": 700
      },
      "4313-4/00": {
        "descricao": "Obras de terraplenagem",
        "cargaIncendio": 700
      },
      "4319-3/00": {
        "descricao": "Serviço de sepultamento (sem salas de funerais)",
        "cargaIncendio": 700
      },
      "4321-5/00": {
        "descricao": "Instalação e manutenção elétrica",
        "cargaIncendio": 700
      },
      "4322-3/01": {
        "descricao": "Instalações hidráulicas, sanitárias e de gás",
        "cargaIncendio": 700
      },
      "4322-3/02": {
        "descricao": "Sistemas centrais de ar-condicionado, de ventilação e refrigeração (instalação e manutenção)",
        "cargaIncendio": 700
      },
      "4329-1/01": {
        "descricao": "Painéis publicitários (instalação)",
        "cargaIncendio": 700
      },
      "4329-1/04": {
        "descricao": "Sistemas e equipamentos de iluminação e sinalização em vias públicas, portos e aeroportos (montagem e instalação)",
        "cargaIncendio": 700
      },
      "4329-1/05": {
        "descricao": "Tratamentos térmicos, acústicos ou de vibração",
        "cargaIncendio": 700
      },
      "4329-1/99": {
        "descricao": "Obras de instalações em construções não especificadas anteriormente",
        "cargaIncendio": 700
      },
      "4330-4/01": {
        "descricao": "Obras de engenharia civil (impermeabilização)",
        "cargaIncendio": 700
      },
      "4330-4/02": {
        "descricao": "Portas, janelas, tetos, divisórias e armários embutidos de qualquer material(instalação)",
        "cargaIncendio": 700
      },
      "4330-4/03": {
        "descricao": "Obras de acabamento em gesso e estuque",
        "cargaIncendio": 700
      },
      "4330-4/05": {
        "descricao": "Obras – Revestimentos e resinas em interiores e exteriores (aplicação)",
        "cargaIncendio": 700
      },
      "4330-4/99": {
        "descricao": "Obras de acabamento da construção",
        "cargaIncendio": 700
      },
      "4391-6/00": {
        "descricao": "Obras de fundações",
        "cargaIncendio": 700
      },
      "4399-1/01": {
        "descricao": "Obras (administração)",
        "cargaIncendio": 700
      },
      "4399-1/03": {
        "descricao": "Obras de alvenaria",
        "cargaIncendio": 700
      },
      "4399-1/04": {
        "descricao": "Obras - Serviços de operação e fornecimento de equipamentos para transporte e elevação de cargas e pessoas para uso em obras",
        "cargaIncendio": 700
      },
      "4399-1/05": {
        "descricao": "Poços de água (perfuração e construção)",
        "cargaIncendio": 700
      },
      "4399-1/99": {
        "descricao": "Obras – Serviços especializados para construção não especificados anteriormente",
        "cargaIncendio": 700
      },
      "4911-6/00": {
        "descricao": "Transporte ferroviário de carga",
        "cargaIncendio": 800
      },
      "4912-4/01": {
        "descricao": "Transporte ferroviário de passageiros intermunicipal e interestadual",
        "cargaIncendio": 200
      },
      "4912-4/02": {
        "descricao": "Transporte ferroviário de passageiros municipal e em região metropolitana",
        "cargaIncendio": 200
      },
      "4912-4/03": {
        "descricao": "Transporte metroviário",
        "cargaIncendio": 200
      },
      "4921-3/01": {
        "descricao": "Transporte rodoviário coletivo de passageiros, com itinerário fixo, municipal",
        "cargaIncendio": 200
      },
      "4921-3/02": {
        "descricao": "Transporte rodoviário coletivo de passageiros, com itinerário fixo, intermunicipal em região metropolitana",
        "cargaIncendio": 200
      },
      "4922-1/01": {
        "descricao": "Transporte rodoviário coletivo de passageiros, com itinerário fixo, intermunicipal, exceto em região metropolitana",
        "cargaIncendio": 200
      },
      "4922-1/02": {
        "descricao": "Transporte rodoviário coletivo de passageiros, com itinerário fixo, interestadual",
        "cargaIncendio": 200
      },
      "4922-1/03": {
        "descricao": "Transporte rodoviário coletivo de passageiros, com itinerário fixo, internacional",
        "cargaIncendio": 200
      },
      "4923-0/01": {
        "descricao": "Transporte – Serviço de táxi",
        "cargaIncendio": 200
      },
      "4923-0/02": {
        "descricao": "Transporte de passageiros - Locação de automóveis com motorista",
        "cargaIncendio": 200
      },
      "4924-8/00": {
        "descricao": "Transporte escolar",
        "cargaIncendio": 200
      },
      "4929-9/01": {
        "descricao": "Transporte rodoviário coletivo de passageiros, sob regime de fretamento, municipal",
        "cargaIncendio": 200
      },
      "4929-9/02": {
        "descricao": "Transporte rodoviário coletivo de passageiros, sob regime de fretamento, intermunicipal, interestadual e internacional",
        "cargaIncendio": 200
      },
      "4929-9/03": {
        "descricao": "Transporte – Organização de excursões em veículos rodoviários próprios, municipal",
        "cargaIncendio": 200
      },
      "4929-9/04": {
        "descricao": "Transporte – Organização de excursões em veículos rodoviários próprios, intermunicipal, interestadual e internacional",
        "cargaIncendio": 200
      },
      "4929-9/99": {
        "descricao": "Transportes rodoviários de passageiros não especificados anteriormente",
        "cargaIncendio": 200
      },
      "4930-2/01": {
        "descricao": "Transporte rodoviário de carga, exceto produtos perigosos e mudanças, municipal",
        "cargaIncendio": 800
      },
      "4930-2/02": {
        "descricao": "Transporte rodoviário de carga, exceto produtos perigosos e mudanças, intermunicipal, interestadual e internacional",
        "cargaIncendio": 800
      },
      "4930-2/03": {
        "descricao": "Transporte rodoviário de produtos perigosos",
        "cargaIncendio": 800
      },
      "4930-2/04": {
        "descricao": "Transporte rodoviário de mudanças",
        "cargaIncendio": 800
      },
      "4940-0/00": {
        "descricao": "Transporte dutoviário",
        "cargaIncendio": 800
      },
      "4950-7/00": {
        "descricao": "Transporte – Trens turísticos, teleféricos e similares",
        "cargaIncendio": 200
      },
      "5011-4/01": {
        "descricao": "Transporte marítimo de cabotagem – carga",
        "cargaIncendio": 800
      },
      "5011-4/02": {
        "descricao": "Transporte marítimo de cabotagem – passageiro",
        "cargaIncendio": 200
      },
      "5012-2/01": {
        "descricao": "Transporte marítimo de longo curso – carga",
        "cargaIncendio": 800
      },
      "5012-2/02": {
        "descricao": "Transporte marítimo de longo curso – passageiro",
        "cargaIncendio": 200
      },
      "5021-1/01": {
        "descricao": "Transporte por navegação interior de carga, municipal, exceto travessia",
        "cargaIncendio": 800
      },
      "5021-1/02": {
        "descricao": "Transporte por navegação interior de carga, intermunicipal, interestadual e internacional, exceto travessia",
        "cargaIncendio": 800
      },
      "5022-0/01": {
        "descricao": "Transporte por navegação interior de passageiros em linhas regulares, municipal, exceto travessia",
        "cargaIncendio": 200
      },
      "5022-0/02": {
        "descricao": "Transporte por navegação interior de passageiros em linhas regulares, intermunicipal, interestadual e internacional, exceto travessia",
        "cargaIncendio": 200
      },
      "5030-1/01": {
        "descricao": "Transporte – Navegação de apoio marítimo",
        "cargaIncendio": 200
      },
      "5030-1/02": {
        "descricao": "Transporte – Navegação de apoio portuário",
        "cargaIncendio": 200
      },
      "5091-2/01": {
        "descricao": "Transporte por navegação de travessia, municipal",
        "cargaIncendio": 200
      },
      "5091-2/02": {
        "descricao": "Transporte por navegação de travessia, intermunicipal",
        "cargaIncendio": 200
      },
      "5099-8/01": {
        "descricao": "Transporte aquaviário para passeios turísticos",
        "cargaIncendio": 200
      },
      "5099-8/99": {
        "descricao": "Transportes aquaviários não especificados anteriormente",
        "cargaIncendio": 200
      },
      "5111-1/00": {
        "descricao": "Transporte aéreo de passageiros regular",
        "cargaIncendio": 200
      },
      "5112-9/01": {
        "descricao": "Transporte – Serviço de táxi aéreo e locação de aeronaves com tripulação",
        "cargaIncendio": 200
      },
      "5112-9/99": {
        "descricao": "Transporte – Outros serviços de transporte aéreo de passageiros não-regulares",
        "cargaIncendio": 200
      },
      "5120-0/00": {
        "descricao": "Transporte aéreo de carga",
        "cargaIncendio": 800
      },
      "5130-7/00": {
        "descricao": "Transporte espacial",
        "cargaIncendio": 800
      },
      "5211-7/02": {
        "descricao": "Guarda-móveis",
        "cargaIncendio": 800
      },
      "5222-2/00": {
        "descricao": "Terminais rodoviários e ferroviários",
        "cargaIncendio": 200
      },
      "5229-0/01": {
        "descricao": "Transporte – Serviços de apoio ao transporte por táxi, inclusive centrais de chamada",
        "cargaIncendio": 700
      },
      "5229-0/02": {
        "descricao": "Transporte – Serviços de reboque de veículos",
        "cargaIncendio": 700
      },
      "5229-0/99": {
        "descricao": "Transporte - Atividades auxiliares dos transportes terrestres não especificadas anteriormente",
        "cargaIncendio": 700
      },
      "5231-1/01": {
        "descricao": "Porto – Administração da infra - estrutura portuária",
        "cargaIncendio": 700
      },
      "5231-1/02": {
        "descricao": "Porto – Operações de terminais",
        "cargaIncendio": 700
      },
      "5232-0/00": {
        "descricao": "Porto – Atividades de agenciamento marítimo",
        "cargaIncendio": 700
      },
      "5239-7/00": {
        "descricao": "Porto – Atividades auxiliares dos transportes aquaviários não especificadas anteriormente",
        "cargaIncendio": 700
      },
      "5250-8/02": {
        "descricao": "Aduaneiras – Atividades de despachantes aduaneiros",
        "cargaIncendio": 700
      },
      "5250-8/03": {
        "descricao": "Transporte – Agenciamento de cargas, exceto para o transporte marítimo",
        "cargaIncendio": 700
      },
      "5250-8/04": {
        "descricao": "Transporte – Organização logística do transporte de carga",
        "cargaIncendio": 700
      },
      "5250-8/05": {
        "descricao": "Transporte – Operador de transporte multimodal – OTM",
        "cargaIncendio": 700
      },
      "5811-5/00": {
        "descricao": "Livros (edição)",
        "cargaIncendio": 1000
      },
      "5821-2/00": {
        "descricao": "Livros (edição integrada à impressão)",
        "cargaIncendio": 1000
      },
      "5822-1/00": {
        "descricao": "Jornais (edição)",
        "cargaIncendio": 1000
      },
      "5920-1/00": {
        "descricao": "Som e edição de música (atividades de gravação)",
        "cargaIncendio": 300
      },
      "6010-1/00": {
        "descricao": "Rádio (atividades)",
        "cargaIncendio": 300
      },
      "6021-7/00": {
        "descricao": "Televisão aberta (atividades)",
        "cargaIncendio": 300
      },
      "6022-5/01": {
        "descricao": "Televisão – Programadoras",
        "cargaIncendio": 300
      },
      "6022-5/02": {
        "descricao": "Televisão por assinatura, exceto programadoras (atividades relacionadas)",
        "cargaIncendio": 300
      },
      "6110-8/01": {
        "descricao": "Telecomunicações – Serviços de telefonia fixa comutada – STFC",
        "cargaIncendio": 200
      },
      "6110-8/02": {
        "descricao": "Telecomunicações – Serviços de redes de transportes de telecomunicações – SRTT",
        "cargaIncendio": 200
      },
      "6110-8/03": {
        "descricao": "Telecomunicações – Serviços de comunicação multimídia – SMC",
        "cargaIncendio": 200
      },
      "6110-8/99": {
        "descricao": "Telecomunicações – Serviços de telecomunicações por fio não especificados anteriormente",
        "cargaIncendio": 200
      },
      "6120-5/01": {
        "descricao": "Telecomunicações – Telefonia móvel celular",
        "cargaIncendio": 200
      },
      "6120-5/02": {
        "descricao": "Telecomunicações – Serviço móvel especializado – SME",
        "cargaIncendio": 200
      },
      "6120-5/99": {
        "descricao": "Telecomunicações – Serviços de telecomunicações sem fio não especificados anteriormente",
        "cargaIncendio": 200
      },
      "6130-2/00": {
        "descricao": "Telecomunicações por satélite",
        "cargaIncendio": 400
      },
      "6141-8/00": {
        "descricao": "Televisão por assinatura por cabo (operadora)",
        "cargaIncendio": 400
      },
      "6142-6/00": {
        "descricao": "Televisão por assinatura por micro-ondas (operadora)",
        "cargaIncendio": 400
      },
      "6143-4/00": {
        "descricao": "Televisão por assinatura por satélite (operadora)",
        "cargaIncendio": 400
      },
      "6190-6/01": {
        "descricao": "Telecomunicações – Provedores de acesso às redes de comunicações",
        "cargaIncendio": 400
      },
      "6190-6/02": {
        "descricao": "Telecomunicações – Provedores de voz sobre protocolo internet – VOIP",
        "cargaIncendio": 400
      },
      "6190-6/99": {
        "descricao": "Telecomunicações – Outras atividades de telecomunicações não especificadas anteriormente",
        "cargaIncendio": 400
      },
      "6201-5/00": {
        "descricao": "Informática – Desenvolvimento de programas de computador sob encomenda",
        "cargaIncendio": 400
      },
      "6202-3/00": {
        "descricao": "Informática – Desenvolvimento e licenciamento de programas de computador customizáveis",
        "cargaIncendio": 400
      },
      "6203-1/00": {
        "descricao": "Informática – Desenvolvimento e licenciamento de programas de computador não – customizáveis",
        "cargaIncendio": 400
      },
      "6204-0/00": {
        "descricao": "Informática – Consultoria em tecnologia da informação",
        "cargaIncendio": 400
      },
      "6209-1/00": {
        "descricao": "Informática – Suporte técnico, manutenção e outros serviços em tecnologia da informação",
        "cargaIncendio": 400
      },
      "6311-9/00": {
        "descricao": "Informática – Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet",
        "cargaIncendio": 400
      },
      "6319-4/00": {
        "descricao": "Informática – Portais, provedores de conteúdo e outros serviços de informação na internet",
        "cargaIncendio": 400
      },
      "6391-7/00": {
        "descricao": "Informática – Agências de notícias",
        "cargaIncendio": 400
      },
      "6399-2/00": {
        "descricao": "Informática – Outras atividades de prestação de serviços de informação não especificadas anteriormente",
        "cargaIncendio": 400
      },
      "6810-2/01": {
        "descricao": "Imóveis próprios (compra e venda)",
        "cargaIncendio": 700
      },
      "6810-2/02": {
        "descricao": "Imóveis próprios (aluguel)",
        "cargaIncendio": 700
      },
      "6821-8/01": {
        "descricao": "Imóveis (corretagem na compra e venda e avaliação)",
        "cargaIncendio": 700
      },
      "6821-8/02": {
        "descricao": "Imóveis (corretagem no aluguel)",
        "cargaIncendio": 700
      },
      "6822-6/00": {
        "descricao": "Imóvel – Administração de outros imóveis; Sinalização em pistas rodoviárias e aeroportos (pintura)",
        "cargaIncendio": 700
      },
      "6911-7/01": {
        "descricao": "Advocacia – Serviços advocatícios",
        "cargaIncendio": 700
      },
      "6911-7/02": {
        "descricao": "Advocacia – Atividades auxiliares da justiça",
        "cargaIncendio": 700
      },
      "7119-7/02": {
        "descricao": "Estudos geológicos (atividades)",
        "cargaIncendio": 700
      },
      "7119-7/04": {
        "descricao": "Perícia técnica relacionados à segurança do trabalho (serviços)",
        "cargaIncendio": 700
      },
      "7311-4/00": {
        "descricao": "Publicidade – Agências de publicidade",
        "cargaIncendio": 700
      },
      "7312-2/00": {
        "descricao": "Publicidade – Agenciamento de espaços para publicidade, exceto em veículos de comunicação",
        "cargaIncendio": 700
      },
      "7319-0/01": {
        "descricao": "Feiras e exposições - Criação e montagem de estandes",
        "cargaIncendio": 700
      },
      "7319-0/02": {
        "descricao": "Publicidade – Promoção de vendas",
        "cargaIncendio": 700
      },
      "7319-0/03": {
        "descricao": "Publicidade – Marketing direto",
        "cargaIncendio": 700
      },
      "7319-0/04": {
        "descricao": "Publicidade – Consultoria em publicidade",
        "cargaIncendio": 700
      },
      "7319-0/99": {
        "descricao": "Publicidade – Outras atividades de publicidade não especificadas anteriormente",
        "cargaIncendio": 700
      },
      "7320-3/00": {
        "descricao": "Pesquisas de mercado e de opinião pública",
        "cargaIncendio": 700
      },
      "7420-0/01": {
        "descricao": "Fotografias (atividades de produção, exceto aérea e submarina)",
        "cargaIncendio": 700
      },
      "7420-0/02": {
        "descricao": "Fotografias aéreas e submarinas (atividade de produção)",
        "cargaIncendio": 700
      },
      "7420-0/04": {
        "descricao": "Filmagem de festas e eventos",
        "cargaIncendio": 700
      },
      "7420-0/05": {
        "descricao": "Filmagem – Serviços de microfilmagem",
        "cargaIncendio": 700
      },
      "7490-1/01": {
        "descricao": "Tradução, interpretação e similares (serviços)",
        "cargaIncendio": 700
      },
      "7740-3/00": {
        "descricao": "Gestão de ativos intangíveis não – financeiros",
        "cargaIncendio": 700
      },
      "7911-2/00": {
        "descricao": "Turismo – Agências de viagens",
        "cargaIncendio": 700
      },
      "7912-1/00": {
        "descricao": "Turismo – Operadores turísticos",
        "cargaIncendio": 700
      },
      "7990-2/00": {
        "descricao": "Turismo – Serviços de reservas e outros serviços de turismo não especificados anteriormente",
        "cargaIncendio": 700
      },
      "8011-1/01": {
        "descricao": "Vigilância e segurança privada (atividade)",
        "cargaIncendio": 700
      },
      "8012-9/00": {
        "descricao": "Transporte de valores (atividade)",
        "cargaIncendio": 700
      },
      "8020-0/00": {
        "descricao": "Monitoramento de sistemas de segurança (atividade)",
        "cargaIncendio": 700
      },
      "8122-2/00": {
        "descricao": "Imunização e controle de pragas urbanas",
        "cargaIncendio": 700
      },
      "8129-0/00": {
        "descricao": "Limpeza – Atividades de limpeza não especificadas anteriormente",
        "cargaIncendio": 700
      },
      "8219-9/01": {
        "descricao": "Fotocópias",
        "cargaIncendio": 400
      },
      "8219-9/99": {
        "descricao": "Preparação de documentos e serviços especializados de apoio administrativo não especificados anteriormente",
        "cargaIncendio": 400
      },
      "8220-2/00": {
        "descricao": "Tele atendimento (atividade)",
        "cargaIncendio": 200
      },
      "8230-0/01": {
        "descricao": "Feiras, congressos, exposições e festas - Serviços de organização",
        "cargaIncendio": 700
      },
      "8291-1/00": {
        "descricao": "Cobranças e informações cadastrais (atividade)",
        "cargaIncendio": 700
      },
      "8299-7/01": {
        "descricao": "Medição de consumo de energia elétrica, gás e água",
        "cargaIncendio": 700
      },
      "8299-7/05": {
        "descricao": "Levantamento de fundos sob contrato (serviço)",
        "cargaIncendio": 700
      },
      "8299-7/99": {
        "descricao": "Serviços auxiliares à educação",
        "cargaIncendio": 700
      },
      "8411-6/00": {
        "descricao": "Administração pública em geral",
        "cargaIncendio": 700
      },
      "8412-4/00": {
        "descricao": "Administração pública - Regulação das atividades de saúde, educação, serviços culturais e outros serviços sociais",
        "cargaIncendio": 700
      },
      "8413-2/00": {
        "descricao": "Administração pública - Regulação das atividades econômicas",
        "cargaIncendio": 700
      },
      "8414-1/00": {
        "descricao": "Administração pública - Atividades de suporte à administração pública",
        "cargaIncendio": 700
      },
      "8421-3/00": {
        "descricao": "Administração pública - Relações exteriores",
        "cargaIncendio": 700
      },
      "8422-1/00": {
        "descricao": "Administração pública – Defesa",
        "cargaIncendio": 700
      },
      "8423-0/00": {
        "descricao": "Administração pública – Justiça",
        "cargaIncendio": 700
      },
      "8424-8/00": {
        "descricao": "Administração pública - Segurança e ordem pública",
        "cargaIncendio": 700
      },
      "8425-6/00": {
        "descricao": "Administração pública - Defesa civil",
        "cargaIncendio": 700
      },
      "8430-2/00": {
        "descricao": "Administração pública - Seguridade social obrigatória",
        "cargaIncendio": 700
      },
      "8550-3/02": {
        "descricao": "Serviço de cremação (sem salas de funerais)",
        "cargaIncendio": 700
      },
      "8621-6/02": {
        "descricao": "Serviços – Outras atividades de serviços prestados principalmente às empresas não especificadas anteriormente",
        "cargaIncendio": 700
      },
      "8640-2/04": {
        "descricao": "Saúde – Serviços móveis de atendimento a urgências, exceto por UTI móvel",
        "cargaIncendio": 500
      },
      "9001-9/06": {
        "descricao": "Sonorização e de iluminação (atividade)",
        "cargaIncendio": 700
      },
      "9311-5/00": {
        "descricao": "Esporte – Gestão de instalações de esportes",
        "cargaIncendio": 150
      },
      "9319-1/01": {
        "descricao": "Esporte – Produção e promoção de eventos esportivos",
        "cargaIncendio": 150
      },
      "9411-1/00": {
        "descricao": "Organizações associativas patronais e empresariais (atividade)",
        "cargaIncendio": 700
      },
      "9412-0/00": {
        "descricao": "Organizações associativas profissionais (atividade)",
        "cargaIncendio": 700
      },
      "9420-1/00": {
        "descricao": "Organizações sindicais (atividade)",
        "cargaIncendio": 700
      },
      "9430-8/00": {
        "descricao": "Organizações e associações de defesa de direitos sociais (atividade)",
        "cargaIncendio": 700
      },
      "9492-8/00": {
        "descricao": "Organizações políticas (atividade)",
        "cargaIncendio": 700
      },
      "9529-1/06": {
        "descricao": "Jornais (edição integrada à impressão)",
        "cargaIncendio": 300
      },
      "9601-7/01": {
        "descricao": "Leiloeiros independentes",
        "cargaIncendio": 300
      },
      "9603-3/01": {
        "descricao": "Funerária – Gestão e manutenção de cemitérios",
        "cargaIncendio": 200
      },
      "9603-3/02": {
        "descricao": "Serviço de funerárias (sem salas de funerais)",
        "cargaIncendio": 200
      },
      "9603-3/03": {
        "descricao": "Serviço de som e autoconservação (sem salas de funerais)",
        "cargaIncendio": 200
      },
      "9603-3/04": {
        "descricao": "Serviços de preparação do terreno não especificados anteriormente",
        "cargaIncendio": 200
      },
      "9603-3/05": {
        "descricao": "Serviços domésticos",
        "cargaIncendio": 200
      },
      "9603-3/99": {
        "descricao": "Funerárias – Atividades e serviços relacionados não especificados anteriormente",
        "cargaIncendio": 200
      },
      "9609-2/04": {
        "descricao": "Máquinas de serviços pessoais acionadas por moeda (Exploração)",
        "cargaIncendio": 400
      },
      "9700-5/00": {
        "descricao": "Shopping Center – Administração de shopping centers",
        "cargaIncendio": 700
      },
      "9900-8/00": {
        "descricao": "Organismos internacionais e outras instituições extraterritoriais",
        "cargaIncendio": 700
      }
    },
    "D-2": {
      "6421-2/00": {
        "descricao": "Atividades financeiras - Bancos comerciais",
        "cargaIncendio": 300
      },
      "6422-1/00": {
        "descricao": "Atividades financeiras – Bancos múltiplos, com carteira comercial",
        "cargaIncendio": 300
      },
      "6423-9/00": {
        "descricao": "Atividades financeiras – Caixas econômicas",
        "cargaIncendio": 300
      },
      "6424-7/01": {
        "descricao": "Atividades financeiras – Bancos cooperativos",
        "cargaIncendio": 300
      },
      "6424-7/02": {
        "descricao": "Atividades financeiras – Cooperativas centrais de crédito",
        "cargaIncendio": 300
      },
      "6424-7/03": {
        "descricao": "Atividades financeiras – Cooperativas de crédito mútuo",
        "cargaIncendio": 300
      },
      "6424-7/04": {
        "descricao": "Atividades financeiras – Cooperativas de crédito rural",
        "cargaIncendio": 300
      },
      "6431-0/00": {
        "descricao": "Atividades financeiras – Bancos múltiplos, sem carteira comercial",
        "cargaIncendio": 300
      },
      "6432-8/00": {
        "descricao": "Atividades financeiras – Bancos de investimento",
        "cargaIncendio": 300
      },
      "6433-6/00": {
        "descricao": "Atividades financeiras – Bancos de desenvolvimento",
        "cargaIncendio": 300
      },
      "6435-2/03": {
        "descricao": "Atividades financeiras – Companhias hipotecárias",
        "cargaIncendio": 300
      },
      "6461-1/00": {
        "descricao": "Atividades financeiras – Holding de instituições financeiras",
        "cargaIncendio": 300
      },
      "6462-0/00": {
        "descricao": "Atividades financeiras – Holding de instituições não-financeiras",
        "cargaIncendio": 300
      },
      "6470-1/01": {
        "descricao": "Atividades financeiras – Fundos de investimentos, exceto previdenciários e imobiliários",
        "cargaIncendio": 300
      },
      "6470-1/02": {
        "descricao": "Atividades financeiras – Fundos de investimentos previdenciários",
        "cargaIncendio": 300
      },
      "6470-1/03": {
        "descricao": "Atividades financeiras – Fundos de investimentos imobiliários",
        "cargaIncendio": 300
      },
      "6499-9/01": {
        "descricao": "Atividades financeiras – Clubes de investimento",
        "cargaIncendio": 300
      },
      "6499-9/03": {
        "descricao": "Atividades financeiras – Fundos garantidores de crédito",
        "cargaIncendio": 300
      },
      "6499-9/04": {
        "descricao": "Atividades financeiras – Caixas de financiamento de corporações",
        "cargaIncendio": 300
      },
      "6499-9/05": {
        "descricao": "Atividades financeiras – Concessão de crédito pelas OSCIP",
        "cargaIncendio": 300
      },
      "6499-9/99": {
        "descricao": "Atividades financeiras – Outras atividades de serviços financeiros não especificados anteriormente",
        "cargaIncendio": 300
      },
      "6511-1/02": {
        "descricao": "Atividades financeiras – Planos de auxílio-funeral",
        "cargaIncendio": 300
      },
      "6550-2/00": {
        "descricao": "Atividades financeiras – Planos de saúde",
        "cargaIncendio": 300
      },
      "6611-8/01": {
        "descricao": "Atividades financeiras – Bolsa de valores",
        "cargaIncendio": 300
      },
      "6611-8/02": {
        "descricao": "Atividades financeiras – Bolsa de mercadorias",
        "cargaIncendio": 300
      },
      "6611-8/03": {
        "descricao": "Atividades financeiras – Bolsa de mercadorias e futuros",
        "cargaIncendio": 300
      },
      "6612-6/01": {
        "descricao": "Atividades financeiras – Corretoras de títulos e valores mobiliários",
        "cargaIncendio": 300
      },
      "6612-6/02": {
        "descricao": "Atividades financeiras – Distribuidoras de títulos e valores mobiliários",
        "cargaIncendio": 300
      },
      "6612-6/03": {
        "descricao": "Atividades financeiras – Corretoras de câmbio",
        "cargaIncendio": 300
      },
      "6612-6/04": {
        "descricao": "Atividades financeiras – Corretoras de contratos de mercadorias",
        "cargaIncendio": 300
      },
      "6619-3/02": {
        "descricao": "Atividades financeiras – Correspondentes de instituições financeiras",
        "cargaIncendio": 300
      },
      "6619-3/04": {
        "descricao": "Atividades financeiras – Caixas eletrônicos",
        "cargaIncendio": 300
      },
      "6619-3/05": {
        "descricao": "Atividades financeiras – Operadoras de cartões de débito",
        "cargaIncendio": 300
      },
      "6619-3/99": {
        "descricao": "Atividades financeiras – Outras atividades auxiliares dos serviços financeiros não especificados anteriormente",
        "cargaIncendio": 300
      },
      "6622-3/00": {
        "descricao": "Atividades financeiras – Corretores e agentes de seguros, de planos de previdência complementar e de saúde",
        "cargaIncendio": 300
      }
    },
    "D-3": {
      "0990-4/03": {
        "descricao": "Minerais não-metálicos (atividades de apoio à extração)",
        "cargaIncendio": 700
      },
      "3311-2/00": {
        "descricao": "Tanques, reservatórios metálicos e caldeiras, exceto para veículos (manutenção e reparação)",
        "cargaIncendio": 200
      },
      "3313-9/01": {
        "descricao": "Geradores, transformadores e motores elétricos (manutenção e reparação)",
        "cargaIncendio": 600
      },
      "3313-9/99": {
        "descricao": "Máquinas, aparelhos e materiais elétricos não especificados anteriormente (manutenção e reparação)",
        "cargaIncendio": 600
      },
      "3314-7/01": {
        "descricao": "Máquinas motrizes não-elétricas (manutenção e reparação)",
        "cargaIncendio": 200
      },
      "3314-7/03": {
        "descricao": "Válvulas industriais (manutenção e reparação)",
        "cargaIncendio": 600
      },
      "3314-7/06": {
        "descricao": "Máquinas, aparelhos e equipamentos para instalações térmicas (manutenção e reparação)",
        "cargaIncendio": 600
      },
      "3314-7/07": {
        "descricao": "Máquinas e aparelhos de refrigeração e ventilação para uso industrial e comercial (manutenção e reparação)",
        "cargaIncendio": 600
      },
      "3314-7/08": {
        "descricao": "Máquinas, equipamentos e aparelhos para transporte e elevação de cargas (manutenção e reparação)",
        "cargaIncendio": 200
      },
      "3314-7/09": {
        "descricao": "Máquinas de escrever, calcular e de outros equipamentos não eletrônicos para escritório (manutenção e reparação)",
        "cargaIncendio": 600
      },
      "3314-7/10": {
        "descricao": "Máquinas e equipamentos para uso gerais não especificados anteriormente (manutenção e reparação)",
        "cargaIncendio": 600
      },
      "3314-7/11": {
        "descricao": "Máquinas e equipamentos para agricultura e pecuária (manutenção e reparação)",
        "cargaIncendio": 200
      },
      "3314-7/12": {
        "descricao": "Tratores agrícolas (manutenção e reparação)",
        "cargaIncendio": 200
      },
      "3314-7/13": {
        "descricao": "Máquinas-ferramenta (manutenção e reparação)",
        "cargaIncendio": 600
      },
      "3314-7/14": {
        "descricao": "Máquinas e equipamentos para a prospecção e extração de petróleo (manutenção e reparação)",
        "cargaIncendio": 200
      },
      "3314-7/15": {
        "descricao": "Máquinas e equipamentos para uso na extração mineral, exceto na extração de petróleo (manutenção e reparação)",
        "cargaIncendio": 200
      },
      "3314-7/16": {
        "descricao": "Tratores, exceto agrícolas (manutenção e reparação)",
        "cargaIncendio": 200
      },
      "3314-7/17": {
        "descricao": "Máquinas e equipamentos de terraplenagem, pavimentação e construção, exceto tratores (manutenção e reparação)",
        "cargaIncendio": 200
      },
      "3314-7/18": {
        "descricao": "Máquinas para a indústria metalúrgica, exceto máquinas - ferramenta (manutenção e reparação)",
        "cargaIncendio": 600
      },
      "3314-7/19": {
        "descricao": "Máquinas e equipamentos para as indústrias de alimentos, bebidas e fumo (manutenção e reparação)",
        "cargaIncendio": 600
      },
      "3314-7/20": {
        "descricao": "Máquinas e equipamentos para a indústria têxtil, do vestuário, do couro e calçados (manutenção e reparação)",
        "cargaIncendio": 600
      },
      "3314-7/21": {
        "descricao": "Máquinas e aparelhos para a indústria de celulose, papel e papelão e artefatos (manutenção e reparação)",
        "cargaIncendio": 600
      },
      "3314-7/22": {
        "descricao": "Máquinas e aparelhos para a indústria do plástico (manutenção e reparação)",
        "cargaIncendio": 600
      },
      "3314-7/99": {
        "descricao": "Máquinas e equipamentos para usos industriais não especificados anteriormente (manutenção e reparação)",
        "cargaIncendio": 600
      },
      "3315-5/00": {
        "descricao": "Veículos ferroviários (manutenção e reparação)",
        "cargaIncendio": 200
      },
      "3321-0/00": {
        "descricao": "Máquinas e equipamentos industriais (instalação)",
        "cargaIncendio": 600
      },
      "3329-5/01": {
        "descricao": "Móveis de qualquer material (serviços de montagem)",
        "cargaIncendio": 200
      },
      "8030-7/00": {
        "descricao": "Joias (Reparação)",
        "cargaIncendio": 700
      },
      "8640-2/01": {
        "descricao": "Lavanderias",
        "cargaIncendio": 500
      },
      "9002-7/02": {
        "descricao": "Obras de arte (Restauração)",
        "cargaIncendio": 700
      },
      "9102-3/02": {
        "descricao": "Prédios e lugares históricos (Restauração e conservação)",
        "cargaIncendio": 300
      },
      "9511-8/00": {
        "descricao": "Informática – Computadores e de equipamentos periféricos (Reparação e manutenção)",
        "cargaIncendio": 600
      },
      "9512-6/00": {
        "descricao": "Telecomunicação – Equipamentos de comunicação (Reparação e manutenção)",
        "cargaIncendio": 600
      },
      "9529-1/05": {
        "descricao": "Móvel – Reparação de artigo mobiliário",
        "cargaIncendio": 400
      },
      "9529-1/99": {
        "descricao": "Objetos e equipamentos pessoais e domésticos não especificados anteriormente (reparação e manutenção)",
        "cargaIncendio": 300
      },
      "9601-7/02": {
        "descricao": "Tinturarias",
        "cargaIncendio": 300
      },
      "9601-7/03": {
        "descricao": "Toalheiros",
        "cargaIncendio": 300
      }
    },
    "D-4": {
      "5812-3/00": {
        "descricao": "Laboratórios clínicos",
        "cargaIncendio": 1000
      },
      "7120-1/00": {
        "descricao": "Testes e análises técnicas",
        "cargaIncendio": 300
      },
      "7420-0/03": {
        "descricao": "Fotografia – Laboratórios fotográficos",
        "cargaIncendio": 500
      },
      "8640-2/01": {
        "descricao": "Laboratórios químicos",
        "cargaIncendio": 500
      },
      "8640-2/02": {
        "descricao": "Laboratórios de anatomia patológica e citológica",
        "cargaIncendio": 500
      },
      "8640-2/04": {
        "descricao": "Saúde – Serviços de tomografia",
        "cargaIncendio": 500
      }
    },
    "E-1": {
      "8513-9/00": {
        "descricao": "Ensino fundamental",
        "cargaIncendio": 300
      },
      "8520-1/00": {
        "descricao": "Ensino médio",
        "cargaIncendio": 300
      },
      "8531-7/00": {
        "descricao": "Educação superior – graduação",
        "cargaIncendio": 300
      },
      "8532-5/00": {
        "descricao": "Educação superior – graduação e pós-graduação",
        "cargaIncendio": 300
      },
      "8533-3/00": {
        "descricao": "Educação superior – pós-graduação e extensão",
        "cargaIncendio": 300
      },
      "8599-6/05": {
        "descricao": "Cursos preparatórios para concursos",
        "cargaIncendio": 300
      },
      "8599-6/99": {
        "descricao": "Outras atividades de ensino não especificadas anteriormente",
        "cargaIncendio": 300
      }
    },
    "E-2": {
      "8592-9/02": {
        "descricao": "Ensino de artes cênicas, exceto dança",
        "cargaIncendio": 300
      },
      "8592-9/03": {
        "descricao": "Ensino de música",
        "cargaIncendio": 300
      },
      "8592-9/99": {
        "descricao": "Ensino de arte e cultura não especificado anteriormente",
        "cargaIncendio": 300
      },
      "8593-7/00": {
        "descricao": "Ensino de idiomas",
        "cargaIncendio": 300
      }
    },
    "E-3": {
      "8591-1/00": {
        "descricao": "Ensino de esportes",
        "cargaIncendio": 300
      },
      "8592-9/01": {
        "descricao": "Ensino de dança",
        "cargaIncendio": 300
      },
      "9313-1/00": {
        "descricao": "Academias de ginástica e similar; Atividades de condicionamento físico",
        "cargaIncendio": 300
      },
      "9609-2/01": {
        "descricao": "Saunas e similares",
        "cargaIncendio": 700
      }
    },
    "E-4": {
      "8541-4/00": {
        "descricao": "Educação profissional de nível técnico",
        "cargaIncendio": 300
      },
      "8542-2/00": {
        "descricao": "Educação profissional de nível tecnológico",
        "cargaIncendio": 300
      },
      "8599-6/01": {
        "descricao": "Formação de condutores",
        "cargaIncendio": 300
      },
      "8599-6/02": {
        "descricao": "Cursos de pilotagem",
        "cargaIncendio": 300
      },
      "8599-6/03": {
        "descricao": "Treinamento em informática",
        "cargaIncendio": 300
      },
      "8599-6/04": {
        "descricao": "Treinamento em desenvolvimento profissional e gerencial",
        "cargaIncendio": 300
      }
    },
    "E-5": {
      "8511-2/00": {
        "descricao": "Creches e similares; Educação infantil – creche",
        "cargaIncendio": 300
      },
      "8512-1/00": {
        "descricao": "Educação infantil - pré-escola; Pré-escolas e similares",
        "cargaIncendio": 300
      }
    },
    "E-6": {
      "8599-6/99": {
        "descricao": "Escola para portadores de necessidades especiais",
        "cargaIncendio": 300
      }
    },
    "F-1": {
      "9101-5/00": {
        "descricao": "Arquivos; Bibliotecas",
        "cargaIncendio": 2000
      },
      "9102-3/01": {
        "descricao": "Museus e exploração de lugares e prédios históricos e atrações similares",
        "cargaIncendio": 300
      }
    },
    "F-2": {
      "9491-0/00": {
        "descricao": "Atividades de organizações religiosas; Igrejas e templos",
        "cargaIncendio": 200
      },
      "9603-3/02": {
        "descricao": "Serviço de cremação (com salas de funerais)",
        "cargaIncendio": 200
      },
      "9603-3/03": {
        "descricao": "Serviço de sepultamento (com salas de funerais)",
        "cargaIncendio": 200
      },
      "9603-3/04": {
        "descricao": "Serviço de funerárias (com salas de funerais)",
        "cargaIncendio": 200
      },
      "9603-3/05": {
        "descricao": "Serviço de somatoconservação (com salas de funerais)",
        "cargaIncendio": 200
      }
    },
    "F-3": {
      "-": {
        "descricao": "Centros esportivos e de exibição",
        "cargaIncendio": 150
      },
      "9001-9/05": {
        "descricao": "Rodeios, vaquejadas e similares (produção de espetáculos)",
        "cargaIncendio": 500
      },
      "9200-3/02": {
        "descricao": "Corridas de cavalos (exploração de apostas)",
        "cargaIncendio": 600
      },
      "9319-1/99": {
        "descricao": "Outras atividades esportivas não especificadas anteriormente",
        "cargaIncendio": 150
      }
    },
    "F-4": {
      "4922-1/02": {
        "descricao": "Estações e terminais de passageiros",
        "cargaIncendio": 200
      }
    },
    "F-5": {
      "5914-6/00": {
        "descricao": "Cinemas, teatros e similares",
        "cargaIncendio": 600
      },
      "9001-9/01": {
        "descricao": "Produção teatral",
        "cargaIncendio": 600
      },
      "9001-9/02": {
        "descricao": "Produção musical",
        "cargaIncendio": 600
      },
      "9001-9/03": {
        "descricao": "Produção de espetáculos de dança",
        "cargaIncendio": 600
      },
      "9001-9/99": {
        "descricao": "Artes cênicas, espetáculos e atividades complementares não especificadas anteriormente",
        "cargaIncendio": 600
      }
    },
    "F-6": {
      "8230-0/02": {
        "descricao": "Casas de festas e eventos",
        "cargaIncendio": 600
      },
      "9200-3/01": {
        "descricao": "Casas de bingo",
        "cargaIncendio": 600
      },
      "9200-3/99": {
        "descricao": "Jogos de azar e apostas não especificadas anteriormente (exploração de apostas)",
        "cargaIncendio": 600
      },
      "9312-3/00": {
        "descricao": "Clubes esportivos e similares; Clubes sociais e similares.",
        "cargaIncendio": 600
      },
      "9329-8/01": {
        "descricao": "Discotecas, danceterias, boates, salões de dança e similares",
        "cargaIncendio": 600
      },
      "9329-8/02": {
        "descricao": "Boliches (exploração)",
        "cargaIncendio": 600
      },
      "9329-8/03": {
        "descricao": "Sinuca, bilhar e similares (exploração)",
        "cargaIncendio": 600
      },
      "9329-8/04": {
        "descricao": "Jogos eletrônicos recreativos (exploração)",
        "cargaIncendio": 600
      },
      "9493-6/00": {
        "descricao": "Atividades de organizações associativas ligadas à cultura e à arte",
        "cargaIncendio": 600
      },
      "9499-5/00": {
        "descricao": "Atividades associativas não especificadas anteriormente",
        "cargaIncendio": 600
      }
    },
    "F-7": {
      "9001-9/04": {
        "descricao": "Circos e assemelhados; Produção de espetáculos circenses, de marionetes e similares",
        "cargaIncendio": 500
      }
    },
    "F-8": {
      "5611-2/01": {
        "descricao": "Restaurantes e similares",
        "cargaIncendio": 300
      },
      "5611-2/02": {
        "descricao": "Bares e outros estabelecimentos especializados em servir bebidas",
        "cargaIncendio": 300
      },
      "5611-2/03": {
        "descricao": "Lanchonetes, casas de chá, de sucos e similares",
        "cargaIncendio": 300
      },
      "5612-1/00": {
        "descricao": "Serviço ambulante de alimentação",
        "cargaIncendio": 300
      },
      "5620-1/01": {
        "descricao": "Alimentação – Fornecimento de alimentos preparados preponderantemente para empresas",
        "cargaIncendio": 300
      },
      "5620-1/02": {
        "descricao": "Buffet – Serviços de alimentação para eventos e recepções",
        "cargaIncendio": 300
      },
      "5620-1/03": {
        "descricao": "Cantinas - serviços de alimentação privativos",
        "cargaIncendio": 300
      },
      "5620-1/04": {
        "descricao": "Alimentação – Fornecimento de alimentos preparados preponderantemente para consumo domiciliar",
        "cargaIncendio": 300
      }
    },
    "F-9": {
      "9103-1/00": {
        "descricao": "Jardins botânicos; Zoológicos",
        "cargaIncendio": 500
      },
      "9321-2/00": {
        "descricao": "Parques de diversão e parques temáticos",
        "cargaIncendio": 500
      }
    },
    "F-10": {
      "9101-5/00": {
        "descricao": "Exposições",
        "cargaIncendio": 2000
      }
    },
    "G-1": {
      "5223-1/00": {
        "descricao": "Estacionamento de veículos (garagem com acesso de público e sem abastecimento); Estacionamento de veículos (garagem sem acesso de público e sem abastecimento)",
        "cargaIncendio": 200
      }
    },
    "G-3": {
      "4731-8/00": {
        "descricao": "Comércio varejista de combustíveis para veículos automotores; Postos de abastecimentos (tanque enterrado)",
        "cargaIncendio": 1000
      }
    },
    "G-4": {
      "4520-0/01": {
        "descricao": "Serviços de manutenção e reparação mecânica de veículos automotores",
        "cargaIncendio": 300
      },
      "4520-0/02": {
        "descricao": "Serviços de lanternagem ou funilaria e pintura de veículos automotores",
        "cargaIncendio": 500
      },
      "4520-0/03": {
        "descricao": "Serviços de manutenção e reparação elétrica de veículos automotores",
        "cargaIncendio": 300
      },
      "4520-0/04": {
        "descricao": "Serviços de alinhamento e balanceamento de veículos automotores",
        "cargaIncendio": 300
      },
      "4520-0/05": {
        "descricao": "Serviços de lavagem, lubrificação e polimento de veículos automotores",
        "cargaIncendio": 300
      },
      "4520-0/06": {
        "descricao": "Serviços de borracharia para veículos automotores",
        "cargaIncendio": 300
      },
      "4520-0/07": {
        "descricao": "Serviços de instalação, manutenção e reparação de acessórios para veículos automotores",
        "cargaIncendio": 300
      },
      "4543-9/00": {
        "descricao": "Serviço de manutenção e reparação em motocicletas e motonetas",
        "cargaIncendio": 300
      }
    },
    "G-5": {
      "5223-1/00": {
        "descricao": "Hangares",
        "cargaIncendio": 200
      }
    },
    "H-1": {
      "7500-1/00": {
        "descricao": "Atividades veterinárias",
        "cargaIncendio": 300
      }
    },
    "H-2": {
      "8650-0/01": {
        "descricao": "Atividades de centros de assistência psicossocial",
        "cargaIncendio": 200
      },
      "8711-5/01": {
        "descricao": "Clínicas e residências geriátricas",
        "cargaIncendio": 350
      },
      "8711-5/02": {
        "descricao": "Asilos; Instituições de longa permanência para idosos",
        "cargaIncendio": 350
      },
      "8711-5/03": {
        "descricao": "Atividades de assistência a deficientes físicos, imuno deprimidos e convalescentes",
        "cargaIncendio": 350
      },
      "8711-5/04": {
        "descricao": "Centros de apoio a pacientes com câncer e com AIDS",
        "cargaIncendio": 350
      },
      "8711-5/05": {
        "descricao": "Condomínios residenciais para idosos",
        "cargaIncendio": 350
      },
      "8720-4/99": {
        "descricao": "Atividades de assistência psicossocial e à saúde a portadores de distúrbios psíquicos, deficiência mental e dependência química não especificada anteriormente",
        "cargaIncendio": 200
      },
      "8730-1/01": {
        "descricao": "Orfanatos",
        "cargaIncendio": 350
      },
      "8730-1/02": {
        "descricao": "Albergues assistenciais",
        "cargaIncendio": 350
      },
      "8730-1/99": {
        "descricao": "Atividades de assistência social prestadas em residências coletivas e particulares não especificadas anteriormente",
        "cargaIncendio": 350
      }
    },
    "H-3": {
      "8610-1/01": {
        "descricao": "Atividades de atendimento em pronto-socorro e unidades hospitalares para atendimento a urgência",
        "cargaIncendio": 300
      },
      "8630-5/01": {
        "descricao": "Atividade médica ambulatorial com recursos para realização de procedimentos cirúrgicos",
        "cargaIncendio": 300
      },
      "8690-9/02": {
        "descricao": "Atividades de atendimento hospitalar, exceto pronto-socorro e unidades para atendimento a urgências",
        "cargaIncendio": 200
      }
    },
    "H-4": {
      "8424-8/00": {
        "descricao": "Quartéis e similares",
        "cargaIncendio": 450
      }
    },
    "H-5": {
      "8424-8/00": {
        "descricao": "Presídios e similares",
        "cargaIncendio": 700
      }
    },
    "H-6": {
      "-": {
        "descricao": "Clínicas e consultórios médicos ou odontológicos.",
        "cargaIncendio": 200
      },
      "8610-1/02": {
        "descricao": "Atividades de atenção ambulatorial não especificadas anteriormente",
        "cargaIncendio": 300
      },
      "8630-5/02": {
        "descricao": "Atividade médica ambulatorial com recursos para realização de exames complementares",
        "cargaIncendio": 200
      },
      "8630-5/03": {
        "descricao": "Atividade médica ambulatorial restrita a consultas",
        "cargaIncendio": 200
      },
      "8630-5/04": {
        "descricao": "Atividade odontológica com recursos para realização de procedimentos cirúrgicos",
        "cargaIncendio": 200
      },
      "8630-5/05": {
        "descricao": "Atividade odontológica sem recursos para realização de procedimentos cirúrgicos",
        "cargaIncendio": 200
      },
      "8630-5/06": {
        "descricao": "Serviços de vacinação e imunização humana",
        "cargaIncendio": 200
      },
      "8630-5/07": {
        "descricao": "Atividades de reprodução humana assistida",
        "cargaIncendio": 200
      },
      "8650-0/02": {
        "descricao": "Atividades de profissionais da nutrição",
        "cargaIncendio": 200
      },
      "8650-0/03": {
        "descricao": "Atividades de psicologia e psicanálise",
        "cargaIncendio": 200
      },
      "8650-0/04": {
        "descricao": "Atividades de enfermagem",
        "cargaIncendio": 200
      },
      "8650-0/05": {
        "descricao": "Atividades de terapia ocupacional",
        "cargaIncendio": 200
      },
      "8650-0/06": {
        "descricao": "Atividades de fisioterapia; Atividades de fonoaudiologia",
        "cargaIncendio": 200
      },
      "8650-0/07": {
        "descricao": "Atividades de terapia de nutrição enteral e parenteral",
        "cargaIncendio": 200
      },
      "8650-0/99": {
        "descricao": "Atividades de profissionais da área de saúde não especificadas anteriormente",
        "cargaIncendio": 200
      },
      "8690-9/01": {
        "descricao": "Atividades de práticas integrativas e complementares em saúde humana",
        "cargaIncendio": 200
      },
      "8690-9/99": {
        "descricao": "Outras atividades de atenção à saúde humana não especificadas anteriormente",
        "cargaIncendio": 200
      },
      "8720-4/01": {
        "descricao": "Atividades de banco de leite humano",
        "cargaIncendio": 200
      }
    },
    "I-1": {
      "0710-3/01": {
        "descricao": "Minério de ferro (extração)",
        "cargaIncendio": 200
      },
      "0710-3/02": {
        "descricao": "Minério de ferro (pelotização, sinterização e outros beneficiamentos)",
        "cargaIncendio": 200
      },
      "0721-9/01": {
        "descricao": "Minério de alumínio (extração)",
        "cargaIncendio": 200
      },
      "0721-9/02": {
        "descricao": "Minério de alumínio (beneficiamento)",
        "cargaIncendio": 200
      },
      "0722-7/01": {
        "descricao": "Minério de estanho (extração)",
        "cargaIncendio": 200
      },
      "0722-7/02": {
        "descricao": "Minério de estanho (beneficiamento)",
        "cargaIncendio": 200
      },
      "0723-5/01": {
        "descricao": "Minério de manganês (extração)",
        "cargaIncendio": 200
      },
      "0723-5/02": {
        "descricao": "Minério de manganês (beneficiamento)",
        "cargaIncendio": 200
      },
      "0724-3/01": {
        "descricao": "Minério de metais preciosos (extração)",
        "cargaIncendio": 200
      },
      "0724-3/02": {
        "descricao": "Minério de metais preciosos (beneficiamento)",
        "cargaIncendio": 200
      },
      "0725-1/00": {
        "descricao": "Minerais radioativos (extração)",
        "cargaIncendio": 200
      },
      "0729-4/01": {
        "descricao": "Minérios de nióbio e titânio (extração)",
        "cargaIncendio": 200
      },
      "0729-4/02": {
        "descricao": "Minério de tungstênio (extração)",
        "cargaIncendio": 200
      },
      "0729-4/03": {
        "descricao": "Minério de níquel (extração)",
        "cargaIncendio": 200
      },
      "0729-4/04": {
        "descricao": "Minérios de cobre, chumbo, zinco e outros minerais metálicos não-ferrosos não especificados anteriormente (extração)",
        "cargaIncendio": 200
      },
      "0729-4/05": {
        "descricao": "Minérios de cobre, chumbo, zinco e outros minerais metálicos não ferrosos não especificados anteriormente (beneficiamento)",
        "cargaIncendio": 200
      },
      "0810-0/01": {
        "descricao": "Ardósia (extração e beneficiamento associado)",
        "cargaIncendio": 40
      },
      "0810-0/02": {
        "descricao": "Granito (extração e beneficiamento associado)",
        "cargaIncendio": 40
      },
      "0810-0/03": {
        "descricao": "Mármore (extração e beneficiamento associado)",
        "cargaIncendio": 40
      },
      "0810-0/04": {
        "descricao": "Calcário e dolomita (extração e beneficiamento associado)",
        "cargaIncendio": 40
      },
      "0810-0/05": {
        "descricao": "Gesso e caulim (extração)",
        "cargaIncendio": 40
      },
      "0810-0/06": {
        "descricao": "Areia, cascalho ou pedregulho (extração e beneficiamento associado)",
        "cargaIncendio": 40
      },
      "0810-0/07": {
        "descricao": "Argila (extração e beneficiamento associado)",
        "cargaIncendio": 40
      },
      "0810-0/08": {
        "descricao": "Saibro (extração e beneficiamento associado)",
        "cargaIncendio": 2000
      },
      "0810-0/09": {
        "descricao": "Basalto (extração e beneficiamento associado)",
        "cargaIncendio": 40
      },
      "0810-0/10": {
        "descricao": "Gesso e caulim (extração e beneficiamento associado)",
        "cargaIncendio": 40
      },
      "0810-0/99": {
        "descricao": "Pedras e outros materiais para construção (extração, britamento e beneficiamento associado)",
        "cargaIncendio": 40
      },
      "0891-6/00": {
        "descricao": "Minerais para fabricação de adubos, fertilizantes e outros produtos químicos (extração)",
        "cargaIncendio": 200
      },
      "0892-4/01": {
        "descricao": "Sal (refino e outros tratamentos)",
        "cargaIncendio": 40
      },
      "0892-4/02": {
        "descricao": "Sal marinho (extração)",
        "cargaIncendio": 40
      },
      "0893-2/00": {
        "descricao": "Gemas – Pedras preciosas e semipreciosas (extração)",
        "cargaIncendio": 40
      },
      "0899-1/01": {
        "descricao": "Grafita (extração)",
        "cargaIncendio": 40
      },
      "0899-1/02": {
        "descricao": "Quartzo (extração)",
        "cargaIncendio": 40
      },
      "0899-1/03": {
        "descricao": "Amianto (extração)",
        "cargaIncendio": 40
      },
      "0899-1/99": {
        "descricao": "Minerais não-metálicos não especificados anteriormente (extração)",
        "cargaIncendio": 40
      },
      "1011-2/05": {
        "descricao": "Matadouro - Abate de reses sob contrato - exceto abate de suínos",
        "cargaIncendio": 40
      },
      "1012-1/01": {
        "descricao": "Matadouro - Abate de aves",
        "cargaIncendio": 40
      },
      "1012-1/02": {
        "descricao": "Matadouro - Abate de pequenos animais",
        "cargaIncendio": 40
      },
      "1012-1/04": {
        "descricao": "Matadouro - abate de suínos sob contrato",
        "cargaIncendio": 40
      },
      "1033-3/01": {
        "descricao": "Sucos concentrados de frutas, hortaliças e legumes (fabricação)",
        "cargaIncendio": 200
      },
      "1033-3/02": {
        "descricao": "Sucos de frutas, hortaliças e legumes, exceto concentrados (fabricação)",
        "cargaIncendio": 200
      },
      "1043-1/00": {
        "descricao": "Margarina e outras gorduras vegetais e de óleos não - comestíveis de animais (fabricação)",
        "cargaIncendio": 1000
      },
      "1051-1/00": {
        "descricao": "Leite (preparação)",
        "cargaIncendio": 200
      },
      "1052-0/00": {
        "descricao": "Laticínios (fabricação)",
        "cargaIncendio": 200
      },
      "1053-8/00": {
        "descricao": "Sorvetes e outros gelados comestíveis (fabricação)",
        "cargaIncendio": 80
      },
      "1095-3/00": {
        "descricao": "Condimentos, conservas.; Especiarias, molhos, temperos e condimentos (fabricação)",
        "cargaIncendio": 40
      },
      "1099-6/01": {
        "descricao": "Vinagres (fabricação)",
        "cargaIncendio": 80
      },
      "1099-6/04": {
        "descricao": "Gelo comum (fabricação)",
        "cargaIncendio": 80
      },
      "1113-5/02": {
        "descricao": "Cervejas e chopes (fabricação)",
        "cargaIncendio": 80
      },
      "1121-6/00": {
        "descricao": "Águas envasadas (fabricação)",
        "cargaIncendio": 80
      },
      "1122-4/01": {
        "descricao": "Refrigerantes (fabricação)",
        "cargaIncendio": 80
      },
      "1122-4/02": {
        "descricao": "Chá mate e outros chás prontos para consumo (fabricação)",
        "cargaIncendio": 80
      },
      "1122-4/03": {
        "descricao": "Refrescos, xaropes e pós para refrescos, exceto refrescos de frutas (fabricação)",
        "cargaIncendio": 80
      },
      "1122-4/99": {
        "descricao": "Bebidas não-alcoólicas não especificadas anteriormente (fabricação)",
        "cargaIncendio": 80
      },
      "1210-7/00": {
        "descricao": "Fumo (processamento industrial); Tabaco (artigos)",
        "cargaIncendio": 200
      },
      "1220-4/01": {
        "descricao": "Cigarros (fabricação)",
        "cargaIncendio": 200
      },
      "1220-4/02": {
        "descricao": "Cigarrilhas e charutos(fabricação)",
        "cargaIncendio": 200
      },
      "1220-4/03": {
        "descricao": "Cigarros (fabricação de filtros)",
        "cargaIncendio": 200
      },
      "1313-8/00": {
        "descricao": "Têxtil – Fibras artificiais e sintéticas (fiação)",
        "cargaIncendio": 300
      },
      "1323-5/00": {
        "descricao": "Têxtil – Fibras artificiais e sintéticas (tecelagem de fios)",
        "cargaIncendio": 300
      },
      "1330-8/00": {
        "descricao": "Têxtil – Malha (fabricação de tecidos)",
        "cargaIncendio": 300
      },
      "1422-3/00": {
        "descricao": "Malharias",
        "cargaIncendio": 300
      },
      "1610-2/01": {
        "descricao": "Serralheria - Fabricação de artigos, exceto esquadrias",
        "cargaIncendio": 800
      },
      "1710-9/00": {
        "descricao": "Papel – Fabricação de celulose e outras pastas para a fabricação de papel",
        "cargaIncendio": 80
      },
      "2019-3/99": {
        "descricao": "Produtos químicos inorgânicos não especificados anteriormente (fabricação)",
        "cargaIncendio": 80
      },
      "2040-1/00": {
        "descricao": "Fibras artificiais e sintéticas (fabricação)",
        "cargaIncendio": 300
      },
      "2051-7/00": {
        "descricao": "Defensivos agrícolas(fabricação)",
        "cargaIncendio": 200
      },
      "2063-1/00": {
        "descricao": "Cosméticos, produtos de perfumaria e de higiene pessoal (fabricação); Perfumes",
        "cargaIncendio": 300
      },
      "2110-6/00": {
        "descricao": "Farmoquímicos (fabricação de produtos)",
        "cargaIncendio": 300
      },
      "2121-1/01": {
        "descricao": "Medicamentos alopáticos para uso humano (fabricação)",
        "cargaIncendio": 300
      },
      "2121-1/02": {
        "descricao": "Medicamentos homeopáticos para uso humano (fabricação)",
        "cargaIncendio": 300
      },
      "2121-1/03": {
        "descricao": "Medicamentos fitoterápicos para uso humano (fabricação)",
        "cargaIncendio": 300
      },
      "2122-0/00": {
        "descricao": "Medicamentos para uso veterinário (fabricação)",
        "cargaIncendio": 300
      },
      "2123-8/00": {
        "descricao": "Medicamentos – Preparações farmacêuticas (fabricação)",
        "cargaIncendio": 300
      },
      "2229-3/01": {
        "descricao": "Flores artificiais",
        "cargaIncendio": 300
      },
      "2311-7/00": {
        "descricao": "Vidro plano e de segurança (fabricação)",
        "cargaIncendio": 200
      },
      "2312-5/00": {
        "descricao": "Embalagens de vidro (fabricação)",
        "cargaIncendio": 200
      },
      "2319-2/00": {
        "descricao": "Produtos refratários; Vidro (fabricação de artigos)",
        "cargaIncendio": 200
      },
      "2320-6/00": {
        "descricao": "Cimento (fabricação)",
        "cargaIncendio": 40
      },
      "2330-3/01": {
        "descricao": "Cimento – Estruturas pré-moldadas de concreto armado, em série e sob encomenda (fabricação)",
        "cargaIncendio": 40
      },
      "2330-3/02": {
        "descricao": "Cimento – Fabricação de artefatos de cimento para uso na construção",
        "cargaIncendio": 40
      },
      "2330-3/03": {
        "descricao": "Cimento – Fabricação de artefatos de fibrocimento para uso na construção",
        "cargaIncendio": 40
      },
      "2330-3/04": {
        "descricao": "Casas pré-moldadas de concreto (fabricação)",
        "cargaIncendio": 40
      },
      "2330-3/05": {
        "descricao": "Cimento – Preparação de massa de concreto e argamassa para construção",
        "cargaIncendio": 40
      },
      "2330-3/99": {
        "descricao": "Cimento – Fabricação de outros artefatos e produtos de concreto, cimento, fibrocimento, gesso e materiais semelhantes",
        "cargaIncendio": 40
      },
      "2341-9/00": {
        "descricao": "Cerâmica – Fabricação de produtos cerâmicos refratários",
        "cargaIncendio": 200
      },
      "2342-7/01": {
        "descricao": "Cerâmica – Azulejos e pisos (fabricação)",
        "cargaIncendio": 200
      },
      "2342-7/02": {
        "descricao": "Cerâmica – Fabricação de artefatos de cerâmica e barro cozido para uso na construção, exceto azulejos e pisos",
        "cargaIncendio": 200
      },
      "2349-4/01": {
        "descricao": "Cerâmica – Fabricação de material sanitário de cerâmica",
        "cargaIncendio": 200
      },
      "2349-4/99": {
        "descricao": "Cerâmica – Fabricação de produtos cerâmicos não - refratários não especificados anteriormente",
        "cargaIncendio": 200
      },
      "2391-5/01": {
        "descricao": "Pedras – Britamento de pedras, exceto associado à extração",
        "cargaIncendio": 40
      },
      "2391-5/02": {
        "descricao": "Pedras – Aparelhamento de pedras para construção, exceto associado à extração",
        "cargaIncendio": 40
      },
      "2391-5/03": {
        "descricao": "Pedras – Aparelhamento de placas e execução de trabalhos em mármore, granito, ardósia e outras pedras",
        "cargaIncendio": 40
      },
      "2392-3/00": {
        "descricao": "Cal e gesso (fabricação)",
        "cargaIncendio": 80
      },
      "2399-1/01": {
        "descricao": "Cerâmica – Decoração, lapidação, gravação, vitrificação e outros trabalhos em cerâmica e louça; Vidro – Decoração, lapidação, gravação, vitrificação e outros trabalhos em vidro e cristal",
        "cargaIncendio": 200
      },
      "2399-1/99": {
        "descricao": "Produtos de minerais não - metálicos não especificados anteriormente (fabricação)",
        "cargaIncendio": 200
      },
      "2411-3/00": {
        "descricao": "Metal – Ferro-gusa (produção)",
        "cargaIncendio": 200
      },
      "2412-1/00": {
        "descricao": "Metal – Ferro-ligas (produção)",
        "cargaIncendio": 200
      },
      "2421-1/00": {
        "descricao": "Metal – Produção de semi - acabados de aço",
        "cargaIncendio": 200
      },
      "2422-9/01": {
        "descricao": "Metal – Produção de laminados planos de aço ao carbono, revestidos ou não",
        "cargaIncendio": 200
      },
      "2422-9/02": {
        "descricao": "Metal – Produção de laminados planos de aços especiais",
        "cargaIncendio": 200
      },
      "2423-7/01": {
        "descricao": "Metal – Produção de tubos de aço sem costura",
        "cargaIncendio": 200
      },
      "2423-7/02": {
        "descricao": "Metal – Produção de laminados longos de aço, exceto tubos",
        "cargaIncendio": 200
      },
      "2424-5/01": {
        "descricao": "Metal – Produção de arames de aço",
        "cargaIncendio": 200
      },
      "2431-8/00": {
        "descricao": "Metal – Produção de tubos de aço com costura",
        "cargaIncendio": 200
      },
      "2439-3/00": {
        "descricao": "Metal – Produção de outros tubos de aço; Metal – Produção de outros tubos de ferro",
        "cargaIncendio": 200
      },
      "2441-5/01": {
        "descricao": "Metal – Produção de alumínio e suas ligas em formas primárias",
        "cargaIncendio": 200
      },
      "2441-5/02": {
        "descricao": "Metal – Produção de laminados de alumínio",
        "cargaIncendio": 200
      },
      "2442-3/00": {
        "descricao": "Metal – Metalurgia dos metais preciosos",
        "cargaIncendio": 200
      },
      "2443-1/00": {
        "descricao": "Metal – Metalurgia do cobre",
        "cargaIncendio": 200
      },
      "2449-1/01": {
        "descricao": "Metal – Produção de zinco em formas primárias",
        "cargaIncendio": 200
      },
      "2449-1/02": {
        "descricao": "Metal – Produção de laminados de zinco",
        "cargaIncendio": 200
      },
      "2449-1/03": {
        "descricao": "Metal – Soldas e ânodos para galvanoplastia (produção)",
        "cargaIncendio": 200
      },
      "2449-1/99": {
        "descricao": "Metal – Metalurgia de outros metais não - ferrosos e suas ligas não especificados anteriormente",
        "cargaIncendio": 200
      },
      "2451-2/00": {
        "descricao": "Metal – Fundição de ferro e aço",
        "cargaIncendio": 40
      },
      "2452-1/00": {
        "descricao": "Metal – Fundição de metais não - ferrosos e suas ligas",
        "cargaIncendio": 40
      },
      "2511-0/00": {
        "descricao": "Estruturas metálicas (fabricação)",
        "cargaIncendio": 200
      },
      "2512-8/00": {
        "descricao": "Esquadrias de metal (fabricação)",
        "cargaIncendio": 200
      },
      "2513-6/00": {
        "descricao": "Caldeiras – fabricação de obras de caldeiraria pesada",
        "cargaIncendio": 200
      },
      "2521-7/00": {
        "descricao": "Caldeiras – Fabricação de tanques, reservatórios metálicos e caldeiras para aquecimento central",
        "cargaIncendio": 200
      },
      "2522-5/00": {
        "descricao": "Caldeiras – Fabricação de caldeiras geradoras de vapor, exceto para aquecimento central1e para veículos",
        "cargaIncendio": 200
      },
      "2531-4/01": {
        "descricao": "Metal – Produção de forjados de aço",
        "cargaIncendio": 200
      },
      "2531-4/02": {
        "descricao": "Metal – Produção de forjados de metais não-ferrosos e suas ligas",
        "cargaIncendio": 200
      },
      "2532-2/01": {
        "descricao": "Metal – Produção de artefatos estampados de metal",
        "cargaIncendio": 200
      },
      "2532-2/02": {
        "descricao": "Metal – Metalurgia do pó",
        "cargaIncendio": 200
      },
      "2539-0/00": {
        "descricao": "Metal – Serviços de usinagem, solda, tratamento e revestimento em metais",
        "cargaIncendio": 200
      },
      "2541-1/00": {
        "descricao": "Cutelaria (fabricação de artigos)",
        "cargaIncendio": 200
      },
      "2542-0/00": {
        "descricao": "Sal-gema (extração)",
        "cargaIncendio": 200
      },
      "2543-8/00": {
        "descricao": "Ferramentas (fabricação)",
        "cargaIncendio": 300
      },
      "2591-8/00": {
        "descricao": "Embalagens metálicas (fabricação)",
        "cargaIncendio": 300
      },
      "2592-6/01": {
        "descricao": "Produtos de trefilados de metal padronizados (fabricação)",
        "cargaIncendio": 300
      },
      "2592-6/02": {
        "descricao": "Produtos de trefilados de metal, exceto padronizados (fabricação)",
        "cargaIncendio": 300
      },
      "2593-4/00": {
        "descricao": "Metal – Fabricação de artigos de metal para uso doméstico e pessoal",
        "cargaIncendio": 300
      },
      "2599-3/01": {
        "descricao": "Metal – Serviços de confecção de armações metálicas para a construção",
        "cargaIncendio": 300
      },
      "2599-3/99": {
        "descricao": "Metal – Fabricação de outros produtos de metal não especificados anteriormente",
        "cargaIncendio": 300
      },
      "2651-5/00": {
        "descricao": "Balanças",
        "cargaIncendio": 300
      },
      "2710-4/01": {
        "descricao": "Geradores de corrente contínua e alternada (fabricação de equipamentos, peças e acessórios)",
        "cargaIncendio": 300
      },
      "2710-4/02": {
        "descricao": "Transformadores, indutores, conversores, sincronizadores e semelhantes (fabricação de equipamentos, peças e acessórios)",
        "cargaIncendio": 300
      },
      "2710-4/03": {
        "descricao": "Motores elétricos (fabricação de equipamentos, peças e acessórios)",
        "cargaIncendio": 300
      },
      "2732-5/00": {
        "descricao": "Material elétrico para instalações em circuito de consumo (fabricação)",
        "cargaIncendio": 300
      },
      "2733-3/00": {
        "descricao": "Fios, cabos e condutores elétricos isolados (fabricação)",
        "cargaIncendio": 300
      },
      "2740-6/01": {
        "descricao": "Lâmpadas (fabricação)",
        "cargaIncendio": 40
      },
      "2740-6/02": {
        "descricao": "Luminárias e outros equipamentos de iluminação (fabricação)",
        "cargaIncendio": 40
      },
      "2751-1/00": {
        "descricao": "Máquinas de lavar de costura ou de escritório",
        "cargaIncendio": 300
      },
      "2811-9/00": {
        "descricao": "Motores e turbinas, peças e acessórios, exceto para aviões e veículos rodoviários(fabricação)",
        "cargaIncendio": 300
      },
      "2812-7/00": {
        "descricao": "Aparelhos e equipamentos hidráulicos e pneumáticos, peças e acessórios, exceto válvulas (fabricação)",
        "cargaIncendio": 300
      },
      "2813-5/00": {
        "descricao": "Válvulas, registros e dispositivos semelhantes (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2814-3/01": {
        "descricao": "Compressores para uso industrial (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2814-3/02": {
        "descricao": "Compressores para uso não industrial (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2815-1/01": {
        "descricao": "Rolamentos para fins industriais (fabricação)",
        "cargaIncendio": 3000
      },
      "2815-1/02": {
        "descricao": "Aparelhos e equipamentos de transmissão para fins industriais, exceto rolamentos(fabricação)",
        "cargaIncendio": 300
      },
      "2821-6/01": {
        "descricao": "Fornos industriais, aparelhos e equipamentos não-elétricos para instalações térmicas (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2821-6/02": {
        "descricao": "Estufas e fornos elétricos para fins industriais (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2822-4/01": {
        "descricao": "Aparelhos, máquinas e equipamentos para transporte e elevação de pessoas (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2822-4/02": {
        "descricao": "Aparelhos, máquinas e equipamentos para transporte e elevação de cargas (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2825-9/00": {
        "descricao": "Aparelhos, máquinas e equipamentos para saneamento básico e ambiental (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2829-1/01": {
        "descricao": "Máquinas de escrever, calcular e outros equipamentos não - eletrônicos para escritório (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2829-1/99": {
        "descricao": "Aparelhos, máquinas e equipamentos de uso geral não especificados anteriormente (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2831-3/00": {
        "descricao": "Tratores agrícolas (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2832-1/00": {
        "descricao": "Aparelhos e equipamentos para irrigação agrícola (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2833-0/00": {
        "descricao": "Aparelhos, máquinas e equipamentos para a agricultura e pecuária, exceto para irrigação (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2840-2/00": {
        "descricao": "Máquinas-ferramenta (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2851-8/00": {
        "descricao": "Aparelhos, máquinas e equipamentos para a prospecção e extração de petróleo (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2852-6/00": {
        "descricao": "Aparelhos, máquinas e equipamentos para uso na extração mineral, exceto na extração de petróleo (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2853-4/00": {
        "descricao": "Tratores, exceto agrícolas (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2854-2/00": {
        "descricao": "Aparelhos, máquinas e equipamentos para terraplenagem, pavimentação e construção, exceto tratores (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2861-5/00": {
        "descricao": "Máquinas para a indústria metalúrgica, exceto máquinas - ferramenta (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2862-3/00": {
        "descricao": "Máquinas e equipamentos para as indústrias de alimentos, bebidas e fumo (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2863-1/00": {
        "descricao": "Aparelhos, máquinas e equipamentos para a indústria têxtil (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2864-0/00": {
        "descricao": "Aparelhos, máquinas e equipamentos para as indústrias do vestuário, do couro e de calçados (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2865-8/00": {
        "descricao": "Aparelhos, máquinas e equipamentos para as indústrias de celulose, papel e papelão e artefatos (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2866-6/00": {
        "descricao": "Aparelhos, máquinas e equipamentos para a indústria do plástico (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2869-1/00": {
        "descricao": "Aparelhos, máquinas e equipamentos para uso industrial específico não especificados anteriormente (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 300
      },
      "2941-7/00": {
        "descricao": "Automóveis – Fabricação de peças e acessórios para o sistema motor de veículos automotores",
        "cargaIncendio": 300
      },
      "2942-5/00": {
        "descricao": "Automóveis – Fabricação de peças e acessórios para os sistemas de marcha e transmissão de veículos automotores",
        "cargaIncendio": 300
      },
      "2943-3/00": {
        "descricao": "Automóveis – Fabricação de peças e acessórios para o sistema de freios de veículos automotores",
        "cargaIncendio": 300
      },
      "2944-1/00": {
        "descricao": "Automóveis – Fabricação de peças e acessórios para o sistema de direção e suspensão de veículos automotores",
        "cargaIncendio": 300
      },
      "2945-0/00": {
        "descricao": "Automóveis – Fabricação de material elétrico e eletrônico para veículos automotores, exceto baterias",
        "cargaIncendio": 300
      },
      "2949-2/99": {
        "descricao": "Automóveis – Fabricação de outras peças e acessórios para veículos automotores não especificadas anteriormente",
        "cargaIncendio": 300
      },
      "2950-6/00": {
        "descricao": "Automóveis –Recondicionamento e recuperação de motores para veículos automotores",
        "cargaIncendio": 300
      },
      "3021-1/00": {
        "descricao": "Embarcações e estruturas flutuantes (manutenção e reparação)",
        "cargaIncendio": 300
      },
      "3022-9/00": {
        "descricao": "Embarcações para esporte e lazer (manutenção e reparação)",
        "cargaIncendio": 300
      },
      "3031-8/00": {
        "descricao": "Vagões",
        "cargaIncendio": 500
      },
      "3092-0/00": {
        "descricao": "Bicicletas e triciclos não - motorizados (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 200
      },
      "3211-6/01": {
        "descricao": "Lapidação de gemas",
        "cargaIncendio": 200
      },
      "3211-6/02": {
        "descricao": "Joalheria e ourivesaria (fabricação de artefatos); Joias; Relógios",
        "cargaIncendio": 300
      },
      "3211-6/03": {
        "descricao": "Moedas e medalhas (cunhagem)",
        "cargaIncendio": 200
      },
      "3212-4/00": {
        "descricao": "Bijuterias e artefatos semelhantes (fabricação)",
        "cargaIncendio": 200
      },
      "3299-0/01": {
        "descricao": "Guarda-chuvas e similares (fabricação)",
        "cargaIncendio": 300
      }
    },
    "I-2": {
      "-": {
        "descricao": "Instrumentos musicais",
        "cargaIncendio": 600
      },
      "1013-9/01": {
        "descricao": "Carne (fabricação de produtos)",
        "cargaIncendio": 800
      },
      "1013-9/02": {
        "descricao": "Preparação de subprodutos do abate",
        "cargaIncendio": 800
      },
      "1020-1/01": {
        "descricao": "Peixes, crustáceos e moluscos (preservação)",
        "cargaIncendio": 800
      },
      "1020-1/02": {
        "descricao": "Peixes, crustáceos e moluscos (fabricação de conservas)",
        "cargaIncendio": 800
      },
      "1031-7/00": {
        "descricao": "Frutas (fabricação de conservas)",
        "cargaIncendio": 800
      },
      "1032-5/01": {
        "descricao": "Palmito (fabricação de conservas)",
        "cargaIncendio": 800
      },
      "1032-5/99": {
        "descricao": "Legumes e outros vegetais, exceto palmito (fabricação de conservas)",
        "cargaIncendio": 800
      },
      "1041-4/00": {
        "descricao": "Óleos vegetais em bruto, exceto óleo de milho (fabricação)",
        "cargaIncendio": 1000
      },
      "1042-2/00": {
        "descricao": "Óleos vegetais refinados, exceto óleo de milho (fabricação)",
        "cargaIncendio": 1000
      },
      "1043-1/00": {
        "descricao": "Gorduras comestíveis",
        "cargaIncendio": 1000
      },
      "1061-9/02": {
        "descricao": "Arroz (fabricação de produtos)",
        "cargaIncendio": 1700
      },
      "1065-1/02": {
        "descricao": "Óleo de milho em bruto (fabricação)",
        "cargaIncendio": 1000
      },
      "1065-1/03": {
        "descricao": "Óleo de milho refinado (fabricação)",
        "cargaIncendio": 1000
      },
      "1066-0/00": {
        "descricao": "Alimentos para animais – Ração (fabricação)",
        "cargaIncendio": 800
      },
      "1071-6/00": {
        "descricao": "Açúcar em bruto (fabricação)",
        "cargaIncendio": 800
      },
      "1072-4/01": {
        "descricao": "Açúcar de cana refinado (fabricação)",
        "cargaIncendio": 800
      },
      "1072-4/02": {
        "descricao": "Açúcar de cereais (dextrose) e de beterraba (fabricação)",
        "cargaIncendio": 800
      },
      "1081-3/01": {
        "descricao": "Café (beneficiamento)",
        "cargaIncendio": 400
      },
      "1081-3/02": {
        "descricao": "Café (torrefação e moagem)",
        "cargaIncendio": 400
      },
      "1082-1/00": {
        "descricao": "Café (fabricação de produtos à base de café)",
        "cargaIncendio": 400
      },
      "1091-1/00": {
        "descricao": "Confeitarias; Doces; Padarias; Panificação (fabricação de produtos)",
        "cargaIncendio": 1000
      },
      "1092-9/00": {
        "descricao": "Biscoitos e bolachas (fabricação)",
        "cargaIncendio": 800
      },
      "1093-7/01": {
        "descricao": "Cacau (fabricação de produtos derivados); Chocolate (fabricação de produtos derivados)",
        "cargaIncendio": 400
      },
      "1093-7/02": {
        "descricao": "Frutas cristalizadas, balas e semelhantes (fabricação)",
        "cargaIncendio": 800
      },
      "1094-5/00": {
        "descricao": "Massas alimentícias (fabricação)",
        "cargaIncendio": 1000
      },
      "1096-1/00": {
        "descricao": "Alimentos e pratos prontos (fabricação)",
        "cargaIncendio": 800
      },
      "1099-6/02": {
        "descricao": "Pós alimentícios (fabricação)",
        "cargaIncendio": 800
      },
      "1099-6/03": {
        "descricao": "Fermentos e leveduras (fabricação)",
        "cargaIncendio": 800
      },
      "1099-6/05": {
        "descricao": "Chá – Produtos para infusão, como chá, mate, etc. (fabricação)",
        "cargaIncendio": 800
      },
      "1099-6/06": {
        "descricao": "Adoçantes naturais e artificiais (fabricação)",
        "cargaIncendio": 800
      },
      "1099-6/99": {
        "descricao": "Produtos alimentícios não especificados anteriormente (fabricação)",
        "cargaIncendio": 800
      },
      "1111-9/01": {
        "descricao": "Aguardente de cana-de-açúcar (fabricação)",
        "cargaIncendio": 500
      },
      "1111-9/02": {
        "descricao": "Aguardente, com exceção de cana-de - açúcar e outras bebidas destiladas (fabricação)",
        "cargaIncendio": 500
      },
      "1112-7/00": {
        "descricao": "Vinho (fabricação)",
        "cargaIncendio": 500
      },
      "1113-5/01": {
        "descricao": "Malte, inclusive malte uísque (fabricação)",
        "cargaIncendio": 500
      },
      "1220-4/99": {
        "descricao": "Fumo, exceto cigarros, cigarrilhas e charutos (fabricação de outros produtos derivados)",
        "cargaIncendio": 200
      },
      "1311-1/00": {
        "descricao": "Têxtil – Algodão (preparação e fiação de fibras)",
        "cargaIncendio": 700
      },
      "1312-0/00": {
        "descricao": "Têxtil natural, exceto algodão (preparação e fiação de fibras)",
        "cargaIncendio": 700
      },
      "1314-6/00": {
        "descricao": "Têxtil – Linhas para costurar e bordar (fabricação)",
        "cargaIncendio": 700
      },
      "1321-9/00": {
        "descricao": "Têxtil – Algodão (tecelagem de fios)",
        "cargaIncendio": 700
      },
      "1322-7/00": {
        "descricao": "Têxtil – Fibras têxteis naturais, exceto algodão (tecelagem de fios)",
        "cargaIncendio": 700
      },
      "1340-5/01": {
        "descricao": "Têxtil – Tecidos, fios, artefatos têxteis e peças do vestuário (estamparia e texturização)",
        "cargaIncendio": 700
      },
      "1340-5/02": {
        "descricao": "Têxtil – Tecidos, fios, artefatos têxteis e peças do vestuário (alvejamento, tingimento e torção)",
        "cargaIncendio": 700
      },
      "1340-5/99": {
        "descricao": "Têxtil – Tecidos, fios, artefatos têxteis e peças do vestuário (outros serviços de acabamento)",
        "cargaIncendio": 700
      },
      "1351-1/00": {
        "descricao": "Têxtil – Artefatos têxteis para uso doméstico (fabricação)",
        "cargaIncendio": 700
      },
      "1352-9/00": {
        "descricao": "Tapeçaria (fabricação de artefatos)",
        "cargaIncendio": 600
      },
      "1353-7/00": {
        "descricao": "Cordoaria (fabricação de artefatos)",
        "cargaIncendio": 700
      },
      "1354-5/00": {
        "descricao": "Têxtil – Tecidos especiais, inclusive artefatos (fabricação)",
        "cargaIncendio": 700
      },
      "1359-6/00": {
        "descricao": "Têxtil – Produtos têxteis não especificados anteriormente (fabricação)",
        "cargaIncendio": 700
      },
      "1411-8/01": {
        "descricao": "Têxtil – Confecção de roupas íntimas",
        "cargaIncendio": 500
      },
      "1411-8/02": {
        "descricao": "Têxtil – Facção de roupas íntimas",
        "cargaIncendio": 500
      },
      "1412-6/01": {
        "descricao": "Têxtil – Confecção de peças do vestuário, exceto roupas íntimas e as confeccionadas sob medida",
        "cargaIncendio": 500
      },
      "1412-6/02": {
        "descricao": "Têxtil – Confecção, sob medida, de peças do vestuário, exceto roupas íntimas",
        "cargaIncendio": 500
      },
      "1412-6/03": {
        "descricao": "Têxtil – Facção de peças do vestuário, exceto roupas íntimas",
        "cargaIncendio": 500
      },
      "1413-4/01": {
        "descricao": "Têxtil – Confecção de roupas profissionais, exceto sob medida",
        "cargaIncendio": 500
      },
      "1413-4/02": {
        "descricao": "Têxtil – Confecção, sob medida, de roupas profissionais",
        "cargaIncendio": 500
      },
      "1413-4/03": {
        "descricao": "Têxtil – Facção de roupas profissionais",
        "cargaIncendio": 500
      },
      "1414-2/00": {
        "descricao": "Têxtil – Fabricação de acessórios do vestuário, exceto para segurança e proteção",
        "cargaIncendio": 500
      },
      "1421-5/00": {
        "descricao": "Têxtil – Fabricação de meias",
        "cargaIncendio": 500
      },
      "1422-3/00": {
        "descricao": "Têxtil – Fabricação de artigos do vestuário, produzidos em malharias e tricotagens, exceto meias",
        "cargaIncendio": 500
      },
      "1510-6/00": {
        "descricao": "Couro (curtimento e outras preparações)",
        "cargaIncendio": 600
      },
      "1521-1/00": {
        "descricao": "Bolsas, artigos para viagem e semelhantes de qualquer material (fabricação)",
        "cargaIncendio": 600
      },
      "1529-7/00": {
        "descricao": "Couro – Fabricação de artefatos não especificados anteriormente; Peles (artigos)",
        "cargaIncendio": 600
      },
      "1531-9/01": {
        "descricao": "Calçados de couro (fabricação)",
        "cargaIncendio": 600
      },
      "1531-9/02": {
        "descricao": "Calçados de couro (acabamento sob contrato)",
        "cargaIncendio": 600
      },
      "1532-7/00": {
        "descricao": "Calçados – Tênis de qualquer material (fabricação)",
        "cargaIncendio": 600
      },
      "1533-5/00": {
        "descricao": "Calçados de material sintético (fabricação)",
        "cargaIncendio": 600
      },
      "1539-4/00": {
        "descricao": "Calçados de materiais não especificados anteriormente (fabricação)",
        "cargaIncendio": 600
      },
      "1540-8/00": {
        "descricao": "Calçados – Fabricação de partes para calçados, de qualquer material",
        "cargaIncendio": 600
      },
      "1610-2/02": {
        "descricao": "Serrarias com desdobramento de madeira",
        "cargaIncendio": 800
      },
      "1621-8/00": {
        "descricao": "Madeira laminada e de chapas de madeira compensada, prensada e aglomerada (fabricação)",
        "cargaIncendio": 800
      },
      "1622-6/01": {
        "descricao": "Casas de madeira pré-fabricadas (fabricação)",
        "cargaIncendio": 800
      },
      "1622-6/02": {
        "descricao": "Esquadrias de madeira e de peças de madeira para instalações industriais e comerciais (fabricação); Janelas e portas de madeira",
        "cargaIncendio": 800
      },
      "1622-6/99": {
        "descricao": "Carpintaria – Fabricação de outros artigos de carpintaria para construção; Marcenarias",
        "cargaIncendio": 800
      },
      "1623-4/00": {
        "descricao": "Tanoaria e embalagens de madeira (fabricação de artefatos)",
        "cargaIncendio": 800
      },
      "1629-3/01": {
        "descricao": "Caixotes barris ou pallets de madeira; Madeira – Fabricação de artefatos diversos, exceto móveis",
        "cargaIncendio": 1000
      },
      "1629-3/02": {
        "descricao": "Cortiça, bambu, palha, vime e outros materiais trançados – Fabricação de artefatos diversos, exceto móveis -",
        "cargaIncendio": 800
      },
      "1721-4/00": {
        "descricao": "Papel (fabricação)",
        "cargaIncendio": 500
      },
      "1722-2/00": {
        "descricao": "Papel – Fabricação de cartolina e papel – cartão",
        "cargaIncendio": 500
      },
      "1731-1/00": {
        "descricao": "Papel – Fabricação de embalagens de papel",
        "cargaIncendio": 500
      },
      "1732-0/00": {
        "descricao": "Papel – Fabricação de embalagens de cartolina e papel-cartão",
        "cargaIncendio": 500
      },
      "1733-8/00": {
        "descricao": "Papel – Fabricação de chapas e de embalagens de papelão ondulado",
        "cargaIncendio": 800
      },
      "1741-9/01": {
        "descricao": "Papel – Fabricação de formulários contínuos",
        "cargaIncendio": 500
      },
      "1741-9/02": {
        "descricao": "Papel – Fabricação de produtos de papel, cartolina, papel-cartão e papelão ondulado para uso industrial, comercial e de escritório, exceto formulário contínuo",
        "cargaIncendio": 800
      },
      "1742-7/01": {
        "descricao": "Fraldas descartáveis (fabricação)",
        "cargaIncendio": 1000
      },
      "1742-7/02": {
        "descricao": "Absorventes higiênicos (fabricação)",
        "cargaIncendio": 1000
      },
      "1742-7/99": {
        "descricao": "Papel – Fabricação de produtos de papel para uso doméstico e higiênico-sanitário não especificados anteriormente",
        "cargaIncendio": 500
      },
      "1749-4/00": {
        "descricao": "Papel – Fabricação de produtos de pastas celulósicas, papel, cartolina, papel-cartão e papelão ondulado não especificados anteriormente",
        "cargaIncendio": 500
      },
      "1813-0/01": {
        "descricao": "Gráfica – Impressão de material para uso publicitário",
        "cargaIncendio": 400
      },
      "1813-0/99": {
        "descricao": "Gráfica – Impressão de material para outros usos",
        "cargaIncendio": 400
      },
      "1821-1/00": {
        "descricao": "Gráfica – Serviços de pré-impressão",
        "cargaIncendio": 400
      },
      "1822-9/00": {
        "descricao": "Gráfica – Serviços de acabamentos gráficos",
        "cargaIncendio": 400
      },
      "1830-0/01": {
        "descricao": "Som (reprodução em qualquer suporte)",
        "cargaIncendio": 600
      },
      "1830-0/02": {
        "descricao": "Vídeo (reprodução em qualquer suporte)",
        "cargaIncendio": 600
      },
      "1830-0/03": {
        "descricao": "Software (reprodução em qualquer suporte)",
        "cargaIncendio": 600
      },
      "1922-5/02": {
        "descricao": "Óleos lubrificantes (rerrefino)",
        "cargaIncendio": 3000
      },
      "2012-6/00": {
        "descricao": "Fertilizantes (fabricação de intermediários)",
        "cargaIncendio": 200
      },
      "2013-4/00": {
        "descricao": "Adubos e fertilizantes (fabricação)",
        "cargaIncendio": 200
      },
      "2014-2/00": {
        "descricao": "Gases industriais (fabricação)",
        "cargaIncendio": 700
      },
      "2022-3/00": {
        "descricao": "Plastificantes, resinas e fibras (fabricação de intermediários para); Produtos adesivos",
        "cargaIncendio": 1000
      },
      "2029-1/00": {
        "descricao": "Produtos químicos orgânicos não especificados anteriormente (fabricação)",
        "cargaIncendio": 1000
      },
      "2091-6/00": {
        "descricao": "Adesivos e selantes (fabricação)",
        "cargaIncendio": 1000
      },
      "2093-2/00": {
        "descricao": "Aditivos de uso industrial (fabricação)",
        "cargaIncendio": 500
      },
      "2094-1/00": {
        "descricao": "Catalisadores (fabricação)",
        "cargaIncendio": 500
      },
      "2099-1/01": {
        "descricao": "Chapas, filmes, papéis e outros materiais e produtos químicos para fotografia(fabricação)",
        "cargaIncendio": 500
      },
      "2099-1/99": {
        "descricao": "Produtos químicos não especificados anteriormente (fabricação)",
        "cargaIncendio": 500
      },
      "2211-1/00": {
        "descricao": "Pneumáticos e de câmaras-de - ar (fabricação)",
        "cargaIncendio": 700
      },
      "2212-9/00": {
        "descricao": "Pneumáticos usados (reforma)",
        "cargaIncendio": 700
      },
      "2219-6/00": {
        "descricao": "Borracha – Fabricação de artefatos não especificados anteriormente",
        "cargaIncendio": 700
      },
      "2221-8/00": {
        "descricao": "Laminados planos e tubulares de material plástico (fabricação)",
        "cargaIncendio": 1000
      },
      "2222-6/00": {
        "descricao": "Embalagens de material plástico (fabricação)",
        "cargaIncendio": 1000
      },
      "2223-4/00": {
        "descricao": "Tubos e acessórios de material plástico para uso na construção (fabricação)",
        "cargaIncendio": 1000
      },
      "2229-3/01": {
        "descricao": "Artefatos de material plástico para uso pessoal e doméstico (fabricação); Plásticos em geral (artigos)",
        "cargaIncendio": 1000
      },
      "2229-3/02": {
        "descricao": "Artefatos de material plástico para usos industriais (fabricação)",
        "cargaIncendio": 1000
      },
      "2229-3/03": {
        "descricao": "Artefatos de material plástico para uso na construção, exceto tubos e acessórios (fabricação)",
        "cargaIncendio": 1000
      },
      "2229-3/99": {
        "descricao": "Artefatos de material plástico para outros usos não especificados anteriormente (fabricação)",
        "cargaIncendio": 1000
      },
      "2610-8/00": {
        "descricao": "Componentes eletrônicos (fabricação)",
        "cargaIncendio": 400
      },
      "2621-3/00": {
        "descricao": "Informática – Fabricação de equipamentos de informática",
        "cargaIncendio": 400
      },
      "2622-1/00": {
        "descricao": "Informática – Fabricação de periféricos para equipamentos de informática",
        "cargaIncendio": 400
      },
      "2631-1/00": {
        "descricao": "Transmissores de comunicação (fabricação de equipamentos, peças e acessórios)",
        "cargaIncendio": 400
      },
      "2632-9/00": {
        "descricao": "Aparelhos telefônicos e de outros equipamentos de comunicação, peças e acessórios (fabricação)",
        "cargaIncendio": 400
      },
      "2640-0/00": {
        "descricao": "Aparelhos de recepção, reprodução, gravação e amplificação de áudio e vídeo (fabricação)",
        "cargaIncendio": 400
      },
      "2651-5/00": {
        "descricao": "Aparelhos e equipamentos de medida, teste e controle (fabricação)",
        "cargaIncendio": 400
      },
      "2652-3/00": {
        "descricao": "Cronômetros e relógio s(fabricação)",
        "cargaIncendio": 400
      },
      "2660-4/00": {
        "descricao": "Aparelhos eletromédicos e eletroterapêuticos e equipamentos de irradiação (fabricação)",
        "cargaIncendio": 400
      },
      "2670-1/01": {
        "descricao": "Ópticos – Aparelhos, equipamentos e instrumentos ópticos, peças e acessórios (fabricação)",
        "cargaIncendio": 400
      },
      "2670-1/02": {
        "descricao": "Aparelhos fotográficos e cinematográficos (fabricação de equipamentos, peças e acessórios)",
        "cargaIncendio": 400
      },
      "2680-9/00": {
        "descricao": "Mídias virgens, magnéticas e ópticas (fabricação)",
        "cargaIncendio": 400
      },
      "2721-0/00": {
        "descricao": "Pilhas, baterias e acumuladores elétricos, exceto para veículos automotores (fabricação)",
        "cargaIncendio": 800
      },
      "2722-8/01": {
        "descricao": "Baterias e acumuladores para veículos automotores (fabricação)",
        "cargaIncendio": 800
      },
      "2722-8/02": {
        "descricao": "Baterias e acumuladores para veículos automotores (recondicionamento)",
        "cargaIncendio": 800
      },
      "2731-7/00": {
        "descricao": "Aparelhos e equipamentos para distribuição e controle de energia elétrica(fabricação)",
        "cargaIncendio": 400
      },
      "2751-1/00": {
        "descricao": "Fogões, refrigeradores e máquinas de lavar e secar para uso doméstico, peças e acessórios (fabricação)",
        "cargaIncendio": 1000
      },
      "2759-7/01": {
        "descricao": "Aparelhos elétricos de uso pessoal, peças e acessórios (fabricação)",
        "cargaIncendio": 400
      },
      "2759-7/99": {
        "descricao": "Aparelhos eletrodomésticos não especificados anteriormente (fabricação de aparelhos, peças e acessórios)",
        "cargaIncendio": 400
      },
      "2790-2/01": {
        "descricao": "Eletrodos, contatos e outros artigos de carvão e grafita para uso elétrico, eletroímãs e isoladores (fabricação)",
        "cargaIncendio": 400
      },
      "2790-2/02": {
        "descricao": "Aparelhos e equipamentos para sinalização e alarme (fabricação)",
        "cargaIncendio": 400
      },
      "2790-2/99": {
        "descricao": "Aparelhos e equipamentos elétricos não especificados anteriormente (fabricação)",
        "cargaIncendio": 400
      },
      "2823-2/00": {
        "descricao": "Aparelhos e máquinas de refrigeração e ventilação para uso industrial e comercial (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 1000
      },
      "2824-1/01": {
        "descricao": "Aparelhos e equipamentos de ar-condicionado para uso industrial (fabricação)",
        "cargaIncendio": 1000
      },
      "2824-1/02": {
        "descricao": "Aparelhos e equipamentos de ar-condicionado para uso não - industrial (fabricação)",
        "cargaIncendio": 1000
      },
      "2910-7/01": {
        "descricao": "Automóveis, camionetas e utilitários (fabricação)",
        "cargaIncendio": 500
      },
      "2910-7/02": {
        "descricao": "Automóveis – Fabricação de chassis com motor para automóveis, camionetas e utilitários",
        "cargaIncendio": 500
      },
      "2910-7/03": {
        "descricao": "Automóveis – Fabricação de motores para automóveis, camionetas e utilitários",
        "cargaIncendio": 500
      },
      "2920-4/01": {
        "descricao": "Automóveis – Fabricação de caminhões e ônibus",
        "cargaIncendio": 500
      },
      "2920-4/02": {
        "descricao": "Automóveis – Fabricação de motores para caminhões e ônibus",
        "cargaIncendio": 500
      },
      "2930-1/01": {
        "descricao": "Automóveis – Fabricação de cabines, carrocerias e reboques para caminhões",
        "cargaIncendio": 500
      },
      "2930-1/02": {
        "descricao": "Automóveis – Fabricação de carrocerias para ônibus",
        "cargaIncendio": 500
      },
      "2930-1/03": {
        "descricao": "Automóveis – Fabricação de cabines, carrocerias e reboques para outros veículos automotores, exceto caminhões e ônibus",
        "cargaIncendio": 500
      },
      "2949-2/01": {
        "descricao": "Automóveis – Fabricação de bancos e estofados para veículos automotores",
        "cargaIncendio": 600
      },
      "3011-3/01": {
        "descricao": "Embarcações de grande porte (construção)",
        "cargaIncendio": 700
      },
      "3011-3/02": {
        "descricao": "Embarcações para uso comercial e para usos especiais, exceto de grande porte(construção)",
        "cargaIncendio": 700
      },
      "3012-1/00": {
        "descricao": "Embarcações para esporte e lazer (construção)",
        "cargaIncendio": 700
      },
      "3031-8/00": {
        "descricao": "Ferroviário – Fabricação de locomotivas, vagões e outros materiais rodantes",
        "cargaIncendio": 500
      },
      "3032-6/00": {
        "descricao": "Ferroviário – Fabricação de peças e acessórios para veículos ferroviários",
        "cargaIncendio": 500
      },
      "3041-5/00": {
        "descricao": "Aeronaves – Fabricação de aeronaves",
        "cargaIncendio": 600
      },
      "3042-3/00": {
        "descricao": "Aeronaves – Fabricação de turbinas, motores e outros componentes e peças para aeronaves",
        "cargaIncendio": 600
      },
      "3050-4/00": {
        "descricao": "Transporte – Veículos militares de combate (fabricação)",
        "cargaIncendio": 500
      },
      "3091-1/00": {
        "descricao": "Motocicletas (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 500
      },
      "3099-7/00": {
        "descricao": "Transporte – Fabricação de equipamentos de transporte não especificados anteriormente",
        "cargaIncendio": 500
      },
      "3101-2/00": {
        "descricao": "Móveis com predominância de madeira (fabricação)",
        "cargaIncendio": 600
      },
      "3102-1/00": {
        "descricao": "Móveis com predominância de metal (fabricação)",
        "cargaIncendio": 600
      },
      "3103-9/00": {
        "descricao": "Móveis de outros materiais, exceto madeira e metal (fabricação)",
        "cargaIncendio": 600
      },
      "3220-5/00": {
        "descricao": "Instrumentos musicais (fabricação, incluindo peças e acessórios)",
        "cargaIncendio": 600
      },
      "3230-2/00": {
        "descricao": "Esporte (fabricação de artefatos); Pesca (fabricação de artefatos)",
        "cargaIncendio": 800
      },
      "3240-0/01": {
        "descricao": "Jogos eletrônicos (fabricação)",
        "cargaIncendio": 400
      },
      "3240-0/02": {
        "descricao": "Mesas de bilhar, de sinuca e acessórios não associada à locação (fabricação)",
        "cargaIncendio": 600
      },
      "3240-0/03": {
        "descricao": "Mesas de bilhar, de sinuca e acessórios associada à locação (fabricação)",
        "cargaIncendio": 600
      },
      "3240-0/99": {
        "descricao": "Brinquedos; Jogos recreativos e brinquedos não especificados anteriormente (fabricação)",
        "cargaIncendio": 600
      },
      "3250-7/01": {
        "descricao": "Instrumentos não-eletrônicos e utensílios para uso médico, cirúrgico, odontológico e de laboratório (fabricação)",
        "cargaIncendio": 400
      },
      "3250-7/02": {
        "descricao": "Mobiliário para uso médico, cirúrgico, odontológico e de laboratório (fabricação)",
        "cargaIncendio": 400
      },
      "3250-7/03": {
        "descricao": "Aparelhos e utensílios para correção de defeitos físicos",
        "cargaIncendio": 400
      },
      "3250-7/05": {
        "descricao": "Materiais para medicina e odontologia (fabricação)",
        "cargaIncendio": 400
      },
      "3250-7/06": {
        "descricao": "Serrarias sem desdobramento de madeira",
        "cargaIncendio": 400
      },
      "3250-7/07": {
        "descricao": "Óptico – Fabricação de artigos ópticos",
        "cargaIncendio": 400
      },
      "3250-7/08": {
        "descricao": "Tecido não tecido para uso odonto-médico-hospitalar (fabricação de artefatos)",
        "cargaIncendio": 400
      },
      "3291-4/00": {
        "descricao": "Escovas, pincéis e vassouras (fabricação); Vassouras",
        "cargaIncendio": 700
      },
      "3292-2/01": {
        "descricao": "Roupas de proteção e segurança e resistentes a fogo (fabricação)",
        "cargaIncendio": 300
      },
      "3292-2/02": {
        "descricao": "Equipamentos e acessórios para segurança pessoal e profissional (fabricação)",
        "cargaIncendio": 1000
      },
      "3299-0/02": {
        "descricao": "Canetas, lápis e outros artigos para escritório (fabricação); Lápis",
        "cargaIncendio": 600
      },
      "3299-0/03": {
        "descricao": "Letras, letreiros e placas de qualquer material, exceto luminosos (fabricação)",
        "cargaIncendio": 1000
      },
      "3299-0/04": {
        "descricao": "Painéis e letreiros luminosos (fabricação)",
        "cargaIncendio": 1000
      },
      "3299-0/05": {
        "descricao": "Aviamentos para costura (fabricação)",
        "cargaIncendio": 700
      },
      "3299-0/99": {
        "descricao": "Produtos diversos não especificados anteriormente (fabricação)",
        "cargaIncendio": 600
      },
      "3530-1/00": {
        "descricao": "Vapor, água quente e ar-condicionado (produção e distribuição)",
        "cargaIncendio": 400
      }
    },
    "I-3": {
      "0500-3/01": {
        "descricao": "Carvão mineral (Extração)",
        "cargaIncendio": 3000
      },
      "0500-3/02": {
        "descricao": "Carvão mineral (Beneficiamento)",
        "cargaIncendio": 3000
      },
      "0600-0/02": {
        "descricao": "Xisto (extração e beneficiamento)",
        "cargaIncendio": 3000
      },
      "0600-0/03": {
        "descricao": "Areias betuminosas (extração e beneficiamento)",
        "cargaIncendio": 3000
      },
      "1011-2/01": {
        "descricao": "Frigorífico - Abate de bovinos",
        "cargaIncendio": 2000
      },
      "1011-2/02": {
        "descricao": "Frigorífico - Abate de equinos",
        "cargaIncendio": 2000
      },
      "1011-2/03": {
        "descricao": "Frigorífico - Abate de ovinos e caprinos",
        "cargaIncendio": 2000
      },
      "1011-2/04": {
        "descricao": "Frigorífico - Abate de bufalinos",
        "cargaIncendio": 2000
      },
      "1012-1/03": {
        "descricao": "Frigorífico - abate de suínos",
        "cargaIncendio": 2000
      },
      "1061-9/01": {
        "descricao": "Arroz (beneficiamento)",
        "cargaIncendio": 1700
      },
      "1062-7/00": {
        "descricao": "Trigo (moagem e fabricação de derivados)",
        "cargaIncendio": 2000
      },
      "1063-5/00": {
        "descricao": "Mandioca (moagem e fabricação de derivados)",
        "cargaIncendio": 2000
      },
      "1064-3/00": {
        "descricao": "Milho (moagem e fabricação de derivados, exceto óleos de milho)",
        "cargaIncendio": 2000
      },
      "1065-1/01": {
        "descricao": "Amidos e féculas de vegetais (fabricação)",
        "cargaIncendio": 2000
      },
      "1066-0/00": {
        "descricao": "Ração",
        "cargaIncendio": 2000
      },
      "1811-3/01": {
        "descricao": "Gráfica – Impressão de jornais",
        "cargaIncendio": 2000
      },
      "1811-3/02": {
        "descricao": "Gráfica – Impressão de livros, revistas e outras publicações periódicas",
        "cargaIncendio": 2000
      },
      "1812-1/00": {
        "descricao": "Gráfica – Impressão de material de segurança",
        "cargaIncendio": 2000
      },
      "1910-1/00": {
        "descricao": "Coquerias",
        "cargaIncendio": 4000
      },
      "1921-7/00": {
        "descricao": "Petróleo – Fabricação de produtos do refino de petróleo",
        "cargaIncendio": 4000
      },
      "1922-5/01": {
        "descricao": "Formulação de combustíveis",
        "cargaIncendio": 4000
      },
      "1922-5/99": {
        "descricao": "Petróleo – Fabricação de outros produtos derivados do petróleo, exceto produtos do refino",
        "cargaIncendio": 3000
      },
      "1931-4/00": {
        "descricao": "Álcool (fabricação)",
        "cargaIncendio": 3000
      },
      "1932-2/00": {
        "descricao": "Biocombustíveis, exceto álcool (fabricação)",
        "cargaIncendio": 3000
      },
      "2011-8/00": {
        "descricao": "Cloro e álcalis (fabricação)",
        "cargaIncendio": 2000
      },
      "2019-3/01": {
        "descricao": "Combustíveis nucleares (elaboração)",
        "cargaIncendio": 3000
      },
      "2021-5/00": {
        "descricao": "Produtos graxos; Produtos petroquímicos básicos (fabricação)",
        "cargaIncendio": 1000
      },
      "2031-2/00": {
        "descricao": "Resinas termoplásticas (fabricação)",
        "cargaIncendio": 3000
      },
      "2032-1/00": {
        "descricao": "Resinas termofixas (fabricação)",
        "cargaIncendio": 3000
      },
      "2033-9/00": {
        "descricao": "Elastômeros (fabricação)",
        "cargaIncendio": 3000
      },
      "2052-5/00": {
        "descricao": "Desinfetantes domissanitários (fabricação)",
        "cargaIncendio": 2000
      },
      "2061-4/00": {
        "descricao": "Sabões e detergentes sintéticos (fabricação)",
        "cargaIncendio": 700
      },
      "2062-2/00": {
        "descricao": "Cera de polimento; Produtos de limpeza e polimento (fabricação)",
        "cargaIncendio": 2000
      },
      "2071-1/00": {
        "descricao": "Tintas, vernizes, esmaltes e lacas (fabricação)",
        "cargaIncendio": 4000
      },
      "2072-0/00": {
        "descricao": "Tintas de impressão (fabricação)",
        "cargaIncendio": 4000
      },
      "2073-8/00": {
        "descricao": "Impermeabilizantes, solventes e produtos afins (fabricação)",
        "cargaIncendio": 4000
      },
      "2229-3/01": {
        "descricao": "Materiais sintéticos ou plásticos",
        "cargaIncendio": 1000
      },
      "2550-1/01": {
        "descricao": "Equipamento bélico pesado, exceto veículos militares de combate (fabricação)",
        "cargaIncendio": 4000
      },
      "2550-1/02": {
        "descricao": "Armas de fogo e munições (fabricação)",
        "cargaIncendio": 4000
      },
      "3104-7/00": {
        "descricao": "Colchões (fabricação); Espumas",
        "cargaIncendio": 3000
      }
    },
    "J-1": {},
    "J-2": {},
    "J-3": {},
    "J-4": {},
    "K-1": {
      "3511-5/00": {
        "descricao": "Energia elétrica (geração)",
        "cargaIncendio": 200
      },
      "3512-3/00": {
        "descricao": "Energia elétrica (transmissão)",
        "cargaIncendio": 200
      },
      "3513-1/00": {
        "descricao": "Energia elétrica (comércio atacadista)",
        "cargaIncendio": 200
      },
      "3514-0/00": {
        "descricao": "Energia elétrica (distribuição)",
        "cargaIncendio": 200
      }
    },
    "L-1": {
      "4789-0/06": {
        "descricao": "Fogos de artifício e artigos pirotécnicos (comércio varejista)",
        "cargaIncendio": 2100
      }
    },
    "L-2": {
      "2092-4/01": {
        "descricao": "Fabricação de pólvoras, explosivos e detonantes",
        "cargaIncendio": 4000
      },
      "2092-4/02": {
        "descricao": "Fabricação de artigos pirotécnicos",
        "cargaIncendio": 4000
      },
      "2092-4/03": {
        "descricao": "Fabricação de fósforos de segurança",
        "cargaIncendio": 4000
      }
    },
    "L-3": {
      "2092-4/01": {
        "descricao": "Depósito de pólvoras, explosivos e detonantes",
        "cargaIncendio": 4000
      }
    },
    "M-2": {
      "0600-0/01": {
        "descricao": "Petróleo e gás natural (extração)",
        "cargaIncendio": 4000
      },
      "3520-4/01": {
        "descricao": "Gás natural (processamento)",
        "cargaIncendio": 4000
      },
      "3520-4/02": {
        "descricao": "Combustíveis gasosos por redes urbanas (distribuição)",
        "cargaIncendio": 200
      },
      "4681-8/01": {
        "descricao": "Combustíveis – Álcool carburante, biodiesel, gasolina e demais derivados de petróleo, exceto lubrificantes, não realizado por transportador retalhista – TRR (comércio atacadista)",
        "cargaIncendio": 2100
      },
      "4681-8/02": {
        "descricao": "Combustíveis – Álcool carburante, biodiesel, gasolina e demais derivados de petróleo, realizado por transportador retalhista – TRR (comércio atacadista)",
        "cargaIncendio": 2100
      },
      "4681-8/03": {
        "descricao": "Combustíveis de origem vegetal, exceto álcool carburante (comércio atacadista)",
        "cargaIncendio": 4000
      },
      "4681-8/04": {
        "descricao": "Combustíveis de origem mineral em bruto (comércio atacadista)",
        "cargaIncendio": 2100
      },
      "4681-8/05": {
        "descricao": "Lubrificantes (comércio atacadista)",
        "cargaIncendio": 2100
      },
      "4682-6/00": {
        "descricao": "Gás liquefeito de petróleo – GLP (comércio atacadista)",
        "cargaIncendio": 2100
      },
      "4784-9/00": {
        "descricao": "Gás liquefeito de petróleo – GLP (comércio varejista, revenda)",
        "cargaIncendio": 2100
      }
    },
    "M-5": {
      "3811-4/00": {
        "descricao": "Resíduos não-perigosos (coleta)",
        "cargaIncendio": 300
      },
      "3812-2/00": {
        "descricao": "Resíduos perigosos (coleta)",
        "cargaIncendio": 500
      },
      "3821-1/00": {
        "descricao": "Resíduos não-perigosos (tratamento e disposição)",
        "cargaIncendio": 300
      },
      "3822-0/00": {
        "descricao": "Resíduos perigosos (tratamento e disposição)",
        "cargaIncendio": 500
      },
      "3831-9/01": {
        "descricao": "Sucatas de alumínio (recuperação)",
        "cargaIncendio": 200
      },
      "3831-9/99": {
        "descricao": "Materiais metálicos, exceto alumínio (recuperação)",
        "cargaIncendio": 300
      },
      "3832-7/00": {
        "descricao": "Materiais plásticos (recuperação)",
        "cargaIncendio": 2000
      },
      "3839-4/01": {
        "descricao": "Usinas de compostagem",
        "cargaIncendio": 200
      },
      "3839-4/99": {
        "descricao": "Materiais não especificados anteriormente (recuperação)",
        "cargaIncendio": 800
      }
    },
    "M-6": {
      "9103-1/00": {
        "descricao": "Parques nacionais, reservas ecológicas e áreas de proteção ambiental",
        "cargaIncendio": 500
      }
    }
  }
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('MA', 'nts', $j${
  "nts_padrao_ma": [
    {
      "numero": "NT 01",
      "nome": "Procedimentos administrativos e medidas de segurança"
    },
    {
      "numero": "NT 03",
      "nome": "Terminologia de segurança contra incêndio e emergências"
    },
    {
      "numero": "NT 04",
      "nome": "Símbolos gráficos para projetos de segurança contra incêndio e emergências"
    }
  ],
  "nts_por_sistema": {
    "acesso_viatura": {
      "numero": "NT 06",
      "nome": "Acesso de viaturas nas edificações e áreas de risco"
    },
    "seg_estrutural": {
      "numero": "NT 08",
      "nome": "Segurança estrutural contra incêndio"
    },
    "compart_horizontal": {
      "numero": "NT 09",
      "nome": "Compartimentação horizontal e vertical"
    },
    "compart_vertical": {
      "numero": "NT 09",
      "nome": "Compartimentação horizontal e vertical"
    },
    "controle_acabamento": {
      "numero": "NT 10",
      "nome": "Controle de material de acabamento e revestimento"
    },
    "saida_emergencia": {
      "numero": "NT 11",
      "nome": "Saída de emergência"
    },
    "gerenciamento_risco": {
      "numero": "NT 16",
      "nome": "Gerenciamento de risco"
    },
    "brigada": {
      "numero": "NT 17",
      "nome": "Brigada de Incêndio"
    },
    "iluminacao": {
      "numero": "NT 18",
      "nome": "Iluminação de emergência"
    },
    "alarme": {
      "numero": "NT 19",
      "nome": "Sistema de detecção e alarme de incêndio"
    },
    "deteccao": {
      "numero": "NT 19",
      "nome": "Sistema de detecção e alarme de incêndio"
    },
    "sinalizacao": {
      "numero": "NT 20",
      "nome": "Sinalização de Emergência"
    },
    "extintores": {
      "numero": "NT 21",
      "nome": "Sistema de proteção por extintores"
    },
    "hidrantes": {
      "numero": "NT 22",
      "nome": "Sistema de hidrantes e mangotinhos"
    },
    "sprinklers": {
      "numero": "NT 23",
      "nome": "Sistema de proteção por chuveiros automáticos"
    },
    "central_gas": {
      "numero": "NT 28",
      "nome": "Manipulação, armazenamento, comercialização e utilização de Gás Liquefeito de Petróleo (GLP)"
    },
    "controle_fumaca": {
      "numero": "NT 15",
      "nome": "Controle de Fumaça"
    },
    "spda": {
      "numero": "NBR 5419",
      "nome": "Proteção de estruturas contra descargas atmosféricas"
    }
  },
  "nt_carga_incendio": {
    "numero": "NT 14",
    "nome": "Carga de incêndio"
  }
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();

