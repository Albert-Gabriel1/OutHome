const API_BASE_URL = "http://localhost:3000";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("outhome_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("outhome_token");
      localStorage.removeItem("outhome_usuario");
    }

    const message =
      data?.erro ||
      data?.message ||
      "Não foi possível concluir a solicitação.";

    throw new Error(message);
  }

  return data;
}

function salvarSessao(data) {
  localStorage.setItem("outhome_token", data.token);
  localStorage.setItem("outhome_usuario", JSON.stringify(data.usuario));
}

function obterUsuario() {
  try {
    return JSON.parse(localStorage.getItem("outhome_usuario") || "null");
  } catch {
    return null;
  }
}

function estaLogado() {
  return Boolean(localStorage.getItem("outhome_token"));
}

function sair() {
  localStorage.removeItem("outhome_token");
  localStorage.removeItem("outhome_usuario");
  window.location.href = "index.html";
}

async function verificarSessao() {
  if (!estaLogado()) return null;

  try {
    const data = await apiFetch("/auth/me");
    localStorage.setItem("outhome_usuario", JSON.stringify(data.usuario));
    return data.usuario;
  } catch {
    return null;
  }
}
