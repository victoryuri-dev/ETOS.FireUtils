-- Parte de uma migração maior (base normativa central — ver
-- 20260906120002_seed_normas_restantes_ma.sql original) dividida em um
-- arquivo por sistema pra rodar e conferir um de cada vez no SQL Editor
-- do Supabase (o arquivo único de ~235KB/7 mil linhas não deixou nenhuma
-- linha nova gravada, sem erro nenhum reportado — mais fácil de
-- diagnosticar rodando aos pedaços do que investigar o motivo exato).

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
