const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['temperature', 'humidity', 'co2', 'noise']
    },
    unit: {
        type: String
    },
    model: {
        type: String
    },
    location: {
        type: String
    },
    isActive: {
        type: Boolean
    }
});

// Pre-hook para evitar eliminación si el sensor tiene lecturas — devolver Promise
sensorSchema.pre('deleteOne', { document: false, query: true }, function() {
  const sensorId = this.getFilter()._id;
  const Reading = mongoose.model('Reading');
  return Reading.countDocuments({ sensorId: sensorId })
    .then(count => {
      if (count > 0) {
        throw new Error('No se puede eliminar el sensor porque tiene lecturas registradas');
      }
      // resolved => permite continuar con la eliminación
    });
});

module.exports = mongoose.model('Sensor', sensorSchema);