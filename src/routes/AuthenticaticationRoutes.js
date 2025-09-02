import express from 'express'
import { Authenticate } from '../utils/jwtfunctions.js'
import {
  deleteUserById,
  getAllUsers,
  login,
  signup,
  updateUserById,
  changepassword,
  generateAndSendOTP,
  verifyOTPAndUpdatePassword,
  changeUserRole,
  getMyProfile,
  getUserById
} from '../controllers/authentication/index.js'
import { uploadMiddleware } from '../middleware/uploadMiddlewareMulter.js'
import { isAdmin } from '../middleware/authorizations.js'

const authRouter = express.Router()

// Public routes
authRouter.post('/login', login)
authRouter.post('/signup', uploadMiddleware, signup)

// Protected routes
authRouter.use(Authenticate)
authRouter.get('/getAllUsers', getAllUsers)

authRouter.post('/change', changepassword)
authRouter.patch('/updateUserById/:id', uploadMiddleware, updateUserById)
authRouter.post('/forget', generateAndSendOTP)
authRouter.post('/reset', verifyOTPAndUpdatePassword)
// Admin-only routes
authRouter.delete('/deleteUserById/:id', isAdmin, deleteUserById)

authRouter.get('/me', getMyProfile)
// ✅ New flexible role-changing route (e.g. to ADMIN, DEVELOPER, UI_UX, etc.)
authRouter.patch('/changeUserRole/:id', isAdmin, changeUserRole)
authRouter.get('/user/:id',isAdmin, getUserById)
export default authRouter
