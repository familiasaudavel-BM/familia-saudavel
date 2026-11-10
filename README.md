# 🥦 Família Saudável

Plataforma da família com abas para: Hoje, Cardápio, Receitas, Compras, Treinos, Shot e chás, Acompanhar, Provas (resultados e fotos de corridas), Crianças (missões e joguinhos) e Orientações.

## Arquivos

| Arquivo | O que é |
| --- | --- |
| `index.html` | A página |
| `estilo.css` | Visual |
| `config.js` | **Única coisa que você precisa editar** (Supabase, nomes, data de início) |
| `dados.js` | Conteúdo: cardápio, receitas, treinos, compras, shot, orientações |
| `app.js` | Funcionamento das abas |
| `criancas.js` | Missões e joguinhos das crianças |
| `provas.js` | Provas e eventos de corrida, recordes e fotos |
| `figuras.js` | Desenhos dos exercícios |
| `relogio.js` | Aba do relógio (Mi Fitness) |
| `editor.js` | Modo edição e aba Ajustes |
| `supabase.sql` | Cria a tabela e a pasta privada de fotos no Supabase |

Todos ficam na raiz do repositório, sem pastas (mais fácil de subir pelo tablet).

## Passo 1 — GitHub (pelo tablet)

1. Crie um repositório novo, por exemplo `familia-saudavel`, na sua conta **pessoal**. Não use a organização da escola.
2. **Add file → Upload files** e envie os 12 arquivos de uma vez → **Commit changes**.
3. **Settings → Pages → Source: Deploy from a branch → Branch: main / (root) → Save**.
4. Em 1 ou 2 minutos, o site fica em `https://SEU-USUARIO.github.io/familia-saudavel/`.

Nesse momento ele já funciona em **modo local**: o que marcar fica salvo só naquele aparelho.

## Passo 2 — Supabase (para sincronizar celulares e tablet)

1. Crie um projeto novo no Supabase (ex.: `familia-saudavel`), separado dos projetos da escola.
2. **SQL Editor → New query** → cole o conteúdo de `supabase.sql` → **Run**. Isso cria a tabela e a pasta privada `fotos-familia` para as fotos das provas.
3. **Authentication → Users → Add user → Create new user**: crie o login da família (e-mail + senha) e marque **Auto Confirm User**.
4. **Authentication → Sign In / Providers** (ou *Settings*): **desligue "Allow new users to sign up"**. Assim ninguém de fora consegue criar conta.
5. **Project Settings → API**: copie a **Project URL** e a chave **anon public**.
6. No GitHub, abra `config.js` → lápis ✏️ → cole nos campos `SUPABASE_URL` e `SUPABASE_ANON_KEY` → **Commit changes**.

Pronto: o site pede o login da família e tudo sincroniza entre os aparelhos. O que já tinha sido marcado em modo local sobe para a nuvem no primeiro login.

## Personalizar (`config.js`)

- `NOMES`: como cada um aparece. O site é público na internet: para as crianças, use apelidos.
- `DATA_INICIO`: a segunda-feira em que começa a semana 1 do ciclo de 2 semanas.
- `AGUA`: meta de copos (250 ml) por dia.

## Privacidade

- O código no GitHub **não tem nenhum dado pessoal**. Peso, medidas, corridas, provas, fotos e anotações ficam só no Supabase, protegidos pelo login e pelo RLS.
- As fotos ficam numa pasta **privada**: só abrem com o login da família (links temporários de 1 hora).
- **Não desative o RLS** da tabela `registros`.
- Para sair num aparelho: botão ⎋ no topo.

## Instalar como aplicativo

No Chrome do celular ou tablet: menu ⋮ → **Adicionar à tela inicial**.

---
Plano educativo. Não substitui médico ou nutricionista.
