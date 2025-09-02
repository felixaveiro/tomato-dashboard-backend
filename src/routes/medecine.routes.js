// src/routes/medecine.routes.js

import express from 'express'
import {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getMedicinesByDisease
} from '../controllers/medecine/medicine.controller.js'

import { Authenticate } from '../utils/jwtfunctions.js'
import { authorizeRoles } from '../middleware/authorizations.js'
const medecineRouter = express.Router()

// Base path: /api/medecines
medecineRouter.post(
  '/',
  Authenticate,
  authorizeRoles('AGRONOMIST', 'ADMIN'),
  createMedicine
)
medecineRouter.get('/', Authenticate, getAllMedicines)
medecineRouter.get('/:id', Authenticate, getMedicineById)
medecineRouter.put(
  '/:id',
  Authenticate,
  authorizeRoles('AGRONOMIST', 'ADMIN'),
  updateMedicine
)
medecineRouter.delete(
  '/:id',
  Authenticate,
  authorizeRoles('AGRONOMIST', 'ADMIN'),
  deleteMedicine
)
medecineRouter.get('/by-disease/:id', Authenticate, getMedicinesByDisease)
export default medecineRouter
