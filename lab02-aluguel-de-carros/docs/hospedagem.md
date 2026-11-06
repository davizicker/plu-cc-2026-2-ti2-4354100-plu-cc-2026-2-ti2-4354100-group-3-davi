# Hospedagem: site na Vercel (seu domínio) + API no Render (grátis)

## Por que dois serviços?
A Vercel só executa funções temporárias e **não guarda arquivos**. O JSON Server precisa gravar no `db.json`, então a API roda no **Render** (gratuito) e o **site** roda na **Vercel**, no seu domínio. O `vercel.json` já repassa tudo que começa com `/api` para o Render, então o navegador só enxerga o seu domínio (sem CORS).

```
Navegador ──► seudominio.com (Vercel: HTML/CSS/JS) ──/api/*──► Render (JSON Server + db.json)
```

## Parte 1 — API no Render
1. Deixe o código na branch que será publicada (normalmente `main`): abra e faça o *merge* do Pull Request da branch `ccr-10e2f1db-ekrd7f`. (Se preferir, o Render também aceita escolher essa branch.)
2. Crie conta em <https://render.com> entrando com o GitHub.
3. **New → Web Service** → escolha este repositório.
4. Preencha:
   - **Branch:** `main`
   - **Root Directory:** `lab02-aluguel-de-carros`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. **Create Web Service** e espere o status *Live*. Copie a URL, algo como `https://aluguel-de-carros-xxxx.onrender.com`.
6. Teste abrindo `https://SUA-URL.onrender.com/api/agentes` no navegador: deve aparecer uma lista JSON (sem o campo `senha`).

## Parte 2 — Site na Vercel
7. Edite o arquivo `lab02-aluguel-de-carros/vercel.json` e troque `SEU-SERVICO.onrender.com` pelo endereço do passo 5, **sem `https://` repetido e sem barra no final** dentro do host (fica `https://aluguel-de-carros-xxxx.onrender.com/api/:path*`). Faça *commit* e *push*.
8. Em <https://vercel.com> → **Add New… → Project** → importe **o mesmo repositório**.
   > Se o portfólio (Lab 01) já está na Vercel, este é um **segundo projeto** do mesmo repositório.
9. Em **Root Directory** clique em **Edit** e selecione `lab02-aluguel-de-carros`. **Framework Preset:** *Other* (o `vercel.json` já define o resto). Clique em **Deploy**.
10. Abra a URL `.vercel.app` gerada e entre com uma conta de demonstração (`maria@exemplo.com` / `123456`). Se entrar, tudo está ligado.

## Parte 3 — Seu domínio
11. No projeto da Vercel: **Settings → Domains → Add** e digite o domínio (ex.: `aluguel.seudominio.com` ou `seudominio.com`).
12. A Vercel mostra os registros DNS exatos. Em geral:
    - **Subdomínio** (`aluguel.seudominio.com`): registro **CNAME** `aluguel` → valor indicado pela Vercel (ex.: `cname.vercel-dns.com`).
    - **Domínio raiz** (`seudominio.com`): registro **A** → `76.76.21.21` (ou o valor que a Vercel indicar).
    - Alternativa: apontar os **nameservers** do domínio para os da Vercel.
13. Crie esses registros no painel de onde você registrou o domínio (Registro.br, Hostinger, GoDaddy, etc.). Use sempre os valores que a Vercel mostrar na tela.
14. Aguarde a propagação (de minutos a algumas horas). Quando o domínio ficar com ✔ na Vercel, o HTTPS é emitido automaticamente.

## Pontos de atenção
- **Plano gratuito do Render "dorme"** após ~15 min sem acesso; a primeira requisição pode levar até 1 minuto. O site mostra o aviso *"Conectando ao servidor…"* nesse caso. Dica: abra o site uns minutos antes de apresentar.
- **Dados voltam ao `db.json` do repositório** a cada novo deploy ou reinício do Render (disco efêmero). Para apresentar, basta usar as contas de demonstração; para persistir de verdade seria necessário um disco pago no Render (defina `DB_FILE` apontando para ele).
- A **Vercel Hobby (gratuita)** aceita domínio próprio, mas é para uso não comercial.
- Se aparecer erro ao entrar ou "falha na requisição": confira se o host do `vercel.json` está certo e se `https://SUA-URL.onrender.com/api/agentes` abre.

## Alternativa mais simples: tudo no Render
O Render também aceita domínio próprio gratuitamente (**Settings → Custom Domains**) e serve site e API juntos (`npm start`), sem precisar do `vercel.json`. Use esta opção se não quiser manter dois serviços.
