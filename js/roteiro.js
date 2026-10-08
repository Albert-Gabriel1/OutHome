document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const roteiroId = params.get("id");

  if (!roteiroId || !estaLogado()) {
    window.location.href = !estaLogado() ? "login.html" : "meus_projetos.html";
    return;
  }

  const titulo = document.getElementById("roteiro-titulo");
  const datas = document.getElementById("roteiro-datas");
  const diasContainer = document.getElementById("dias-container");
  const atividadeForm = document.getElementById("atividade-form");
  const mensagem = document.getElementById("editor-mensagem");
  const diaSelect = document.getElementById("atividade-dia");

  let dias = [];

  async function carregarRoteiro() {
    const roteiros = await apiFetch("/roteiros");
    const roteiro = roteiros.find((item) => String(item.id) === String(roteiroId));

    if (!roteiro) {
      throw new Error("Roteiro não encontrado.");
    }

    titulo.textContent = roteiro.titulo;
    datas.textContent = `${formatarData(roteiro.data_inicio)} → ${formatarData(roteiro.data_fim)}`;
  }

  async function carregarDias() {
    dias = await apiFetch(`/roteiros/${roteiroId}/dias`);

    diaSelect.innerHTML = dias.length
      ? dias.map((dia) =>
          `<option value="${dia.id}">Dia ${dia.ordem} - ${formatarData(dia.data)}</option>`
        ).join("")
      : "<option value=''>Nenhum dia cadastrado</option>";

    await renderizarDias();
  }

  async function renderizarDias() {
    if (!dias.length) {
      diasContainer.innerHTML = "<p>Nenhum dia cadastrado ainda.</p>";
      return;
    }

    const blocos = [];

    for (const dia of dias) {
      const atividades = await apiFetch(
        `/roteiros/${roteiroId}/dias/${dia.id}/atividades`
      );

      const atividadesHTML = atividades.length
        ? atividades.map((atividade) => `
            <li>
              <strong>${escaparHTML(atividade.horario || "--:--")}</strong>
              ${escaparHTML(atividade.titulo)}
              ${atividade.custo_estimado ? ` · R$ ${Number(atividade.custo_estimado).toFixed(2)}` : ""}
              <button type="button"
                class="btn-excluir-atividade"
                data-dia="${dia.id}"
                data-atividade="${atividade.id}">
                excluir
              </button>
            </li>
          `).join("")
        : "<li>Nenhuma atividade neste dia.</li>";

      blocos.push(`
        <article class="dia-card">
          <div class="dia-cabecalho">
            <div>
              <h3>Dia ${dia.ordem}</h3>
              <p>${formatarData(dia.data)}</p>
            </div>
            <button type="button" class="btn-excluir" data-excluir-dia="${dia.id}">
              Excluir dia
            </button>
          </div>
          <ul>${atividadesHTML}</ul>
        </article>
      `);
    }

    diasContainer.innerHTML = blocos.join("");

    diasContainer.querySelectorAll("[data-excluir-dia]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!confirm("Excluir este dia e todas as atividades dele?")) return;

        try {
          await apiFetch(
            `/roteiros/${roteiroId}/dias/${button.dataset.excluirDia}`,
            { method: "DELETE" }
          );
          await carregarDias();
        } catch (error) {
          alert(error.message);
        }
      });
    });

    diasContainer.querySelectorAll("[data-atividade]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await apiFetch(
            `/roteiros/${roteiroId}/dias/${button.dataset.dia}/atividades/${button.dataset.atividade}`,
            { method: "DELETE" }
          );
          await renderizarDias();
        } catch (error) {
          alert(error.message);
        }
      });
    });
  }

  document.getElementById("dia-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const data = document.getElementById("dia-data").value;
      const ordem = Number(document.getElementById("dia-ordem").value);

      await apiFetch(`/roteiros/${roteiroId}/dias`, {
        method: "POST",
        body: JSON.stringify({ data, ordem })
      });

      event.target.reset();
      await carregarDias();
    } catch (error) {
      mensagem.textContent = error.message;
    }
  });

  atividadeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const diaId = diaSelect.value;

      if (!diaId) {
        throw new Error("Crie um dia antes de adicionar atividades.");
      }

      const body = {
        titulo: atividadeForm.titulo.value.trim(),
        horario: atividadeForm.horario.value || null,
        custo_estimado: Number(atividadeForm.custo_estimado.value || 0),
        categoria: atividadeForm.categoria.value.trim() || null
      };

      await apiFetch(
        `/roteiros/${roteiroId}/dias/${diaId}/atividades`,
        {
          method: "POST",
          body: JSON.stringify(body)
        }
      );

      atividadeForm.reset();
      await renderizarDias();
    } catch (error) {
      mensagem.textContent = error.message;
    }
  });

  try {
    await carregarRoteiro();
    await carregarDias();
  } catch (error) {
    document.body.innerHTML = `<main><h1>Erro</h1><p>${escaparHTML(error.message)}</p><a href="meus_projetos.html">Voltar</a></main>`;
  }
});

function formatarData(data) {
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
