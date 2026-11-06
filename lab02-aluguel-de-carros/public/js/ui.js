// Utilitários de interface: navbar, toasts, confirmação, formatação.
import { getSessao, logout } from './auth.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const brl = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** 'YYYY-MM-DD' -> 'DD/MM/YYYY' */
export const fmtData = (iso) => (iso ? iso.split('-').reverse().join('/') : '—');

export const fmtDataHora = (iso) => (iso ? new Date(iso).toLocaleString('pt-BR') : '—');

export const hojeISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

/** Dias de aluguel, contando início e fim (10 a 12 = 3 diárias). */
export function diarias(inicio, fim) {
  const a = Date.parse(`${inicio}T00:00:00Z`);
  const b = Date.parse(`${fim}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.round((b - a) / 86400000) + 1;
}

/** Dois períodos (inclusivos) se sobrepõem? */
export const periodosSeSobrepoem = (a, b) => a.dataInicio <= b.dataFim && b.dataInicio <= a.dataFim;

export const STATUS_PEDIDO = {
  'Em análise': 'warning text-dark',
  Aprovado: 'info text-dark',
  Reprovado: 'danger',
  Cancelado: 'secondary',
  Contratado: 'success'
};

export const badgeStatus = (status) =>
  `<span class="badge badge-status text-bg-${STATUS_PEDIDO[status] ?? 'light'}">${esc(status)}</span>`;

export const rotuloProprietario = { cliente: 'Cliente', empresa: 'Empresa', banco: 'Banco' };

const LINKS = [
  { href: 'painel.html', icone: 'speedometer2', rotulo: 'Painel', perfis: ['cliente', 'agente'] },
  { href: 'pedidos.html', icone: 'clipboard-check', rotulo: 'Pedidos', perfis: ['cliente', 'agente'] },
  { href: 'automoveis.html', icone: 'car-front', rotulo: 'Automóveis', perfis: ['cliente', 'agente'] },
  { href: 'contratos.html', icone: 'file-earmark-text', rotulo: 'Contratos', perfis: ['cliente', 'agente'] },
  { href: 'clientes.html', icone: 'people', rotulo: 'Clientes', rotuloCliente: 'Meu perfil', perfis: ['cliente', 'agente'] }
];

/** Renderiza a barra de navegação em #navbar. */
export function renderNavbar(paginaAtiva) {
  const sessao = getSessao();
  const el = document.getElementById('navbar');
  if (!el) return;
  const itens = sessao
    ? LINKS.filter((l) => l.perfis.includes(sessao.perfil))
        .map((l) => {
          const rotulo = sessao.perfil === 'cliente' && l.rotuloCliente ? l.rotuloCliente : l.rotulo;
          const ativo = l.href === paginaAtiva ? ' active' : '';
          return `<li class="nav-item"><a class="nav-link${ativo}" href="${l.href}"><i class="bi bi-${l.icone} me-1"></i>${rotulo}</a></li>`;
        })
        .join('')
    : '';
  const perfilTxt = sessao ? (sessao.perfil === 'agente' ? (sessao.tipo === 'banco' ? 'Banco' : 'Empresa') : 'Cliente') : '';
  el.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-dark bg-brand">
    <div class="container">
      <a class="navbar-brand fw-semibold" href="${sessao ? 'painel.html' : 'index.html'}"><i class="bi bi-car-front-fill me-2"></i>AluguelCar</a>
      ${sessao ? `<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu" aria-controls="menu" aria-expanded="false" aria-label="Alternar navegação"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse" id="menu">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">${itens}</ul>
        <span class="navbar-text me-3 small"><i class="bi bi-person-circle me-1"></i>${esc(sessao.nome)} <span class="badge text-bg-light ms-1">${perfilTxt}</span></span>
        <button id="btn-sair" class="btn btn-outline-light btn-sm"><i class="bi bi-box-arrow-right me-1"></i>Sair</button>
      </div>` : ''}
    </div>
  </nav>`;
  document.getElementById('btn-sair')?.addEventListener('click', logout);
}

export function renderFooter() {
  const el = document.getElementById('footer');
  if (el) {
    el.innerHTML = `<footer class="text-center text-muted py-3 mt-4 border-top bg-white">
      Sistema de Aluguel de Carros · Laboratório 02 · DIW · PUC Minas
    </footer>`;
  }
}

/** Notificação (toast) do Bootstrap. tipo: success | danger | warning | info */
export function toast(mensagem, tipo = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `toast align-items-center text-bg-${tipo} border-0`;
  el.setAttribute('role', 'alert');
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${esc(mensagem)}</div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button></div>`;
  container.appendChild(el);
  const t = new window.bootstrap.Toast(el, { delay: 4500 });
  el.addEventListener('hidden.bs.toast', () => el.remove());
  t.show();
}

/** Caixa de confirmação (Promise<boolean>). */
export function confirmar(mensagem, { titulo = 'Confirmar', ok = 'Confirmar', perigo = false } = {}) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'modal fade';
    el.tabIndex = -1;
    el.innerHTML = `<div class="modal-dialog modal-dialog-centered"><div class="modal-content">
      <div class="modal-header"><h5 class="modal-title">${esc(titulo)}</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button></div>
      <div class="modal-body">${esc(mensagem)}</div>
      <div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Voltar</button>
      <button type="button" class="btn btn-${perigo ? 'danger' : 'brand'}" data-ok>${esc(ok)}</button></div></div></div>`;
    document.body.appendChild(el);
    const modal = new window.bootstrap.Modal(el);
    let resposta = false;
    el.querySelector('[data-ok]').addEventListener('click', () => {
      resposta = true;
      modal.hide();
    });
    el.addEventListener('hidden.bs.modal', () => {
      el.remove();
      resolve(resposta);
    });
    modal.show();
  });
}

export const getModal = (id) => window.bootstrap.Modal.getOrCreateInstance(document.getElementById(id));

/** Mostra mensagem de erro de API/regra em um elemento de alerta. */
export function mostraErro(el, mensagem) {
  el.innerHTML = `<div class="alert alert-danger py-2 mb-3" role="alert"><i class="bi bi-exclamation-triangle me-1"></i>${esc(mensagem)}</div>`;
}

export const estadoVazio = (texto, colunas) =>
  `<tr><td colspan="${colunas}" class="text-center text-muted py-4">${esc(texto)}</td></tr>`;

/** Rodapé comum de páginas: navbar + footer. */
export function iniciaPagina(paginaAtiva) {
  renderNavbar(paginaAtiva);
  renderFooter();
  adicionaToggleSenha();
}

/** Botão "mostrar/ocultar senha" em todos os campos de senha da página. */
function adicionaToggleSenha() {
  document.querySelectorAll('input[type=password]').forEach((campo) => {
    const grupo = document.createElement('div');
    grupo.className = 'input-group has-validation';
    campo.parentNode.insertBefore(grupo, campo);
    grupo.appendChild(campo);
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn btn-outline-secondary';
    botao.setAttribute('aria-label', 'Mostrar senha');
    botao.innerHTML = '<i class="bi bi-eye"></i>';
    grupo.appendChild(botao);
    const feedback = grupo.nextElementSibling;
    if (feedback?.classList.contains('invalid-feedback')) grupo.appendChild(feedback);
    botao.addEventListener('click', () => {
      const mostrar = campo.type === 'password';
      campo.type = mostrar ? 'text' : 'password';
      botao.innerHTML = `<i class="bi bi-eye${mostrar ? '-slash' : ''}"></i>`;
      botao.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
    });
  });
}

export const STATUS_ATIVOS = ['Em análise', 'Aprovado', 'Contratado'];
