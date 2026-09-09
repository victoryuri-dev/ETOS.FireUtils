-- Parte de uma migração maior (base normativa central — ver
-- 20260906120002_seed_normas_restantes_ma.sql original) dividida em um
-- arquivo por sistema pra rodar e conferir um de cada vez no SQL Editor
-- do Supabase (o arquivo único de ~235KB/7 mil linhas não deixou nenhuma
-- linha nova gravada, sem erro nenhum reportado — mais fácil de
-- diagnosticar rodando aos pedaços do que investigar o motivo exato).

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
