import {
  getAdminDashboard,
  getAgronomistDashboard,
  getFarmerDashboard
} from '../controllers/statisticControllers.js'
import { authorizeRoles } from '../middleware/authorizations.js'
import { Authenticate } from '../utils/jwtfunctions.js'
import express from 'express'
const statatisticsRouter = express.Router()

statatisticsRouter.use(Authenticate)

statatisticsRouter.get('/farmer', authorizeRoles('FARMER'), getFarmerDashboard)
statatisticsRouter.get(
  '/agronomist',
  authorizeRoles('AGRONOMIST'),
  getAgronomistDashboard
)
statatisticsRouter.get('/admin', authorizeRoles('ADMIN'), getAdminDashboard)

export default statatisticsRouter
