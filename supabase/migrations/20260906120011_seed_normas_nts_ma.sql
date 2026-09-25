-- Parte de uma migração maior (base normativa central — ver
-- 20260906120002_seed_normas_restantes_ma.sql original) dividida em um
-- arquivo por sistema pra rodar e conferir um de cada vez no SQL Editor
-- do Supabase (o arquivo único de ~235KB/7 mil linhas não deixou nenhuma
-- linha nova gravada, sem erro nenhum reportado — mais fácil de
-- diagnosticar rodando aos pedaços do que investigar o motivo exato).

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
