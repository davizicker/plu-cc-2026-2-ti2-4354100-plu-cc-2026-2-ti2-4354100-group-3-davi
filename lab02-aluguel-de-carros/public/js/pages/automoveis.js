import { api } from '../api.js';
import { exigeLogin } from '../auth.js';
import { brl, confirmar, esc, estadoVazio, getModal, iniciaPagina, mostraErro, rotuloProprietario, STATUS_ATIVOS, toast } from '../ui.js';
import { isPlaca, normalizaPlaca } from '../validators.js';

const sessao = await exigeLogin();
iniciaPagina('automoveis.html');
const agente = sessao.perfil === 'agente';
const $ = (id) => document.getElementById(id);
let automoveis = [], pedidos = [], clientes = [], agentes = [];
let editandoId = null;

$('subtitulo').textContent = agente
  ? 'Gerencie a frota de empresas, bancos e clientes.'
  : 'Consulte a frota disponível e cadastre os seus próprios veículos.';
$('grupo-proprietario').classList.toggle('d-none', !agente);

async function carrega() {
  try {
    [automoveis, pedidos, agentes] = await Promise.all([api.list('automoveis'), api.list('pedidos'), api.list('agentes')]);
    clientes = agente ? await api.list('clientes') : [];
    render();
  } catch (err) {
    mostraErro($('alerta'), err.message);
  }
}

const podeEditar = (a) => agente || (a.proprietarioTipo === 'cliente' && a.proprietarioId === sessao.id);

function nomeProprietario(a) {
  if (a.proprietarioTipo === 'cliente') {
    if (!agente) return a.proprietarioId === sessao.id ? 'Você' : 'Cliente';
    return clientes.find((c) => c.id === a.proprietarioId)?.nome ?? 'Cliente';
  }
  return agentes.find((g) => g.id === a.proprietarioId && g.tipo === a.proprietarioTipo)?.nome ?? rotuloProprietario[a.proprietarioTipo];
}

function render() {
  const q = $('busca').value.trim().toLowerCase();
  const lista = automoveis.filter((a) => !q || [a.placa, a.marca, a.modelo, a.matricula].some((v) => String(v).toLowerCase().includes(q)));
  $('lista').innerHTML = lista.length
    ? lista.map((a) => {
        const reservas = pedidos.filter((p) => p.automovelId === a.id && STATUS_ATIVOS.includes(p.status)).length;
        return `<tr>
          <td data-label="Placa"><code>${esc(a.placa)}</code></td><td data-label="Veículo"><span><strong>${esc(a.marca)}</strong> ${esc(a.modelo)}</span></td><td data-label="Ano">${esc(a.ano)}</td><td data-label="Matrícula">${esc(a.matricula)}</td>
          <td data-label="Diária" class="text-end">${brl(a.diaria)}</td>
          <td data-label="Proprietário"><span>${esc(nomeProprietario(a))} <span class="badge text-bg-light border">${rotuloProprietario[a.proprietarioTipo]}</span></span></td>
          <td data-label="Reservas ativas" class="text-center">${reservas}</td>
          <td class="text-end table-actions text-nowrap">${podeEditar(a)
            ? `<button class="btn btn-outline-primary" data-acao="editar" data-id="${a.id}" title="Editar"><i class="bi bi-pencil"></i></button>
               <button class="btn btn-outline-danger" data-acao="excluir" data-id="${a.id}" title="Excluir"><i class="bi bi-trash"></i></button>`
            : `<a class="btn btn-brand" href="pedidos.html?novo=1&carro=${a.id}" title="Alugar este automóvel"><i class="bi bi-key me-1"></i>Alugar</a>`}</td></tr>`;
      }).join('')
    : estadoVazio('Nenhum automóvel encontrado.', 8);
}

function opcoesProprietario(selecionado) {
  const grupo = (rotulo, itens) => itens.length ? `<optgroup label="${rotulo}">${itens.join('')}</optgroup>` : '';
  const opt = (tipo, id, nome) => `<option value="${tipo}:${id}" ${selecionado === `${tipo}:${id}` ? 'selected' : ''}>${esc(nome)}</option>`;
  $('f-proprietario').innerHTML =
    grupo('Empresas', agentes.filter((g) => g.tipo === 'empresa').map((g) => opt('empresa', g.id, g.nome))) +
    grupo('Bancos', agentes.filter((g) => g.tipo === 'banco').map((g) => opt('banco', g.id, g.nome))) +
    grupo('Clientes', clientes.map((c) => opt('cliente', c.id, c.nome)));
}

function abreModal(auto = null) {
  editandoId = auto?.id ?? null;
  $('modal-auto-titulo').textContent = auto ? 'Editar automóvel' : 'Novo automóvel';
  $('modal-alerta').innerHTML = '';
  $('form-auto').querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  $('f-marca').value = auto?.marca ?? '';
  $('f-modelo').value = auto?.modelo ?? '';
  $('f-ano').value = auto?.ano ?? '';
  $('f-placa').value = auto?.placa ?? '';
  $('f-matricula').value = auto?.matricula ?? '';
  $('f-diaria').value = auto?.diaria ?? '';
  if (agente) opcoesProprietario(auto ? `${auto.proprietarioTipo}:${auto.proprietarioId}` : `${sessao.tipo}:${sessao.id}`);
  getModal('modal-auto').show();
}

function erro(input, msg) {
  input.classList.add('is-invalid');
  input.parentElement.querySelector('.invalid-feedback').textContent = msg;
  return false;
}

$('btn-novo').addEventListener('click', () => abreModal());
$('busca').addEventListener('input', render);
$('f-placa').addEventListener('input', (e) => (e.target.value = e.target.value.toUpperCase()));

$('lista').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-acao]');
  if (!btn) return;
  const auto = automoveis.find((a) => a.id === Number(btn.dataset.id));
  if (!auto || !podeEditar(auto)) return;
  if (btn.dataset.acao === 'editar') return abreModal(auto);
  const ativos = pedidos.filter((p) => p.automovelId === auto.id && STATUS_ATIVOS.includes(p.status));
  if (ativos.length) return mostraErro($('alerta'), `Não é possível excluir ${auto.placa}: há ${ativos.length} pedido(s)/contrato(s) ativo(s) com este veículo.`);
  const ok = await confirmar(`Excluir o automóvel ${auto.marca} ${auto.modelo} (${auto.placa})?`, { titulo: 'Excluir automóvel', ok: 'Excluir', perigo: true });
  if (!ok) return;
  try {
    const historico = pedidos.filter((p) => p.automovelId === auto.id);
    await Promise.all(historico.map((p) => api.remove('pedidos', p.id)));
    await api.remove('automoveis', auto.id);
    toast('Automóvel excluído.');
    $('alerta').innerHTML = '';
    await carrega();
  } catch (err) {
    mostraErro($('alerta'), err.message);
  }
});

$('form-auto').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('form-auto').querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  const f = { marca: $('f-marca'), modelo: $('f-modelo'), ano: $('f-ano'), placa: $('f-placa'), matricula: $('f-matricula'), diaria: $('f-diaria') };
  const anoMax = new Date().getFullYear() + 1;
  let ok = true;
  if (!f.marca.value.trim()) ok = erro(f.marca, 'Informe a marca.');
  if (!f.modelo.value.trim()) ok = erro(f.modelo, 'Informe o modelo.');
  const ano = Number(f.ano.value);
  if (!Number.isInteger(ano) || ano < 1980 || ano > anoMax) ok = erro(f.ano, `Ano entre 1980 e ${anoMax}.`);
  if (!isPlaca(f.placa.value)) ok = erro(f.placa, 'Placa inválida (ex.: ABC1D23 ou ABC-1234).');
  if (f.matricula.value.trim().length < 3) ok = erro(f.matricula, 'Informe a matrícula.');
  if (!(Number(f.diaria.value) > 0)) ok = erro(f.diaria, 'Informe um valor maior que zero.');
  if (!ok) return;

  const placa = normalizaPlaca(f.placa.value);
  const outros = automoveis.filter((a) => a.id !== editandoId);
  if (outros.some((a) => normalizaPlaca(a.placa) === placa)) return erro(f.placa, 'Placa já cadastrada.');
  if (outros.some((a) => a.matricula === f.matricula.value.trim())) return erro(f.matricula, 'Matrícula já cadastrada.');

  let proprietarioTipo = 'cliente', proprietarioId = sessao.id;
  if (agente) {
    const [t, id] = $('f-proprietario').value.split(':');
    if (!t) return mostraErro($('modal-alerta'), 'Selecione o proprietário.');
    proprietarioTipo = t;
    proprietarioId = Number(id);
  }
  const dados = {
    matricula: f.matricula.value.trim(), ano, marca: f.marca.value.trim(), modelo: f.modelo.value.trim(),
    placa, diaria: Number(f.diaria.value), proprietarioTipo, proprietarioId
  };
  const botao = $('form-auto').querySelector('[type=submit]');
  botao.disabled = true;
  try {
    if (editandoId) await api.update('automoveis', editandoId, { id: editandoId, ...dados });
    else await api.create('automoveis', dados);
    getModal('modal-auto').hide();
    toast(editandoId ? 'Automóvel atualizado.' : 'Automóvel cadastrado.');
    await carrega();
  } catch (err) {
    mostraErro($('modal-alerta'), err.message);
  } finally {
    botao.disabled = false;
  }
});

carrega();
