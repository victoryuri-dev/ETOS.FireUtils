export const NORMA = {
  estado: 'MA',
  nome:   'NT 42/2019 CBMMA',
  desc:   'Norma Tecnica de Licenciamento e Fiscalizacao — CBMMA',
}

export const OCUPACOES = {
    'A': {
        'A-1': 'A-1 — Habitacao unifamiliar',
        'A-2': 'A-2 — Habitacao multifamiliar',
        'A-3': 'A-3 — Habitacao coletiva',
    },
    'B': {
        'B-1': 'B-1 — Hotel / apart-hotel',
        'B-2': 'B-2 — Pensao / albergue',
    },
    'C': {
        'C-1': 'C-1 — Comercio de pequeno porte',
        'C-2': 'C-2 — Comercio de medio porte',
        'C-3': 'C-3 — Shopping / centro comercial',
    },
    'D': {
        'D-1': 'D-1 — Servicos de protecao',
        'D-2': 'D-2 — Servicos funerarios',
        'D-3': 'D-3 — Telecomunicacoes',
    },
    'E': {
        'E-1': 'E-1 — Escritorios em geral',
        'E-2': 'E-2 — Agencias bancarias',
        'E-3': 'E-3 — Cartorios / reparticoes',
        'E-4': 'E-4 — Consultorios / ambulatorios',
    },
    'F': {
        'F-1': 'F-1 — Templos / auditorios',
        'F-2': 'F-2 — Restaurantes / lanchonetes',
        'F-3': 'F-3 — Museus / bibliotecas',
        'F-4': 'F-4 — Ginasios / estadios',
        'F-5': 'F-5 — Escolas',
        'F-6': 'F-6 — Creches',
        'F-7': 'F-7 — Cinemas / teatros',
    },
    'G': {
        'G-1': 'G-1 — Depositos em geral',
        'G-2': 'G-2 — Silos / armazens',
        'G-3': 'G-3 — Depositos frigorificos',
    },
    'H': {
        'H-1': 'H-1 — Hospital geral',
        'H-2': 'H-2 — Hospital psiquiatrico',
        'H-3': 'H-3 — Clinica com internacao',
        'H-4': 'H-4 — Pronto-socorro',
    },
    'I': {
        'I-1': 'I-1 — Industria de baixo risco',
        'I-2': 'I-2 — Industria de medio risco',
        'I-3': 'I-3 — Industria de alto risco',
    }
};

export const CARGADEINCENDIO = {
  "A-1": {
    "5590-6/03": { descricao: "Pensionatos", cargaIncendio: 300 }
  },
  "A-2": {
    "8112-5/00": { descricao: "Condomínios prediais / Apartamentos", cargaIncendio: 300 }
  },
  "A-3": {
    "-": { descricao: "Casas térreas ou sobrados", cargaIncendio: 300 }
  },
  "B-1": {
    "5510-8/01": { descricao: "Hotéis", cargaIncendio: 500 },
    "5510-8/03": { descricao: "Motéis", cargaIncendio: 500 },
    "8112-5/00": { descricao: "Alojamentos estudantis", cargaIncendio: 300 },
    "5590-6/01": { descricao: "Albergues, exceto assistenciais", cargaIncendio: 300 },
    "5590-6/02": { descricao: "Camping", cargaIncendio: 300 }
  },
  "B-2": {
    "5510-8/02": { descricao: "Apart-hoteis", cargaIncendio: 500 }
  },
  "*": {
    "5590-6/99": { descricao: "Outros alojamentos não especificados anteriormente", cargaIncendio: 500 }
  },
  "C-1": {
    "7719-5/02": { descricao: "Aeronaves - Locação sem tripulação", cargaIncendio: 200 },
    "7732-2/02": { descricao: "Andaimes (aluguel)", cargaIncendio: 300 },
    "4649-4/01": { descricao: "Aparelhos e equipamentos elétricos de uso pessoal e doméstico (comércio atacadista)", cargaIncendio: 300 },
    "4649-4/02": { descricao: "Aparelhos eletrônicos de uso pessoal e doméstico (comércio atacadista)", cargaIncendio: 300 },
    "4789-0/09": { descricao: "Armas e munições (comércio varejista)", cargaIncendio: 300 },
    "7711-0/00": { descricao: "Automóvel - Locação sem condutor", cargaIncendio: 200 },
    "4530-7/06": { descricao: "Automóveis – Peças e acessórios novos e usadas para veículos automotores (representantes comerciais e agentes do comércio)", cargaIncendio: 200 },
    "4530-7/01": { descricao: "Automóveis – Peças e acessórios novos para veículos automotores (comércio por atacado)", cargaIncendio: 200 },
    "4530-7/03": { descricao: "Automóveis – Peças e acessórios novos para veículos automotores (comércio a varejo)", cargaIncendio: 200 },
    "4530-7/04": { descricao: "Automóveis – Peças e acessórios usados para veículos automotores (comércio a varejo)", cargaIncendio: 200 },
    "4512-9/02": { descricao: "Automóveis (comércio sob consignação de veículos automotores)", cargaIncendio: 200 },
    "4512-9/01": { descricao: "Automóveis (representantes comerciais e agentes do comércio de veículos automotores)", cargaIncendio: 200 },
    "4511-1/01": { descricao: "Automóveis, camionetas e utilitários novos (comércio a varejo)", cargaIncendio: 200 },
    "4511-1/03": { descricao: "Automóveis, camionetas e utilitárias novas e usadas (comércio por atacado)", cargaIncendio: 200 },
    "4511-1/02": { descricao: "Automóveis, camionetas e utilitários usados (comércio a varejo)", cargaIncendio: 200 },
    "4634-6/02": { descricao: "Aves abatidas e derivadas (comércio atacadista)", cargaIncendio: 40 },
    // ... (continua para todos os CNAEs da divisão C-1)
  },
  "C-2": {
    "4637-1/02": { descricao: "Açúcar (comércio atacadista)", cargaIncendio: 400 },
    "4635-4/01": { descricao: "Água mineral (comércio atacadista)", cargaIncendio: 400 },
    "4623-1/03": { descricao: "Algodão (comércio atacadista)", cargaIncendio: 600 },
    "4623-1/09": { descricao: "Alimentos para animais (comércio atacadista)", cargaIncendio: 400 },
    "4789-0/04": { descricao: "Animais vivos e de artigos e alimentos para animais de estimação (comércio varejista)", cargaIncendio: 400 },
    "4785-7/01": { descricao: "Antiguidades (comércio varejista)", cargaIncendio: 700 },
    "7729/01": { descricao: "Aparelhos de jogos eletrônicos (aluguel)", cargaIncendio: 400 },
    "4649-4/99": { descricao: "Aparelhos, equipamentos e artigos de uso pessoal e doméstico não especificados anteriormente (comércio atacadista)", cargaIncendio: 400 },
    "4641-9/03": { descricao: "Armarinho – Artigos (comércio atacadista)", cargaIncendio: 600 },
    "4755-5/02": { descricao: "Armarinho – Artigos (comércio varejista)", cargaIncendio: 600 },
    "4759-8/99": { descricao: "Artigos de uso doméstico não especificados anteriormente (comércio varejista)", cargaIncendio: 600 },
    "4773-3/00": { descricao: "Artigos médicos e ortopédicos (comércio varejista)", cargaIncendio: 400 },
    // ... (continua para todos os CNAEs da divisão C-2)
  },
  "D-1": {
    "8414-1/00": { descricao: "Administração pública - Atividades de suporte à administração pública", cargaIncendio: 700 },
    "8422-1/00": { descricao: "Administração pública – Defesa", cargaIncendio: 700 },
    "8425-6/00": { descricao: "Administração pública - Defesa civil", cargaIncendio: 700 },
    "8423-0/00": { descricao: "Administração pública – Justiça", cargaIncendio: 700 },
    "8412-4/00": { descricao: "Administração pública - Regulação das atividades de saúde, educação, serviços culturais e outros serviços sociais", cargaIncendio: 700 },
    "8413-2/00": { descricao: "Administração pública - Regulação das atividades econômicas", cargaIncendio: 700 },
    "8421-3/00": { descricao: "Administração pública - Relações exteriores", cargaIncendio: 700 },
    "8424-8/00": { descricao: "Administração pública - Segurança e ordem pública", cargaIncendio: 700 },
    "8430-2/00": { descricao: "Administração pública - Seguridade social obrigatória", cargaIncendio: 700 },
    "8411-6/00": { descricao: "Administração pública em geral", cargaIncendio: 700 },
    // ... (continua para todos os CNAEs da divisão D-1)
  },
  "D-2": {
    "6421-2/00": { descricao: "Atividades financeiras - Bancos comerciais", cargaIncendio: 300 },
    "6424-7/01": { descricao: "Atividades financeiras – Bancos cooperativos", cargaIncendio: 300 },
    "6433-6/00": { descricao: "Atividades financeiras – Bancos de desenvolvimento", cargaIncendio: 300 },
    "6432-8/00": { descricao: "Atividades financeiras – Bancos de investimento", cargaIncendio: 300 },
    "6422-1/00": { descricao: "Atividades financeiras – Bancos múltiplos, com carteira comercial", cargaIncendio: 300 },
    "6431-0/00": { descricao: "Atividades financeiras – Bancos múltiplos, sem carteira comercial", cargaIncendio: 300 },
    "6611-8/02": { descricao: "Atividades financeiras – Bolsa de mercadorias", cargaIncendio: 300 },
    "6611-8/03": { descricao: "Atividades financeiras – Bolsa de mercadorias e futuros", cargaIncendio: 300 },
    "6611-8/01": { descricao: "Atividades financeiras – Bolsa de valores", cargaIncendio: 300 },
    "6499-9/04": { descricao: "Atividades financeiras – Caixas de financiamento de corporações", cargaIncendio: 300 },
    // ... (continua para todos os CNAEs da divisão D-2)
  },
  "D-3": {
    "3313-9/01": { descricao: "Geradores, transformadores e motores elétricos (manutenção e reparação)", cargaIncendio: 600 },
    "9511-8/00": { descricao: "Informática – Computadores e de equipamentos periféricos (Reparação e manutenção)", cargaIncendio: 600 },
    "3314-7/09": { descricao: "Máquinas de escrever, calcular e de outros equipamentos não eletrônicos para escritório (manutenção e reparação)", cargaIncendio: 600 },
    "3314-7/07": { descricao: "Máquinas e aparelhos de refrigeração e ventilação para uso industrial e comercial (manutenção e reparação)", cargaIncendio: 600 },
    "3314-7/21": { descricao: "Máquinas e aparelhos para a indústria de celulose, papel e papelão e artefatos (manutenção e reparação)", cargaIncendio: 600 },
    "3314-7/22": { descricao: "Máquinas e aparelhos para a indústria do plástico (manutenção e reparação)", cargaIncendio: 600 },
    "3314-7/17": { descricao: "Máquinas, equipamentos para terraplenagem, pavimentação e construção, exceto tratores (manutenção e reparação)", cargaIncendio: 200 },
    // ... (continua para todos os CNAEs da divisão D-3)
  },
  "D-4": {
    "7420-0/03": { descricao: "Fotografia – Laboratórios fotográficos", cargaIncendio: 500 },
    "5812-3/00": { descricao: "Laboratórios clínicos", cargaIncendio: 1000 },
    "8640-2/02": { descricao: "Laboratórios de anatomia patológica e citológica", cargaIncendio: 500 },
    "8640-2/01": { descricao: "Laboratórios químicos", cargaIncendio: 500 },
    "7120-1/00": { descricao: "Testes e análises técnicas", cargaIncendio: 300 },
    // ... (continua para todos os CNAEs da divisão D-4)
  },
  "E-1": {
    "8599-6/05": { descricao: "Cursos preparatórios para concursos", cargaIncendio: 300 },
    "8531-7/00": { descricao: "Educação superior – graduação", cargaIncendio: 300 },
    "8532-5/00": { descricao: "Educação superior – graduação e pós-graduação", cargaIncendio: 300 },
    "8533-3/00": { descricao: "Educação superior – pós-graduação e extensão", cargaIncendio: 300 },
    "8599-6/99": { descricao: "Outras atividades de ensino não especificadas anteriormente", cargaIncendio: 300 },
    // ... (continua para todos os CNAEs da divisão E-1)
  },
  "E-2": {
    "8592-9/99": { descricao: "Ensino de arte e cultura não especificado anteriormente", cargaIncendio: 300 },
    "8592-9/02": { descricao: "Ensino de artes cênicas, exceto dança", cargaIncendio: 300 },
    "8593-7/00": { descricao: "Ensino de idiomas", cargaIncendio: 300 },
    "8592-9/03": { descricao: "Ensino de música", cargaIncendio: 300 },
    // ... (continua para todos os CNAEs da divisão E-2)
  },
  "E-3": {
    "9313-1/00": { descricao: "Academias de ginástica e similar", cargaIncendio: 300 },
    "8592-9/01": { descricao: "Ensino de dança", cargaIncendio: 300 },
    "8591-1/00": { descricao: "Ensino de esportes", cargaIncendio: 300 },
    "9609-2/01": { descricao: "Saunas e similares", cargaIncendio: 700 },
    // ... (continua para todos os CNAEs da divisão E-3)
  },
  "E-4": {
    "8599-6/02": { descricao: "Cursos de pilotagem", cargaIncendio: 300 },
    "8541-4/00": { descricao: "Educação profissional de nível técnico", cargaIncendio: 300 },
    "8542-2/00": { descricao: "Educação profissional de nível tecnológico", cargaIncendio: 300 },
    "8599-6/04": { descricao: "Treinamento em desenvolvimento profissional e gerencial", cargaIncendio: 300 },
    "8599-6/03": { descricao: "Treinamento em informática", cargaIncendio: 300 },
    // ... (continua para todos os CNAEs da divisão E-4)
  },
  "E-5": {
    "8511-2/00": { descricao: "Creches e similares / Educação infantil – creche", cargaIncendio: 300 },
    "8512-1/00": { descricao: "Educação infantil - pré-escola / Pré-escolas e similares", cargaIncendio: 300 },
    // ... (continua para todos os CNAEs da divisão E-5)
  },
  "E-6": {
    "8599-6/99": { descricao: "Escola para portadores de necessidades especiais", cargaIncendio: 300 },
    // ... (continua para todos os CNAEs da divisão E-6)
  },
  "F-1": {
    "9101-5/00": { descricao: "Arquivos / Bibliotecas", cargaIncendio: 2000 },
    "9102-3/01": { descricao: "Museus e exploração de lugares e prédios históricos e atrações similares", cargaIncendio: 300 },
    // ... (continua para todos os CNAEs da divisão F-1)
  },
  "F-2": {
    "9491-0/00": { descricao: "Atividades de organizações religiosas / Igrejas e templos", cargaIncendio: 200 },
    "9603-3/02": { descricao: "Serviço de cremação (com salas de funerais)", cargaIncendio: 200 },
    // ... (continua para todos os CNAEs da divisão F-2)
  },
  "F-3": {
    "9200-3/02": { descricao: "Corridas de cavalos (exploração de apostas)", cargaIncendio: 600 },
    "9319-1/99": { descricao: "Outras atividades esportivas não especificadas anteriormente", cargaIncendio: 150 },
    // ... (continua para todos os CNAEs da divisão F-3)
  },
  "F-4": {
    "4922-1/02": { descricao: "Estações e terminais de passageiros", cargaIncendio: 200 },
    // ... (continua para todos os CNAEs da divisão F-4)
  },
  "F-5": {
    "9001-9/99": { descricao: "Artes cênicas, espetáculos e atividades complementares não especificadas anteriormente", cargaIncendio: 600 },
    "9001-9/03": { descricao: "Produção de espetáculos de dança", cargaIncendio: 600 },
    "9001-9/02": { descricao: "Produção musical", cargaIncendio: 600 },
    "9001-9/01": { descricao: "Produção teatral", cargaIncendio: 600 },
    // ... (continua para todos os CNAEs da divisão F-5)
  },
  "F-6": {
    "9499-5/00": { descricao: "Atividades associativas não especificadas anteriormente", cargaIncendio: 600 },
    "9329-8/02": { descricao: "Boliches (exploração)", cargaIncendio: 600 },
    "9200-3/01": { descricao: "Casas de bingo", cargaIncendio: 600 },
    "8230-0/02": { descricao: "Casas de festas e eventos", cargaIncendio: 600 },
    // ... (continua para todos os CNAEs da divisão F-6)
  },
  "F-7": {
    "9001-9/04": { descricao: "Produção de espetáculos circenses, de marionetes e similares", cargaIncendio: 500 },
    "9001-9/05": { descricao: "Rodeios, vaquejadas e similares (produção de espetáculos)", cargaIncendio: 500 },
    "9001-9/06": { descricao: "Sonorização e de iluminação (atividade)", cargaIncendio: 700 },
    // ... (continua para todos os CNAEs da divisão F-7)
  },
  "F-8": {
    "5620-1/01": { descricao: "Alimentação – Fornecimento de alimentos preparados preponderantemente para empresas", cargaIncendio: 300 },
    "5620-1/04": { descricao: "Alimentação – Fornecimento de alimentos preparados preponderantemente para consumo domiciliar", cargaIncendio: 300 },
    "5611-2/03": { descricao: "Lanchonetes, casas de chá, de sucos e similares", cargaIncendio: 300 },
    "5611-2/01": { descricao: "Restaurantes e similares", cargaIncendio: 300 },
    // ... (continua para todos os CNAEs da divisão F-8)
  },
  "G-1": {
    "5223-1/00": { descricao: "Estacionamento de veículos (garagem com ou sem acesso de público e sem abastecimento)", cargaIncendio: 200 }
  },
  "G-3": {
    "4731-8/00": { descricao: "Comércio varejista de combustíveis para veículos automotores", cargaIncendio: 1000 },
    "4731-8/00": { descricao: "Postos de abastecimentos (tanque enterrado)", cargaIncendio: 300 }
  },
  "G-4": {
    "4543-9/00": { descricao: "Serviço de manutenção e reparação em motocicletas e motonetas", cargaIncendio: 300 },
    "4520-0/04": { descricao: "Serviços de alinhamento e balanceamento de veículos automotores", cargaIncendio: 300 },
    "4520-0/06": { descricao: "Serviços de borracharia para veículos automotores", cargaIncendio: 300 },
    "4520-0/07": { descricao: "Serviços de instalação, manutenção e reparação de acessórios para veículos automotores", cargaIncendio: 300 },
    "4520-0/02": { descricao: "Serviços de lanternagem ou funilaria e pintura de veículos automotores", cargaIncendio: 500 },
    "4520-0/05": { descricao: "Serviços de lavagem, lubrificação e polimento de veículos automotores", cargaIncendio: 300 },
    "4520-0/03": { descricao: "Serviços de manutenção e reparação elétrica de veículos automotores", cargaIncendio: 300 },
    "4520-0/01": { descricao: "Serviços de manutenção e reparação mecânica de veículos automotores", cargaIncendio: 300 }
  },
  "H-1": {
    "7500-1/00": { descricao: "Atividades veterinárias", cargaIncendio: 300 }
  },
  "H-2": {
    "8730-1/02": { descricao: "Albergues assistenciais", cargaIncendio: 350 },
    "8711-5/02": { descricao: "Asilos / Instituições de longa permanência para idosos / Condomínios residenciais para idosos", cargaIncendio: 350 },
    "8711-5/03": { descricao: "Atividades de assistência a deficientes físicos, imuno deprimidos e convalescentes", cargaIncendio: 350 },
    "8720-4/99": { descricao: "Atividades de assistência psicossocial e à saúde a portadores de distúrbios psíquicos, deficiência mental e dependência química não especificada anteriormente", cargaIncendio: 200 },
    "8730-1/99": { descricao: "Atividades de assistência social prestadas em residências coletivas e particulares não especificadas anteriormente", cargaIncendio: 350 },
    "8711-5/04": { descricao: "Centros de apoio a pacientes com câncer e com AIDS", cargaIncendio: 350 },
    "8711-5/01": { descricao: "Clínicas e residências geriátricas", cargaIncendio: 350 },
    "8730-1/01": { descricao: "Orfanatos", cargaIncendio: 350 }
  },
  "H-3": {
    "8630-5/01": { descricao: "Atividade médica ambulatorial com recursos para realização de procedimentos cirúrgicos", cargaIncendio: 300 },
    "8610-1/01": { descricao: "Atividades de atendimento em pronto-socorro e unidades hospitalares para atendimento a urgência", cargaIncendio: 300 },
    "8690-9/02": { descricao: "Atividades de atendimento hospitalar, exceto pronto-socorro e unidades para atendimento a urgências", cargaIncendio: 200 }
  },
  "H-4": {
    "8424-8/00": { descricao: "Quartéis e similares", cargaIncendio: 450 }
  },
  "H-6": {
    "8630-5/02": { descricao: "Atividade médica ambulatorial com recursos para realização de exames complementares", cargaIncendio: 200 },
    "8630-5/03": { descricao: "Atividade médica ambulatorial restrita a consultas", cargaIncendio: 200 },
    "8630-5/04": { descricao: "Atividade odontológica com recursos para realização de procedimentos cirúrgicos", cargaIncendio: 200 },
    "8630-5/05": { descricao: "Atividade odontológica sem recursos para realização de procedimentos cirúrgicos", cargaIncendio: 200 },
    "8610-1/02": { descricao: "Atividades de atenção ambulatorial não especificadas anteriormente", cargaIncendio: 300 },
    "8650-0/01": { descricao: "Atividades de centros de assistência psicossocial", cargaIncendio: 200 },
    "8650-0/04": { descricao: "Atividades de enfermagem", cargaIncendio: 200 },
    "8650-0/06": { descricao: "Atividades de fisioterapia / fonoaudiologia", cargaIncendio: 200 },
    "8650-0/99": { descricao: "Atividades de profissionais da área de saúde não especificadas anteriormente", cargaIncendio: 200 },
    "8650-0/02": { descricao: "Atividades de profissionais da nutrição", cargaIncendio: 200 },
    "8650-0/03": { descricao: "Atividades de psicologia e psicanálise", cargaIncendio: 200 },
    "8630-5/07": { descricao: "Atividades de reprodução humana assistida", cargaIncendio: 200 },
    "8650-0/07": { descricao: "Atividades de terapia de nutrição enteral e parenteral", cargaIncendio: 200 },
    "8650-0/05": { descricao: "Atividades de terapia ocupacional", cargaIncendio: 200 },
    "8630-5/06": { descricao: "Serviços de vacinação e imunização humana", cargaIncendio: 200 }
  },
  "I-1": {
    "1121-6/00": { descricao: "Águas envasadas (fabricação)", cargaIncendio: 80 },
    "0810-0/01": { descricao: "Ardósia (extração e beneficiamento associado)", cargaIncendio: 40 },
    "0810-0/06": { descricao: "Areia, cascalho ou pedregulho (extração e beneficiamento associado)", cargaIncendio: 40 },
    "0810-0/07": { descricao: "Argila (extração e beneficiamento associado)", cargaIncendio: 40 },
    "0810-0/02": { descricao: "Granito (extração e beneficiamento associado)", cargaIncendio: 40 },
    "0810-0/05": { descricao: "Gesso e caulim (extração)", cargaIncendio: 40 },
    "0810-0/10": { descricao: "Gesso e caulim (extração e beneficiamento associado)", cargaIncendio: 40 },
    "0810-0/99": { descricao: "Pedras e outros materiais para construção (extração, britamento e beneficiamento associado)", cargaIncendio: 40 },
    "2330-3/01": { descricao: "Cimento – Estruturas pré-moldadas de concreto armado, em série e sob encomenda (fabricação)", cargaIncendio: 40 },
    "2330-3/02": { descricao: "Cimento – Fabricação de artefatos de cimento para uso na construção", cargaIncendio: 40 },
    "2330-3/03": { descricao: "Cimento – Fabricação de artefatos de fibrocimento para uso na construção", cargaIncendio: 40 },
    "2330-3/99": { descricao: "Cimento – Fabricação de outros artefatos e produtos de concreto, cimento, fibrocimento, gesso e materiais semelhantes", cargaIncendio: 40 },
    "2330-3/05": { descricao: "Cimento – Preparação de massa de concreto e argamassa para construção", cargaIncendio: 40 },
    "2320-6/00": { descricao: "Cimento (fabricação)", cargaIncendio: 40 },
    "0899-1/03": { descricao: "Amianto (extração)", cargaIncendio: 40 },
    "0899-1/01": { descricao: "Grafita (extração)", cargaIncendio: 40 },
    "0899-1/02": { descricao: "Quartzo (extração)", cargaIncendio: 40 },
    "0899-1/99": { descricao: "Minerais não-metálicos não especificados anteriormente (extração)", cargaIncendio: 40 },
    "0892-4/01": { descricao: "Sal (refino e outros tratamentos)", cargaIncendio: 40 },
    "0892-4/02": { descricao: "Sal marinho (extração)", cargaIncendio: 40 },
    "2542-0/00": { descricao: "Sal-gema (extração)", cargaIncendio: 200 },
    // ... (continua para todos os CNAEs da divisão I-1)
  },
  "I-2": {
    "1742-7/02": { descricao: "Absorventes higiênicos (fabricação)", cargaIncendio: 1000 },
    "1072-4/01": { descricao: "Açúcar de cana refinado (fabricação)", cargaIncendio: 800 },
    "1072-4/02": { descricao: "Açúcar de cereais (dextrose) e de beterraba (fabricação)", cargaIncendio: 800 },
    "1071-6/00": { descricao: "Açúcar em bruto (fabricação)", cargaIncendio: 800 },
    "2091-6/00": { descricao: "Adesivos e selantes (fabricação)", cargaIncendio: 1000 },
    "2093-2/00": { descricao: "Aditivos de uso industrial (fabricação)", cargaIncendio: 500 },
    "1099-6/06": { descricao: "Adoçantes naturais e artificiais (fabricação)", cargaIncendio: 800 },
    "2013-4/00": { descricao: "Adubos e fertilizantes (fabricação)", cargaIncendio: 200 },
    "3041-5/00": { descricao: "Aeronaves – Fabricação de aeronaves", cargaIncendio: 600 },
    "3042-3/00": { descricao: "Aeronaves – Fabricação de turbinas, motores e outros componentes e peças para aeronaves", cargaIncendio: 600 },
    "1111-9/01": { descricao: "Aguardente de cana-de-açúcar (fabricação)", cargaIncendio: 500 },
    "1111-9/02": { descricao: "Aguardente, com exceção de cana-de-açúcar e outras bebidas destiladas (fabricação)", cargaIncendio: 500 },
    // ... (continua para todos os CNAEs da divisão I-2)
  },
  "I-3": {
    "1931-4/00": { descricao: "Álcool (fabricação)", cargaIncendio: 3000 },
    "1065-1/01": { descricao: "Amidos e féculas de vegetais (fabricação)", cargaIncendio: 2000 },
    "1910-1/00": { descricao: "Coquerias", cargaIncendio: 4000 },
    "1922-5/01": { descricao: "Formulação de combustíveis", cargaIncendio: 4000 },
    "1932-2/00": { descricao: "Biocombustíveis, exceto álcool (fabricação)", cargaIncendio: 3000 },
    "2062-2/00": { descricao: "Cera de polimento", cargaIncendio: 2000 },
    "2019-3/01": { descricao: "Combustíveis nucleares (elaboração)", cargaIncendio: 3000 },
    "2073-8/00": { descricao: "Impermeabilizantes, solventes e produtos afins (fabricação)", cargaIncendio: 4000 },
    "2033-9/00": { descricao: "Elastômeros (fabricação)", cargaIncendio: 3000 },
    "2032-1/00": { descricao: "Resinas termofixas (fabricação)", cargaIncendio: 3000 },
    "2031-2/00": { descricao: "Resinas termoplásticas (fabricação)", cargaIncendio: 3000 },
    "1922-5/99": { descricao: "Petróleo – Fabricação de outros produtos derivados do petróleo, exceto produtos do refino", cargaIncendio: 3000 },
    "1921-7/00": { descricao: "Petróleo – Fabricação de produtos do refino de petróleo", cargaIncendio: 4000 },
    // ... (continua para todos os CNAEs da divisão I-3)
  },
  "J-1": {
    // Depósito de materiais incombustíveis
  },
  "J-2": {
    // Depósito com carga de incêndio até 300 MJ/m²
  },
  "J-3": {
    // Depósito com carga de incêndio de 301 a 1200 MJ/m²
  },
  "J-4": {
    // Depósito com carga de incêndio acima de 1200 MJ/m²
  },
  "K-1": {
    "3513-1/00": { descricao: "Energia elétrica (comércio atacadista)", cargaIncendio: 200 },
    "3514-0/00": { descricao: "Energia elétrica (distribuição)", cargaIncendio: 200 },
    "3511-5/00": { descricao: "Energia elétrica (geração)", cargaIncendio: 200 },
    "3512-3/00": { descricao: "Energia elétrica (transmissão)", cargaIncendio: 200 }
  },
  "L-1": {
    // Explosivos e pirotécnicos (fabricação)
  },
  "M-2": {
    "4681-8/01": { descricao: "Combustíveis – Álcool carburante, biodiesel, gasolina e demais derivados de petróleo, exceto lubrificantes, não realizado por transportador retalhista – TRR (comércio atacadista)", cargaIncendio: 2100 },
    "4681-8/02": { descricao: "Combustíveis – Álcool carburante, biodiesel, gasolina e demais derivados de petróleo, realizado por transportador retalhista – TRR (comércio atacadista)", cargaIncendio: 2100 },
    "4681-8/04": { descricao: "Combustíveis de origem mineral em bruto (comércio atacadista)", cargaIncendio: 2100 },
    "4681-8/03": { descricao: "Combustíveis de origem vegetal, exceto álcool carburante (comércio atacadista)", cargaIncendio: 4000 },
    "3520-4/02": { descricao: "Combustíveis gasosos por redes urbanas (distribuição)", cargaIncendio: 200 },
    "4682-6/00": { descricao: "Gás liquefeito de petróleo – GLP (comércio atacadista)", cargaIncendio: 2100 },
    "4784-9/00": { descricao: "Gás liquefeito de petróleo – GLP (comércio varejista, revenda)", cargaIncendio: 2100 },
    "3520-4/01": { descricao: "Gás natural (processamento)", cargaIncendio: 4000 },
    "4681-8/05": { descricao: "Lubrificantes (comércio atacadista)", cargaIncendio: 2100 }
  },
  "M-5": {
    "3831-9/99": { descricao: "Materiais metálicos, exceto alumínio (recuperação)", cargaIncendio: 300 },
    "3839-4/99": { descricao: "Materiais não especificados anteriormente (recuperação)", cargaIncendio: 800 },
    "3832-7/00": { descricao: "Materiais plásticos (recuperação)", cargaIncendio: 2000 },
    "3811-4/00": { descricao: "Resíduos não-perigosos (coleta)", cargaIncendio: 300 },
    "3821-1/00": { descricao: "Resíduos não-perigosos (tratamento e disposição)", cargaIncendio: 300 },
    "3812-2/00": { descricao: "Resíduos perigosos (coleta)", cargaIncendio: 500 },
    "3822-0/00": { descricao: "Resíduos perigosos (tratamento e disposição)", cargaIncendio: 500 },
    "3831-9/01": { descricao: "Sucatas de alumínio (recuperação)", cargaIncendio: 200 },
    "3839-4/01": { descricao: "Usinas de compostagem", cargaIncendio: 200 }
  },
  "M-6": {
    "9103-1/00": { descricao: "Parques nacionais, reservas ecológicas e áreas de proteção ambiental", cargaIncendio: 500 }
  }
};

