import prisma from '../models/prismaClient.js'

export const isAdmin = async (req, res, next, userRole) => {
  const { userId } = req

  let user = await prisma.user.findById(userId)
  if (!user) {
    return res.status(401).json({ message: 'user not found' })
  }
  let isadmin = user.role == userRole
  if (!isadmin) {
    return res.status(401).json({
      message: `action is only reseverd for ${userRole} while ${user} role is {user.role}`
    })
  }

  next()
}
export const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { userId } = req

      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) {
        return res.status(401).json({ message: 'User not found' })
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          message: `Access denied: required roles [${allowedRoles.join(
            ', '
          )}], but your role is ${user.role}`
        })
      }

      next()
    } catch (err) {
      return res
        .status(500)
        .json({ message: 'Authorization error', error: err.message })
    }
  }
}
