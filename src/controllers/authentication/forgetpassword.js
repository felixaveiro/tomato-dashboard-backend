
import prisma from '../../models/prismaClient.js'



export const generateAndSendOTP = async (req, res) => {
  try {
    const { email } = req.body
    console.log('Generating and sending OTP for user:', email)

    const { code: otp, expiresAt } = generateOTp()

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({
        message: `No user with email ${email} found. Please use a correct registered email if you have ever signed up.`
      })
    }
    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiresAt: expiresAt
      }
    })

    await sendEmail(
      email,
      'Password OTP Code Reset',
      'Password Resetting!',
      `Use this ${otp} to change your password. It is valid for five minutes and will expire at ${expiresAt}.`
    )

    return res.status(200).json({
      message:
        'OTP sent successfully! Please check your email and come back with the OTP.',
      otp
    })
  } catch (error) {
    console.log('Error generating and sending OTP:', error)
    return res
      .status(500)
      .json({ message: 'An error occurred while sending the OTP.' })
  }
}

export const verifyOTPAndUpdatePassword = async (req, res) => {
  try {
    const { email, otp: receivedOTP, newpassword } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({
        message: `No user with email ${email} found. Please use a correct registered email if you have ever signed up.`
      })
    }

    const validOTP = isOTPValid(user.otp, receivedOTP, user.otpExpiresAt, res)

    if (!validOTP) {
      return res.status(400).json({ message: 'Invalid OTP.' })
    }

    const hashedPassword = await passHashing(newpassword)

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiresAt: null
      }
    })

    return res.status(200).json({ message: 'Password updated successfully.' })
  } catch (error) {

    return res
      .status(500)
      .json({ message: 'An error occurred while updating the password.' })
  }
}
