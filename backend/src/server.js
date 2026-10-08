const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const pool = require("./db");

const authRoutes = require("./routes/auth");
const roteirosRoutes = require("./routes/roteiros");
const destinosRoutes = require("./routes/destinos");

const app = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    mensagem: "API do OutHome está funcionando."
  });
});

app.use("/auth", authRoutes);
app.use("/roteiros", roteirosRoutes);
app.use("/destinos", destinosRoutes);

app.get("/testar-banco", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    const [rows] = await pool.query("SHOW TABLES");

    res.json({
      conectado: true,
      tabelas: rows
    });
  } catch (err) {
    console.error("Erro ao testar banco:", err);
    res.status(500).json({
      conectado: false,
      erro: "Não foi possível conectar ao banco de dados."
    });
  }
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`OutHome API rodando em http://localhost:${PORT}`);
});
