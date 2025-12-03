try {
  const fs = require('fs');
  const path = require('path');
  const dotenv = require('dotenv');

  const envCandidates = [
    path.join(__dirname, 'database', 'database.env'),
    path.join(__dirname, '.env')
  ];

  const envPath = envCandidates.find(p => fs.existsSync(p));
  if (envPath) {
    dotenv.config({ path: envPath });
    console.log(`Cargado .env desde: ${envPath}`);
  } else {
    try { dotenv.config(); } catch {}
    console.warn('No se encontró archivo de entorno en database/database.env ni en .env');
  }
} catch (e) {
  console.warn('No se pudo cargar dotenv, continúo sin variables de entorno desde archivos.');
}

const express = require('express');
const routerAPI = require('./Routes/rutas');
const setupSwagger = require('./swagger');
const { logErrors, errorHandler } = require('./middlewares/errorHandler');
let connectDB, setupCloseHandlers;
try {
 ({ connectDB, setupCloseHandlers } = require('./database'));
} catch (e1) {
 try {
   ({ connectDB, setupCloseHandlers } = require('./database/database'));
 } catch (e2) {
   try {
     ({ connectDB, setupCloseHandlers } = require('./database.js'));
   } catch (e3) {
     console.error('No se encontró el módulo de database. Asegura que existe database.js o database/database.js');
     throw e3;
   }
 }
}

let cors;
try {
  cors = require('cors');
} catch (e) {
  console.warn('cors no está instalado. Usando fallback CORS simple.');
  cors = () => (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  };
}

async function start() {
  try {
    await connectDB();
    setupCloseHandlers();

    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.json());
    app.use(cors());
    app.get('/health', (req, res) => res.json({ status: 'ok' }));

    app.get('/debug/collections', async (req, res) => {
      try {
        const User = require('./models/Users.model');
        const Zone = require('./models/Zones.model');
        const Sensor = require('./models/Sensors.model');
        const Device = require('./models/Devices.model');
        const Reading = require('./models/Readings.model');

        const counts = await Promise.all([
          User.countDocuments().catch(() => 0),
          Zone.countDocuments().catch(() => 0),
          Sensor.countDocuments().catch(() => 0),
          Device.countDocuments().catch(() => 0),
          Reading.countDocuments().catch(() => 0),
        ]);

        res.json({
          users: counts[0],
          zones: counts[1],
          sensors: counts[2],
          devices: counts[3],
          readings: counts[4],
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    routerAPI(app);
    setupSwagger(app);
    app.use(logErrors);
    app.use(errorHandler);

    app.listen(port, () => {
      const base = process.env.BASE_URL || `http://localhost:${port}`;
      console.log(`Servidor iniciado en: ${base}`);
      console.log(`Swagger UI disponible en: ${base.replace(/\/$/, '')}/api-docs`);
    });
  } catch (err) {
    console.error('Error arrancando la app:', err);
    process.exit(1);
  }
}

start();
