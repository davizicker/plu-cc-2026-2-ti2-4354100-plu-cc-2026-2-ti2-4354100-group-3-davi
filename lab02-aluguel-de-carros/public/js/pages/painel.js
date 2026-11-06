import { api } from '../api.js';
import { exigeLogin } from '../auth.js';
import { badgeStatus, brl, diarias, esc, estadoVazio, fmtData, iniciaPagina, mostraErro } from '../ui.js';

const sessao = await exigeLogin();
iniciaPagina('painel.html');
const agente = sessao.perfil === 'agente';
const $ = (id) => document.getElementById(id);

const comStatus = (status) => `pedidos.html?status=${encodeURIComponent(status)}`;
const aviso = (tipo, icone, html) => `<div class="alert alert-${tipo} d-flex align-items-center gap-2 py-2"><i class="bi bi-${icone}"></i><div>${html}</div></div>`;

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
        cartao('hourglass-split', pedidos.filter((p) => p.status === 'Em análise').length, 'Pedidos para analisar', comStatus('Em análise')) +
        cartao('patch-check', pedidos.filter((p) => p.status === 'Aprovado').length, 'Aprovados (aguardando contrato)', comStatus('Aprovado')) +
        cartao('file-earmark-text', contratos.filter((c) => c.status === 'Vigente').length, 'Contratos vigentes', 'contratos.html') +
        cartao('people', clientes.length, 'Clientes cadastrados', 'clientes.html');
      $('acoes-rapidas').innerHTML = '<a class="btn btn-brand" href="pedidos.html"><i class="bi bi-clipboard-check me-1"></i>Analisar pedidos</a>';
    } else {
      $('subtitulo').textContent = 'Acompanhe seus pedidos de aluguel.';
      meus = pedidos.filter((p) => p.clienteId === sessao.id);
      $('cartoes').innerHTML =
        cartao('clipboard-data', meus.length, 'Meus pedidos', 'pedidos.html') +
        cartao('hourglass-split', meus.filter((p) => p.status === 'Em análise').length, 'Em análise', comStatus('Em análise')) +
        cartao('patch-check', meus.filter((p) => p.status === 'Aprovado').length, 'Aprovados', comStatus('Aprovado')) +
        cartao('file-earmark-text', meus.filter((p) => p.status === 'Contratado').length, 'Contratados', 'contratos.html');
      $('acoes-rapidas').innerHTML = '<a class="btn btn-brand" href="pedidos.html?novo=1"><i class="bi bi-plus-lg me-1"></i>Novo pedido</a>';
    }

    // Avisos com o próximo passo de cada perfil
    const n = (status) => meus.filter((p) => p.status === status).length;
    const avisos = [];
    if (agente) {
      if (n('Em análise')) avisos.push(aviso('warning', 'hourglass-split', `<strong>${n('Em análise')}</strong> pedido(s) aguardando análise financeira. <a href="${comStatus('Em análise')}" class="alert-link">Analisar agora</a>`));
      if (n('Aprovado')) avisos.push(aviso('info', 'file-earmark-check', `<strong>${n('Aprovado')}</strong> pedido(s) aprovado(s) aguardando execução do contrato. <a href="${comStatus('Aprovado')}" class="alert-link">Executar contrato</a>`));
    } else {
      if (n('Aprovado')) avisos.push(aviso('success', 'patch-check', `Você tem <strong>${n('Aprovado')}</strong> pedido(s) aprovado(s). Agora o agente vai executar o contrato. <a href="${comStatus('Aprovado')}" class="alert-link">Ver pedidos</a>`));
      if (n('Reprovado')) avisos.push(aviso('danger', 'x-circle', `<strong>${n('Reprovado')}</strong> pedido(s) reprovado(s). Abra os detalhes para ver o parecer. <a href="${comStatus('Reprovado')}" class="alert-link">Ver pedidos</a>`));
      if (!meus.length) avisos.push(aviso('primary', 'lightbulb', 'Você ainda não fez pedidos. <a href="pedidos.html?novo=1" class="alert-link">Faça seu primeiro pedido</a> ou escolha um carro no <a href="automoveis.html" class="alert-link">catálogo</a>.'));
    }
    $('avisos').innerHTML = avisos.join('');
    if (!agente) {
      const passo = (num, titulo, texto) => `<div class="col-md-3"><div class="card passo h-100"><div class="card-body"><span class="num">${num}</span> <strong class="ms-1">${titulo}</strong><p class="small text-muted mb-0 mt-2">${texto}</p></div></div></div>`;
      $('como-funciona').innerHTML = `<h2 class="h6 text-uppercase text-muted">Como funciona</h2><div class="row g-3 mb-4">
        ${passo(1, 'Escolha o carro', 'Veja o catálogo e informe o período do aluguel.')}
        ${passo(2, 'Análise financeira', 'Uma empresa ou banco avalia o pedido com base na sua renda.')}
        ${passo(3, 'Contrato', 'Com parecer positivo, o agente executa o contrato (com crédito, se pedido).')}
        ${passo(4, 'Acompanhe', 'Consulte o status e o contrato a qualquer momento.')}</div>`;
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
