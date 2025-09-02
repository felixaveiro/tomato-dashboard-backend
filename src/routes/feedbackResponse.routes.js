import express from 'express'
import {
  createFeedbackResponse,
  getAllFeedbackResponses,
  getFeedbackResponseById,
  deleteFeedbackResponse
} from '../controllers/feedbackResponse/feedbackResponse.controller.js'
import { Authenticate } from '../utils/jwtfunctions.js'
import { authorizeRoles } from '../middleware/authorizations.js'
const feedbackResponseRouter = express.Router()

feedbackResponseRouter.use(Authenticate)

feedbackResponseRouter.post('/',  authorizeRoles("AGRONOMIST", "ADMIN") ,createFeedbackResponse)

feedbackResponseRouter.get('/', getAllFeedbackResponses)

feedbackResponseRouter.get('/:id', getFeedbackResponseById)

feedbackResponseRouter.delete('/:id',  authorizeRoles("AGRONOMIST", "ADMIN") ,deleteFeedbackResponse)

export default feedbackResponseRouter
  