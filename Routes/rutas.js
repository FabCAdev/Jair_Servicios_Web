const usersRoutes = require('./usersRoutes');
const zoneRoutes = require('./zoneRoutes');
const sensorRoutes = require('./sensorRoutes');
const readingRoutes = require('./readingRoutes');
const devicesRoutes = require('./devicesRoutes');

function routerAPI(app) {
  app.use('/users', usersRoutes);
  app.use('/zones', zoneRoutes);
  app.use('/sensors', sensorRoutes);
  app.use('/readings', readingRoutes);
  app.use('/devices', devicesRoutes);
}

module.exports = routerAPI;