// Camada de acesso à API REST (JSON Server) usando a Fetch API.
const BASE = String(window.APP_CONFIG?.API_URL ?? '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch {
    throw new ApiError('Não foi possível conectar à API. Verifique se o servidor (JSON Server) está em execução.');
  }
  if (!res.ok) throw new ApiError(`Falha na requisição (${res.status}) para ${path}.`, res.status);
  return res.status === 204 ? null : res.json();
}

const qs = (params) => {
  const s = new URLSearchParams(params).toString();
  return s ? `?${s}` : '';
};

export const api = {
  list: (colecao, params = {}) => request(`/${colecao}${qs(params)}`),
  get: (colecao, id) => request(`/${colecao}/${id}`),
  create: (colecao, dados) => request(`/${colecao}`, { method: 'POST', body: JSON.stringify(dados) }),
  update: (colecao, id, dados) => request(`/${colecao}/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  patch: (colecao, id, dados) => request(`/${colecao}/${id}`, { method: 'PATCH', body: JSON.stringify(dados) }),
  remove: (colecao, id) => request(`/${colecao}/${id}`, { method: 'DELETE' })
};
