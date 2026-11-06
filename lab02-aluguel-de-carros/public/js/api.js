// Camada de acesso à API REST (JSON Server) usando a Fetch API.
const BASE = String(window.APP_CONFIG?.API_URL ?? '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Hospedagens gratuitas "dormem" após alguns minutos sem uso: avisa o usuário se a resposta demorar.
let emAndamento = 0;
let aviso = null;
function mostraAviso(ligado) {
  if (ligado && !aviso) {
    aviso = document.createElement('div');
    aviso.className = 'alert alert-info shadow aviso-servidor py-2 px-3 small';
    aviso.setAttribute('role', 'status');
    aviso.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Conectando ao servidor… na hospedagem gratuita ele pode levar até 1 minuto para acordar.';
    document.body.appendChild(aviso);
  } else if (!ligado && aviso) {
    aviso.remove();
    aviso = null;
  }
}

async function request(path, options = {}) {
  let res;
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), 90000);
  const lento = setTimeout(() => emAndamento > 0 && mostraAviso(true), 3500);
  emAndamento++;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controle.signal,
      ...options
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente em instantes.');
  } finally {
    clearTimeout(limite);
    clearTimeout(lento);
    emAndamento--;
    if (emAndamento === 0) mostraAviso(false);
  }
  if (!res.ok) {
    const corpo = await res.json().catch(() => null);
    throw new ApiError(corpo?.erro ?? `Falha na requisição (${res.status}) para ${path}.`, res.status);
  }
  return res.status === 204 ? null : res.json();
}

const qs = (params) => {
  const s = new URLSearchParams(params).toString();
  return s ? `?${s}` : '';
};

export const api = {
  /** Login validado no servidor. Retorna a sessão ou null se as credenciais forem inválidas. */
  login: async (email, senha) => {
    try {
      return await request('/login', { method: 'POST', body: JSON.stringify({ email, senha }) });
    } catch (err) {
      if (err.status === 401) return null;
      throw err;
    }
  },
  list: (colecao, params = {}) => request(`/${colecao}${qs(params)}`),
  get: (colecao, id) => request(`/${colecao}/${id}`),
  create: (colecao, dados) => request(`/${colecao}`, { method: 'POST', body: JSON.stringify(dados) }),
  update: (colecao, id, dados) => request(`/${colecao}/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  patch: (colecao, id, dados) => request(`/${colecao}/${id}`, { method: 'PATCH', body: JSON.stringify(dados) }),
  remove: (colecao, id) => request(`/${colecao}/${id}`, { method: 'DELETE' })
};
