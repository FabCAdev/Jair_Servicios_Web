const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    serialNumber: {
        type: String,
        required: true,
        unique: true
    },
    model: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'offline']
    },
    installedAt: {
        type: Date
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    zoneId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Zone'
    },
    sensors: {
        // Cambiado a array de referencias
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' }]
    }
});

// Función de validación de referencias (lanza errores)
async function validateReferences(doc) {
    const User = mongoose.model('User');
    const Zone = mongoose.model('Zone');
    const Sensor = mongoose.model('Sensor');

    if (doc.ownerId) {
        const user = await User.findById(doc.ownerId);
        if (!user) throw new Error('Owner (User) does not exist.');
    }

    if (doc.zoneId) {
        const zone = await Zone.findById(doc.zoneId);
        if (!zone) throw new Error('Zone does not exist.');
    }

    if (doc.sensors && Array.isArray(doc.sensors)) {
        for (const sId of doc.sensors) {
            const sensor = await Sensor.findById(sId);
            if (!sensor) throw new Error(`Sensor ${sId} does not exist.`);
        }
    }
}

// Middleware para save — devolver la promesa de validación
deviceSchema.pre('save', function () {
    return validateReferences(this);
});

// Middleware para update — devolver la promesa de validación (si hay cambios relevantes)
deviceSchema.pre('findOneAndUpdate', function () {
    const update = this.getUpdate();
    const ownerId = update?.ownerId || this._conditions?.ownerId;
    const zoneId = update?.zoneId || this._conditions?.zoneId;
    const sensors = update?.sensors;

    if (ownerId || zoneId || sensors) {
        return validateReferences({ ownerId, zoneId, sensors });
    }
    // si no hay nada que validar, devolver resolución inmediata
    return Promise.resolve();
});

module.exports = mongoose.model('Device', deviceSchema);