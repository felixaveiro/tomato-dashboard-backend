import prisma from '../models/prismaClient.js'

export const createFeedbackService = async data => {
  const { detectionId, farmerId, comment, category, adviceId } = data

  // Minimal required field check (since controller handles logic)
  if (!detectionId || !farmerId || !comment || !category) {
    throw new Error('Missing required feedback fields')
  }

  try {
    // Save feedback
    const feedback = await prisma.feedback.create({
      data: {
        detectionId,
        farmerId,
        comment,
        category,
        adviceId: adviceId || null 
      },
      include: {
        advice: true,
        detection: true
      }
    })

    return feedback
  } catch (error) {
    throw new Error(`Failed to create feedback: ${error.message}`)
  }
}

// For listing all feedbacks (summary info)
export const getAllFeedbacksService = async () => {
  const whereClause = user.role === 'FARMER' ? { farmerId: user.farmerId } : {}
  try {
    return await prisma.feedback.findMany({
      where: whereClause,
      select: {
        id: true,
        category: true,
        status: true,
        reportId: true,
        comment: true,
        createdAt: true,
        farmer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                profilePicture: true,
                role: true,
                createdAt: true
              }
            }
          }
        },
        detection: {
          select: {
            id: true,
            image: true,
            disease: { select: { name: true } }
          }
        },
        advice: {
          select: {
            id: true,
            prescription: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error in getAllFeedbacksService:', error)
    throw error
  }
}

// For getting full details of one feedback by ID
export const getFeedbackByIdService = async id => {
  const feedback = await prisma.feedback.findUnique({
    where: { id },
    include: {
      farmer: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              profilePicture: true,
              role: true,
              createdAt: true
            }
          }
        }
      },
      detection: {
        include: {
          disease: true
        }
      },
      advice: {
        include: {
          agronomist: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  profilePicture: true,
                  role: true,
                  createdAt: true
                }
              }
            }
          },
          medicine: true
        }
      },
      response: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              profilePicture: true,
              role: true,
              createdAt: true
            }
          }
        }
      }
    }
  })

  if (!feedback) throw new Error('Feedback not found')

  return feedback
}

export const deleteFeedbackService = async (id, user) => {
  // user = { id, farmerId, role } - info from token

  const feedback = await prisma.feedback.findUnique({
    where: { id },
    select: { farmerId: true }
  })

  if (!feedback) {
    throw new Error('Feedback not found')
  }

  const isOwner = feedback.farmerId === user.farmerId
  const canDelete = user.role === 'AGRONOMIST' || user.role === 'ADMIN'

  if (!isOwner && !canDelete) {
    throw new Error('You do not have permission to delete this feedback')
  }

  const deleted = await prisma.feedback.delete({ where: { id } })
  return deleted
}
