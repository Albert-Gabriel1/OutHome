document.addEventListener("DOMContentLoaded", async () => {
  const lista = document.getElementById("lista-roteiros");
  const usuarioNome = document.getElementById("usuario-nome");
  const form = document.getElementById("novo-roteiro-form");
  const mensagem = document.getElementById("roteiro-mensagem");

  const usuario = obterUsuario();
  if (!usuario || !estaLogado()) {
    window.location.href = "login.html";
    return;
  }

  usuarioNome.textContent = usuario.nome;

  async function carregarRoteiros() {
    try {
      lista.innerHTML = "<p>Carregando roteiros...</p>";
      const roteiros = await apiFetch("/roteiros");

      if (!roteiros.length) {
        lista.innerHTML = "<p>Você ainda não possui roteiros. Crie o primeiro acima.</p>";
        return;
      }

      lista.innerHTML = "";

      roteiros.forEach((roteiro) => {
        const card = document.createElement("article");
        card.className = "projeto-card";

        card.innerHTML = `
          <h3>${escaparHTML(roteiro.titulo)}</h3>
          <p>${formatarData(roteiro.data_inicio)} → ${formatarData(roteiro.data_fim)}</p>
          <p>${escaparHTML(roteiro.descricao || "Sem descrição.")}</p>
          <div class="projeto-acoes">
            <a class="btn-projeto" href="roteiro.html?id=${roteiro.id}">Abrir roteiro</a>
            <button type="button" class="btn-excluir" data-id="${roteiro.id}">Excluir</button>
          </div>
        `;

        lista.appendChild(card);
      });

      lista.querySelectorAll("[data-id]").forEach((button) => {
        button.addEventListener("click", async () => {
          if (!confirm("Excluir este roteiro?")) return;

          try {
            await apiFetch(`/roteiros/${button.dataset.id}`, {
              method: "DELETE"
            });
            await carregarRoteiros();
          } catch (error) {
            alert(error.message);
          }
        });
      });
    } catch (error) {
      lista.innerHTML = `<p>${escaparHTML(error.message)}</p>`;
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      mensagem.textContent = "Criando roteiro...";

      const body = {
        titulo: form.titulo.value.trim(),
        data_inicio: form.data_inicio.value,
        data_fim: form.data_fim.value,
        descricao: form.descricao.value.trim(),
        publico: form.publico.checked
      };

      if (body.data_fim < body.data_inicio) {
        throw new Error("A data final não pode ser anterior à data inicial.");
      }

      const roteiro = await apiFetch("/roteiros", {
        method: "POST",
        body: JSON.stringify(body)
      });

      window.location.href = `roteiro.html?id=${roteiro.id}`;
    } catch (error) {
      mensagem.textContent = error.message;
    }
  });

  document.querySelector("[data-logout]")?.addEventListener("click", (event) => {
    event.preventDefault();
    sair();
  });

  await carregarRoteiros();
});

function formatarData(data) {
  if (!data) return "";
  const [ano, mes, dia] = String(data).slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

function escaparHTML(valor) {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
