const express = require('express');
const Zone = require('../models/Zones.model');
const DeviceModel = require('../models/Devices.model');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: zones
 *     description: Operaciones relacionadas con zonas
  */
 
/**
 * @swagger
 * /zones:
 *   get:
 *     tags: [zones]
 *     summary: Obtiene una lista de zonas
 *     responses:
 *       200:
 *         description: Lista de zonas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *
  */
router.get('/', async (req, res) => {
  try {
    const zones = await Zone.find().lean();
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /zones/{id}:
 *   get:
 *     summary: Obtener zona por ID
 *     tags: [zones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (ObjectId) de la zona
 *     responses:
 *       200:
 *         description: Zona encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });
    const zone = await Zone.findById(id).lean();
    if (!zone) return res.status(404).json({ error: 'Zona no encontrada' });
    res.json(zone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /zones:
 *   post:
 *     summary: Crea una nueva zona
 *     tags: [zones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Zona creada
 */
router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.id;
    delete body._id;
    if (!body || !body.name) return res.status(400).json({ error: 'El campo "name" es requerido' });
    const created = await Zone.create(body);
    res.status(201).json({ message: 'created', data: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /zones/{id}:
 *   patch:
 *     summary: Actualiza una zona por ID
 *     tags: [zones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (ObjectId) de la zona
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Zona actualizada
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });
    const changes = { ...req.body };
    delete changes.id;
    delete changes._id;

    const zone = await Zone.findById(id);
    if (!zone) return res.status(404).json({ error: 'Zona no encontrada' });

    Object.keys(changes).forEach(k => {
      zone[k] = changes[k];
    });

    await zone.save();
    res.json(zone);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /zones/{id}:
 *   delete:
 *     summary: Elimina una zona por ID
 *     tags: [zones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (ObjectId) de la zona
 *     responses:
 *       200:
 *         description: Zona eliminada
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });
    const zone = await Zone.findById(id);
    if (!zone) return res.status(404).json({ error: 'Zona no encontrada' });
    const deviceCount = await DeviceModel.countDocuments({ zoneId: id });
    if (deviceCount > 0) return res.status(400).json({ error: 'No se puede eliminar la zona: tiene dispositivos asignados' });
    await Zone.findByIdAndDelete(id);
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
