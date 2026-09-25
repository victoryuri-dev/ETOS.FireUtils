# Login surface

## Mode

Operate

## Purpose

Permitir que usuários recorrentes entrem rapidamente na plataforma FireUtils. A criação de conta permanece disponível como ação secundária, sem competir com o acesso principal.

## Direction contract

### FORM

Retorno à primeira versão funcional da página: um único painel de autenticação estreito, centralizado e sem conteúdo editorial concorrente. A única expansão visual é o fundo animado herdado do hero da landing page.

### Visual world

Herda a identidade técnica e escura da FireUtils com fundo quase preto, vermelho `#EA1330`, tipografia clara e superfícies precisas. O painel usa cantos discretamente arredondados e o fundo reproduz as faixas vermelhas animadas do hero da landing page.

### First viewport

No desktop, o painel original de 380 px permanece centralizado e inteiramente visível na primeira tela.

No mobile, o mesmo painel ocupa a largura disponível com margens curtas, sem rolagem horizontal.

### Interaction

Somente o fundo possui movimento contínuo em repouso. Ao enviar o login, um overlay bloqueia o painel e apresenta no centro o símbolo FireUtils pulsante usado pelo loader da landing até a autenticação responder. Troca entre login e cadastro, foco, erro e sucesso possuem estados próprios.

### Motion grammar

As faixas do fundo oscilam lentamente como no hero da landing. A animação respeita `prefers-reduced-motion`; o conteúdo permanece totalmente funcional sem movimento.

### Content constraints

Usar somente capacidades confirmadas no produto. Não adicionar promessas de segurança, cobertura normativa, clientes, métricas ou benefícios comerciais não comprovados.
