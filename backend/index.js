const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
