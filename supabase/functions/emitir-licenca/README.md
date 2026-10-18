# emitir-licenca

Emite o token de licença assinado que o plugin Revit guarda no computador do
usuário e confere **offline** — é o que libera as ferramentas de
produtividade sem internet. Formato e motivação: `../_shared/licencaToken.ts`.

`POST` com `Authorization: Bearer <access token do usuário>` →
`{ token, exp, modulos }`. Conta sem licença também recebe token (com
`modulos: []`), para o plugin saber que a conta é conhecida e que o resultado
é "não contratou".

## Primeira publicação

```bash
node scripts/gerar-chave-licenca.mjs        # imprime a chave privada e a parte pública
supabase secrets set LICENCA_CHAVE_PRIVADA="$(cat chave.pem)"   # depois apague chave.pem
supabase functions deploy emitir-licenca
```

Cole `_CHAVE_PUBLICA_MODULO` e `_CHAVE_PUBLICA_EXPOENTE` em
`Fire Utils.tab/lib/licenca.py` (FireUtils.extension) **antes** de gerar o
instalador — o `build.ps1` recusa gerar sem elas. A chave privada nunca vai
para o repositório; guarde um backup num cofre de senhas, porque trocar a
chave exige reinstalar o plugin em todos os clientes.

`LICENCA_TTL_DIAS` (padrão 30, limite 1–90) é por quanto tempo o token vale
sem renovar: o tempo máximo que uma licença cancelada ainda funciona para quem
nunca abre a dockpane com internet. O dimensionamento não depende disso —
`motor-hidrantes` confere a licença no banco a cada chamada.

## Testes

```bash
node --test tests/licencaToken.test.mjs
```
