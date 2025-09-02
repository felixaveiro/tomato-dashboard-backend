import prisma from '../../models/prismaClient.js'
import { formatUser } from '../../utils/formatUser.js'
import { tokengenerating } from '../../utils/jwtfunctions.js'
import { passComparer } from '../../utils/passwordfunctions.js'
import Response from '../../utils/response.js'

export const login = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email
      },
      include: {
        farmer: { select: { id: true } },
       agronomist:  { select: { id: true } }
      }
    })
    if (!user) {
      return Response.error(res, 'User not found', 404)
    }
    let istruepassword = await passComparer(req.body.password, user.password)
    if (!istruepassword) {
      return Response.error(res, 'Wrong password', 401)
    }
    const farmerId = user.farmer?.id
    const AgronomistId = user.agronomist?.id
    const token = tokengenerating({
      id: user.id,
      email: user.email,
      role: user.role,       
      ...(farmerId && { farmerId }),
      ...(AgronomistId && { AgronomistId })
    })
    const userInfo = formatUser(user)
    return Response.success(res, {
      access_token: token,
      user: userInfo
    }, 'User logged in successfully')
    

  } catch (err) {
    console.log('Login Error:', err)
    return Response.error(res, 'Internal server error', 500, err.message)  }
}
