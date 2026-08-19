const express = require('express');
const pool = require('../db');

const router = express.Router();

// Listar todos os destinos (rota pública)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM destinos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;