/**
 * Servidor único do projeto:
 *  - /api/*  -> JSON Server (API REST simulada a partir do arquivo db.json)
 *  - /*      -> arquivos estáticos do front-end (pasta public/)
 *
 * Assim, um único serviço (Render, Railway, etc.) hospeda tudo e o front-end
 * consome a API via Fetch API na mesma origem (sem CORS).
 */
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

const server = jsonServer.create();
const router = jsonServer.router(DB_FILE);
const middlewares = jsonServer.defaults({ static: PUBLIC_DIR, logger: process.env.NODE_ENV !== 'test' });

server.use(middlewares);
server.use('/api', router);

server.listen(PORT, () => {
  console.log(`Aluguel de Carros rodando em http://localhost:${PORT}`);
  console.log(`API REST (JSON Server):     http://localhost:${PORT}/api/clientes`);
});
