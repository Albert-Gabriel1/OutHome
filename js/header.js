document.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.getElementById("login");
  if (!loginLink) return;

  if (estaLogado()) {
    const usuario = obterUsuario();
    loginLink.textContent = usuario?.nome ? `Olá, ${usuario.nome}` : "Minha conta";
    loginLink.href = "meus_projetos.html";
  }
});
