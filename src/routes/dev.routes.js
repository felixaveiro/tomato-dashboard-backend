import express from 'express'
import prisma from '../models/prismaClient.js'

import { signup } from '../controllers/authentication/signup.js'
import { login } from '../controllers/authentication/index.js' // import your existing login
import Response from '../utils/response.js'

const devRouter = express.Router()

devRouter.delete('/reset', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return Response.error(res, '🚫 Operation not allowed in production', 403)
  }

  try {
    await prisma.advice.deleteMany()
    await prisma.feedback.deleteMany()
    await prisma.detection.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.agronomist.deleteMany()
    await prisma.farmer.deleteMany()
    await prisma.user.deleteMany()
    await prisma.region.deleteMany()
    await prisma.diseaseStat.deleteMany()
    await prisma.disease.deleteMany()
    await prisma.medicine.deleteMany()

    return Response.success(res, {}, '✅ Database cleared successfully.')
  } catch (err) {
    console.error('❌ Failed to clear DB:', err)
    return Response.error(res, '❌ Failed to clear database', 500, err.message)
  }
})

devRouter.post('/seed-users', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return Response.error(res, 'Operation not allowed in production', 403)
  }

  const usersToCreate = [
    {
      email: 'admin@example.com',
      password: 'password123',
      role: 'ADMIN',
      username: 'Admin User'
    },
    {
      email: 'agronomist@example.com',
      password: 'password123',
      role: 'AGRONOMIST',
      username: 'Agronomist User'
    },
    {
      email: 'farmer@example.com',
      password: 'password123',
      role: 'FARMER',
      username: 'Farmer User'
    }
  ]

  try {
    for (const userData of usersToCreate) {
      // Create a fake req and res object for calling signup
      const fakeReq = { body: userData, files: {} }
      const fakeRes = {
        status: code => ({
          json: data => data
        })
      }
      await signup(fakeReq, fakeRes)
    }
    return Response.success(res, {}, 'Users seeded successfully')
  } catch (error) {
    return Response.error(res, error, 'Failed to seed users')
  }
})

devRouter.post('/login-by-role', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return Response.error(res, 'Operation not allowed in production', 403)
  }

  const { role } = req.query
  if (!role) {
    return Response.error(res, 'Role is required as a query parameter', 400)
  }

  try {
    // Find one user with that role
    const user = await prisma.user.findFirst({
      where: { role },
      select: { email: true }
    })

    if (!user) {
      return Response.error(res, `No user found with role ${role}`, 404)
    }

    // Known seeded password
    const defaultPassword = 'password123'

    // Create fake req/res to call login
    const fakeReq = {
      body: {
        email: user.email,
        password: defaultPassword
      }
    }

    let resultData
    const fakeRes = {
      status (code) {
        this.statusCode = code
        return this
      },
      json (data) {
        resultData = { statusCode: this.statusCode || 200, data }
        return resultData
      }
    }

    await login(fakeReq, fakeRes)

    return res.status(resultData.statusCode).json(resultData.data)
  } catch (error) {
    console.error('Dev login error:', error)
    return Response.error(res, 'Failed to login by role', 500, error.message)
  }
})

export default devRouter
