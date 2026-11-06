/**
 * Servidor único do projeto:
 *  - /api/*  -> JSON Server (API REST simulada a partir do arquivo db.json)
 *  - /*      -> arquivos estáticos do front-end (pasta public/)
 *
 * Camada de segurança sobre o JSON Server:
 *  - senhas são gravadas com hash (scrypt) e NUNCA retornam nas respostas da API;
 *  - POST /api/login valida credenciais no servidor (com limite de tentativas);
 *  - cabeçalhos de segurança (CSP, nosniff, etc.).
 * Observação: o JSON Server não tem controle de acesso por usuário; as permissões
 * por perfil continuam sendo aplicadas no front-end (projeto acadêmico).
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');

const PORT = process.env.PORT || 3000;
const SEED_FILE = path.join(__dirname, 'db.json');
// Em hospedagens com disco efêmero, DB_FILE pode apontar para um volume persistente.
const DB_FILE = process.env.DB_FILE || SEED_FILE;
const PUBLIC_DIR = path.join(__dirname, 'public');

if (!fs.existsSync(DB_FILE)) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.copyFileSync(SEED_FILE, DB_FILE);
}

// ---- Senhas ------------------------------------------------------------------------------
const hashSenha = (senha) => {
  const salt = crypto.randomBytes(16);
  return `scrypt$${salt.toString('hex')}$${crypto.scryptSync(senha, salt, 32).toString('hex')}`;
};
const iguais = (a, b) => a.length === b.length && crypto.timingSafeEqual(a, b);
function confereSenha(senha, armazenada) {
  if (typeof armazenada !== 'string') return false;
  // Dados de exemplo do db.json ainda estão em texto puro; contas novas usam hash.
  if (!armazenada.startsWith('scrypt$')) return iguais(Buffer.from(senha), Buffer.from(armazenada));
  const [, saltHex, hashHex] = armazenada.split('$');
  const calculado = crypto.scryptSync(senha, Buffer.from(saltHex, 'hex'), 32);
  return iguais(calculado, Buffer.from(hashHex, 'hex'));
}
const semSenha = (dado) => {
  if (Array.isArray(dado)) return dado.map(semSenha);
  if (dado && typeof dado === 'object') {
    const copia = { ...dado };
    delete copia.senha;
    return copia;
  }
  return dado;
};

// ---- Aplicação ---------------------------------------------------------------------------
const server = jsonServer.create();
const router = jsonServer.router(DB_FILE);
server.disable('x-powered-by');

server.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' https://cdn.jsdelivr.net; " +
      "font-src 'self' https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'"
  );
  next();
});

server.use(jsonServer.defaults({ static: PUBLIC_DIR, logger: process.env.NODE_ENV !== 'test', noCors: true }));

// CORS só é necessário se o front-end estiver em OUTRO domínio. Por padrão (mesma origem ou proxy da Vercel) nada é liberado.
// ALLOWED_ORIGINS="https://meusite.com,https://www.meusite.com" libera origens específicas.
const origensPermitidas = (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
server.use('/api', (req, res, next) => {
  const origem = req.headers.origin;
  if (origem && origensPermitidas.includes(origem)) {
    res.setHeader('Access-Control-Allow-Origin', origem);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});
server.use(jsonServer.bodyParser); // as rotas abaixo (login e hash de senha) precisam do corpo já interpretado

// Login validado no servidor, com limite de 10 tentativas por minuto (IP + e-mail).
const tentativas = new Map();
server.post('/api/login', (req, res) => {
  const { email, senha } = req.body || {};
  if (typeof email !== 'string' || typeof senha !== 'string' || !email || !senha) {
    return res.status(400).json({ erro: 'Informe e-mail e senha.' });
  }
  const e = email.trim().toLowerCase();
  const chave = `${req.ip}|${e}`;
  const agora = Date.now();
  const reg = tentativas.get(chave);
  if (reg && agora < reg.ate && reg.n >= 10) {
    return res.status(429).json({ erro: 'Muitas tentativas. Aguarde um minuto e tente novamente.' });
  }
  const db = router.db;
  const cliente = db.get('clientes').find((c) => c.email === e).value();
  if (cliente && confereSenha(senha, cliente.senha)) {
    tentativas.delete(chave);
    return res.json({ perfil: 'cliente', id: cliente.id, nome: cliente.nome });
  }
  const agente = db.get('agentes').find((a) => a.email === e).value();
  if (agente && confereSenha(senha, agente.senha)) {
    tentativas.delete(chave);
    return res.json({ perfil: 'agente', id: agente.id, nome: agente.nome, tipo: agente.tipo });
  }
  tentativas.set(chave, !reg || agora >= reg.ate ? { n: 1, ate: agora + 60000 } : { n: reg.n + 1, ate: reg.ate });
  return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
});

// Escrita em clientes/agentes: aplica hash na senha; se a senha não vier, preserva a existente.
server.use(['/api/clientes', '/api/agentes'], (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method) || !req.body || typeof req.body !== 'object') return next();
  const colecao = req.baseUrl.split('/').pop();
  if (typeof req.body.senha === 'string' && req.body.senha) {
    if (req.body.senha.length < 6) return res.status(400).json({ erro: 'A senha deve ter ao menos 6 caracteres.' });
    req.body.senha = hashSenha(req.body.senha);
  } else {
    delete req.body.senha;
    const id = Number(req.path.split('/')[1]);
    const existente = id ? router.db.get(colecao).find({ id }).value() : null;
    if (existente?.senha) req.body.senha = existente.senha;
  }
  next();
});

// Nunca devolve o campo "senha" ao navegador.
router.render = (req, res) => res.jsonp(semSenha(res.locals.data));
server.use('/api', router);

server.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ erro: 'Recurso não encontrado.' });
  return res.status(404).sendFile(path.join(PUBLIC_DIR, '404.html'));
});

server.listen(PORT, () => {
  console.log(`Aluguel de Carros rodando em http://localhost:${PORT}`);
  console.log(`API REST (JSON Server):     http://localhost:${PORT}/api/clientes`);
});
