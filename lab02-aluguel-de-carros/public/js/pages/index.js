import { getSessao, login } from '../auth.js';
import { iniciaPagina, mostraErro } from '../ui.js';

if (getSessao()) location.replace('painel.html');
iniciaPagina('');

const aviso = document.getElementById('aviso');
if (new URLSearchParams(location.search).get('cadastro') === 'ok') {
  aviso.innerHTML = '<div class="alert alert-success py-2">Cadastro realizado! Entre com seu e-mail e senha.</div>';
}

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  if (!email.trim() || !senha) return mostraErro(aviso, 'Informe e-mail e senha.');
  const btn = document.getElementById('btn-entrar');
  btn.disabled = true;
  try {
    const sessao = await login(email, senha);
    if (!sessao) return mostraErro(aviso, 'E-mail ou senha inválidos.');
    location.href = 'painel.html';
  } catch (err) {
    mostraErro(aviso, err.message);
  } finally {
    btn.disabled = false;
  }
});
