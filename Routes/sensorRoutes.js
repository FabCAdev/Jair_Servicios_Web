const express = require('express');
const Sensor = require('../models/Sensors.model');
const ReadingModel = require('../models/Readings.model');
const mongoose = require('mongoose');
const router = express.Router();

/** 
 * @swagger
 * tags:
 *   - name: sensors
 *     description: Operaciones relacionadas con sensores
 *
 * 
 */

/**
 * @swagger
 * /sensors:
 *   get:
 *     summary: Obtiene una lista de sensores
 *     tags: [sensors]
 *     description: Devuelve una lista de todos los sensores disponibles.
 *     responses:
 *       '200':
 *         description: Lista de sensores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   unit:
 *                     type: string
 *                   model:
 *                     type: string
 *                   location:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *
 */
router.get('/', async (req, res) => {
  try {
    const sensors = await Sensor.find().lean();
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /sensors/{id}:
 *   get:
 *     summary: Obtener sensor por ID
 *     tags: [sensors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del sensor los devuelve
 *     responses:
 *       200:
 *         description: Sensor encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   unit:
 *                     type: string
 *                   model:
 *                     type: string
 *                   location:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });
    const sensor = await Sensor.findById(id).lean();
    if (!sensor) return res.status(404).json({ error: 'Sensor no encontrado' });
    res.json(sensor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /sensors:
 *   post:
 *     summary: Crea un nuevo sensor
 *     tags: [sensors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               unit:
 *                 type: string
 *               model:
 *                 type: string
 *               location:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Sensor creado
 */
router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.id;
    delete body._id;
    if (!body || !body.type || !body.unit) return res.status(400).json({ error: 'Los campos "type" y "unit" son requeridos' });
    const created = await Sensor.create(body);
    res.status(201).json({ message: 'created', data: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /sensors/{id}:
 *   patch:
 *     summary: Actualiza un sensor por ID
 *     tags: [sensors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del sensor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               unit:
 *                 type: string
 *               model:
 *                 type: string
 *               location:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Sensor actualizado
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });
    const changes = { ...req.body };
    delete changes.id;
    delete changes._id;

    const sensor = await Sensor.findById(id);
    if (!sensor) return res.status(404).json({ error: 'Sensor no encontrado' });

    Object.keys(changes).forEach(k => {
      sensor[k] = changes[k];
    });

    await sensor.save();
    res.json(sensor);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /sensors/{id}:
 *   delete:
 *     summary: Elimina un sensor por ID
 *     tags: [sensors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del sensor
 *     responses:
 *       200:
 *         description: Sensor eliminado
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });
    const sensor = await Sensor.findById(id);
    if (!sensor) return res.status(404).json({ error: 'Sensor no encontrado' });
    const readingCount = await ReadingModel.countDocuments({ sensorId: id });
    if (readingCount > 0) return res.status(400).json({ error: 'No se puede eliminar el sensor: tiene lecturas registradas' });
    await Sensor.findByIdAndDelete(id);
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;