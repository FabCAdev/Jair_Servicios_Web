const express = require('express');
const User = require('../models/Users.model');
const DeviceModel = require('../models/Devices.model');
const mongoose = require('mongoose'); // añadido
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: users
 *     description: Usuarios del sistema
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [users]
 *     description: Retorna una lista de todos los usuarios disponibles
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *                   role:
 *                     type: string
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener usuarios por ID
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (ObjectId) del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });
    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Crear un nuevo usuario
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                type: string
 *               email:
 *                type: string
 *               password:
 *                type: string
 *               role: 
 *                type: string
 *     responses:
 *       '201':
 *         description: Usuario creado exitosamente
 */
router.post('/', async (req, res) => {
  try {
    // clonar y sanear body para evitar enviar id/_id que rompan el casteo a ObjectId
    const body = { ...req.body };
    delete body.id;
    delete body._id;

    if (!body || !body.name || !body.email) return res.status(400).json({ error: 'name y email son requeridos' });

    const created = await User.create(body);
    res.status(201).json({ message: 'created', data: created });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Email ya registrado' });
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Actualiza un usuario por ID
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (ObjectId) del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, technician, viewer]
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });

    const body = { ...req.body };
    delete body.id;
    delete body._id;

    // Obtener documento, aplicar cambios y guardar (usa validadores y hooks)
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    Object.keys(body).forEach(k => {
      user[k] = body[k];
    });

    await user.save();
    res.json(user);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    if (err.code === 11000) return res.status(400).json({ error: 'Email ya registrado' });
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *  delete: 
 *   summary: Elimina un usuario por ID
 *   tags: [users]
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: ID del usuario
 *       schema:
 *         type: string
 *   responses:
 *     200:
 *       description: Usuario Eliminado
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'ID inválido' });

    const deviceCount = await DeviceModel.countDocuments({ ownerId: id });
    if (deviceCount > 0) return res.status(400).json({ error: 'No se puede eliminar el usuario: tiene dispositivos asignados' });

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ id: deleted._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;