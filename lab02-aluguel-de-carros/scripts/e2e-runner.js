// Sobe o servidor com uma CÓPIA temporária do db.json (o original não é alterado) e roda tests/e2e.cjs.
const { spawn, spawnSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');

const PORT = process.env.E2E_PORT || '3100';
const tmpDb = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'aluguel-e2e-')), 'db.json');
fs.copyFileSync(path.join(__dirname, '..', 'db.json'), tmpDb);

const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, PORT, DB_FILE: tmpDb, NODE_ENV: 'test' },
  stdio: 'ignore'
});

(async () => {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`http://localhost:${PORT}/api/clientes`)).ok) break; } catch { /* aguardando */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  const r = spawnSync('node', [path.join(__dirname, '..', 'tests', 'e2e.cjs')], {
    stdio: 'inherit', env: { ...process.env, BASE_URL: `http://localhost:${PORT}` }
  });
  server.kill();
  process.exit(r.status ?? 1);
})();
