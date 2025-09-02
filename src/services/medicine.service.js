import prisma from '../models/prismaClient.js'
import { Prisma as PrismaTypes } from '@prisma/client'
import { createNotificationForUsers } from '../utils/notificationUtils.js'

// Create Medicine with connected diseases
export const createMedicineService = async data => {
  try {
    // Create the medicine
    const medicine = await prisma.medicine.create({
      data: {
        name: data.name,
        description: data.description,
        usageInstructions: data.usageInstructions,
        diseases: {
          connect: Array.isArray(data.diseases)
            ? data.diseases.map(id => ({ id }))
            : []
        }
      },
      include: { diseases: true }
    })

    // Find farmers linked to any of the diseases
    if (medicine.diseases.length > 0) {
      const diseaseIds = medicine.diseases.map(d => d.id)

      const detections = await prisma.detection.findMany({
        where: {
          diseaseId: { in: diseaseIds }
        },
        select: {
          farmer: {
            select: {
              userId: true
            }
          }
        },
        distinct: ['farmerId']
      })

      const userIds = [...new Set(detections.map(d => d.farmer.userId))]

      await createNotificationForUsers(userIds, {
        title: 'New Medicine Added',
        message: `A new medicine "${medicine.name}" is now available for the following diseases: ${medicine.diseases
          .map(d => d.name)
          .join(', ')}.`
      })
    }

    return medicine
  } catch (error) {
    if (error instanceof PrismaTypes.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new Error('Medicine with this name already exists.')
        case 'P2025':
          throw new Error('One or more specified diseases were not found.')
        default:
          throw new Error('Database error while creating medicine.')
      }
    } else if (error instanceof PrismaTypes.PrismaClientValidationError) {
      throw new Error('Invalid medicine data. Please check required fields.')
    } else {
      throw new Error('Something went wrong while creating medicine.')
    }
  }
}

// Get all Medicines with related diseases
export const getAllMedicinesService = async () => {
  try {
    return await prisma.medicine.findMany({
      include: { diseases: true }
    })
  } catch (error) {
    throw new Error('Failed to fetch medicines. Please try again later.')
  }
}

// Get Medicine by ID with related diseases

/**
 * Fetch a specific medicine by its ID with all possible relations:
 * - Linked diseases
 * - Related advices and their respective agronomists and detections
 */
export const getMedicineByIdService = async id => {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        diseases: {
          select: {
            id: true,
            name: true,
            scientificName: true,
            symptoms: true,
            severity: true,
            prevention: true,
            treatment: true
          }
        },
        advices: {
          select: {
            id: true,
            prescription: true,
            createdAt: true,
            updatedAt: true,
            agronomist: {
              select: {
                id: true,
                name: true,
                region: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            detection: {
              select: {
                id: true,
                image: true,
                confidence: true,
                detectedAt: true,
                disease: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                farmer: {
                  select: {
                    id: true,
                    user: {
                      select: {
                        id: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!medicine) {
      throw new Error('Medicine not found with the given ID.')
    }

    return medicine
  } catch (error) {
    console.error(`[MedicineService] Error fetching medicine by ID:`, error)
    throw new Error('Failed to fetch the medicine. Please try again later.')
  }
}

// Update Medicine including its diseases connections
export const updateMedicineService = async (id, data) => {
  try {
    const existing = await prisma.medicine.findUnique({
      where: { id },
      include: { diseases: true }
    })

    if (!existing) throw new Error('Medicine not found.')

    // Detect changed fields
    const fieldsToWatch = ['description', 'usageInstructions']
    const hasChanges = fieldsToWatch.some(field => {
      const existingVal = JSON.stringify(existing[field])
      const newVal = JSON.stringify(data[field])
      return existingVal !== newVal
    })

    const newDiseaseIds = Array.isArray(data.diseases) ? data.diseases : []
    const oldDiseaseIds = existing.diseases.map(d => d.id)
    const diseaseChanged =
      newDiseaseIds.sort().join(',') !== oldDiseaseIds.sort().join(',')

    const updated = await prisma.medicine.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        usageInstructions: data.usageInstructions,
        diseases: {
          set: newDiseaseIds.map(id => ({ id }))
        }
      },
      include: { diseases: true }
    })

    // If relevant fields changed, notify affected farmers
    if (hasChanges || diseaseChanged) {
      const affectedFarmerUsers = await prisma.user.findMany({
        where: {
          farmer: {
            detections: {
              some: {
                diseaseId: { in: newDiseaseIds }
              }
            }
          }
        },
        select: { id: true }
      })

      const notifications = affectedFarmerUsers.map(user => ({
        userId: user.id,
        title: 'Medicine Update',
        message: `The medicine "${updated.name}" related to a disease you encountered has been updated.`,
        isRead: false
      }))

      await prisma.notification.createMany({
        data: notifications,
        skipDuplicates: true
      })
    }

    return updated
  } catch (error) {
    if (error instanceof PrismaTypes.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new Error('Another medicine with this name already exists.')
        case 'P2025':
          throw new Error(
            'The medicine or one of the diseases does not exist.'
          )
        default:
          throw new Error('Database error while updating medicine.')
      }
    } else if (error instanceof PrismaTypes.PrismaClientValidationError) {
      throw new Error('Invalid update data for medicine.')
    } else {
      throw new Error('Something went wrong while updating the medicine.')
    }
  }
}
export const getMedicinesByDiseaseIdService = async diseaseId => {
  try {
    const disease = await prisma.disease.findUnique({
      where: { id: diseaseId },
      include: {
        medicines: true // This will return all medicines linked to this disease
      }
    })

    if (!disease) {
      throw new Error('Disease not found')
    }

    return disease.medicines
  } catch (error) {
    console.error('Error fetching medicines for disease:', error)
    throw new Error('Failed to fetch medicines for the disease')
  }
}

// Delete Medicine
export const deleteMedicineService = async id => {
  try {
    return await prisma.medicine.delete({ where: { id } })
  } catch (error) {
    if (
      error instanceof PrismaTypes.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new Error('Medicine not found or already deleted.')
    } else {
      throw new Error('Failed to delete medicine. Please try again.')
    }
  }
}
