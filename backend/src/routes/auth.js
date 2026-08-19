const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
 
const router = express.Router();
 
// Cadastro de novo usuário
router.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;
 
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
  }
 
  try {
    const senha_hash = await bcrypt.hash(senha, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
      [nome, email, senha_hash]
    );
    res.status(201).json({ id: result.insertId, nome, email });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }
    res.status(500).json({ erro: err.message });
  }
});
 
// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
 
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }
 
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const usuario = rows[0];
 
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
 
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
 
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
 
    res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});
 
module.exports = router;