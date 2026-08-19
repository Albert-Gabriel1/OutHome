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

// ---------------------------------------------------------
// Dias do roteiro
// ---------------------------------------------------------

// Listar os dias de um roteiro
router.get('/:roteiroId/dias', verificarToken, async (req, res) => {
  const { roteiroId } = req.params;

  try {
    const [roteiroRows] = await pool.query(
      'SELECT id FROM roteiros WHERE id = ? AND usuario_id = ?',
      [roteiroId, req.usuario.id]
    );
    if (roteiroRows.length === 0) {
      return res.status(404).json({ erro: 'Roteiro não encontrado' });
    }

    const [dias] = await pool.query(
      'SELECT * FROM dias_roteiro WHERE roteiro_id = ? ORDER BY ordem',
      [roteiroId]
    );
    res.json(dias);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Criar um dia dentro de um roteiro
router.post('/:roteiroId/dias', verificarToken, async (req, res) => {
  const { roteiroId } = req.params;
  const { data, ordem } = req.body;

  if (!data || ordem === undefined) {
    return res.status(400).json({ erro: 'Data e ordem são obrigatórios' });
  }

  try {
    const [roteiroRows] = await pool.query(
      'SELECT id FROM roteiros WHERE id = ? AND usuario_id = ?',
      [roteiroId, req.usuario.id]
    );
    if (roteiroRows.length === 0) {
      return res.status(404).json({ erro: 'Roteiro não encontrado' });
    }

    const [result] = await pool.query(
      'INSERT INTO dias_roteiro (roteiro_id, data, ordem) VALUES (?, ?, ?)',
      [roteiroId, data, ordem]
    );
    res.status(201).json({ id: result.insertId, roteiro_id: Number(roteiroId), data, ordem });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ---------------------------------------------------------
// Atividades de um dia
// ---------------------------------------------------------

// Listar as atividades de um dia
router.get('/:roteiroId/dias/:diaId/atividades', verificarToken, async (req, res) => {
  const { roteiroId, diaId } = req.params;

  try {
    const [diaRows] = await pool.query(
      `SELECT dr.id FROM dias_roteiro dr
       JOIN roteiros r ON dr.roteiro_id = r.id
       WHERE dr.id = ? AND dr.roteiro_id = ? AND r.usuario_id = ?`,
      [diaId, roteiroId, req.usuario.id]
    );
    if (diaRows.length === 0) {
      return res.status(404).json({ erro: 'Dia não encontrado' });
    }

    const [atividades] = await pool.query(
      'SELECT * FROM atividades WHERE dia_id = ? ORDER BY horario',
      [diaId]
    );
    res.json(atividades);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Criar uma atividade dentro de um dia
router.post('/:roteiroId/dias/:diaId/atividades', verificarToken, async (req, res) => {
  const { roteiroId, diaId } = req.params;
  const { titulo, horario, custo_estimado, categoria, destino_id } = req.body;

  if (!titulo) {
    return res.status(400).json({ erro: 'Título é obrigatório' });
  }

  try {
    const [diaRows] = await pool.query(
      `SELECT dr.id FROM dias_roteiro dr
       JOIN roteiros r ON dr.roteiro_id = r.id
       WHERE dr.id = ? AND dr.roteiro_id = ? AND r.usuario_id = ?`,
      [diaId, roteiroId, req.usuario.id]
    );
    if (diaRows.length === 0) {
      return res.status(404).json({ erro: 'Dia não encontrado' });
    }

    const [result] = await pool.query(
      'INSERT INTO atividades (dia_id, destino_id, titulo, horario, custo_estimado, categoria) VALUES (?, ?, ?, ?, ?, ?)',
      [diaId, destino_id || null, titulo, horario || null, custo_estimado || 0, categoria || null]
    );
    res.status(201).json({ id: result.insertId, dia_id: Number(diaId), titulo });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;