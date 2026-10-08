document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const cadastroForm = document.getElementById("cadastro-form");
  const logoutButtons = document.querySelectorAll("[data-logout]");

  logoutButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      sair();
    });
  });

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = loginForm.email.value.trim().toLowerCase();
      const senha = loginForm.senha.value;
      const button = loginForm.querySelector("button[type='submit']");
      const mensagem = document.getElementById("login-mensagem");

      try {
        button.disabled = true;
        mensagem.textContent = "Entrando...";

        const data = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, senha })
        });

        salvarSessao(data);
        window.location.href = "meus_projetos.html";
      } catch (error) {
        mensagem.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
  }

  if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nome = cadastroForm.nome.value.trim();
      const email = cadastroForm.email.value.trim().toLowerCase();
      const confirmarEmail = cadastroForm.confirm_email.value.trim().toLowerCase();
      const senha = cadastroForm.senha.value;
      const confirmarSenha = cadastroForm.confirm_senha.value;

      const button = cadastroForm.querySelector("button[type='submit']");
      const mensagem = document.getElementById("cadastro-mensagem");

      if (email !== confirmarEmail) {
        mensagem.textContent = "Os e-mails não coincidem.";
        return;
      }

      if (senha !== confirmarSenha) {
        mensagem.textContent = "As senhas não coincidem.";
        return;
      }

      if (senha.length < 6) {
        mensagem.textContent = "A senha deve ter pelo menos 6 caracteres.";
        return;
      }

      try {
        button.disabled = true;
        mensagem.textContent = "Criando conta...";

        await apiFetch("/auth/cadastro", {
          method: "POST",
          body: JSON.stringify({ nome, email, senha })
        });

        alert("Conta criada com sucesso! Agora faça login.");
        window.location.href = "login.html";
      } catch (error) {
        mensagem.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
  }
});
