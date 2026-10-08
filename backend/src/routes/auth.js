const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const verificarToken = require("../middleware/auth");

const router = express.Router();

router.post("/cadastro", async (req, res) => {
  const nome = String(req.body.nome || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const senha = String(req.body.senha || "");

  if (!nome || !email || !senha) {
    return res.status(400).json({
      erro: "Nome, email e senha são obrigatórios."
    });
  }

  if (senha.length < 6) {
    return res.status(400).json({
      erro: "A senha deve ter pelo menos 6 caracteres."
    });
  }

  try {
    const [existente] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    if (existente.length > 0) {
      return res.status(409).json({
        erro: "Email já cadastrado."
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [result] = await pool.query(
      "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
      [nome, email, senhaHash]
    );

    return res.status(201).json({
      id: result.insertId,
      nome,
      email
    });
  } catch (err) {
    console.error("Erro no cadastro:", err);
    return res.status(500).json({
      erro: "Erro interno ao criar a conta."
    });
  }
});

router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const senha = String(req.body.senha || "");

  if (!email || !senha) {
    return res.status(400).json({
      erro: "Email e senha são obrigatórios."
    });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    const usuario = rows[0];

    if (!usuario) {
      return res.status(401).json({
        erro: "Email ou senha inválidos."
      });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({
        erro: "Email ou senha inválidos."
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({
      erro: "Erro interno ao fazer login."
    });
  }
});

router.get("/me", verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nome, email FROM usuarios WHERE id = ? LIMIT 1",
      [req.usuario.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        erro: "Usuário não encontrado."
      });
    }

    return res.json({ usuario: rows[0] });
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    return res.status(500).json({
      erro: "Erro interno ao buscar usuário."
    });
  }
});

module.exports = router;
