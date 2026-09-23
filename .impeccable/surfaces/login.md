# Login surface

## Mode

Operate

## Purpose

Permitir que usuários recorrentes entrem rapidamente na plataforma FireUtils. A criação de conta permanece disponível como ação secundária, sem competir com o acesso principal.

## Direction contract

### Visual world

Herda a identidade técnica e escura da landing page: fundo quase preto, vermelho FireUtils `#EA1330`, tipografia clara, linhas precisas e pouco arredondamento. O logotipo, a linguagem e o fluxo real do produto permanecem reconhecíveis.

### First viewport

No desktop, a composição divide a continuidade do projeto à esquerda e o formulário à direita. O lado editorial apresenta a frase “Seu projeto continua daqui” e demonstra o fluxo Revit → FireUtils → Memorial com uma linha técnica animada. O formulário de entrada permanece inteiramente visível e é a ação dominante.

No mobile, o contexto é reduzido ao título e o formulário aparece dentro do primeiro viewport. A narrativa completa não pode empurrar a tarefa de autenticação para baixo da dobra.

### Interaction

Uma única entrada coordenada apresenta cabeçalho, mensagem, fluxo e formulário. Um sinal vermelho percorre continuamente o diagrama do projeto. A troca entre login e cadastro anima apenas o conteúdo do formulário. Hover, foco, carregamento, erro e sucesso possuem estados próprios.

### Motion grammar

Movimento curto, suave e direcional, com curvas de desaceleração. A animação respeita `prefers-reduced-motion`; o conteúdo permanece totalmente funcional sem movimento.

### Content constraints

Usar somente capacidades confirmadas no produto. Não adicionar promessas de segurança, cobertura normativa, clientes, métricas ou benefícios comerciais não comprovados.
