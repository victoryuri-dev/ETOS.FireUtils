-- getSinalizacao() (src/data/normas/index.js) prefere o catálogo gravado
-- aqui (normas_dados, uf='MA', sistema='sinalizacao') ao arquivo estático
-- local (src/data/normas/MA/sinalizacao.js) sempre que essa linha existir
-- — então trocar os códigos só no arquivo local não tinha efeito nenhum em
-- produção, já que a base central continuava servindo os antigos S1/S2.
--
-- Substitui S1/S2 pelas quatro variantes de orientação (E = esquerda,
-- D = direita) — mesmos códigos que os quantitativos do plugin Revit
-- (parâmetro "Código da Placa") passam a usar, e mesmo catálogo já
-- aplicado em src/data/normas/MA/sinalizacao.js (fallback offline/dev).
-- Preserva tudo o mais, inclusive a placa E1 (ver
-- 20260924120000_seed_normas_sinalizacao_add_e1.sql).

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
      "key": "s1_e",
      "codigo": "S1-E",
      "categoria": "orientacao",
      "label": "Saída de emergência — seta à esquerda (modelo 1)",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s1_d",
      "codigo": "S1-D",
      "categoria": "orientacao",
      "label": "Saída de emergência — seta à direita (modelo 1)",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s2_e",
      "codigo": "S2-E",
      "categoria": "orientacao",
      "label": "Saída de emergência — seta à esquerda (modelo 2)",
      "quantidadeRef": "O necessário para atender a NT 14",
      "localInstalacao": "Rotas de saída"
    },
    {
      "key": "s2_d",
      "codigo": "S2-D",
      "categoria": "orientacao",
      "label": "Saída de emergência — seta à direita (modelo 2)",
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
      "key": "e1",
      "codigo": "E1",
      "categoria": "equipamentos",
      "label": "Telefone para uso em caso de incêndio",
      "localInstalacao": "A 1,80 m de altura, imediatamente acima do equipamento sinalizado"
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
