const express = require('express');
const pool = require('../db');
const verificarToken = require('../middleware/auth');

const router = express.Router();

// Listar os roteiros do usuário logado
router.get('/', verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM roteiros WHERE usuario_id = ?',
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Criar um novo roteiro
router.post('/', verificarToken, async (req, res) => {
  const { titulo, data_inicio, data_fim, descricao, publico } = req.body;

  if (!titulo || !data_inicio || !data_fim) {
    return res.status(400).json({ erro: 'Título, data de início e data de fim são obrigatórios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO roteiros (usuario_id, titulo, data_inicio, data_fim, descricao, publico) VALUES (?, ?, ?, ?, ?, ?)',
      [req.usuario.id, titulo, data_inicio, data_fim, descricao || null, !!publico]
    );
    res.status(201).json({ id: result.insertId, titulo, data_inicio, data_fim });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;