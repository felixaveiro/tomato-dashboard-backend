
import prisma from '../../prisma/client.js'
import { catchAsync } from '../middlewares/globaleerorshandling.js'
import { isOTPValid } from '../utils/passwordfunctions.js'


export const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.query

  if (!token) {
    return res.status(400).json({
      message: 'Token is required for email verification.'
    })
  }

  // Use Prisma to find the user by OTP
  const user = await prisma.user.findFirst({
    where: { otp: token }
  })

  if (!user) {
    return res.status(404).json({
      message: 'Invalid token. User not found.'
    })
  }

  const storedOTP = user.otp
  const receivedOTP = token
  const validOTP = isOTPValid(storedOTP, receivedOTP, user.otpExpiresAt, res)

  if (validOTP === true) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        otp: null,
        otpExpiresAt: null
      }
    })

    return res.status(200).json({
      message: 'Email verification successful. You can now login.'
    })
  } else {
    return res.status(400).json({
      message: 'Invalid or expired OTP.'
    })
  }
})
