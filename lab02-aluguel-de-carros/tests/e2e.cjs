const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
// Teste ponta a ponta (Playwright). Use `npm run test:e2e` (sobe um servidor com cópia do banco).
// CDN_NM (opcional): pasta node_modules com bootstrap/bootstrap-icons para uso sem acesso ao CDN.
const NM = process.env.CDN_NM;
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const results = [];
const check = (nome, cond, extra='') => { results.push([cond, nome]); console.log((cond ? 'PASS ' : 'FAIL ') + nome + (cond ? '' : ' ' + extra)); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  const cdn = (route) => {
    const u = route.request().url();
    let f;
    if (u.includes('bootstrap-icons') && u.endsWith('.css')) f = NM + '/bootstrap-icons/font/bootstrap-icons.min.css';
    else if (u.includes('bootstrap-icons')) f = NM + '/bootstrap-icons/font/fonts/' + path.basename(u.split('?')[0]);
    else if (u.endsWith('.css')) f = NM + '/bootstrap/dist/css/bootstrap.min.css';
    else f = NM + '/bootstrap/dist/js/bootstrap.bundle.min.js';
    return fs.existsSync(f) ? route.fulfill({ path: f }) : route.fulfill({ status: 404, body: '' });
  };
  if (NM) await ctx.route('https://cdn.jsdelivr.net/**', cdn);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  // o 401 do login com senha errada é esperado (o navegador o registra no console)
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('401 (Unauthorized)')) errors.push('console: ' + m.text()); });
  page.on('dialog', (d) => d.accept());
  const shot = (n) => page.screenshot({ path: `${process.env.SHOTS_DIR || '/tmp'}/lab02-${n}.png`, fullPage: true });
  const login = async (email, senha = '123456') => {
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(BASE + '/index.html');
    await page.fill('#email', email); await page.fill('#senha', senha);
    await page.click('#btn-entrar');
    await page.waitForURL('**/painel.html');
  };

  // --- Login inválido
  await page.goto(BASE + '/index.html');
  await page.fill('#email', 'maria@exemplo.com'); await page.fill('#senha', 'errada');
  await page.click('#btn-entrar');
  await page.waitForSelector('.alert-danger');
  check('login com senha errada mostra erro', (await page.textContent('#aviso')).includes('inválidos'));
  await shot('01-login');

  // --- Cadastro público de cliente (validações + sucesso)
  await page.goto(BASE + '/cadastro.html');
  await page.click('form#form-cliente button[type=submit]');
  check('cadastro vazio mostra erros', (await page.locator('#form-cliente .is-invalid').count()) >= 5);
  await page.fill('#c-nome', 'Ana Paula Lima'); await page.fill('#c-rg', 'MG-11.222.333');
  await page.fill('#c-cpf', '52998224725');   // CPF já existente
  await page.fill('#c-endereco', 'Rua A, 10, Centro, BH/MG'); await page.fill('#c-profissao', 'Designer');
  await page.fill('#c-email', 'ana@exemplo.com'); await page.fill('#c-senha', 'abc123');
  await page.fill('.r-entidade', 'Studio X'); await page.fill('.r-valor', '6000');
  await page.click('form#form-cliente button[type=submit]');
  await page.waitForTimeout(500);
  check('CPF duplicado é rejeitado', (await page.locator('#c-cpf.is-invalid').count()) === 1);
  await page.fill('#c-cpf', '39053344705'); // valid CPF
  await page.click('#btn-add-rendimento'); await page.click('#btn-add-rendimento');
  check('máximo de 3 rendimentos', (await page.locator('.rendimento-linha').count()) === 3 && await page.locator('#btn-add-rendimento').isDisabled());
  await page.locator('.r-remover').first().click();
  check('remover rendimento reabilita adicionar', await page.locator('#btn-add-rendimento').isEnabled());
  await page.click('#btn-add-rendimento'); // 3 rows again; fill empties
  const linhas = page.locator('.rendimento-linha');
  for (let i = 0; i < 3; i++) { await linhas.nth(i).locator('.r-entidade').fill('Fonte ' + i); await linhas.nth(i).locator('.r-valor').fill('2000'); }
  await shot('02-cadastro');
  await page.click('form#form-cliente button[type=submit]');
  await page.waitForURL('**/index.html?cadastro=ok');
  check('cadastro de cliente conclui e volta ao login', (await page.textContent('#aviso')).includes('Cadastro realizado'));

  // --- Cliente Ana: login, novo pedido
  await login('ana@exemplo.com', 'abc123');
  check('painel do cliente', (await page.textContent('#saudacao')).includes('Ana'));
  await shot('03-painel-cliente');
  await page.goto(BASE + '/pedidos.html');
  await page.click('#btn-novo');
  await page.waitForSelector('#modal-pedido.show');
  await page.click('#btn-salvar-pedido');
  check('pedido vazio mostra erros', (await page.locator('#form-pedido .is-invalid').count()) >= 3);
  await page.selectOption('#p-auto', '4'); // Corolla
  await page.fill('#p-inicio', '2027-01-10'); await page.fill('#p-fim', '2027-01-09');
  await page.click('#btn-salvar-pedido');
  check('devolução antes da retirada é rejeitada', (await page.locator('#p-fim.is-invalid').count()) === 1);
  await page.fill('#p-fim', '2027-01-14');
  check('resumo calcula total (5 diárias × 310)', (await page.textContent('#p-resumo')).includes('1.550,00'));
  await page.check('#p-credito');
  await page.click('#btn-salvar-pedido');
  check('crédito sem banco é rejeitado', (await page.locator('#p-banco.is-invalid').count()) === 1);
  await page.selectOption('#p-banco', '3');
  await shot('04-novo-pedido');
  await page.click('#btn-salvar-pedido');
  await page.waitForSelector('#modal-pedido', { state: 'hidden' });
  check('pedido criado (Em análise)', (await page.textContent('#lista')).includes('Corolla') && (await page.textContent('#lista')).includes('Em análise'));

  // conflito de datas
  await page.click('#btn-novo'); await page.waitForSelector('#modal-pedido.show');
  await page.selectOption('#p-auto', '4'); await page.fill('#p-inicio', '2027-01-12'); await page.fill('#p-fim', '2027-01-20');
  await page.click('#btn-salvar-pedido');
  await page.waitForSelector('#modal-pedido-alerta .alert-danger');
  check('conflito de período bloqueia pedido', (await page.textContent('#modal-pedido-alerta')).includes('indisponível'));
  await page.waitForTimeout(500); await page.keyboard.press('Escape'); await page.waitForSelector('#modal-pedido', { state: 'hidden' });

  // modificar
  const linhaAna = page.locator('#lista tr', { hasText: 'Corolla' }).first();
  await linhaAna.locator('[data-acao=editar]').click();
  await page.waitForSelector('#modal-pedido.show');
  await page.fill('#p-fim', '2027-01-15');
  await page.click('#btn-salvar-pedido');
  await page.waitForSelector('#modal-pedido', { state: 'hidden' });
  check('pedido modificado', (await page.textContent('#lista')).includes('15/01/2027'));

  // cancelar outro pedido (cria e cancela)
  await page.click('#btn-novo'); await page.waitForSelector('#modal-pedido.show');
  await page.selectOption('#p-auto', '1'); await page.fill('#p-inicio', '2027-02-01'); await page.fill('#p-fim', '2027-02-02');
  await page.click('#btn-salvar-pedido'); await page.waitForSelector('#modal-pedido', { state: 'hidden' });
  const lArgo = page.locator('#lista tr', { hasText: 'Argo' }).first();
  await lArgo.locator('[data-acao=cancelar]').click();
  await page.waitForSelector('.modal.show [data-ok]');
  await page.click('.modal.show [data-ok]');
  await page.waitForFunction(() => document.querySelector('#lista').textContent.includes('Cancelado'));
  check('pedido cancelado pelo cliente', true);
  check('cliente não vê pedidos de outros', !(await page.textContent('#lista')).includes('T-Cross'));
  await shot('05-pedidos-cliente');

  // cliente não acessa área de agente (clientes mostra só o próprio)
  await page.goto(BASE + '/clientes.html');
  await page.waitForSelector('dl');
  check('cliente vê só o próprio perfil', (await page.textContent('#conteudo')).includes('Ana Paula') && !(await page.textContent('#conteudo')).includes('Maria'));

  // --- Agente errado (empresa) tenta contratar pedido com crédito do Banco Minas
  await login('empresa@exemplo.com');
  await page.goto(BASE + '/pedidos.html');
  await page.waitForSelector('#lista tr');
  check('agente vê todos os pedidos', (await page.locator('#lista tr').count()) >= 5);
  check('agente não vê "Novo pedido"', await page.locator('#btn-novo').isHidden());
  const lCorolla = page.locator('#lista tr', { hasText: 'Corolla' }).first();
  await lCorolla.locator('[data-acao=avaliar]').click();
  await page.waitForSelector('#modal-avaliacao.show');
  await shot('06-avaliacao');
  await page.click('#btn-aprovar');
  check('parecer curto é rejeitado', (await page.locator('#a-parecer.is-invalid').count()) === 1);
  await page.fill('#a-parecer', 'Renda compatível.');
  await page.click('#btn-aprovar');
  await page.waitForSelector('#modal-avaliacao', { state: 'hidden' });
  check('pedido aprovado', (await page.textContent('#lista')).includes('Aprovado'));
  await page.locator('#lista tr', { hasText: 'Corolla' }).first().locator('[data-acao=contratar]').click();
  await page.waitForSelector('#modal-contrato.show');
  check('empresa não pode executar contrato com crédito de outro banco', await page.locator('#btn-executar').isDisabled());
  await page.waitForTimeout(500); await page.keyboard.press('Escape'); await page.waitForSelector('#modal-contrato', { state: 'hidden' });

  // empresa executa contrato do pedido sem crédito (Carlos / Argo, #2 Aprovado)
  const l2 = page.locator('#lista tr', { hasText: 'Carlos' }).filter({ hasText: 'Aprovado' }).first();
  await l2.locator('[data-acao=contratar]').click();
  await page.waitForSelector('#modal-contrato.show');
  await page.selectOption('#k-propriedade', 'cliente');
  await page.click('#btn-executar');
  await page.waitForSelector('#modal-contrato', { state: 'hidden' });
  check('contrato executado sem crédito', (await page.textContent('#lista')).includes('Contratado'));
  const autos = await (await fetch(BASE + '/api/automoveis/1')).json();
  check('propriedade do carro passou ao cliente', autos.proprietarioTipo === 'cliente' && autos.proprietarioId === 2);

  // --- Banco Minas (id 3) executa contrato com crédito (Ana / Corolla)
  await login('minascredito@exemplo.com');
  await page.goto(BASE + '/pedidos.html');
  await page.locator('#lista tr', { hasText: 'Corolla' }).first().locator('[data-acao=contratar]').click();
  await page.waitForSelector('#modal-contrato.show');
  await page.fill('#k-parcelas', '5'); await page.fill('#k-taxa', '2');
  check('prévia da parcela calculada', (await page.textContent('#k-parcela-previa')).includes('5×'));
  await shot('07-contrato');
  await page.click('#btn-executar');
  await page.waitForSelector('#modal-contrato', { state: 'hidden' });
  const ctr = await (await fetch(BASE + '/api/contratos')).json();
  const novo = ctr[ctr.length - 1];
  const esperado = 1550 + 0; // total Corolla 5 diárias após edição (6 diárias = 1860)
  check('contrato com crédito gravado (Price)', novo.credito && novo.credito.parcelas === 5 && novo.credito.valorParcela > 0 && novo.credito.bancoId === 3, JSON.stringify(novo));
  const car4 = await (await fetch(BASE + '/api/automoveis/4')).json();
  check('propriedade do carro passou ao banco', car4.proprietarioTipo === 'banco' && car4.proprietarioId === 3);
  await page.goto(BASE + '/contratos.html'); await page.waitForSelector('#lista tr');
  await page.locator('#lista [data-id]').first().click();
  await page.waitForSelector('#modal-contrato.show');
  check('detalhe do contrato', (await page.textContent('#contrato-corpo')).includes('Crédito'));
  await shot('08-contratos');

  // --- Agente: CRUD de clientes e automóveis
  await login('banco@exemplo.com');
  await page.goto(BASE + '/clientes.html'); await page.waitForSelector('#lista tr');
  check('agente lista clientes', (await page.locator('#lista tr').count()) >= 3);
  await page.fill('#busca', 'carlos');
  check('busca de clientes filtra', (await page.locator('#lista tr').count()) === 1);
  await shot('09-clientes-agente');
  await page.fill('#busca', 'Ana');
  await page.locator('#lista [data-acao=excluir]').first().click();
  await page.waitForSelector('#alerta .alert-danger');
  check('exclusão bloqueada com pedido ativo', (await page.textContent('#alerta')).includes('Não é possível excluir'));
  // edita cliente
  await page.goto(BASE + '/cadastro.html?id=2'); await page.waitForSelector('#c-nome');
  await page.waitForFunction(() => document.querySelector('#c-nome').value);
  await page.fill('#c-profissao', 'Professor Universitário');
  await page.click('form#form-cliente button[type=submit]');
  await page.waitForURL('**/clientes.html');
  check('cliente editado', (await (await fetch(BASE + '/api/clientes/2')).json()).profissao === 'Professor Universitário');
  // novo cliente pelo agente + exclusão
  await page.goto(BASE + '/cadastro.html');
  check('agente cria cliente sem seletor de perfil', await page.locator('#seletor-perfil').isHidden());
  await page.fill('#c-nome', 'Temp Teste'); await page.fill('#c-rg', 'MG-1234567'); await page.fill('#c-cpf', '16899535009');
  await page.fill('#c-endereco', 'Rua Temp 1, BH'); await page.fill('#c-profissao', 'Teste'); await page.fill('#c-email', 'temp@exemplo.com'); await page.fill('#c-senha', 'temp123');
  await page.fill('.r-entidade', 'X'); await page.fill('.r-valor', '100');
  await page.click('form#form-cliente button[type=submit]');
  await page.waitForURL('**/clientes.html'); await page.waitForSelector('#lista tr');
  await page.fill('#busca', 'Temp');
  await page.locator('#lista [data-acao=excluir]').first().click();
  await page.waitForSelector('.modal.show [data-ok]'); await page.click('.modal.show [data-ok]');
  await page.waitForFunction(() => !document.querySelector('#lista').textContent.includes('Temp Teste'));
  check('cliente excluído', !(await (await fetch(BASE + '/api/clientes')).json()).some((c) => c.email === 'temp@exemplo.com'));

  // automóveis
  await page.goto(BASE + '/automoveis.html'); await page.waitForSelector('#lista tr');
  await page.click('#btn-novo'); await page.waitForSelector('#modal-auto.show');
  await page.click('#form-auto button[type=submit]');
  check('carro vazio mostra erros', (await page.locator('#form-auto .is-invalid').count()) >= 5);
  await page.fill('#f-marca', 'Renault'); await page.fill('#f-modelo', 'Kwid'); await page.fill('#f-ano', '2025');
  await page.fill('#f-placa', 'rio2a19'); await page.fill('#f-matricula', '999888777'); await page.fill('#f-diaria', '99.9');
  await page.click('#form-auto button[type=submit]');
  check('placa duplicada rejeitada', (await page.locator('#f-placa.is-invalid').count()) === 1);
  await page.fill('#f-placa', 'ZZZ9Z99');
  await page.click('#form-auto button[type=submit]');
  await page.waitForSelector('#modal-auto', { state: 'hidden' });
  check('carro criado', (await page.textContent('#lista')).includes('Kwid'));
  await shot('10-automoveis');
  await page.locator('#lista tr', { hasText: 'Kwid' }).locator('[data-acao=editar]').click();
  await page.waitForSelector('#modal-auto.show'); await page.fill('#f-diaria', '105');
  await page.click('#form-auto button[type=submit]'); await page.waitForSelector('#modal-auto', { state: 'hidden' });
  check('carro editado', (await page.textContent('#lista')).includes('105,00'));
  await page.locator('#lista tr', { hasText: 'Kwid' }).locator('[data-acao=excluir]').click();
  await page.waitForSelector('.modal.show [data-ok]'); await page.click('.modal.show [data-ok]');
  await page.waitForFunction(() => !document.querySelector('#lista').textContent.includes('Kwid'));
  check('carro excluído', true);
  await page.locator('#lista tr', { hasText: 'T-Cross' }).locator('[data-acao=excluir]').click();
  await page.waitForSelector('#alerta .alert-danger');
  check('exclusão de carro com pedido ativo bloqueada', (await page.textContent('#alerta')).includes('Não é possível'));

  // cliente só edita seus carros
  await login('carlos@exemplo.com');
  await page.goto(BASE + '/automoveis.html'); await page.waitForSelector('#lista tr');
  check('cliente só edita os próprios carros', (await page.locator('#lista [data-acao=editar]').count()) === 2 /* HR-V + Argo agora do Carlos */, String(await page.locator('#lista [data-acao=editar]').count()));
  // novo pedido: cliente não vê os próprios carros; atalho ?novo=1
  await page.goto(BASE + '/pedidos.html?novo=1'); await page.waitForSelector('#modal-pedido.show');
  const opts = await page.locator('#p-auto option').allTextContents();
  check('cliente não pode alugar o próprio carro', !opts.some((o) => o.includes('HR-V')) && !opts.some((o) => o.includes('Argo')) && opts.some((o) => o.includes('Onix')), opts.join('|'));

  // ação sobre pedido desatualizado (outro usuário alterou antes)
  await login('banco@exemplo.com');
  await page.goto(BASE + '/pedidos.html'); await page.waitForSelector('#lista tr');
  await page.locator('#lista tr', { hasText: 'T-Cross' }).locator('[data-acao=avaliar]').click();
  await page.waitForSelector('#modal-avaliacao.show'); await page.waitForTimeout(500);
  await fetch(BASE + '/api/pedidos/1', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Cancelado' }) });
  await page.fill('#a-parecer', 'Parecer de teste.'); await page.click('#btn-aprovar');
  await page.waitForSelector('.toast.text-bg-warning');
  check('ação sobre pedido desatualizado é recusada', (await (await fetch(BASE + '/api/pedidos/1')).json()).status === 'Cancelado');

  // segurança do servidor
  const clAPI = await (await fetch(BASE + '/api/clientes')).json();
  const agAPI = await (await fetch(BASE + '/api/agentes')).json();
  check('API não expõe senhas', clAPI.every((c) => !('senha' in c)) && agAPI.every((a) => !('senha' in a)));
  const post = (corpo) => fetch(BASE + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
  const bom = await post({ email: 'ana@exemplo.com', senha: 'abc123' });
  check('login no servidor devolve sessão sem senha', bom.status === 200 && !JSON.stringify(await bom.json()).includes('senha'));
  check('login inválido retorna 401', (await post({ email: 'ana@exemplo.com', senha: 'errada' })).status === 401);
  if (process.env.E2E_DB) {
    const bruto = JSON.parse(fs.readFileSync(process.env.E2E_DB, 'utf8'));
    check('senha de conta nova é gravada com hash', bruto.clientes.find((c) => c.email === 'ana@exemplo.com').senha.startsWith('scrypt$'));
  }
  const cab = (await fetch(BASE + '/')).headers;
  check('cabeçalhos de segurança presentes', Boolean(cab.get('content-security-policy')) && cab.get('x-content-type-options') === 'nosniff');
  const nf = await fetch(BASE + '/nao-existe');
  check('página 404 amigável', nf.status === 404 && (await nf.text()).includes('Página não encontrada'));

  // rotas protegidas
  await page.evaluate(() => sessionStorage.clear());
  await page.goto(BASE + '/pedidos.html'); await page.waitForURL('**/index.html');
  check('rota protegida redireciona ao login', true);

  // mobile
  const m = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  if (NM) await m.route('https://cdn.jsdelivr.net/**', cdn);
  const mp = await m.newPage();
  await mp.goto(BASE + '/index.html'); await mp.screenshot({ path: `${process.env.SHOTS_DIR || '/tmp'}/lab02-11-mobile-login.png`, fullPage: true });
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  check('sem rolagem horizontal no mobile (login)', !overflow);

  check('sem erros de console/JS', errors.length === 0, errors.join(' | '));
  await browser.close();
  const falhas = results.filter((r) => !r[0]).length;
  console.log(`\n${results.length - falhas}/${results.length} verificações OK`);
  process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error('ERRO NO TESTE', e); process.exit(2); });
