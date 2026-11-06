import { api } from '../api.js';
import { exigeLogin, logout } from '../auth.js';
import { brl, confirmar, esc, estadoVazio, iniciaPagina, mostraErro, STATUS_ATIVOS, toast } from '../ui.js';

const sessao = await exigeLogin();
iniciaPagina('clientes.html');
const agente = sessao.perfil === 'agente';
const $ = (id) => document.getElementById(id);
const rendaTotal = (c) => c.rendimentos.reduce((s, r) => s + Number(r.valor), 0);
let clientes = [];

async function carrega() {
  try {
    clientes = agente ? await api.list('clientes') : [await api.get('clientes', sessao.id)];
    render();
  } catch (err) {
    $('conteudo').innerHTML = '';
    mostraErro($('alerta'), err.message);
  }
}

function render() {
  if (agente) renderLista();
  else renderPerfil(clientes[0]);
}

function renderLista() {
  $('titulo').textContent = 'Clientes';
  $('subtitulo').textContent = 'Cadastro, consulta, edição e exclusão de clientes.';
  $('acoes').innerHTML = `
    <a class="btn btn-outline-secondary" href="cadastro.html?agente=${sessao.id}"><i class="bi bi-pencil me-1"></i>Meus dados</a>
    <a class="btn btn-brand" href="cadastro.html"><i class="bi bi-plus-lg me-1"></i>Novo cliente</a>`;
  $('conteudo').innerHTML = `
    <div class="card mb-3"><div class="card-body py-2"><input type="search" id="busca" class="form-control" placeholder="Buscar por nome, CPF, profissão ou e-mail…" aria-label="Buscar clientes"></div></div>
    <div class="card"><div class="table-responsive"><table class="table table-hover align-middle mb-0 table-stack">
      <thead class="table-light"><tr><th>Nome</th><th>CPF</th><th>Profissão</th><th class="text-end">Renda mensal</th><th>E-mail</th><th class="text-end">Ações</th></tr></thead>
      <tbody id="lista"></tbody></table></div></div>`;
  $('busca').addEventListener('input', preencheLista);
  $('lista').addEventListener('click', aoClicar);
  preencheLista();
}

function preencheLista() {
  const q = ($('busca')?.value ?? '').trim().toLowerCase();
  const filtrados = clientes.filter((c) => !q || [c.nome, c.cpf, c.profissao, c.email].some((v) => String(v).toLowerCase().includes(q)));
  $('lista').innerHTML = filtrados.length
    ? filtrados.map((c) => `<tr>
        <td data-label="Nome"><span><strong>${esc(c.nome)}</strong><div class="small text-muted">${esc(c.endereco)}</div></span></td>
        <td data-label="CPF">${esc(c.cpf)}</td><td data-label="Profissão">${esc(c.profissao)}</td><td data-label="Renda mensal" class="text-end">${brl(rendaTotal(c))}</td><td data-label="E-mail">${esc(c.email)}</td>
        <td class="text-end table-actions text-nowrap">
          <button class="btn btn-outline-secondary" data-acao="ver" data-id="${c.id}" title="Consultar"><i class="bi bi-eye"></i></button>
          <a class="btn btn-outline-primary" href="cadastro.html?id=${c.id}" title="Editar"><i class="bi bi-pencil"></i></a>
          <button class="btn btn-outline-danger" data-acao="excluir" data-id="${c.id}" title="Excluir"><i class="bi bi-trash"></i></button>
        </td></tr>`).join('')
    : estadoVazio('Nenhum cliente encontrado.', 6);
}

const detalhe = (c) => `
  <dl class="row mb-0">
    <dt class="col-sm-3">Nome</dt><dd class="col-sm-9">${esc(c.nome)}</dd>
    <dt class="col-sm-3">RG</dt><dd class="col-sm-9">${esc(c.rg)}</dd>
    <dt class="col-sm-3">CPF</dt><dd class="col-sm-9">${esc(c.cpf)}</dd>
    <dt class="col-sm-3">Endereço</dt><dd class="col-sm-9">${esc(c.endereco)}</dd>
    <dt class="col-sm-3">Profissão</dt><dd class="col-sm-9">${esc(c.profissao)}</dd>
    <dt class="col-sm-3">E-mail</dt><dd class="col-sm-9">${esc(c.email)}</dd>
    <dt class="col-sm-3">Rendimentos</dt>
    <dd class="col-sm-9"><ul class="list-unstyled mb-0">${c.rendimentos.map((r) => `<li>${esc(r.entidade)} — <strong>${brl(r.valor)}</strong></li>`).join('')}
      <li class="mt-1 text-muted">Total mensal: ${brl(rendaTotal(c))}</li></ul></dd>
  </dl>`;

function renderPerfil(c) {
  $('titulo').textContent = 'Meu perfil';
  $('subtitulo').textContent = 'Consulte, edite ou exclua os seus dados.';
  $('acoes').innerHTML = `
    <a class="btn btn-brand" href="cadastro.html?id=${c.id}"><i class="bi bi-pencil me-1"></i>Editar</a>
    <button class="btn btn-outline-danger" data-acao="excluir" data-id="${c.id}"><i class="bi bi-trash me-1"></i>Excluir conta</button>`;
  $('acoes').addEventListener('click', aoClicar);
  $('conteudo').innerHTML = `<div class="card"><div class="card-body">${detalhe(c)}</div></div>`;
}

async function aoClicar(e) {
  const btn = e.target.closest('[data-acao]');
  if (!btn) return;
  const cliente = clientes.find((c) => c.id === Number(btn.dataset.id));
  if (!cliente) return;
  if (btn.dataset.acao === 'ver') mostraDetalhe(cliente);
  if (btn.dataset.acao === 'excluir') await excluir(cliente);
}

function mostraDetalhe(c) {
  let modal = $('modal-detalhe');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-detalhe';
    modal.className = 'modal fade';
    modal.tabIndex = -1;
    modal.innerHTML = `<div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content">
      <div class="modal-header"><h5 class="modal-title">Dados do cliente</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button></div>
      <div class="modal-body" id="modal-detalhe-corpo"></div></div></div>`;
    document.body.appendChild(modal);
  }
  $('modal-detalhe-corpo').innerHTML = detalhe(c);
  window.bootstrap.Modal.getOrCreateInstance(modal).show();
}

async function excluir(cliente) {
  try {
    const [pedidos, automoveis] = await Promise.all([api.list('pedidos'), api.list('automoveis')]);
    const carros = automoveis.filter((a) => a.proprietarioTipo === 'cliente' && a.proprietarioId === cliente.id);
    const idsCarros = carros.map((a) => a.id);
    const bloqueios = pedidos.filter(
      (p) => STATUS_ATIVOS.includes(p.status) && (p.clienteId === cliente.id || idsCarros.includes(p.automovelId))
    );
    if (bloqueios.length) {
      return mostraErro($('alerta'), `Não é possível excluir "${cliente.nome}": há ${bloqueios.length} pedido(s)/contrato(s) ativo(s) vinculados. Cancele-os antes.`);
    }
    const ok = await confirmar(
      `Excluir o cliente "${cliente.nome}"? Pedidos antigos e automóveis desse cliente também serão removidos. Esta ação não pode ser desfeita.`,
      { titulo: 'Excluir cliente', ok: 'Excluir', perigo: true }
    );
    if (!ok) return;
    const historico = pedidos.filter((p) => p.clienteId === cliente.id || idsCarros.includes(p.automovelId));
    await Promise.all(historico.map((p) => api.remove('pedidos', p.id)));
    await Promise.all(idsCarros.map((id) => api.remove('automoveis', id)));
    await api.remove('clientes', cliente.id);
    if (!agente) return logout();
    toast('Cliente excluído com sucesso.');
    clientes = clientes.filter((c) => c.id !== cliente.id);
    $('alerta').innerHTML = '';
    render();
  } catch (err) {
    mostraErro($('alerta'), err.message);
  }
}

carrega();
