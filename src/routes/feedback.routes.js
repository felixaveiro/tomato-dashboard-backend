import express from 'express'

import {
  createFeedback,
  deleteFeedback,
  getAllFeedbacks,
  getFeedbackById
} from '../controllers/feedback/feedback.controller.js'
import { Authenticate } from '../utils/jwtfunctions.js'
const feedbackRouter = express.Router()
feedbackRouter.use(Authenticate)
feedbackRouter.post('/on-detection', createFeedback)
feedbackRouter.post('/on-advice', createFeedback)
feedbackRouter.get('/', getAllFeedbacks)
feedbackRouter.get('/:id', getFeedbackById)
feedbackRouter.delete('/:id', deleteFeedback)
export default feedbackRouter
