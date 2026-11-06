import { api } from '../api.js';
import { exigeLogin } from '../auth.js';
import { badgeStatus, brl, diarias, esc, estadoVazio, fmtData, iniciaPagina, mostraErro } from '../ui.js';

const sessao = await exigeLogin();
iniciaPagina('painel.html');
const agente = sessao.perfil === 'agente';
const $ = (id) => document.getElementById(id);

const cartao = (icone, valor, rotulo, href) => `
  <div class="col-6 col-lg-3"><a class="text-decoration-none" href="${href}"><div class="card stat-card h-100"><div class="card-body d-flex justify-content-between align-items-center">
    <div><div class="display-6">${valor}</div><div class="text-muted small">${rotulo}</div></div><i class="bi bi-${icone}"></i></div></div></a></div>`;

async function carrega() {
  try {
    const [pedidos, automoveis, contratos, clientes] = await Promise.all([
      api.list('pedidos'), api.list('automoveis'), api.list('contratos'), agente ? api.list('clientes') : []
    ]);
    $('saudacao').textContent = `Olá, ${sessao.nome.split(' ')[0]}!`;
    const nomeCliente = (id) => clientes.find((c) => c.id === id)?.nome ?? `Cliente #${id}`;
    const carro = (id) => automoveis.find((a) => a.id === id);

    let meus;
    if (agente) {
      $('subtitulo').textContent = 'Visão geral dos pedidos e contratos.';
      meus = pedidos;
      $('cartoes').innerHTML =
        cartao('hourglass-split', pedidos.filter((p) => p.status === 'Em análise').length, 'Pedidos para analisar', 'pedidos.html') +
        cartao('patch-check', pedidos.filter((p) => p.status === 'Aprovado').length, 'Aprovados (aguardando contrato)', 'pedidos.html') +
        cartao('file-earmark-text', contratos.filter((c) => c.status === 'Vigente').length, 'Contratos vigentes', 'contratos.html') +
        cartao('people', clientes.length, 'Clientes cadastrados', 'clientes.html');
      $('acoes-rapidas').innerHTML = '<a class="btn btn-brand" href="pedidos.html"><i class="bi bi-clipboard-check me-1"></i>Analisar pedidos</a>';
    } else {
      $('subtitulo').textContent = 'Acompanhe seus pedidos de aluguel.';
      meus = pedidos.filter((p) => p.clienteId === sessao.id);
      $('cartoes').innerHTML =
        cartao('clipboard-data', meus.length, 'Meus pedidos', 'pedidos.html') +
        cartao('hourglass-split', meus.filter((p) => p.status === 'Em análise').length, 'Em análise', 'pedidos.html') +
        cartao('patch-check', meus.filter((p) => p.status === 'Aprovado').length, 'Aprovados', 'pedidos.html') +
        cartao('file-earmark-text', meus.filter((p) => p.status === 'Contratado').length, 'Contratados', 'contratos.html');
      $('acoes-rapidas').innerHTML = '<a class="btn btn-brand" href="pedidos.html?novo=1"><i class="bi bi-plus-lg me-1"></i>Novo pedido</a>';
    }

    $('titulo-recentes').textContent = agente ? 'Pedidos recentes' : 'Meus pedidos recentes';
    $('cab-recentes').innerHTML =
      `<th>#</th>${agente ? '<th>Cliente</th>' : ''}<th>Automóvel</th><th>Período</th><th>Total</th><th>Status</th>`;
    const recentes = [...meus].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 5);
    $('recentes').innerHTML = recentes.length
      ? recentes.map((p) => {
          const c = carro(p.automovelId);
          const total = (c?.diaria ?? 0) * diarias(p.dataInicio, p.dataFim);
          return `<tr><td data-label="#">${p.id}</td>${agente ? `<td data-label="Cliente">${esc(nomeCliente(p.clienteId))}</td>` : ''}
            <td data-label="Automóvel">${c ? `${esc(c.marca)} ${esc(c.modelo)} <span class="text-muted small">(${esc(c.placa)})</span>` : '—'}</td>
            <td data-label="Período">${fmtData(p.dataInicio)} a ${fmtData(p.dataFim)}</td><td data-label="Total">${brl(total)}</td><td data-label="Status">${badgeStatus(p.status)}</td></tr>`;
        }).join('')
      : estadoVazio('Nenhum pedido ainda.', agente ? 6 : 5);
  } catch (err) {
    mostraErro($('alerta'), err.message);
  }
}
carrega();
