import express from 'express'
import authRouter from './AuthenticaticationRoutes.js'
import detectionRouter from './detection.routes.js'
import devRouter from './dev.routes.js'
import diseasesRouter from './diseases.routes.js'
import medecineRouter from './medecine.routes.js'
import feedbackRouter from './feedback.routes.js'
import adviceRouter from './advice.routes.js'
import feedbackResponseRouter from './feedbackResponse.routes.js'
import notificationsRouter from './notification.routes.js'
import statatisticsRouter from './statstics.routes.js'
const mainRouter = express.Router()
mainRouter.use('/auth', authRouter)
mainRouter.use('/dev/', devRouter)
mainRouter.use('/detect', detectionRouter)
mainRouter.use('/detect/manual', detectionRouter)
mainRouter.use('/diseases', diseasesRouter)
mainRouter.use('/medecines', medecineRouter)
mainRouter.use('/feedback', feedbackRouter)
mainRouter.use('/feedback-response', feedbackResponseRouter)
mainRouter.use('/advice', adviceRouter)
mainRouter.use('/notifications', notificationsRouter)
mainRouter.use('/statistics', statatisticsRouter)
export default mainRouter
