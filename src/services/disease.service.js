import prisma from '../models/prismaClient.js'
import { Prisma as PrismaTypes } from '@prisma/client'

// Create
import { Prisma } from "@prisma/client"

export const createDiseaseService = async (data) => {
  try {
    console.log("Creating disease with data:", data)

    const disease = await prisma.disease.create({
      data: {
        name: data.name,
        description: data.description,
        scientificName: data.scientificName,
        symptoms: data.symptoms,
        severity: data.severity,
        prevention: data.prevention,
        treatment: data.treatment,
        medicines: data.medicines
          ? {
            set: [],
            connect: data.medicines.map((id) => ({ id })),
            }
          : undefined,
          detections: data.detections?.length
          ? {
            set:[],
              connect: data.detections.map(id => ({ id }))
            }
          : undefined,
      },
      include: {
        medicines: true
      }
    })

    return disease
  } catch (error) {
    console.error("Error in createDiseaseService:", error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("Disease with this name already exists.")
      }
    }

    throw error
  }
}

// Get All
export const getAllDiseasesService = async () => {
  try {
    console.log('Fetching all diseases')
  const diseases = await prisma.disease.findMany({
    include: {
      detections: {
        select: {
          id: true
        }
      },
      medicines: {
        select: {
          id: true
        }
      }
    }
  })
  return diseases
  } catch (error) {
    console.error('Error in getAllDiseasesService:', error)
    throw error
  }
}

// Get by ID with existence check
export const getDiseaseByIdService = async id => {
  try {
    console.log('Fetching disease by ID:', id)
    const disease = await prisma.disease.findUnique({ where: { id } })

    if (!disease) {
      throw new Error('Disease not found')
    }

    return disease
  } catch (error) {
    console.error('Error in getDiseaseByIdService:', error)
    throw error
  }
}

// Update with existence check
export const updateDiseaseService = async (id, data) => {
  try {
    const existing = await prisma.disease.findUnique({ where: { id } })
    if (!existing) throw new Error('Disease not found')

    if (data.name && data.name !== existing.name) {
      const nameExists = await prisma.disease.findFirst({
        where: {
          name: data.name,
          NOT: { id }
        }
      })
      if (nameExists) throw new Error('Disease with this name already exists.')
    }
    const updateData = {
      ...data,
      medicines: data.medicines?.length
        ? {
            set: [],
            connect: data.medicines.map((id) => ({ id })),
          }
        : undefined,

      detections: data.detections?.length
        ? {
            set: [],
            connect: data.detections.map((id) => ({ id })),
          }
        : undefined,
    };
    const fieldsToWatch = [
      'symptoms',
      'treatment',
      'severity',
      'description',
      'scientificName'
    ]
    const changes = fieldsToWatch.filter(
      field => data[field] && data[field] !== existing[field]
    )

    const updated = await prisma.disease.update({
      where: { id },
      data: updateData,
      include: {
        medicines: true,
        detections: true,
      },
    });


    if (changes.length > 0) {
      const detections = await prisma.detection.findMany({
        where: { diseaseId: id },
        select: { farmer: { select: { userId: true } } },
        distinct: ['farmerId']
      })

      const userIds = [...new Set(detections.map(d => d.farmer.userId))]

      const notifications = userIds.map(userId => ({
        userId,
        title: `Update on ${updated.name}`,
        message: `The disease "${updated.name}" was updated: ${changes.join(
          ', '
        )}.`
      }))

      if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications })
      }
    }

    return updated
  } catch (error) {
    console.error('Error in updateDiseaseService:', error)
    throw error
  }
}

// Delete with existence check
export const deleteDiseaseService = async id => {
  try {
    console.log('Deleting disease by ID:', id)
    // Check if disease exists before deleting
    const disease = await prisma.disease.findUnique({ where: { id } })
    if (!disease) {
      throw new Error('Disease not found')
    }

    const deleted = await prisma.disease.delete({ where: { id } })
    return deleted
  } catch (error) {
    console.error('Error in deleteDiseaseService:', error)
    throw error
  }
}
