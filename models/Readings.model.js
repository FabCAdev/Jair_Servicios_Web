const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
    sensorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sensor',
        required: true
    },
    time: {
        type: Date
    },
    value: {
        type: Number,
        required: true
    }
}, {
});

// Índice compuesto para búsquedas eficientes
readingSchema.index({ sensorId: 1, time: -1 });

// Validador asíncrono en sensorId (lanza error si inválido/inactivo)
readingSchema.path('sensorId').validate(async function(value) {
  const Sensor = mongoose.model('Sensor');
  const sensor = await Sensor.findById(value);
  if (!sensor) throw new Error('El sensor no existe');
  if (!sensor.isActive) throw new Error('El sensor no está activo');
  return true;
}, 'Sensor inválido o inactivo');

// Nota: findOneAndUpdate ya usa runValidators en las rutas; no usar pre-hooks con next.
module.exports = mongoose.model('Reading', readingSchema);