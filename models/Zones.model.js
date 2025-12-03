const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    isActive: {
        type: Boolean
    }
});

// Reemplazo del pre-hook para deleteOne: devolver una Promise (no usar next)
zoneSchema.pre('deleteOne', { document: false, query: true }, function() {
  const zoneId = this.getFilter()._id;
  const Device = mongoose.model('Device');
  return Device.countDocuments({ zoneId: zoneId })
    .then(count => {
      if (count > 0) {
        throw new Error('No se puede eliminar la zona porque tiene dispositivos asignados');
      }
    });
});

module.exports = mongoose.model('Zone', zoneSchema);