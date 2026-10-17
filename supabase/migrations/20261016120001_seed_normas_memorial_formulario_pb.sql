-- Semeia normas_dados com os parâmetros do formulário do Memorial Descritivo
-- do CBMPB (sistema novo: 'memorial_formulario'). A Paraíba exige o próprio
-- formulário do CBMPB como memorial (seções fixas de marcar X), em vez do
-- memorial em texto corrido do Maranhão — ver src/data/memorial/PB/formulario.js.
--
-- Aqui ficam só os parâmetros que decidem o que é marcado (faixas de altura
-- e de carga de incêndio, classes de GLP da NBR 15514, linhas do CMAR,
-- capacidade extintora por nível, riscos especiais, estágios de construção,
-- limites do acesso de viatura),
-- todos transcritos do próprio formulário. Mesmo conteúdo de
-- src/data/normas/PB/memorial_formulario.js (fonte deste seed) — gerado
-- a partir dele, não editar só um dos dois. Chaves em minúsculo, como nos
-- demais sistemas (ver renomearDaBaseCentral em src/data/normas/index.js).
--
-- A existência desta linha também é o que faz o site tratar a PB como estado
-- de "memorial em formulário" (usaMemorialFormulario). Classificação e
-- exigências ('ocupacoes' e 'medidas_seguranca' da PB) já estão no banco —
-- esta migração não toca nelas.

insert into public.normas_dados (uf, sistema, dados, versao) values
  ('PB', 'memorial_formulario', $j${
  "acesso_viatura": {
    "semRecalque": {
      "edificacaoMax": 20
    },
    "comRecalque": {
      "recalqueMax": 20,
      "edificacaoMax": 50
    },
    "via": {
      "larguraMin": 6,
      "larguraReduzidaMin": 5,
      "alturaLivreMin": 4.5,
      "cargaKgf": 25000,
      "distanciaEdificacaoSemHidrante": 20,
      "distanciaRecalqueComHidrante": 10
    },
    "portao": {
      "larguraMin": 4,
      "alturaMin": 4.5
    },
    "retorno": {
      "larguraAbaixoDe": 6,
      "comprimentoAcimaDe": 30,
      "opcoes": [
        "circular",
        "em \"Y\"",
        "em \"T\""
      ]
    },
    "faixaEstacionamento": {
      "larguraMin": 6,
      "comprimentoMin": 15,
      "desnivelMaxPct": 5,
      "distanciaFaceMax": 8
    }
  },
  "classes_altura": [
    {
      "classe": "I",
      "nome": "Edificação térrea",
      "max": 0
    },
    {
      "classe": "II",
      "nome": "Edificação baixa (H ≤ 6m)",
      "max": 6
    },
    {
      "classe": "III",
      "nome": "Edificação baixa –média altura (6m < H ≤ 12m)",
      "max": 12
    },
    {
      "classe": "IV",
      "nome": "Edificação de média altura (12m < H ≤ 23m)",
      "max": 23
    },
    {
      "classe": "V",
      "nome": "Edificação medianamente alta (23m < H ≤ 30m)",
      "max": 30
    }
  ],
  "classes_glp": [
    {
      "key": "I",
      "label": "CLASSE I – Até 520 kg",
      "coluna": "exigivel"
    },
    {
      "key": "II",
      "label": "CLASSE II – Até 1.560 kg",
      "coluna": "exigivel"
    },
    {
      "key": "III",
      "label": "CLASSE III – Até 6.240 kg",
      "coluna": "exigivel"
    },
    {
      "key": "IV",
      "label": "CLASSE IV – Até 12.480 kg",
      "coluna": "exigivel"
    },
    {
      "key": "V",
      "label": "CLASSE V – Até 24.960 kg",
      "coluna": "nao_exigivel"
    },
    {
      "key": "VI",
      "label": "CLASSE VI – Até 49.920 kg",
      "coluna": "nao_exigivel"
    },
    {
      "key": "VII",
      "label": "CLASSE VII – Até 99.840 kg",
      "coluna": "nao_exigivel"
    },
    {
      "key": "especial",
      "label": "ESPECIAL – Acima de 99.840 kg",
      "coluna": "nao_exigivel"
    }
  ],
  "cmar_linhas": [
    {
      "key": "a",
      "ocupacoes": [
        "A"
      ],
      "classes": {
        "piso": "I, II-A, III-A ou IV-A",
        "parede": "I, II-A ou III-A",
        "teto": "I, II-A ou III-A",
        "fachada": "I a II-B"
      },
      "texto": "Natureza da ocupação A e Cond. Residencial (Classe I, II-A, III-A ou IV-A no Piso; ClasseI, II-A ou III-A na Parede, Classe I, II-A ou III-A no Teto e Fachada Classe I a II-B)"
    },
    {
      "key": "b",
      "ocupacoes": [
        "B",
        "D",
        "E",
        "G",
        "H",
        "I-1",
        "J-1",
        "J-2"
      ],
      "classes": {
        "piso": "I, II-A, III-A ou IV-A",
        "parede": "I ou II-A",
        "teto": "I ou II-A",
        "fachada": "I a II-B"
      },
      "texto": "Natureza da ocupação B, D, E, G, H, I1, J1 e J2 (Classe I, II-A, III-A ou IV-A no Piso;Classe I ou II-A na Parede, Classe I ou II-A no Teto e Fachada Classe I a II-B)"
    },
    {
      "key": "c",
      "ocupacoes": [
        "C",
        "F",
        "I-2",
        "I-3",
        "J-3",
        "J-4",
        "L-1",
        "M-2",
        "M-3"
      ],
      "classes": {
        "piso": "I, II-A, III-A ou IV-A",
        "parede": "I ou II-A",
        "teto": "I ou II-A",
        "fachada": "I a II-B"
      },
      "texto": "Natureza da ocupação C, F, I2, I3, J3, J4, L1, M2 e M3 (Classe I, II-A, III-A ou IV-A no Piso;Classe I ou II-A na Parede, Classe I ou II-A no Teto e Fachada Classe I a II-B)"
    }
  ],
  "divisoes_fora_do_formulario": [
    "A-1"
  ],
  "estagios_construcao": [
    {
      "key": "a_construir",
      "label": "A edificação ainda será construída"
    },
    {
      "key": "existente_nt16",
      "label": "A edificação já é existente (as built) e terá adaptações descritas na NT 16/2018 CBMPB"
    },
    {
      "key": "existente_atual",
      "label": "A edificação já é existente (as built) e seguirá a segurança contra incêndio atual"
    },
    {
      "key": "existente_rt",
      "label": "A edificação já é existente (as built) e utilizará as Resoluções Técnicas do CBMPB"
    },
    {
      "key": "ptiot",
      "label": "Projeto Técnico para Instalação e Ocupação Técnica (PTIOT)"
    },
    {
      "key": "ptotep",
      "label": "Projeto Técnico para Ocupação Temporária em Edificação Permanente (PTOTEP)"
    }
  ],
  "extintores_nivel": [
    {
      "key": "nivel_I",
      "nivel": "I",
      "texto": "Edificação de nível I com capacidade extintora mínima de 2A e 20BC"
    },
    {
      "key": "nivel_II",
      "nivel": "II",
      "texto": "Edificação de nível II com capacidade extintora mínima de 3A e 40BC"
    },
    {
      "key": "nivel_III_3A",
      "nivel": "III",
      "texto": "Edificação de nível III com capacidade extintora mínima de 3A e 40BC",
      "detalhe": "(diminuindo distância máxima a ser percorrido, observar a NT 21)"
    },
    {
      "key": "nivel_III_4A",
      "nivel": "III",
      "texto": "Edificação de nível III com capacidade extintora mínima de 4A e 80BC"
    }
  ],
  "formas_apresentacao": [
    {
      "key": "pci",
      "label": "Projeto de Segurança contra Incêndio - PCI"
    },
    {
      "key": "ptiot",
      "label": "Projeto Técnico para Instalação e Ocupação Temporária (PTIOT)"
    },
    {
      "key": "ptotep",
      "label": "Projeto Técnico para Ocupação Temporária em Edificação Permanente (PTOTEP)"
    }
  ],
  "modelos_plano": [
    {
      "key": "item6",
      "label": "Foi elaborado conforme determina as prescrições do item 6 NT 13/2023"
    },
    {
      "key": "anexoB",
      "label": "Foi utilizado como modelo do anexo B da NT 13/2023"
    }
  ],
  "niveis_carga": [
    {
      "nivel": "I",
      "label": "Carga incêndio total da edificação até 300 MJ/m²",
      "max": 300
    },
    {
      "nivel": "II",
      "label": "Carga incêndio total da edificação de 301 MJ/m² até 1200MJ/m²",
      "max": 1200
    },
    {
      "nivel": "III",
      "label": "Carga incêndio total da edificação acima de 1200 MJ/m²",
      "max": null
    }
  ],
  "norma": {
    "estado": "PB",
    "nome": "Memorial Descritivo do Projeto de Segurança Contra Incêndio — CBMPB",
    "orgao": "Corpo de Bombeiros Militar da Paraíba — CBMPB",
    "diretoria": "Diretoria de Segurança e Prevenção Contra Incêndio – DSPCI",
    "secao": "Seção de Análise de Projeto"
  },
  "riscos_especiais": [
    {
      "key": "liquidos_inflamaveis",
      "label": "Armazenamento de líquidos inflamáveis"
    },
    {
      "key": "fogos_artificio",
      "label": "Fogos de artifício"
    },
    {
      "key": "produtos_perigosos",
      "label": "Armazenamento de produtos perigosos"
    },
    {
      "key": "vasos_pressao",
      "label": "Vaso sob pressão (caldeira, O₂,)"
    },
    {
      "key": "glp",
      "label": "Gás Liquefeito de Petróleo - GLP"
    },
    {
      "key": "outros",
      "label": "Outros (especificar):"
    },
    {
      "key": "tendas_inflamaveis",
      "label": "Tendas ou coberturas inflamáveis"
    },
    {
      "key": "geradores_eletricos",
      "label": "Geradores elétricos"
    },
    {
      "key": "estrutura_montada",
      "label": "Sistemas de estrutura montada"
    },
    {
      "key": "sistemas_eletricos_montados",
      "label": "Sistemas elétricos montados (som,iluminação, etc...)"
    }
  ],
  "riscos_validade": [
    {
      "risco": "baixo",
      "label": "Baixo",
      "validade": "Validade 5 (cinco) anos para nova vistoria",
      "max": 300
    },
    {
      "risco": "medio",
      "label": "Médio",
      "validade": "Validade 2 (dois) anos para nova vistoria",
      "max": 1200
    },
    {
      "risco": "alto",
      "label": "Alto",
      "validade": "Validade 1 (um) ano para nova vistoria",
      "max": null
    }
  ]
}$j$::jsonb, 1)
on conflict (uf, sistema) do update set dados = excluded.dados, versao = normas_dados.versao + 1, atualizado_em = now();
