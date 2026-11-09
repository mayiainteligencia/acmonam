import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { initGeminiClient } from './config/gemini.js';
import chatRoutes from './routes/chatRoutes.js';
// El monitoreo de radio corre aparte, como servicio Python (monitorsol, uvicorn :8001).

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);

// Auth endpoints para compatibilidad con la plataforma
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body || {};
  const cleanEmail = String(email || 'auditor@mayia.mx').trim().toLowerCase();
  const rawName = cleanEmail.split('@')[0] || 'Auditor';
  const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  return res.json({
    token: `mayia-token-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    user: {
      email: cleanEmail,
      name,
    },
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email } = req.body || {};
  const cleanEmail = String(email || 'nuevo@mayia.mx').trim().toLowerCase();
  const userName = name || cleanEmail.split('@')[0] || 'Auditor';
  return res.json({
    token: `mayia-token-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    user: {
      email: cleanEmail,
      name: userName,
    },
  });
});

app.post('/api/auth/logout', (req, res) => {
  return res.json({ ok: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend del asistente en linea' });
});

async function startServer() {
  try {
    console.log('Iniciando servidor API...\n');

    if (process.env.GEMINI_API_KEY) {
      try {
        initGeminiClient();
        console.log('Cliente Gemini inicializado correctamente.');
      } catch (err) {
        console.warn('⚠️ No se pudo inicializar Gemini:', err.message);
      }
    } else {
      console.warn('⚠️ GEMINI_API_KEY no configurada. Las rutas de chat operarán en modo asistivo.');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\nServidor corriendo en puerto ${PORT}`);
      console.log(`API disponible en http://0.0.0.0:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
  }
}

startServer();