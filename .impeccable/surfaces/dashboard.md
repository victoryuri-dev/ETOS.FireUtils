# Dashboard do projeto

## Modo e objetivo

**Operate.** Tela de operação para o projetista entender, em poucos segundos, o estado técnico do projeto e a próxima ação necessária. A visão geral deve resumir os dados existentes sem inventar completude ou substituir as telas de configuração, dimensionamento ou documentação.

## Hierarquia

1. Identidade e estado da configuração do projeto.
2. Identificação do projeto com dados administrativos e responsáveis.
3. Resumo técnico na visão geral ou filtrado por edificação.
4. Sistemas aplicáveis com estado derivado dos dados persistidos.
5. Acesso à documentação gerada.

## Regras

- Usar vermelho como sinal e ação, não como preenchimento dominante.
- Não exibir progresso falso para sistemas sem uma fonte confiável de conclusão.
- Distinguir sistema obrigatório de opcional habilitado.
- A identificação deve refletir os dados já cadastrados e oferecer acesso direto à configuração para edição.
- Priorizar densidade legível e comparação rápida; evitar uma coleção uniforme de cartões.
- Manter o conteúdo funcional em larguras menores, reorganizando colunas sem esconder dados essenciais.

## Contrato de estado

- O percentual principal mede somente a configuração da base técnica. Ele não representa a conclusão do projeto, dos sistemas ou da documentação.
- Em projetos completos, a configuração considera identificação, edificação, responsável técnico, classificação, carga de incêndio e medidas de segurança. Na modalidade de apenas dimensionamento, identificação e responsável técnico ficam fora desse cálculo.
- Um sistema só pode aparecer como concluído quando houver evidência persistida própria. Dados parciais podem produzir o estado em andamento; na ausência de evidência, o estado permanece “A desenvolver”.
- A identificação apresenta nome, localização, proprietário e responsável pelo uso. Projetos completos também mostram responsável técnico e registro/ART; na modalidade de apenas dimensionamento, esses campos dão lugar à modalidade.
- O resumo técnico inicia em “Visão geral”. Nessa visão, área, pavimentos e subsolos representam os totais do projeto, a altura e a carga de incêndio usam os maiores valores encontrados, e classificação e sistemas aplicáveis consolidam todas as edificações.
- O filtro de edificação afeta somente o resumo técnico. Ao selecionar uma edificação, área, altura, pavimentos, subsolos, carga de incêndio, classificação e contagem de sistemas passam a usar os dados vinculados a ela; situação e norma continuam sendo dados do projeto.
- O filtro oferece apenas edificações cadastradas e preserva “Visão geral” como opção agregada.
- O acesso aos documentos permanece indisponível enquanto não houver qualquer dado técnico do projeto.

## Navegação e adaptação

- Linhas de sistema e chamadas documentais são atalhos para as respectivas telas; a identificação leva à configuração, enquanto o filtro apenas muda a leitura do resumo técnico.
- A partir de 1050 px para baixo, identificação e resumo técnico passam a ocupar linhas separadas, e a lista de sistemas usa uma coluna; as métricas mantêm três colunas até o breakpoint móvel.
- Em até 720 px, o menu lateral permanece recolhido em trilho de ícones, as seções seguem em uma coluna e o nome longo do projeto pode truncar no cabeçalho para preservar a conta e o estado de sincronização.
- Em até 720 px, o filtro ocupa a largura do painel e as métricas passam a uma única coluna.
- O menu lateral só lista medidas obrigatórias ou opcionais habilitadas, usando a mesma fonte de verdade apresentada no dashboard.
