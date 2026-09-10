# Sincronização em tempo real — várias abas editando o mesmo projeto

Este documento explica como o Fire Utils permite que a mesma conta, aberta
em vários lugares ao mesmo tempo (duas abas, dois computadores, ou uma aba +
o plugin Revit), edite o mesmo projeto sem uma sessão sobrescrever a outra.
Toda a implementação vive em `src/context/ProjetoContext.jsx`.

## O problema que isso resolve

Sem nada disso, o app teria só um autosave: cada aba grava o projeto
inteiro no Postgres, debounced, de tempos em tempos. Duas abas abertas no
mesmo projeto competiam pra ver quem salvava por último — quem perdia a
corrida via seu trabalho sumir sem aviso.

## As três camadas

1. **localStorage** — toda mudança de estado grava instantaneamente um
   cache local (`etos-projeto` + `etos-projetos`). Sobrevive a F5 e queda de
   internet, mas é só desta aba/navegador.
2. **Autosave no Postgres, com controle de versão** — debounced (800ms),
   condicional: só grava se a `version` da linha que esta aba conhece ainda
   bate com a do banco (compare-and-swap). Se não bater, tenta mais uma vez
   com a versão atual antes de desistir (ver "Falso conflito de versão"
   abaixo) — só marca conflito de verdade se essa segunda tentativa também
   falhar.
3. **Broadcast em tempo real (Supabase Realtime)** — cada ação do reducer é
   transmitida pra outras abas conectadas no mesmo projeto, que aplicam a
   mesma ação no próprio estado. É essa camada que faz a edição parecer
   simultânea, sem esperar um save/reload.

A camada 3 é sobre **UX ao vivo** (o que aparece na tela). A camada 2
continua sendo a única fonte de verdade durável — o que sobrevive a um F5.

## Como uma ação viaja

```
dispatch({ type: 'UPDATE_EXTINTOR', id, changes })
        │
        ├─► resolverAcaoLocal(action, state)   // fixa id/valor quando a ação precisa (ver abaixo)
        │
        ├─► rawDispatch(action)                // aplica localmente, de verdade
        │
        └─► channel.send({ event: 'action', payload: { action } })
                    │
                    ▼
        outras abas: channel.on('broadcast') → rawDispatch(action)
```

O canal é escopado por projeto: `projeto:${state.id}`, criado/destruído
conforme a aba entra e sai de um projeto (efeito com dep `[user, state.id,
state.saveReady]`). Usa `broadcast.self: false` — o remetente nunca recebe
o próprio eco.

## Regras obrigatórias ao adicionar uma ação nova ao reducer

Qualquer ação nova que mexa em dado do projeto passa a ser replicada
automaticamente pra outras abas (é o comportamento padrão — só entra em
`NAO_BROADCAST` quem for navegação/boot local, ver abaixo). Isso só
funciona direito se a ação for **determinística**: a mesma ação aplicada
duas vezes (uma vez localmente, uma vez na aba remota) tem que produzir o
mesmo resultado nos dois lados. Duas armadilhas already found and fixed:

### 1. Não gere id dentro do `case` do reducer

Se o `case` gera um id com `Date.now()`/`Math.random()` (como
`novoExtintor`, `novaEstrutura`, etc.), cada aba geraria um id diferente
pro "mesmo" item — a ação vira dois itens, não um. A correção: o id é
gerado **antes** do reducer, em `resolverAcaoLocal`, e viaja dentro da
própria action. O `case` do reducer sempre prefere `action.id` quando
presente, e só gera um novo como fallback (pra continuar funcionando se
alguém despachar a ação direto, fora do fluxo normal).

```js
// resolverAcaoLocal
case 'ADD_EXTINTOR':
  return action.id ? action : { ...action, id: idParaTipo(action.type)() }
```

Ação nova que cria um item com id → adicione o `type` dela nesse switch
(e no `idParaTipo`, se precisar de um gerador próprio).

### 2. Não use "inverte o valor atual" pra ações tipo toggle

Um `TOGGLE_X` que faz `!estadoAtual` dentro do reducer quebra em replay:
se as duas abas clicarem quase ao mesmo tempo, cada uma inverte
localmente, manda a ação, a outra recebe e inverte de novo — o valor
final fica errado (invertido duas vezes). A correção: `resolverAcaoLocal`
calcula o valor final (`!atual`) **uma vez**, no momento do clique, e a
action carrega esse valor pronto (`action.value`). O reducer usa
`action.value` quando presente; só cai no cálculo `!atual` como fallback.

Qualquer ação nova com semântica de "inverte"/"incrementa" (em vez de "seta
pra X") precisa do mesmo tratamento — calcule o valor final no dispatch,
não no reducer.

### 3. Ações que não devem viajar pra outras abas

`NAO_BROADCAST` (topo do arquivo) lista ações de navegação/boot que são
só desta aba: `LOAD`, `NEW_PROJECT`, `SET_WIZARD`. Se a ação nova for
desse tipo (estado de UI local, não dado do projeto), adicione o `type`
dela ali.

## Só quem editou salva no Postgres (e por que isso quase quebrou tudo)

Deixar as duas abas salvando toda mudança (inclusive as que só chegaram
via broadcast) causava conflitos de versão constantes — as duas
competindo pra persistir o mesmo conteúdo convergido. A correção:
`pendingLocalRef` marca "esta aba tem uma mudança **local** pendente de
salvar". Só é setado por `dispatch` (o wrapper que o app usa); uma ação
aplicada via `channel.on('broadcast', ...)` chama `rawDispatch` direto,
sem passar por `dispatch`, então não marca nada. O autosave ignora o
efeito disparado por uma mudança puramente remota.

### Falso conflito de versão

Isso por si só criou um bug: só a aba de origem salva e avança a
`version` — mas a outra aba nunca fica sabendo do número novo. Na
próxima vez que **ela** tentar salvar sua própria edição, usa a versão
velha, o compare-and-swap falha, e ela marcava conflito — parando de
salvar pro resto da sessão, mesmo continuando a receber/mandar mudanças
ao vivo (dando a falsa impressão de que estava tudo sincronizado). A
correção: antes de declarar conflito de verdade, tenta salvar mais uma
vez com a versão atual do banco — como o `state` local já está
convergido (recebeu tudo ao vivo), essa segunda tentativa resolve o caso
comum sem perder nada.

## O que NÃO está nessa sincronização (limitações conhecidas)

- **Formulários em edição** ficam em `useState` local até o clique de
  confirmar/adicionar — só o resultado final vira uma ação e sincroniza.
  Isso é proposital (ver `SaidaEmergenciaPage.jsx`: o texto sendo digitado
  no formulário de ambiente não gera tráfego a cada tecla).
- **Config só-desta-aba em Saída de Emergência** — chuveiros/detecção por
  estrutura, largura adotada, "saída única" e o colapso dos cards ainda
  são locais, não sincronizam nem persistem entre sessões.
- **Rede/canal caído** — se o Realtime cair, as abas divergem até alguém
  recarregar; o autosave com CAS (camada 2) continua sendo a rede de
  segurança contra sobrescrita silenciosa nesse cenário.
- **Um terceiro escritor não-navegador** (ex.: o plugin Revit escrevendo
  direto no Supabase) precisa seguir o mesmo protocolo (CAS + broadcast no
  mesmo canal, mesmo formato de ação) pra participar dessa sincronização —
  ver histórico de decisões sobre isso, ainda não implementado neste
  repositório.

## Onde olhar no código

Tudo isso está em `src/context/ProjetoContext.jsx`:
- `resolverAcaoLocal` / `idParaTipo` / `NAO_BROADCAST` — regras de
  determinismo antes do dispatch.
- `ProjetoProvider` → efeito do `channelRef` — abre/fecha o canal Realtime
  por projeto.
- `ProjetoProvider` → `dispatch` (useCallback) — aplica local + transmite.
- `ProjetoProvider` → efeito de autosave — grava no localStorage sempre;
  no Postgres só se `pendingLocalRef` for verdadeiro; retry de versão no
  bloco de conflito.
