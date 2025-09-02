

import prisma from "../../models/prismaClient.js";
import { passComparer } from "../../utils/passwordfunctions.js";

export const changepassword = async (req, res) => {
  try {
    const { currentpassword, newpassword } = req.body
    const userId = req.user?.id // assuming req.user is set by JWT middleware

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })



    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isPasswordCorrect = await passComparer(currentpassword, user.password)

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'The current password is wrong' })
    }

    const hashedPassword = await passHashing(newpassword)

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    })

    res.status(200).json({ message: 'Password changed successfully' })
  } catch (err) {

    res.status(500).json({ error: 'Something went wrong' })
  }
}
