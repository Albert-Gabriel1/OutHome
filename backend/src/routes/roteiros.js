const express = require('express');
const pool = require('../db');
const verificarToken = require('../middleware/auth');

const router = express.Router();

// ---------------------------------------------------------
// CRUD de roteiros
// ---------------------------------------------------------

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

router.put('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, data_inicio, data_fim, descricao, publico } = req.body;

  try {
    const [roteiroRows] = await pool.query(
      'SELECT id FROM roteiros WHERE id = ? AND usuario_id = ?',
      [id, req.usuario.id]
    );
    if (roteiroRows.length === 0) {
      return res.status(404).json({ erro: 'Roteiro não encontrado' });
    }

    await pool.query(
      `UPDATE roteiros SET
        titulo = COALESCE(?, titulo),
        data_inicio = COALESCE(?, data_inicio),
        data_fim = COALESCE(?, data_fim),
        descricao = COALESCE(?, descricao),
        publico = COALESCE(?, publico)
       WHERE id = ?`,
      [titulo, data_inicio, data_fim, descricao, publico, id]
    );

    res.json({ mensagem: 'Roteiro atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM roteiros WHERE id = ? AND usuario_id = ?',
      [id, req.usuario.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Roteiro não encontrado' });
    }
    res.json({ mensagem: 'Roteiro excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ---------------------------------------------------------
// Orçamento do roteiro
// ---------------------------------------------------------

// Soma o custo estimado de todas as atividades do roteiro, geral e por dia
router.get('/:id/orcamento', verificarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [roteiroRows] = await pool.query(
      'SELECT id FROM roteiros WHERE id = ? AND usuario_id = ?',
      [id, req.usuario.id]
    );
    if (roteiroRows.length === 0) {
      return res.status(404).json({ erro: 'Roteiro não encontrado' });
    }

    const [totalRows] = await pool.query(
      `SELECT SUM(a.custo_estimado) AS orcamento_total
       FROM atividades a
       JOIN dias_roteiro dr ON a.dia_id = dr.id
       WHERE dr.roteiro_id = ?`,
      [id]
    );

    const [porDia] = await pool.query(
      `SELECT dr.id AS dia_id, dr.data, COALESCE(SUM(a.custo_estimado), 0) AS subtotal
       FROM dias_roteiro dr
       LEFT JOIN atividades a ON a.dia_id = dr.id
       WHERE dr.roteiro_id = ?
       GROUP BY dr.id, dr.data
       ORDER BY dr.ordem`,
      [id]
    );

    res.json({
      roteiro_id: Number(id),
      orcamento_total: totalRows[0].orcamento_total || 0,
      por_dia: porDia
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ---------------------------------------------------------
// Dias do roteiro
// ---------------------------------------------------------

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

router.delete('/:roteiroId/dias/:diaId', verificarToken, async (req, res) => {
  const { roteiroId, diaId } = req.params;

  try {
    const [result] = await pool.query(
      `DELETE dr FROM dias_roteiro dr
       JOIN roteiros r ON dr.roteiro_id = r.id
       WHERE dr.id = ? AND dr.roteiro_id = ? AND r.usuario_id = ?`,
      [diaId, roteiroId, req.usuario.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Dia não encontrado' });
    }
    res.json({ mensagem: 'Dia excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ---------------------------------------------------------
// Atividades de um dia
// ---------------------------------------------------------

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

router.put('/:roteiroId/dias/:diaId/atividades/:atividadeId', verificarToken, async (req, res) => {
  const { roteiroId, diaId, atividadeId } = req.params;
  const { titulo, horario, custo_estimado, categoria, destino_id } = req.body;

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
      `UPDATE atividades SET
        titulo = COALESCE(?, titulo),
        horario = COALESCE(?, horario),
        custo_estimado = COALESCE(?, custo_estimado),
        categoria = COALESCE(?, categoria),
        destino_id = COALESCE(?, destino_id)
       WHERE id = ? AND dia_id = ?`,
      [titulo, horario, custo_estimado, categoria, destino_id, atividadeId, diaId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Atividade não encontrada' });
    }
    res.json({ mensagem: 'Atividade atualizada com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.delete('/:roteiroId/dias/:diaId/atividades/:atividadeId', verificarToken, async (req, res) => {
  const { roteiroId, diaId, atividadeId } = req.params;

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
      'DELETE FROM atividades WHERE id = ? AND dia_id = ?',
      [atividadeId, diaId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Atividade não encontrada' });
    }
    res.json({ mensagem: 'Atividade excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;