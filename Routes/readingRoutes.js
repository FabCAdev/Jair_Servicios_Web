const express = require('express');
const Reading = require('../models/Readings.model');
const SensorModel = require('../models/Sensors.model');
const mongoose = require('mongoose'); // agregado
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: readings
 *     description: Lecturas registradas por sensores
 */

/**
 * @swagger
 * /readings:
 *   get:
 *     summary: Obtener todas las lecturas
 *     tags: [readings]
 *     description: Retorna una lista de todas las lecturas disponibles
 *     responses:
 *       200:
 *         description: Lista de lecturas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sensorId:
 *                     type: number
 *                   time:
 *                     type: string
 *                   value:
 *                     type: number
 */
router.get('/', async (req, res) => {
  try {
    const readings = await Reading.find().lean();
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /readings/{id}:
 *   get:
 *     summary: Obtener lectura por ID
 *     tags: [readings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (ObjectId) de la lectura
 *     responses:
 *       200:
 *         description: Lectura obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 sensorId:
 *                   type: string
 *                 time:
 *                   type: string
 *                   format: date-time
 *                 value:
 *                   type: number
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });
    const reading = await Reading.findById(id).lean();
    if (!reading) return res.status(404).json({ error: 'Lectura no encontrada' });
    res.json(reading);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nueva lectura
/**
 * @swagger
 * /readings:
 *   post:
 *     summary: Crea una nueva lectura
 *     tags: [readings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sensorId:
 *                 type: number
 *               time:
 *                 type: string
 *               value:
 *                 type: number
 *     responses:
 *       '201':
 *         description: Lectura creada exitosamente
 */
router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.id;
    delete body._id;
    const sensorId = body.sensorId || body.sensor;
    if (!sensorId) return res.status(400).json({ error: 'sensorId es requerido' });
    if (!mongoose.isValidObjectId(sensorId)) return res.status(400).json({ error: 'sensorId inválido' });
    const sensor = await SensorModel.findById(sensorId);
    if (!sensor) return res.status(400).json({ error: 'sensorId no existe' });
    if (!sensor.isActive) return res.status(400).json({ error: 'Sensor no activo' });
    const created = await Reading.create({ sensorId: sensor._id, time: body.time, value: body.value });
    res.status(201).json({ message: 'created', data: created });
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /readings/{id}:
 *   patch:
 *     summary: Actualiza una lectura por ID
 *     tags: [readings]
 *     parameters: 
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la lectura
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sensorId:
 *                 type: number
 *               time:
 *                 type: string
 *               value:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Lectura actualizada exitosamente
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });
    const changes = { ...req.body };
    delete changes.id;
    delete changes._id;

    if (changes.sensorId || changes.sensor) {
      const sensorId = changes.sensorId || changes.sensor;
      if (!mongoose.isValidObjectId(sensorId)) return res.status(400).json({ error: 'sensorId inválido' });
      const sensor = await SensorModel.findById(sensorId);
      if (!sensor) return res.status(404).json({ error: 'Sensor no encontrado' });
      if (!sensor.isActive) return res.status(400).json({ error: 'Sensor no activo' });
      changes.sensorId = sensor._id;
    }

    const reading = await Reading.findById(id);
    if (!reading) return res.status(404).json({ error: 'Lectura no encontrada' });

    Object.keys(changes).forEach(k => {
      reading[k] = changes[k];
    });

    await reading.save();
    res.json(reading);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /readings/{id}:
 *  delete: 
 *   summary: Elimina una lectura por ID
 *   tags: [readings]
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: ID de la lectura
 *       schema:
 *         type: string
 *   responses:
 *     200:
 *       description: Lectura Eliminada
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });
    const deleted = await Reading.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Lectura no encontrada' });
    res.json({ id: deleted._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
