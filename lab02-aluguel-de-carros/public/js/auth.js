// Autenticação simulada: cadastro prévio + sessão no sessionStorage.
// ATENÇÃO: projeto acadêmico — senhas ficam em texto puro no db.json (não use em produção).
import { api } from './api.js';

const CHAVE = 'aluguel.sessao';

export function getSessao() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE));
  } catch {
    return null;
  }
}

export const isAgente = (s = getSessao()) => s?.perfil === 'agente';
export const isCliente = (s = getSessao()) => s?.perfil === 'cliente';

export function logout() {
  sessionStorage.removeItem(CHAVE);
  location.href = 'index.html';
}

export async function login(email, senha) {
  const e = String(email).trim().toLowerCase();
  const [clientes, agentes] = await Promise.all([
    api.list('clientes', { email: e }),
    api.list('agentes', { email: e })
  ]);
  const cliente = clientes.find((c) => c.senha === senha);
  const agente = agentes.find((a) => a.senha === senha);
  let sessao = null;
  if (cliente) sessao = { perfil: 'cliente', id: cliente.id, nome: cliente.nome };
  else if (agente) sessao = { perfil: 'agente', id: agente.id, nome: agente.nome, tipo: agente.tipo };
  if (!sessao) return null;
  sessionStorage.setItem(CHAVE, JSON.stringify(sessao));
  return sessao;
}

/**
 * Garante usuário autenticado (e do perfil permitido). Use com `await` no topo do módulo:
 * em caso de redirecionamento a promise nunca resolve, interrompendo o restante da página sem erros.
 */
export async function exigeLogin(perfis = ['cliente', 'agente']) {
  const sessao = getSessao();
  if (!sessao) {
    location.replace('index.html');
    return new Promise(() => {});
  }
  if (!perfis.includes(sessao.perfil)) {
    location.replace('painel.html');
    return new Promise(() => {});
  }
  return sessao;
}

/** Verifica se o e-mail já está cadastrado (clientes ou agentes). */
export async function emailEmUso(email, ignorar = null) {
  const e = String(email).trim().toLowerCase();
  const [clientes, agentes] = await Promise.all([
    api.list('clientes', { email: e }),
    api.list('agentes', { email: e })
  ]);
  return (
    clientes.some((c) => !(ignorar?.colecao === 'clientes' && c.id === ignorar.id)) ||
    agentes.some((a) => !(ignorar?.colecao === 'agentes' && a.id === ignorar.id))
  );
}
