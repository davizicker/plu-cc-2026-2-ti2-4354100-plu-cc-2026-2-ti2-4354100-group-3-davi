import { api } from '../api.js';
import { exigeLogin } from '../auth.js';
import {
  badgeStatus, brl, confirmar, diarias, esc, estadoVazio, fmtData, fmtDataHora, getModal, hojeISO, iniciaPagina,
  mostraErro, periodosSeSobrepoem, rotuloProprietario, STATUS_ATIVOS, toast
} from '../ui.js';

const sessao = await exigeLogin();
iniciaPagina('pedidos.html');
const agente = sessao.perfil === 'agente';
const $ = (id) => document.getElementById(id);

let pedidos = [], automoveis = [], clientes = [], agentes = [];
let pedidoEmEdicao = null;   // pedido sendo modificado (null = novo)
let pedidoAvaliado = null;
let pedidoContrato = null;

$('subtitulo').textContent = agente
  ? 'Analise financeiramente, modifique e execute os contratos dos pedidos.'
  : 'Crie, acompanhe, modifique e cancele os seus pedidos.';
$('btn-novo').classList.toggle('d-none', agente);
$('cabecalho').innerHTML = `<th>#</th>${agente ? '<th>Cliente</th>' : ''}<th>Automóvel</th><th>Período</th><th class="text-end">Total</th><th>Crédito</th><th>Status</th><th class="text-end">Ações</th>`;

// ---- Regras de negócio / cálculos ------------------------------------------------------------
const carro = (id) => automoveis.find((a) => a.id === id);
const cliente = (id) => clientes.find((c) => c.id === id);
const nomeAgente = (id) => agentes.find((a) => a.id === id)?.nome ?? `Agente #${id}`;
const totalPedido = (p) => (carro(p.automovelId)?.diaria ?? 0) * diarias(p.dataInicio, p.dataFim);
const rendaTotal = (c) => (c?.rendimentos ?? []).reduce((s, r) => s + Number(r.valor), 0);
const descCarro = (a) => (a ? `${a.marca} ${a.modelo} (${a.placa})` : 'Automóvel removido');

/** Parcela pela Tabela Price. */
export function calcParcela(valor, n, taxaPct) {
  const i = taxaPct / 100;
  if (!(valor > 0) || !(n > 0)) return 0;
  return i === 0 ? valor / n : (valor * i) / (1 - Math.pow(1 + i, -n));
}

/** Há conflito de período com outro pedido ativo do mesmo automóvel? */
const conflito = (automovelId, inicio, fim, ignorarId = null) =>
  pedidos.find(
    (p) => p.id !== ignorarId && p.automovelId === automovelId && STATUS_ATIVOS.includes(p.status) &&
      periodosSeSobrepoem(p, { dataInicio: inicio, dataFim: fim })
  );

/** Busca o pedido no servidor e confirma que ainda está em um dos status esperados (evita agir sobre dados velhos). */
async function pedidoAtualizado(id, statusPermitidos) {
  const atual = await api.get('pedidos', id);
  if (!statusPermitidos.includes(atual.status)) {
    toast(`O pedido #${id} mudou para "${atual.status}" e não aceita mais esta ação. A lista foi atualizada.`, 'warning');
    await carrega();
    return null;
  }
  return atual;
}

// ---- Carregamento e listagem -----------------------------------------------------------------
async function carrega() {
  try {
    [pedidos, automoveis, agentes] = await Promise.all([api.list('pedidos'), api.list('automoveis'), api.list('agentes')]);
    clientes = agente ? await api.list('clientes') : [await api.get('clientes', sessao.id)];
    const params = new URLSearchParams(location.search);
    const statusUrl = params.get('status');
    if (statusUrl && [...$('filtro-status').options].some((o) => o.value === statusUrl)) $('filtro-status').value = statusUrl;
    render();
    if (params.get('novo') && !agente) {
      const carroPre = Number(params.get('carro')) || null;
      history.replaceState(null, '', 'pedidos.html');
      abreFormulario(null, carroPre);
    }
  } catch (err) {
    mostraErro($('alerta'), err.message);
  }
}

function render() {
  const status = $('filtro-status').value;
  const q = $('busca').value.trim().toLowerCase();
  const lista = pedidos
    .filter((p) => agente || p.clienteId === sessao.id)
    .filter((p) => !status || p.status === status)
    .filter((p) => {
      if (!q) return true;
      const a = carro(p.automovelId);
      return [cliente(p.clienteId)?.nome, a?.placa, a?.modelo, a?.marca].some((v) => String(v ?? '').toLowerCase().includes(q));
    })
    .sort((a, b) => b.id - a.id);
  $('lista').innerHTML = lista.length
    ? lista.map(linha).join('')
    : estadoVazio(agente ? 'Nenhum pedido encontrado.' : 'Você ainda não tem pedidos. Clique em "Novo pedido".', agente ? 8 : 7);
}

function acoes(p) {
  const b = (acao, icone, titulo, cls) =>
    `<button class="btn btn-outline-${cls}" data-acao="${acao}" data-id="${p.id}" title="${titulo}"><i class="bi bi-${icone}"></i></button>`;
  const out = [b('ver', 'eye', 'Detalhes', 'secondary')];
  if (agente) {
    if (p.status === 'Em análise') out.push(b('avaliar', 'clipboard2-pulse', 'Avaliar', 'success'));
    if (['Em análise', 'Aprovado'].includes(p.status)) out.push(b('editar', 'pencil', 'Modificar', 'primary'));
    if (p.status === 'Aprovado') out.push(b('contratar', 'file-earmark-check', 'Executar contrato', 'dark'));
  } else {
    if (p.status === 'Em análise') out.push(b('editar', 'pencil', 'Modificar', 'primary'));
    if (['Em análise', 'Aprovado'].includes(p.status)) out.push(b('cancelar', 'x-octagon', 'Cancelar pedido', 'danger'));
  }
  return out.join(' ');
}

function linha(p) {
  const a = carro(p.automovelId);
  const credito = p.credito?.solicitado ? `<i class="bi bi-bank me-1"></i>${esc(nomeAgente(p.credito.bancoId))}` : '<span class="text-muted">—</span>';
  return `<tr>
    <td data-label="#">${p.id}</td>
    ${agente ? `<td data-label="Cliente">${esc(cliente(p.clienteId)?.nome ?? `Cliente #${p.clienteId}`)}</td>` : ''}
    <td data-label="Automóvel">${esc(descCarro(a))}</td>
    <td data-label="Período" class="text-nowrap"><span>${fmtData(p.dataInicio)} a ${fmtData(p.dataFim)}<div class="small text-muted">${diarias(p.dataInicio, p.dataFim)} diária(s)</div></span></td>
    <td data-label="Total" class="text-end">${brl(totalPedido(p))}</td><td data-label="Crédito" class="small">${credito}</td><td data-label="Status">${badgeStatus(p.status)}</td>
    <td class="text-end table-actions text-nowrap">${acoes(p)}</td></tr>`;
}

// ---- Criar / modificar pedido ----------------------------------------------------------------
function opcoesAutomoveis(selecionadoId) {
  $('p-auto').innerHTML =
    '<option value="">Selecione…</option>' +
    automoveis.filter((a) => agente || !(a.proprietarioTipo === 'cliente' && a.proprietarioId === sessao.id))
      .map((a) => `<option value="${a.id}" ${a.id === selecionadoId ? 'selected' : ''}>${esc(descCarro(a))} — ${brl(a.diaria)}/dia · ${rotuloProprietario[a.proprietarioTipo]}</option>`).join('');
}
function opcoesBancos(selecionadoId) {
  const bancos = agentes.filter((g) => g.tipo === 'banco');
  $('p-banco').innerHTML = '<option value="">Selecione…</option>' + bancos.map((b) => `<option value="${b.id}" ${b.id === selecionadoId ? 'selected' : ''}>${esc(b.nome)}</option>`).join('');
}
function alternaCredito() {
  $('grupo-banco').classList.toggle('d-none', !$('p-credito').checked);
}
/** Desabilita no select os automóveis já reservados no período escolhido. */
function atualizaDisponibilidade() {
  const inicio = $('p-inicio').value, fim = $('p-fim').value;
  const periodoValido = inicio && fim && fim >= inicio;
  [...$('p-auto').options].forEach((op) => {
    if (!op.value) return;
    if (op.dataset.base === undefined) op.dataset.base = op.textContent;
    const ocupado = periodoValido && Boolean(conflito(Number(op.value), inicio, fim, pedidoEmEdicao?.id));
    op.disabled = ocupado;
    op.textContent = ocupado ? `${op.dataset.base} — indisponível no período` : op.dataset.base;
  });
  if ($('p-auto').selectedOptions[0]?.disabled) $('p-auto').value = '';
}

function atualizaResumo() {
  const a = carro(Number($('p-auto').value));
  const n = diarias($('p-inicio').value, $('p-fim').value);
  $('p-resumo').innerHTML = a && n
    ? `<strong>${n}</strong> diária(s) × ${brl(a.diaria)} = <strong>${brl(a.diaria * n)}</strong>`
    : 'Selecione o automóvel e o período.';
}

function abreFormulario(p = null, carroPre = null) {
  pedidoEmEdicao = p;
  $('modal-pedido-titulo').textContent = p ? `Modificar pedido #${p.id}` : 'Novo pedido';
  $('modal-pedido-alerta').innerHTML = '';
  $('form-pedido').querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  opcoesAutomoveis(p?.automovelId ?? carroPre);
  opcoesBancos(p?.credito?.bancoId);
  $('p-inicio').value = p?.dataInicio ?? '';
  $('p-fim').value = p?.dataFim ?? '';
  $('p-inicio').min = hojeISO();
  $('p-fim').min = hojeISO();
  $('p-credito').checked = Boolean(p?.credito?.solicitado);
  $('p-obs').value = p?.observacao ?? '';
  alternaCredito();
  atualizaDisponibilidade();
  atualizaResumo();
  getModal('modal-pedido').show();
}

function erro(input, msg) {
  input.classList.add('is-invalid');
  input.parentElement.querySelector('.invalid-feedback').textContent = msg;
  return false;
}

['p-inicio', 'p-fim'].forEach((id) => $(id).addEventListener('input', atualizaDisponibilidade));
['p-auto', 'p-inicio', 'p-fim'].forEach((id) => $(id).addEventListener('input', atualizaResumo));
$('p-credito').addEventListener('change', alternaCredito);
$('btn-novo').addEventListener('click', () => abreFormulario());

$('form-pedido').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('form-pedido').querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  const automovelId = Number($('p-auto').value);
  const inicio = $('p-inicio').value;
  const fim = $('p-fim').value;
  const usaCredito = $('p-credito').checked;
  const bancoId = Number($('p-banco').value) || null;
  let ok = true;
  if (!automovelId) ok = erro($('p-auto'), 'Selecione um automóvel.');
  if (!inicio) ok = erro($('p-inicio'), 'Informe a data de retirada.');
  else if (inicio < hojeISO() && inicio !== pedidoEmEdicao?.dataInicio) ok = erro($('p-inicio'), 'A retirada não pode ser no passado.');
  if (!fim) ok = erro($('p-fim'), 'Informe a data de devolução.');
  else if (inicio && fim < inicio) ok = erro($('p-fim'), 'A devolução deve ser igual ou posterior à retirada.');
  if (usaCredito && !bancoId) ok = erro($('p-banco'), 'Selecione o banco.');
  if (!ok) return;

  const bloqueio = conflito(automovelId, inicio, fim, pedidoEmEdicao?.id);
  if (bloqueio) {
    return mostraErro($('modal-pedido-alerta'), `Automóvel indisponível: já existe o pedido #${bloqueio.id} de ${fmtData(bloqueio.dataInicio)} a ${fmtData(bloqueio.dataFim)}.`);
  }
  const base = {
    automovelId, dataInicio: inicio, dataFim: fim, observacao: $('p-obs').value.trim(),
    credito: { solicitado: usaCredito, bancoId: usaCredito ? bancoId : null }
  };
  const botao = $('btn-salvar-pedido');
  botao.disabled = true;
  try {
    if (pedidoEmEdicao) {
      // Qualquer modificação invalida o parecer anterior: o pedido volta para análise.
      const atual = await pedidoAtualizado(pedidoEmEdicao.id, agente ? ['Em análise', 'Aprovado'] : ['Em análise']);
      if (!atual) return getModal('modal-pedido').hide();
      await api.update('pedidos', atual.id, { ...atual, ...base, status: 'Em análise', parecer: null });
      toast(`Pedido #${pedidoEmEdicao.id} modificado e reenviado para análise.`);
    } else {
      await api.create('pedidos', {
        clienteId: sessao.id, ...base, status: 'Em análise', parecer: null, contratoId: null, criadoEm: new Date().toISOString()
      });
      toast('Pedido criado e enviado para análise financeira.');
    }
    getModal('modal-pedido').hide();
    await carrega();
  } catch (err) {
    mostraErro($('modal-pedido-alerta'), err.message);
  } finally {
    botao.disabled = false;
  }
});

// ---- Detalhes --------------------------------------------------------------------------------
function linhaDoTempo(p) {
  const etapas = ['Pedido enviado', 'Análise financeira', 'Contrato'];
  const estado = {
    'Em análise': ['feito', 'atual', ''], Aprovado: ['feito', 'feito', 'atual'], Contratado: ['feito', 'feito', 'feito'],
    Reprovado: ['feito', 'erro', ''], Cancelado: ['feito', 'erro', '']
  }[p.status] ?? ['', '', ''];
  const icone = (e) => (e === 'feito' ? 'check-lg' : e === 'erro' ? 'x-lg' : e === 'atual' ? 'three-dots' : 'circle');
  const rotulos = p.status === 'Cancelado' ? ['Pedido enviado', 'Cancelado', 'Contrato'] : p.status === 'Reprovado' ? ['Pedido enviado', 'Reprovado', 'Contrato'] : etapas;
  return `<ol class="etapas">${rotulos.map((r, i) => `<li class="${estado[i]}"><span class="bolinha"><i class="bi bi-${icone(estado[i])}"></i></span><div>${r}</div></li>`).join('')}</ol>`;
}

function mostraDetalhes(p) {
  const a = carro(p.automovelId);
  const c = cliente(p.clienteId);
  const parecer = p.parecer
    ? `<div class="alert alert-${p.parecer.decisao === 'Positivo' ? 'success' : 'danger'} py-2 mb-3"><strong>Parecer ${esc(p.parecer.decisao.toLowerCase())}</strong> — ${esc(p.parecer.agenteNome)} em ${fmtDataHora(p.parecer.data)}<br>${esc(p.parecer.texto)}</div>`
    : '<div class="alert alert-light border py-2 mb-3">Aguardando parecer financeiro.</div>';
  $('modal-detalhe-titulo').innerHTML = `Pedido #${p.id} ${badgeStatus(p.status)}`;
  $('detalhe-corpo').innerHTML = `${linhaDoTempo(p)}${parecer}
    <dl class="row mb-0">
      <dt class="col-sm-4">Cliente</dt><dd class="col-sm-8">${esc(c?.nome ?? `Cliente #${p.clienteId}`)}</dd>
      <dt class="col-sm-4">Automóvel</dt><dd class="col-sm-8">${esc(descCarro(a))}${a ? `, ${esc(a.ano)}` : ''}</dd>
      <dt class="col-sm-4">Período</dt><dd class="col-sm-8">${fmtData(p.dataInicio)} a ${fmtData(p.dataFim)} (${diarias(p.dataInicio, p.dataFim)} diárias)</dd>
      <dt class="col-sm-4">Valor total</dt><dd class="col-sm-8">${brl(totalPedido(p))}</dd>
      <dt class="col-sm-4">Crédito</dt><dd class="col-sm-8">${p.credito?.solicitado ? `Solicitado ao ${esc(nomeAgente(p.credito.bancoId))}` : 'Não solicitado'}</dd>
      <dt class="col-sm-4">Observações</dt><dd class="col-sm-8">${esc(p.observacao) || '—'}</dd>
      <dt class="col-sm-4">Criado em</dt><dd class="col-sm-8">${fmtDataHora(p.criadoEm)}</dd>
      ${p.contratoId ? `<dt class="col-sm-4">Contrato</dt><dd class="col-sm-8"><a href="contratos.html">Contrato #${p.contratoId}</a></dd>` : ''}
    </dl>`;
  getModal('modal-detalhe').show();
}

// ---- Cancelamento (cliente) ------------------------------------------------------------------
async function cancelar(p) {
  const ok = await confirmar(`Cancelar o pedido #${p.id}? Esta ação não pode ser desfeita.`, { titulo: 'Cancelar pedido', ok: 'Cancelar pedido', perigo: true });
  if (!ok) return;
  try {
    if (!(await pedidoAtualizado(p.id, ['Em análise', 'Aprovado']))) return;
    await api.patch('pedidos', p.id, { status: 'Cancelado' });
    toast(`Pedido #${p.id} cancelado.`);
    await carrega();
  } catch (err) {
    mostraErro($('alerta'), err.message);
  }
}

// ---- Avaliação financeira (agente) -----------------------------------------------------------
function abreAvaliacao(p) {
  pedidoAvaliado = p;
  const c = cliente(p.clienteId);
  const renda = rendaTotal(c);
  const total = totalPedido(p);
  const pct = renda > 0 ? (total / renda) * 100 : Infinity;
  const nivel = pct <= 30 ? ['success', 'Compromete até 30% da renda: perfil favorável.']
    : pct <= 60 ? ['warning', 'Compromete entre 30% e 60% da renda: exige atenção.'] : ['danger', 'Compromete mais de 60% da renda: risco elevado.'];
  $('modal-avaliacao-titulo').textContent = `Avaliar pedido #${p.id}`;
  $('modal-avaliacao-alerta').innerHTML = '';
  $('a-parecer').value = '';
  $('a-parecer').classList.remove('is-invalid');
  $('avaliacao-corpo').innerHTML = `
    <div class="row g-3">
      <div class="col-md-6"><div class="border rounded p-3 h-100">
        <h6 class="text-uppercase text-muted">Cliente</h6>
        <div><strong>${esc(c?.nome)}</strong></div><div class="small text-muted mb-2">${esc(c?.profissao)} · CPF ${esc(c?.cpf)}</div>
        <ul class="list-unstyled small mb-2">${(c?.rendimentos ?? []).map((r) => `<li>${esc(r.entidade)}: <strong>${brl(r.valor)}</strong></li>`).join('')}</ul>
        <div>Renda mensal total: <strong>${brl(renda)}</strong></div></div></div>
      <div class="col-md-6"><div class="border rounded p-3 h-100">
        <h6 class="text-uppercase text-muted">Pedido</h6>
        <div><strong>${esc(descCarro(carro(p.automovelId)))}</strong></div>
        <div class="small text-muted mb-2">${fmtData(p.dataInicio)} a ${fmtData(p.dataFim)} · ${diarias(p.dataInicio, p.dataFim)} diária(s)</div>
        <div>Valor total: <strong>${brl(total)}</strong></div>
        <div class="small">Crédito: ${p.credito?.solicitado ? esc(nomeAgente(p.credito.bancoId)) : 'não solicitado'}</div></div></div>
    </div>
    <div class="alert alert-${nivel[0]} mt-3 mb-0 py-2"><strong>${Number.isFinite(pct) ? pct.toFixed(1).replace('.', ',') : '—'}%</strong> da renda mensal — ${nivel[1]}</div>`;
  getModal('modal-avaliacao').show();
}

async function decide(decisao) {
  const texto = $('a-parecer').value.trim();
  if (texto.length < 5) {
    $('a-parecer').classList.add('is-invalid');
    $('a-parecer').parentElement.querySelector('.invalid-feedback').textContent = 'Escreva um parecer com ao menos 5 caracteres.';
    return;
  }
  const positivo = decisao === 'Positivo';
  try {
    if (!(await pedidoAtualizado(pedidoAvaliado.id, ['Em análise']))) return getModal('modal-avaliacao').hide();
    await api.patch('pedidos', pedidoAvaliado.id, {
      status: positivo ? 'Aprovado' : 'Reprovado',
      parecer: { agenteId: sessao.id, agenteNome: sessao.nome, decisao, texto, data: new Date().toISOString() }
    });
    getModal('modal-avaliacao').hide();
    toast(`Pedido #${pedidoAvaliado.id} ${positivo ? 'aprovado' : 'reprovado'}.`, positivo ? 'success' : 'warning');
    await carrega();
  } catch (err) {
    mostraErro($('modal-avaliacao-alerta'), err.message);
  }
}
$('btn-aprovar').addEventListener('click', () => decide('Positivo'));
$('btn-reprovar').addEventListener('click', () => decide('Negativo'));

// ---- Execução do contrato (agente) -----------------------------------------------------------
function atualizaParcela() {
  const v = Number($('k-valor').value), n = Number($('k-parcelas').value), t = Number($('k-taxa').value);
  const parcela = calcParcela(v, n, t);
  $('k-parcela-previa').innerHTML = parcela
    ? `${n}× de <strong>${brl(parcela)}</strong> (Tabela Price) — total pago: ${brl(parcela * n)}`
    : 'Informe valor, parcelas e taxa.';
}

function abreContrato(p) {
  pedidoContrato = p;
  const total = totalPedido(p);
  const exigeBanco = p.credito?.solicitado;
  const donoDoCredito = !exigeBanco || p.credito.bancoId === sessao.id;
  $('modal-contrato-titulo').textContent = `Executar contrato — pedido #${p.id}`;
  $('modal-contrato-alerta').innerHTML = '';
  $('contrato-resumo').innerHTML = `<div class="border rounded p-3 small">
    <div><strong>${esc(cliente(p.clienteId)?.nome)}</strong> alugando <strong>${esc(descCarro(carro(p.automovelId)))}</strong></div>
    <div>${fmtData(p.dataInicio)} a ${fmtData(p.dataFim)} · Total: <strong>${brl(total)}</strong></div></div>`;
  const proprio = sessao.tipo === 'banco' ? 'Banco (agente que executa o contrato)' : 'Empresa (agente que executa o contrato)';
  $('k-propriedade').innerHTML = `<option value="agente">${proprio}</option><option value="cliente">Cliente</option>`;
  $('grupo-credito').classList.toggle('d-none', !exigeBanco);
  $('k-valor').value = total.toFixed(2);
  atualizaParcela();
  if (!donoDoCredito) {
    mostraErro($('modal-contrato-alerta'), `Este pedido solicita crédito ao ${nomeAgente(p.credito.bancoId)}. Somente esse banco pode executar o contrato.`);
  }
  $('btn-executar').disabled = !donoDoCredito;
  getModal('modal-contrato').show();
}
['k-valor', 'k-parcelas', 'k-taxa'].forEach((id) => $(id).addEventListener('input', atualizaParcela));

$('form-contrato').addEventListener('submit', async (e) => {
  e.preventDefault();
  const p = pedidoContrato;
  const total = totalPedido(p);
  let credito = null;
  if (p.credito?.solicitado) {
    const v = Number($('k-valor').value), n = Number($('k-parcelas').value), t = Number($('k-taxa').value);
    if (!(v > 0) || v > total) return mostraErro($('modal-contrato-alerta'), `O valor financiado deve ser maior que zero e no máximo ${brl(total)}.`);
    if (!Number.isInteger(n) || n < 1 || n > 60) return mostraErro($('modal-contrato-alerta'), 'Parcelas: informe um inteiro entre 1 e 60.');
    if (!(t >= 0 && t <= 20)) return mostraErro($('modal-contrato-alerta'), 'Taxa mensal entre 0% e 20%.');
    credito = { bancoId: sessao.id, valorFinanciado: v, parcelas: n, taxaMensal: t, valorParcela: Math.round(calcParcela(v, n, t) * 100) / 100 };
  }
  const propriedade = $('k-propriedade').value;
  const botao = $('btn-executar');
  botao.disabled = true;
  try {
    if (!(await pedidoAtualizado(p.id, ['Aprovado']))) return getModal('modal-contrato').hide();
    const contrato = await api.create('contratos', {
      pedidoId: p.id, agenteId: sessao.id, agenteNome: sessao.nome, clienteId: p.clienteId, automovelId: p.automovelId,
      propriedade, valorTotal: total, credito, status: 'Vigente', assinadoEm: new Date().toISOString()
    });
    // O automóvel é registrado como propriedade do cliente ou do agente, conforme o tipo de contrato.
    await api.patch('automoveis', p.automovelId, propriedade === 'cliente'
      ? { proprietarioTipo: 'cliente', proprietarioId: p.clienteId }
      : { proprietarioTipo: sessao.tipo, proprietarioId: sessao.id });
    await api.patch('pedidos', p.id, { status: 'Contratado', contratoId: contrato.id });
    getModal('modal-contrato').hide();
    toast(`Contrato #${contrato.id} executado com sucesso.`);
    await carrega();
  } catch (err) {
    mostraErro($('modal-contrato-alerta'), err.message);
  } finally {
    botao.disabled = false;
  }
});

// ---- Eventos da tabela e filtros -------------------------------------------------------------
$('lista').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-acao]');
  if (!btn) return;
  const p = pedidos.find((x) => x.id === Number(btn.dataset.id));
  if (!p) return;
  ({ ver: mostraDetalhes, editar: abreFormulario, cancelar, avaliar: abreAvaliacao, contratar: abreContrato })[btn.dataset.acao]?.(p);
});
$('filtro-status').addEventListener('change', render);
$('busca').addEventListener('input', render);

carrega();
