const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/proyecto_final_db';

let connected = false;

async function connectDB({ retries = 5, delayMs = 2000 } = {}) {
  if (connected) return;
  let attempt = 0;
  while (attempt < retries) {
    try {
      attempt++;
      await mongoose.connect(MONGODB_URI);
      connected = true;
      console.log('MongoDB conectado:', MONGODB_URI);
      // listeners para depuración
      mongoose.connection.on('connected', () => console.log('Mongoose conectado'));
      mongoose.connection.on('error', (err) => console.error('Mongoose error:', err));
      mongoose.connection.on('disconnected', () => console.warn('Mongoose desconectado'));
      mongoose.connection.on('reconnected', () => console.log('Mongoose reconectado'));
      return;
    } catch (err) {
      console.error(`Intento ${attempt} - Error conectando a MongoDB:`, err.message);
      if (attempt >= retries) {
        throw new Error(`No se pudo conectar a MongoDB después de ${retries} intentos: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, delayMs * attempt));
    }
  }
}

function setupCloseHandlers() {
  const graceful = async () => {
    try {
      if (connected) {
        await mongoose.disconnect();
        console.log('MongoDB desconectado correctamente');
      }
    } finally {
      process.exit(0);
    }
  };
  process.on('SIGINT', graceful);
  process.on('SIGTERM', graceful);
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    graceful();
  });
}

module.exports = { connectDB, setupCloseHandlers, mongoose };
