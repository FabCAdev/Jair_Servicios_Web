const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    role: {
        type: String,
        enum: ['admin', 'technician', 'viewer']
    }
});

// Reemplazo del pre-hook para deleteOne: devolver una Promise (no usar next)
userSchema.pre('deleteOne', { document: false, query: true }, function() {
  const userId = this.getFilter()._id;
  const Device = mongoose.model('Device');
  return Device.countDocuments({ ownerId: userId })
    .then(count => {
      if (count > 0) {
        throw new Error('No se puede eliminar el usuario porque tiene dispositivos asignados');
      }
    });
});

module.exports = mongoose.model('User', userSchema);