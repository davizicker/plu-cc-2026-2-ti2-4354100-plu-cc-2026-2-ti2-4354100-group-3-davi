import { api } from '../api.js';
import { emailEmUso, getSessao } from '../auth.js';
import { esc, iniciaPagina, mostraErro, toast } from '../ui.js';
import { formatCNPJ, formatCPF, isCNPJ, isCPF, isEmail, onlyDigits } from '../validators.js';

const MAX_RENDIMENTOS = 3;
const params = new URLSearchParams(location.search);
const sessao = getSessao();
iniciaPagina('clientes.html');

const $ = (id) => document.getElementById(id);
const formCliente = $('form-cliente');
const formAgente = $('form-agente');
const alerta = $('alerta');

// ---- Define o modo da página ---------------------------------------------------------
let modo; // 'publico' | 'novoCliente' | 'editaCliente' | 'editaAgente'
let registroId = null;
let registro = null;

if (params.has('agente')) {
  if (sessao?.perfil !== 'agente' || String(sessao.id) !== params.get('agente')) location.replace(sessao ? 'painel.html' : 'index.html');
  modo = 'editaAgente';
  registroId = Number(params.get('agente'));
} else if (params.has('id')) {
  if (!sessao) location.replace('index.html');
  else if (sessao.perfil === 'cliente' && String(sessao.id) !== params.get('id')) location.replace('painel.html');
  modo = 'editaCliente';
  registroId = Number(params.get('id'));
} else if (sessao) {
  if (sessao.perfil !== 'agente') location.replace('clientes.html');
  modo = 'novoCliente';
} else {
  modo = 'publico';
}

// ---- Rendimentos dinâmicos (máx. 3) ------------------------------------------------------
const boxRend = $('rendimentos');
function linhaRendimento(r = { entidade: '', valor: '' }) {
  const div = document.createElement('div');
  div.className = 'row g-2 mb-2 rendimento-linha';
  div.innerHTML = `
    <div class="col-7"><input class="form-control r-entidade" placeholder="Entidade empregadora" maxlength="100" aria-label="Entidade empregadora" value="${esc(r.entidade)}"></div>
    <div class="col-4"><input class="form-control r-valor" type="number" min="0.01" step="0.01" placeholder="Valor mensal (R$)" aria-label="Valor mensal" value="${esc(r.valor)}"></div>
    <div class="col-1"><button type="button" class="btn btn-outline-danger w-100 r-remover" aria-label="Remover rendimento"><i class="bi bi-trash"></i></button></div>`;
  return div;
}
function atualizaBotaoRendimento() {
  const n = boxRend.children.length;
  $('btn-add-rendimento').disabled = n >= MAX_RENDIMENTOS;
  boxRend.querySelectorAll('.r-remover').forEach((b) => (b.disabled = n <= 1));
}
$('btn-add-rendimento').addEventListener('click', () => {
  if (boxRend.children.length < MAX_RENDIMENTOS) boxRend.appendChild(linhaRendimento());
  atualizaBotaoRendimento();
});
boxRend.addEventListener('click', (e) => {
  if (e.target.closest('.r-remover') && boxRend.children.length > 1) {
    e.target.closest('.rendimento-linha').remove();
    atualizaBotaoRendimento();
  }
});

// ---- Máscaras ------------------------------------------------------------------------------
$('c-cpf').addEventListener('input', (e) => (e.target.value = formatCPF(e.target.value)));
$('a-cnpj').addEventListener('input', (e) => (e.target.value = formatCNPJ(e.target.value)));

// ---- Helpers de validação ------------------------------------------------------------------
function limpaErros(form) {
  form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  form.querySelectorAll('.invalid-feedback').forEach((el) => (el.textContent = ''));
  $('rendimentos-erro').textContent = '';
}
function erro(input, msg) {
  input.classList.add('is-invalid');
  const fb = input.parentElement.querySelector('.invalid-feedback');
  if (fb) fb.textContent = msg;
  return false;
}

// ---- Inicialização por modo ----------------------------------------------------------------
function configuraTela() {
  const editando = modo === 'editaCliente' || modo === 'editaAgente';
  $('seletor-perfil').classList.toggle('d-none', modo !== 'publico');
  const textos = {
    publico: ['Cadastre-se', 'O sistema só pode ser utilizado após cadastro prévio.'],
    novoCliente: ['Novo cliente', 'Cadastre um cliente no sistema.'],
    editaCliente: ['Editar cliente', 'Atualize os dados de identificação, rendimentos e acesso.'],
    editaAgente: ['Editar meus dados', 'Atualize os dados do agente.']
  }[modo];
  $('titulo').textContent = textos[0];
  $('subtitulo').textContent = textos[1];
  if (modo === 'editaAgente') mostraForm('agente');
  const voltar = sessao ? 'clientes.html' : 'index.html';
  $('cancelar-cliente').href = voltar;
  $('cancelar-agente').href = voltar;
  $('rotulo-salvar-cliente').textContent = editando ? 'Salvar alterações' : 'Cadastrar';
  $('rotulo-salvar-agente').textContent = editando ? 'Salvar alterações' : 'Cadastrar';
  const dica = editando ? ' (deixe em branco para manter a atual)' : '';
  $('c-senha-label').textContent = `Senha${dica}`;
  $('a-senha-label').textContent = `Senha${dica}`;
  if (!editando) {
    $('c-senha-label').classList.add('required');
    $('a-senha-label').classList.add('required');
  }
}

function mostraForm(perfil) {
  formCliente.classList.toggle('d-none', perfil !== 'cliente');
  formAgente.classList.toggle('d-none', perfil !== 'agente');
  document.querySelectorAll('#seletor-perfil .nav-link').forEach((b) => b.classList.toggle('active', b.dataset.perfil === perfil));
}
document.querySelectorAll('#seletor-perfil .nav-link').forEach((b) => b.addEventListener('click', () => mostraForm(b.dataset.perfil)));

async function carregaRegistro() {
  try {
    if (modo === 'editaCliente') {
      registro = await api.get('clientes', registroId);
      $('c-nome').value = registro.nome;
      $('c-rg').value = registro.rg;
      $('c-cpf').value = registro.cpf;
      $('c-endereco').value = registro.endereco;
      $('c-profissao').value = registro.profissao;
      $('c-email').value = registro.email;
      registro.rendimentos.forEach((r) => boxRend.appendChild(linhaRendimento(r)));
    } else if (modo === 'editaAgente') {
      registro = await api.get('agentes', registroId);
      $('a-nome').value = registro.nome;
      $('a-tipo').value = registro.tipo;
      $('a-cnpj').value = registro.cnpj;
      $('a-email').value = registro.email;
      $('a-tipo').disabled = true; // o tipo não muda após o cadastro (contratos e veículos dependem dele)
    }
  } catch {
    mostraErro(alerta, 'Registro não encontrado ou API indisponível.');
    formCliente.classList.add('d-none');
    formAgente.classList.add('d-none');
    return;
  }
  if (!boxRend.children.length) boxRend.appendChild(linhaRendimento());
  atualizaBotaoRendimento();
}

configuraTela();
carregaRegistro();

// ---- Submissão: cliente --------------------------------------------------------------------
formCliente.addEventListener('submit', async (e) => {
  e.preventDefault();
  limpaErros(formCliente);
  alerta.innerHTML = '';
  const campos = {
    nome: $('c-nome'), rg: $('c-rg'), cpf: $('c-cpf'), endereco: $('c-endereco'),
    profissao: $('c-profissao'), email: $('c-email'), senha: $('c-senha')
  };
  const editando = modo === 'editaCliente';
  let ok = true;
  if (campos.nome.value.trim().length < 3) ok = erro(campos.nome, 'Informe o nome completo.');
  if (campos.rg.value.trim().length < 5) ok = erro(campos.rg, 'Informe um RG válido.');
  if (!isCPF(campos.cpf.value)) ok = erro(campos.cpf, 'CPF inválido.');
  if (campos.endereco.value.trim().length < 5) ok = erro(campos.endereco, 'Informe o endereço.');
  if (!campos.profissao.value.trim()) ok = erro(campos.profissao, 'Informe a profissão.');
  if (!isEmail(campos.email.value)) ok = erro(campos.email, 'E-mail inválido.');
  if ((!editando || campos.senha.value) && campos.senha.value.length < 6) ok = erro(campos.senha, 'A senha deve ter ao menos 6 caracteres.');

  const rendimentos = [];
  boxRend.querySelectorAll('.rendimento-linha').forEach((linha) => {
    const ent = linha.querySelector('.r-entidade');
    const val = linha.querySelector('.r-valor');
    ent.classList.remove('is-invalid');
    val.classList.remove('is-invalid');
    const valor = Number(val.value);
    if (!ent.value.trim()) { ent.classList.add('is-invalid'); ok = false; }
    if (!(valor > 0)) { val.classList.add('is-invalid'); ok = false; }
    rendimentos.push({ entidade: ent.value.trim(), valor });
  });
  if (!rendimentos.length || rendimentos.length > MAX_RENDIMENTOS) {
    $('rendimentos-erro').textContent = 'Informe de 1 a 3 rendimentos.';
    ok = false;
  } else if (rendimentos.some((r) => !r.entidade || !(r.valor > 0))) {
    $('rendimentos-erro').textContent = 'Preencha entidade e valor (maior que zero) de cada rendimento.';
  }
  if (!ok) return;

  const botao = formCliente.querySelector('[type=submit]');
  botao.disabled = true;
  try {
    // Unicidade de CPF e e-mail
    const todos = await api.list('clientes');
    const outros = todos.filter((c) => c.id !== registroId);
    if (outros.some((c) => onlyDigits(c.cpf) === onlyDigits(campos.cpf.value))) return erro(campos.cpf, 'CPF já cadastrado.');
    const ignorar = editando ? { colecao: 'clientes', id: registroId } : null;
    if (await emailEmUso(campos.email.value, ignorar)) return erro(campos.email, 'E-mail já cadastrado.');

    const dados = {
      nome: campos.nome.value.trim(),
      rg: campos.rg.value.trim(),
      cpf: formatCPF(campos.cpf.value),
      endereco: campos.endereco.value.trim(),
      profissao: campos.profissao.value.trim(),
      email: campos.email.value.trim().toLowerCase(),
      senha: campos.senha.value || registro?.senha,
      rendimentos
    };
    if (editando) {
      await api.update('clientes', registroId, { id: registroId, ...dados });
      toast('Cliente atualizado com sucesso.');
      setTimeout(() => (location.href = 'clientes.html'), 600);
    } else {
      await api.create('clientes', dados);
      if (modo === 'publico') location.href = 'index.html?cadastro=ok';
      else {
        toast('Cliente cadastrado com sucesso.');
        setTimeout(() => (location.href = 'clientes.html'), 600);
      }
    }
  } catch (err) {
    mostraErro(alerta, err.message);
  } finally {
    botao.disabled = false;
  }
});

// ---- Submissão: agente ---------------------------------------------------------------------
formAgente.addEventListener('submit', async (e) => {
  e.preventDefault();
  limpaErros(formAgente);
  alerta.innerHTML = '';
  const nome = $('a-nome'), cnpj = $('a-cnpj'), email = $('a-email'), senha = $('a-senha'), tipo = $('a-tipo');
  const editando = modo === 'editaAgente';
  let ok = true;
  if (nome.value.trim().length < 3) ok = erro(nome, 'Informe o nome.');
  if (!isCNPJ(cnpj.value)) ok = erro(cnpj, 'CNPJ inválido.');
  if (!isEmail(email.value)) ok = erro(email, 'E-mail inválido.');
  if ((!editando || senha.value) && senha.value.length < 6) ok = erro(senha, 'A senha deve ter ao menos 6 caracteres.');
  if (!ok) return;

  const botao = formAgente.querySelector('[type=submit]');
  botao.disabled = true;
  try {
    const todos = await api.list('agentes');
    if (todos.some((a) => a.id !== registroId && onlyDigits(a.cnpj) === onlyDigits(cnpj.value))) return erro(cnpj, 'CNPJ já cadastrado.');
    const ignorar = editando ? { colecao: 'agentes', id: registroId } : null;
    if (await emailEmUso(email.value, ignorar)) return erro(email, 'E-mail já cadastrado.');

    const dados = {
      nome: nome.value.trim(),
      tipo: editando ? registro.tipo : tipo.value,
      cnpj: formatCNPJ(cnpj.value),
      email: email.value.trim().toLowerCase(),
      senha: senha.value || registro?.senha
    };
    if (editando) {
      await api.update('agentes', registroId, { id: registroId, ...dados });
      // Mantém a sessão coerente com o novo nome/tipo.
      sessionStorage.setItem('aluguel.sessao', JSON.stringify({ ...sessao, nome: dados.nome, tipo: dados.tipo }));
      toast('Dados atualizados com sucesso.');
      setTimeout(() => (location.href = 'clientes.html'), 600);
    } else {
      await api.create('agentes', dados);
      location.href = 'index.html?cadastro=ok';
    }
  } catch (err) {
    mostraErro(alerta, err.message);
  } finally {
    botao.disabled = false;
  }
});
