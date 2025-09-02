import express from 'express'
import adviceController from '../controllers/advice/advice.controller.js'
import { Authenticate } from '../utils/jwtfunctions.js'
import { authorizeRoles } from '../middleware/authorizations.js'

const adviceRouter = express.Router()

adviceRouter.use(Authenticate)

// Create advice on a detection
adviceRouter.post(
  '/on-detection',
  authorizeRoles('AGRONOMIST'),
  adviceController.create
)

// Create advice on a medicine (no detectionId required)
adviceRouter.post(
  '/on-medicine',
  authorizeRoles('AGRONOMIST'),
  adviceController.create
)
adviceRouter.get('/detection/:detectionId', adviceController.getByDetectionId)
adviceRouter.put('/:id', authorizeRoles('AGRONOMIST'), adviceController.update)
adviceRouter.delete(
  '/:id',
  authorizeRoles('AGRONOMIST', 'ADMIN'),
  adviceController.delete
)
adviceRouter.get('/', adviceController.getAll)
adviceRouter.get('/:id', adviceController.getById)

export default adviceRouter
