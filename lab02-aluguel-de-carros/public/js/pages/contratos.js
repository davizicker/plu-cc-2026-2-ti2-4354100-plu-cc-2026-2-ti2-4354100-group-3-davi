import { api } from '../api.js';
import { exigeLogin } from '../auth.js';
import { brl, diarias, esc, estadoVazio, fmtData, fmtDataHora, getModal, iniciaPagina, mostraErro } from '../ui.js';

const sessao = await exigeLogin();
iniciaPagina('contratos.html');
const agente = sessao.perfil === 'agente';
const $ = (id) => document.getElementById(id);
let contratos = [], pedidos = [], automoveis = [], clientes = [], agentes = [];

$('subtitulo').textContent = agente ? 'Contratos executados pelos agentes.' : 'Contratos dos seus pedidos de aluguel.';
$('cabecalho').innerHTML = `<th>#</th><th>Pedido</th>${agente ? '<th>Cliente</th>' : ''}<th>Automóvel</th><th class="text-end">Valor</th><th>Crédito</th><th>Status</th><th class="text-end">Ações</th>`;

const carro = (id) => automoveis.find((a) => a.id === id);
const cliente = (id) => clientes.find((c) => c.id === id);
const nomeAgente = (id) => agentes.find((a) => a.id === id)?.nome ?? `Agente #${id}`;
const descCarro = (a) => (a ? `${a.marca} ${a.modelo} (${a.placa})` : 'Automóvel removido');

async function carrega() {
  try {
    [contratos, pedidos, automoveis, agentes] = await Promise.all([api.list('contratos'), api.list('pedidos'), api.list('automoveis'), api.list('agentes')]);
    clientes = agente ? await api.list('clientes') : [await api.get('clientes', sessao.id)];
    const lista = contratos.filter((c) => agente || c.clienteId === sessao.id).sort((a, b) => b.id - a.id);
    $('lista').innerHTML = lista.length
      ? lista.map((c) => `<tr><td data-label="#">${c.id}</td><td data-label="Pedido">#${c.pedidoId}</td>${agente ? `<td data-label="Cliente">${esc(cliente(c.clienteId)?.nome ?? `Cliente #${c.clienteId}`)}</td>` : ''}
          <td data-label="Automóvel">${esc(descCarro(carro(c.automovelId)))}</td><td data-label="Valor" class="text-end">${brl(c.valorTotal)}</td>
          <td data-label="Crédito" class="small">${c.credito ? `${esc(nomeAgente(c.credito.bancoId))}<div class="text-muted">${c.credito.parcelas}× ${brl(c.credito.valorParcela)}</div>` : '<span class="text-muted">—</span>'}</td>
          <td data-label="Status"><span class="badge text-bg-${c.status === 'Vigente' ? 'success' : 'secondary'}">${esc(c.status)}</span></td>
          <td class="text-end table-actions"><button class="btn btn-outline-secondary" data-id="${c.id}" title="Detalhes"><i class="bi bi-eye"></i></button></td></tr>`).join('')
      : estadoVazio('Nenhum contrato por enquanto.', agente ? 8 : 7);
  } catch (err) {
    mostraErro($('alerta'), err.message);
  }
}

$('lista').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-id]');
  const c = contratos.find((x) => x.id === Number(btn?.dataset.id));
  if (!c) return;
  const p = pedidos.find((x) => x.id === c.pedidoId);
  $('modal-contrato-titulo').textContent = `Contrato #${c.id}`;
  $('contrato-corpo').innerHTML = `<dl class="row mb-0">
    <dt class="col-sm-5">Pedido</dt><dd class="col-sm-7">#${c.pedidoId}</dd>
    <dt class="col-sm-5">Cliente</dt><dd class="col-sm-7">${esc(cliente(c.clienteId)?.nome ?? `Cliente #${c.clienteId}`)}</dd>
    <dt class="col-sm-5">Automóvel</dt><dd class="col-sm-7">${esc(descCarro(carro(c.automovelId)))}</dd>
    <dt class="col-sm-5">Período</dt><dd class="col-sm-7">${p ? `${fmtData(p.dataInicio)} a ${fmtData(p.dataFim)} (${diarias(p.dataInicio, p.dataFim)} diárias)` : '—'}</dd>
    <dt class="col-sm-5">Executado por</dt><dd class="col-sm-7">${esc(c.agenteNome)}</dd>
    <dt class="col-sm-5">Propriedade do veículo</dt><dd class="col-sm-7">${c.propriedade === 'cliente' ? 'Cliente' : esc(c.agenteNome)}</dd>
    <dt class="col-sm-5">Valor total</dt><dd class="col-sm-7">${brl(c.valorTotal)}</dd>
    ${c.credito ? `<dt class="col-sm-5">Crédito (${esc(nomeAgente(c.credito.bancoId))})</dt>
      <dd class="col-sm-7">${brl(c.credito.valorFinanciado)} em ${c.credito.parcelas}× de ${brl(c.credito.valorParcela)} a ${String(c.credito.taxaMensal).replace('.', ',')}% a.m.</dd>` : ''}
    <dt class="col-sm-5">Assinado em</dt><dd class="col-sm-7">${fmtDataHora(c.assinadoEm)}</dd></dl>`;
  getModal('modal-contrato').show();
});

carrega();
