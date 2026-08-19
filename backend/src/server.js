const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const roteirosRoutes = require('./routes/roteiros');
app.use('/roteiros', roteirosRoutes);

const destinosRoutes = require('./routes/destinos');
app.use('/destinos', destinosRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'API do Site de Viagens rodando' });
});

app.get('/testar-banco', async (req, res) => {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor na porta ${PORT}`));