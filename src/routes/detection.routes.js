import express from 'express'
import { uploadMiddleware } from '../middleware/uploadMiddlewareMulter.js'
import { Authenticate } from '../utils/jwtfunctions.js'
import {
  createDetection,
  getDetectionById,
  deleteDetection,
  getAllDetections,
  getMyDetections
} from '../controllers/detection/detection.controller.js'
const detectionRouter = express.Router()
detectionRouter.get('/', getAllDetections)
detectionRouter.use(Authenticate)
detectionRouter.post('/', uploadMiddleware, createDetection)
detectionRouter.post('/manual', createDetection)
detectionRouter.get('/my', getMyDetections)
detectionRouter.get('/:id', getDetectionById)
detectionRouter.delete('/:id', deleteDetection)
export default detectionRouter
