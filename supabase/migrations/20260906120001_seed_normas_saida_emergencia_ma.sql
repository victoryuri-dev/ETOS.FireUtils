-- Semeia normas_dados com a tabela de Saídas de Emergência do Maranhão,
-- reconciliada a partir das duas cópias que existiam até aqui:
--   site:   src/data/normas/MA/saida_emergencia.js
--   plugin: Fire Utils.tab/lib/normas/MA/saidas.py
--
-- As duas batiam campo a campo em quase tudo. Duas diferenças reais foram
-- encontradas ao reconciliar (registradas também em "_pendencias" dentro
-- do próprio JSON, para não ficarem só neste comentário de migração):
--
--   1. M-3, M-4 e M-5: o site tinha A=null ("consultar norma específica");
--      o plugin tinha valores numéricos (A=10, 4, 10) já em uso no cálculo
--      real de população. Mantidos os valores do plugin nesta migração —
--      PENDENTE revisar com o CBM-MA qual é o correto, especialmente M-4
--      (também diverge em AD/ER: plugin usa 60/45, site usa 100/60).
--   2. M-2, M-6, M-7 e M-8: existiam só no site (o plugin nunca teve
--      essas quatro divisões cadastradas). Incluídas aqui vindas do site.
--
-- distancias_maximas usa o formato mapa_ocupacao + grupos (o que já era
-- o formato do plugin) em vez do array de blocos do site — mesma
-- informação, só reorganizada; nenhum cálculo em produção (nem site nem
-- plugin) dependia do formato antigo do site para essa parte.

insert into public.normas_dados (uf, sistema, dados, versao)
values (
  'MA',
  'saida_emergencia',
  $json$
{
  "sigla": "MA",
  "nome": "Maranhão",
  "corpo": "CBM-MA",
  "norma_ocupacoes": "NT-01/2021 CBM-MA",
  "norma_saidas": "IT 11 CBMSP (adotada pelo MA) / NT 42/2019 CBMMA / NBR 9077",
  "_pendencias": [
    {
      "campo": "tabela.M-3, tabela.M-4, tabela.M-5",
      "descricao": "Site tinha A=null ('consultar norma específica'); plugin tinha valores numéricos (A=10, 4, 10) já em uso no cálculo real. Mantido o valor do plugin nesta migração. M-4 também diverge em AD/ER (plugin: 60/45, site: 100/60). Revisar com o CBM-MA qual é o correto.",
      "revisado": false
    },
    {
      "campo": "ocupacoes/tabela/distancias_maximas: M-2, M-6, M-7, M-8",
      "descricao": "Existiam só no site; o plugin nunca teve essas 4 divisões cadastradas. Incluídas aqui vindas do site. Conferir se o plugin deveria reconhecê-las (ex.: em 'Identificar Ambiente').",
      "revisado": false
    }
  ],
  "ocupacoes": {
    "A-1": {"grupo": "A", "uso": "Residencial", "descricao": "Habitação unifamiliar"},
    "A-2": {"grupo": "A", "uso": "Residencial", "descricao": "Habitação multifamiliar"},
    "A-3": {"grupo": "A", "uso": "Residencial", "descricao": "Habitação coletiva"},
    "B-1": {"grupo": "B", "uso": "Serviço de Hospedagem", "descricao": "Hotel e assemelhado"},
    "B-2": {"grupo": "B", "uso": "Serviço de Hospedagem", "descricao": "Hotel residencial"},
    "C-1": {"grupo": "C", "uso": "Comercial", "descricao": "Comércio com baixa carga de incêndio"},
    "C-2": {"grupo": "C", "uso": "Comercial", "descricao": "Comércio com média e alta carga de incêndio"},
    "C-3": {"grupo": "C", "uso": "Comercial", "descricao": "Shopping centers"},
    "D-1": {"grupo": "D", "uso": "Serviço Profissional", "descricao": "Local para prestação de serviço profissional"},
    "D-2": {"grupo": "D", "uso": "Serviço Profissional", "descricao": "Agência bancária"},
    "D-3": {"grupo": "D", "uso": "Serviço Profissional", "descricao": "Serviço de reparação"},
    "D-4": {"grupo": "D", "uso": "Serviço Profissional", "descricao": "Laboratório"},
    "E-1": {"grupo": "E", "uso": "Educacional e Cultura Física", "descricao": "Escola em geral"},
    "E-2": {"grupo": "E", "uso": "Educacional e Cultura Física", "descricao": "Escola especial"},
    "E-3": {"grupo": "E", "uso": "Educacional e Cultura Física", "descricao": "Espaço para cultura física"},
    "E-4": {"grupo": "E", "uso": "Educacional e Cultura Física", "descricao": "Centro de treinamento profissional"},
    "E-5": {"grupo": "E", "uso": "Educacional e Cultura Física", "descricao": "Pré-escola"},
    "E-6": {"grupo": "E", "uso": "Educacional e Cultura Física", "descricao": "Escola para portadores de deficiências"},
    "F-1": {"grupo": "F", "uso": "Local de Reunião de Público", "descricao": "Local com objeto de valor inestimável"},
    "F-2": {"grupo": "F", "uso": "Local de Reunião de Público", "descricao": "Local religioso e velório"},
    "F-3": {"grupo": "F", "uso": "Local de Reunião de Público", "descricao": "Centro esportivo e de exibição"},
    "F-4": {"grupo": "F", "uso": "Local de Reunião de Público", "descricao": "Estação e terminal de passageiros"},
    "F-5": {"grupo": "F", "uso": "Local de Reunião de Público", "descricao": "Arte cênica e auditório"},
    "F-6": {"grupo": "F", "uso": "Local de Reunião de Público", "descricao": "Clubes sociais e salão de festas"},
    "F-7": {"grupo": "F", "uso": "Local de Reunião de Público", "descricao": "Eventos temporários"},
    "F-8": {"grupo": "F", "uso": "Local de Reunião de Público", "descricao": "Local para refeição"},
    "F-9": {"grupo": "F", "uso": "Local de Reunião de Público", "descricao": "Recreação pública"},
    "F-10": {"grupo": "F", "uso": "Local de Reunião de Público", "descricao": "Exposição de objetos ou animais"},
    "F-11": {"grupo": "F", "uso": "Local de Reunião de Público", "descricao": "Boates"},
    "G-1": {"grupo": "G", "uso": "Serviço Automotivo", "descricao": "Garagem sem acesso ao público e sem abastecimento"},
    "G-2": {"grupo": "G", "uso": "Serviço Automotivo", "descricao": "Garagem com acesso ao público e sem abastecimento"},
    "G-3": {"grupo": "G", "uso": "Serviço Automotivo", "descricao": "Local dotado de abastecimento de combustível"},
    "G-4": {"grupo": "G", "uso": "Serviço Automotivo", "descricao": "Serviço de conservação, manutenção e reparos"},
    "G-5": {"grupo": "G", "uso": "Serviço Automotivo", "descricao": "Hangares"},
    "H-1": {"grupo": "H", "uso": "Saúde e Institucional", "descricao": "Hospital veterinário"},
    "H-2": {"grupo": "H", "uso": "Saúde e Institucional", "descricao": "Local para cuidados especiais"},
    "H-3": {"grupo": "H", "uso": "Saúde e Institucional", "descricao": "Hospital e assemelhado"},
    "H-4": {"grupo": "H", "uso": "Saúde e Institucional", "descricao": "Edificações das forças armadas e policiais"},
    "H-5": {"grupo": "H", "uso": "Saúde e Institucional", "descricao": "Local onde a liberdade das pessoas sofre restrições"},
    "H-6": {"grupo": "H", "uso": "Saúde e Institucional", "descricao": "Clínica e consultório médico e odontológico"},
    "I-1": {"grupo": "I", "uso": "Indústria", "descricao": "Indústria com carga de incêndio até 300 MJ/m²"},
    "I-2": {"grupo": "I", "uso": "Indústria", "descricao": "Indústria com carga de incêndio de 300 a 1.200 MJ/m²"},
    "I-3": {"grupo": "I", "uso": "Indústria", "descricao": "Indústria com carga de incêndio superior a 1.200 MJ/m²"},
    "J-1": {"grupo": "J", "uso": "Depósito", "descricao": "Depósito de material incombustível"},
    "J-2": {"grupo": "J", "uso": "Depósito", "descricao": "Depósito com carga de incêndio até 300 MJ/m²"},
    "J-3": {"grupo": "J", "uso": "Depósito", "descricao": "Depósito com carga de incêndio de 300 a 1.200 MJ/m²"},
    "J-4": {"grupo": "J", "uso": "Depósito", "descricao": "Depósito com carga de incêndio superior a 1.200 MJ/m²"},
    "K-1": {"grupo": "K", "uso": "Energia", "descricao": "Central de transmissão e distribuição de energia"},
    "L-1": {"grupo": "L", "uso": "Explosivo", "descricao": "Comércio de explosivos"},
    "L-2": {"grupo": "L", "uso": "Explosivo", "descricao": "Indústria de material explosivo"},
    "L-3": {"grupo": "L", "uso": "Explosivo", "descricao": "Depósito de material explosivo"},
    "M-1": {"grupo": "M", "uso": "Especial", "descricao": "Túnel"},
    "M-2": {"grupo": "M", "uso": "Especial", "descricao": "Líquido/gás inflamável"},
    "M-3": {"grupo": "M", "uso": "Especial", "descricao": "Central de comunicação"},
    "M-4": {"grupo": "M", "uso": "Especial", "descricao": "Canteiro de obras"},
    "M-5": {"grupo": "M", "uso": "Especial", "descricao": "Silos"},
    "M-6": {"grupo": "M", "uso": "Especial", "descricao": "Floresta"},
    "M-7": {"grupo": "M", "uso": "Especial", "descricao": "Pátio de contêineres"},
    "M-8": {"grupo": "M", "uso": "Especial", "descricao": "Torres de telefonia"}
  },
  "tabela": {
    "A-1": {"A": null, "AD": 60, "ER": 45, "PT": 100, "obs": "2 pessoas por dormitório", "notas": ["C"]},
    "A-2": {"A": null, "AD": 60, "ER": 45, "PT": 100, "obs": "2 pessoas por dormitório", "notas": ["C"]},
    "A-3": {"A": 4, "AD": 60, "ER": 45, "PT": 100, "obs": "2 por dormitório + 1 por 4m²", "notas": ["C", "D"]},
    "B-1": {"A": 15, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 15m²", "notas": ["E", "G"]},
    "B-2": {"A": 15, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 15m²", "notas": ["E", "G"]},
    "C-1": {"A": 3, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 3m²", "notas": ["E", "J", "M"]},
    "C-2": {"A": 3, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 3m²", "notas": ["E", "J", "M"]},
    "C-3": {"A": 3, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 3m²", "notas": ["E", "J", "M"]},
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
    "F-4": {"A": 3, "AD": 100, "ER": 75, "PT": 100, "obs": "1 pessoa por 3m²", "notas": ["E", "F", "J", "N"]},
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
    "M-1": {"A": null, "AD": 100, "ER": 75, "PT": 100, "obs": "Consultar NT específica (Túnel)", "notas": ["I"]},
    "M-2": {"A": null, "AD": 100, "ER": 75, "PT": 100, "obs": "Consultar NT específica (Líquido/gás inflamável)", "notas": ["I"]},
    "M-3": {"A": 10, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 10m²", "notas": []},
    "M-4": {"A": 4, "AD": 60, "ER": 45, "PT": 100, "obs": "1 pessoa por 4m²", "notas": []},
    "M-5": {"A": 10, "AD": 100, "ER": 60, "PT": 100, "obs": "1 pessoa por 10m²", "notas": []},
    "M-6": {"A": null, "AD": 100, "ER": 60, "PT": 100, "obs": "Consultar NT específica (Floresta)", "notas": ["I"]},
    "M-7": {"A": null, "AD": 100, "ER": 60, "PT": 100, "obs": "Consultar NT específica (Pátio de contêineres)", "notas": ["I"]},
    "M-8": {"A": null, "AD": 100, "ER": 60, "PT": 100, "obs": "Consultar NT específica (Torres de telefonia)", "notas": ["I"]}
  },
  "notas": {
    "C": "(C) Em apartamentos de até 2 dormitórios, a sala deve ser considerada como dormitório.",
    "D": "(D) Alojamento = dormitório coletivo, com mais de 10m².",
    "E": "(E) Por Área entende-se a área do pavimento que abriga a população em foco.",
    "F": "(F) Auditórios e assemelhados em escolas são considerados nos grupos F-5, F-6 e outros.",
    "G": "(G) As cozinhas nas ocupações B, F-6 e F-8 têm ocupação admitida como grupo D (1 pes/7m²).",
    "H": "(H) Em hospitais com ambulatório, acresce-se 1 pessoa por 7m² de área de ambulatório.",
    "I": "(I) Necessidade de consultar normas e regulamentos específicos.",
    "J": "(J) A parte de atendimento ao público de comércio atacadista deve ser considerada grupo C.",
    "L": "(L) Para ocupações tipo Call-center, calcular 1 pessoa por 1,5m² de área.",
    "M": "(M) Para área de lojas, adotar 1 pessoa por 7m² de área.",
    "N": "(N) Para o cálculo da população, será admitido o leiaute dos assentos permanentes.",
    "P": "(P) Para restaurante dançante com pista de dança: 1 pessoa por 0,67m² de área.",
    "Q": "(Q) Para locais com banco (assento comprido): 1 pessoa por 0,50m linear."
  },
  "larguras_minimas": {
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
      "M-1": "CDFG", "M-2": "CDFG", "M-3": "CDFG", "M-4": "CDFG",
      "M-5": "CDFG", "M-6": "CDFG", "M-7": "CDFG", "M-8": "CDFG"
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
