# Dashboard do projeto

## Modo e objetivo

**Operate.** Tela de operação para o projetista entender, em poucos segundos, o estado técnico do projeto e a próxima ação necessária. A visão geral deve resumir os dados existentes sem inventar completude ou substituir as telas de configuração, dimensionamento ou documentação.

## Hierarquia

1. Identidade e estado da configuração do projeto.
2. Próximas ações, ordenadas por bloqueio técnico.
3. Resumo técnico consolidado da edificação.
4. Sistemas aplicáveis com estado derivado dos dados persistidos.
5. Acesso à documentação gerada.

## Regras

- Usar vermelho como sinal e ação, não como preenchimento dominante.
- Não exibir progresso falso para sistemas sem uma fonte confiável de conclusão.
- Distinguir sistema obrigatório de opcional habilitado.
- Toda pendência apresentada deve levar à tela onde pode ser resolvida.
- Priorizar densidade legível e comparação rápida; evitar uma coleção uniforme de cartões.
- Manter o conteúdo funcional em larguras menores, reorganizando colunas sem esconder dados essenciais.

## Contrato de estado

- O percentual principal mede somente a configuração da base técnica. Ele não representa a conclusão do projeto, dos sistemas ou da documentação.
- Em projetos completos, a configuração considera identificação, edificação, responsável técnico, classificação, carga de incêndio e medidas de segurança. Na modalidade de apenas dimensionamento, identificação e responsável técnico ficam fora desse cálculo.
- Um sistema só pode aparecer como concluído quando houver evidência persistida própria. Dados parciais podem produzir o estado em andamento; na ausência de evidência, o estado permanece “A desenvolver”.
- As próximas ações mostram no máximo três itens e priorizam, nesta ordem, o bloqueio de configuração, hidrantes quando aplicável, o próximo sistema pendente e a revisão documental.
- O acesso aos documentos permanece indisponível enquanto não houver qualquer dado técnico do projeto.

## Navegação e adaptação

- Linhas de sistema, próximas ações e chamadas documentais são atalhos para as respectivas telas; o dashboard não edita esses dados diretamente.
- A partir de 1050 px para baixo, contexto, métricas e sistemas deixam as grades densas e passam a ocupar menos colunas.
- Em até 720 px, o menu lateral permanece recolhido em trilho de ícones, as seções seguem em uma coluna e o nome longo do projeto pode truncar no cabeçalho para preservar a conta e o estado de sincronização.
- O menu lateral só lista medidas obrigatórias ou opcionais habilitadas, usando a mesma fonte de verdade apresentada no dashboard.
