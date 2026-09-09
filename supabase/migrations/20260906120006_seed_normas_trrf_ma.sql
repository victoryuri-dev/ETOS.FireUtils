-- Parte de uma migração maior (base normativa central — ver
-- 20260906120002_seed_normas_restantes_ma.sql original) dividida em um
-- arquivo por sistema pra rodar e conferir um de cada vez no SQL Editor
-- do Supabase (o arquivo único de ~235KB/7 mil linhas não deixou nenhuma
-- linha nova gravada, sem erro nenhum reportado — mais fácil de
-- diagnosticar rodando aos pedaços do que investigar o motivo exato).

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
