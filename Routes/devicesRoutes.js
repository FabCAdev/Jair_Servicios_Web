const express = require('express');
const Device = require('../models/Devices.model');
const User = require('../models/Users.model');
const Zone = require('../models/Zones.model');
const Sensor = require('../models/Sensors.model');
const mongoose = require('mongoose'); // agregado
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: devices
 *     description: Lista de dispositivos registrados
 */

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Obtener todos los dispositivos
 *     tags: [devices]
 *     description: Retorna una lista de todos los dispositivos registrados
 *     responses:
 *       200:
 *         description: Lista de dispositivos obtenidas de forma exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   serialNumber:
 *                     type: string
 *                   model:
 *                     type: string
 *                   ownerId:
 *                     type: ObjectID => User
 *                   zoneId:
 *                     type: ObjectID => Zone
 *                   installedAt:
 *                     type: date
 *                   status:
 *                     type: enum
 *                   sensors:
 *                     type: ObjectID => Sensor
 */
router.get('/', async (req, res) => {
  try {
    const devices = await Device.find().lean();
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /devices/{id}:
 *   get:
 *     summary: Obtener dispositivo por ID
 *     tags: [devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (ObjectId) del dispositivo
 *     responses:
 *       200:
 *         description: Dispositivo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 serialNumber:
 *                   type: string
 *                 model:
 *                   type: string
 *                 ownerId:
 *                   type: string
 *                 zoneId:
 *                   type: string
 *                 installedAt:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                   enum: [active, maintenance, offline]
 *                 sensors:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });
    const device = await Device.findById(id).lean();
    if (!device) return res.status(404).json({ error: 'Device no encontrado' });
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nueva lectura
/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Crea un nuevo dispositivo
 *     tags: [devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serialNumber:
 *                 type: string
 *               model:
 *                 type: string
 *               ownerId:
 *                 type: ObjectID => User
 *               zoneId:
 *                 type: ObjectID => Zone
 *               installedAt:
 *                 type: date
 *               status:
 *                 type: enum
 *               sensors:
 *                 type: ObjectID => Sensor
 *     responses:
 *       '201':
 *         description: Dispositivo creado exitosamente
 */
router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.id;
    delete body._id;
    if (!body || !body.serialNumber) return res.status(400).json({ error: 'serialNumber es requerido' });

    if (body.ownerId) {
      if (!mongoose.isValidObjectId(body.ownerId)) return res.status(400).json({ error: 'ownerId inválido' });
      const owner = await User.findById(body.ownerId);
      if (!owner) return res.status(400).json({ error: 'ownerId no existe' });
    }
    if (body.zoneId) {
      if (!mongoose.isValidObjectId(body.zoneId)) return res.status(400).json({ error: 'zoneId inválido' });
      const zone = await Zone.findById(body.zoneId);
      if (!zone) return res.status(400).json({ error: 'zoneId no existe' });
    }
    if (body.sensors && Array.isArray(body.sensors)) {
      for (const sId of body.sensors) {
        if (!mongoose.isValidObjectId(sId)) return res.status(400).json({ error: `Sensor ${sId} inválido` });
        const sensor = await Sensor.findById(sId);
        if (!sensor) return res.status(400).json({ error: `Sensor ${sId} no existe` });
      }
    }

    const created = await Device.create(body);
    res.status(201).json({ message: 'created', data: created });
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    if (err.code === 11000) return res.status(400).json({ error: 'serialNumber ya existe' });
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /devices/{id}:
 *   patch:
 *     summary: Actualiza un dispositivo por ID
 *     tags: [devices]
 *     parameters: 
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del dispositivo
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serialNumber:
 *                 type: string
 *               model:
 *                 type: string
 *               ownerId:
 *                 type: ObjectID => User
 *               zoneId:
 *                 type: ObjectID => Zone
 *               installedAt:
 *                 type: date
 *               status:
 *                 type: enum
 *               sensors:
 *                 type: ObjectID => Sensor
 *     responses:
 *       '200':
 *         description: Dispositivo actualizado exitosamente
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });
    const body = { ...req.body };
    delete body.id;
    delete body._id;

    if (body.ownerId) {
      if (!mongoose.isValidObjectId(body.ownerId)) return res.status(400).json({ error: 'ownerId inválido' });
      const owner = await User.findById(body.ownerId);
      if (!owner) return res.status(400).json({ error: 'ownerId no existe' });
    }
    if (body.zoneId) {
      if (!mongoose.isValidObjectId(body.zoneId)) return res.status(400).json({ error: 'zoneId inválido' });
      const zone = await Zone.findById(body.zoneId);
      if (!zone) return res.status(400).json({ error: 'zoneId no existe' });
    }
    if (body.sensors && Array.isArray(body.sensors)) {
      for (const sId of body.sensors) {
        if (!mongoose.isValidObjectId(sId)) return res.status(400).json({ error: `Sensor ${sId} inválido` });
        const sensor = await Sensor.findById(sId);
        if (!sensor) return res.status(400).json({ error: `Sensor ${sId} no existe` });
      }
    }

    const device = await Device.findById(id);
    if (!device) return res.status(404).json({ error: 'Device no encontrado' });

    Object.keys(body).forEach(k => {
      device[k] = body[k];
    });

    await device.save();
    res.json(device);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    if (err.code === 11000) return res.status(400).json({ error: 'serialNumber ya existe' });
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /devices/{id}:
 *  delete: 
 *   summary: Elimina un dispositivo por ID
 *   tags: [devices]
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: ID del dispositivo
 *       schema:
 *         type: string
 *   responses:
 *     200:
 *       description: Dispositivo Eliminado
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });
    const deleted = await Device.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Device no encontrado' });
    res.json({ id: deleted._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
