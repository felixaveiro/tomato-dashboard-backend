import dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'
import prisma from '../../models/prismaClient.js'
import Response from '../../utils/response.js'
import { formatUser } from '../../utils/formatUser.js'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        farmer: { include: { region: true } },
       agronomist:  { include: { region: true } }
      }
    })

    if (!users.length) {
      return Response.notFound(res, 'No users found')
    }

    const formatted = users.map(formatUser)
    return Response.success(res, formatted, 'Users retrieved successfully')
  } catch (error) {
    return Response.error(res, error, 'Error fetching users')
  }
}

// Get Single User
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        farmer: {
          include: {
            detections: {
              include: {
                disease: true,
                feedbacks: true,
                advices: true,
              },
            },
            feedbacks: {
              include: {
                advice: true,
                detection: true,
                response: true,
              },
            },
          },
        },
        agronomist: {
          include: {
            advices: {
              include: {
                medicine: true,
                detection: true,
                feedbacks: true,
              },
            },
          },
        },
        feedbackResponse: {
          include: {
            feedback: true,
          },
        },
        notifications: true,
      },
    });

    if (!user) {
      return Response.notFound(res, 'User not found');
    }

    return Response.success(res, user, 'User retrieved successfully');
  } catch (error) {
    return Response.error(res, error, 'Error fetching user');
  }
};


// Delete User
export const deleteUserById = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.user.delete({ where: { id } })
    return Response.success(res, {}, 'User deleted successfully')
  } catch (error) {
    if (error.code === 'P2025') {
      return Response.notFound(res, 'User not found')
    }
    return Response.error(res, error, 'Error deleting user')
  }
}

// Update User
export const updateUserById = async (req, res) => {
  const { id } = req.params
  let updateData = { ...req.body }

  if (req.files?.profilePicture) {
    const file = req.files.profilePicture[0]
    updateData.profilePicture = `/media/${file.filename}`
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        farmer: { include: { region: true } },
       agronomist:  { include: { region: true } }
      }
    })

    return Response.success(res, formatUser(updatedUser), 'User updated successfully')
  } catch (error) {
    if (error.code === 'P2025') {
      return Response.notFound(res, 'User not found')
    }
    return Response.error(res, error, 'Error updating user')
  }
}

// Set Role (admin or any valid role)
export const changeUserRole = async (req, res) => {
  const { id } = req.params
  const { role } = req.body

  if (!role) return Response.badRequest(res, 'Role is required')

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: role.toUpperCase() }
    })

    return Response.success(res, updatedUser, `User role updated to ${role.toUpperCase()}`)
  } catch (error) {
    if (error.code === 'P2025') {
      return Response.notFound(res, 'User not found')
    }
    return Response.error(res, error, 'Error updating user role')
  }
}


export const getMyProfile = async (req, res) => {
  const id = req.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        farmer: {
          include: {
            detections: {
              include: {
                disease: true,
                feedbacks: true,
                advices: true,
              },
            },
            feedbacks: {
              include: {
                advice: true,
                detection: true,
                response: true,
              },
            },
          },
        },
        agronomist: {
          include: {
            advices: {
              include: {
                medicine: true,
                detection: true,
                feedbacks: true,
              },
            },
          },
        },
        feedbackResponse: {
          include: {
            feedback: true,
          },
        },
        notifications: true,
      },
    });

    if (!user) {
      return Response.notFound(res, 'User not found');
    }

    return Response.success(res, user, 'User profile retrieved successfully');
  } catch (error) {
    return Response.error(res, error, 'Error fetching user profile');
  }
};
