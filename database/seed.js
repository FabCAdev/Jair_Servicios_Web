const { connectDB, mongoose } = require('./database');
const User = require('../models/Users.model');
const Zone = require('../models/Zones.model');
const Sensor = require('../models/Sensors.model');
const Device = require('../models/Devices.model');
const Reading = require('../models/Readings.model');

async function seed() {
  try {
    await connectDB();

    console.log('Limpando colecciones (si existen)...');
    await Promise.all([
      User.deleteMany({}).catch(e => { console.warn('users deleteMany:', e.message); }),
      Zone.deleteMany({}).catch(e => { console.warn('zones deleteMany:', e.message); }),
      Sensor.deleteMany({}).catch(e => { console.warn('sensors deleteMany:', e.message); }),
      Device.deleteMany({}).catch(e => { console.warn('devices deleteMany:', e.message); }),
      Reading.deleteMany({}).catch(e => { console.warn('readings deleteMany:', e.message); })
    ]);
    console.log('Colecciones limpiadas');

    // Insert users
    let users = [];
    try {
      console.log('Insertando usuarios...');
      users = await User.insertMany([
        { name: 'Admin', email: 'admin@example.com', password: 'secret', role: 'admin' },
        { name: 'Tech', email: 'tech@example.com', password: 'secret', role: 'technician' },
        { name: 'Viewer', email: 'viewer@example.com', password: 'secret', role: 'viewer' }
      ], { ordered: false });
      console.log(`Usuarios creados: ${users.length}`);
    } catch (err) {
      console.error('Error insertando usuarios:', err && err.message ? err.message : err);
      // intentar obtener los insertados parciales si los hay
      try { users = await User.find().lean(); } catch(e){ /* ignore */ }
    }

    // Insert zones
    let zones = [];
    try {
      console.log('Insertando zonas...');
      zones = await Zone.insertMany([
        { name: 'Zona A', description: 'Primer sector', isActive: true },
        { name: 'Zona B', description: 'Segundo sector', isActive: true }
      ], { ordered: false });
      console.log(`Zonas creadas: ${zones.length}`);
    } catch (err) {
      console.error('Error insertando zonas:', err && err.message ? err.message : err);
      try { zones = await Zone.find().lean(); } catch(e){ /* ignore */ }
    }

    // Insert sensors
    let sensors = [];
    try {
      console.log('Insertando sensores...');
      sensors = await Sensor.insertMany([
        { type: 'temperature', unit: '°C', model: 'T1000', location: 'Sala 1', isActive: true },
        { type: 'humidity', unit: '%', model: 'H2000', location: 'Sala 2', isActive: true },
        { type: 'co2', unit: 'ppm', model: 'C3000', location: 'Sala 3', isActive: true }
      ], { ordered: false });
      console.log(`Sensores creados: ${sensors.length}`);
    } catch (err) {
      console.error('Error insertando sensores:', err && err.message ? err.message : err);
      try { sensors = await Sensor.find().lean(); } catch(e){ /* ignore */ }
    }

    // Crear devices (usar IDs existentes)
    let devices = [];
    try {
      console.log('Insertando devices...');
      // seleccionar owners/zones/sensors existentes
      const ownerTech = users[1]?._id || (await User.findOne({ role: 'technician' }))?._id;
      const ownerAdmin = users[0]?._id || (await User.findOne({ role: 'admin' }))?._id;
      const zoneA = zones[0]?._id || (await Zone.findOne({ name: 'Zona A' }))?._id;
      const zoneB = zones[1]?._id || (await Zone.findOne({ name: 'Zona B' }))?._id;
      const s0 = sensors[0]?._id || (await Sensor.findOne({ type: 'temperature' }))?._id;
      const s1 = sensors[1]?._id || (await Sensor.findOne({ type: 'humidity' }))?._id;
      const s2 = sensors[2]?._id || (await Sensor.findOne({ type: 'co2' }))?._id;

      devices = await Device.insertMany([
        {
          serialNumber: 'DEV-0001',
          model: 'D-X',
          status: 'active',
          installedAt: new Date(),
          ownerId: ownerTech,
          zoneId: zoneA,
          sensors: [s0, s1].filter(Boolean)
        },
        {
          serialNumber: 'DEV-0002',
          model: 'D-Y',
          status: 'maintenance',
          installedAt: new Date(),
          ownerId: ownerAdmin,
          zoneId: zoneB,
          sensors: [s2].filter(Boolean)
        }
      ], { ordered: false });
      console.log(`Devices creados: ${devices.length}`);
    } catch (err) {
      console.error('Error insertando devices:', err && err.message ? err.message : err);
      try { devices = await Device.find().lean(); } catch(e){ /* ignore */ }
    }

    // Crear readings
    try {
      console.log('Insertando readings...');
      const now = new Date();
      const created = await Reading.insertMany([
        { sensorId: sensors[0]?._id || (await Sensor.findOne({ type: 'temperature' }))._id, time: new Date(now.getTime() - 1000 * 60 * 10), value: 22.5 },
        { sensorId: sensors[0]?._id || (await Sensor.findOne({ type: 'temperature' }))._id, time: new Date(now.getTime() - 1000 * 60 * 5), value: 22.8 },
        { sensorId: sensors[1]?._id || (await Sensor.findOne({ type: 'humidity' }))._id, time: now, value: 45.2 },
        { sensorId: sensors[2]?._id || (await Sensor.findOne({ type: 'co2' }))._id, time: now, value: 600 }
      ], { ordered: false });
      console.log(`Readings creadas: ${created.length}`);
    } catch (err) {
      console.error('Error insertando readings:', err && err.message ? err.message : err);
    }

    // Resumen final
    const counts = {
      users: await User.countDocuments().catch(()=>0),
      zones: await Zone.countDocuments().catch(()=>0),
      sensors: await Sensor.countDocuments().catch(()=>0),
      devices: await Device.countDocuments().catch(()=>0),
      readings: await Reading.countDocuments().catch(()=>0),
    };
    console.log('Resumen final de colecciones:', counts);

    console.log('Seed completado.');
  } catch (err) {
    console.error('Error en seed (fatal):', err && err.stack ? err.stack : err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
