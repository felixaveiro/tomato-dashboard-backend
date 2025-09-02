import * as medicineService from '../../services/medicine.service.js'
import Response from '../../utils/response.js'

// Create
export const createMedicine = async (req, res) => {
  try {
    const {
      name,
      description,
      diseases = [],
      usageInstructions = []
    } = req.body

    const medicine = await medicineService.createMedicineService({
      name,
      description,
      usageInstructions,
      diseases
    })

    return Response.created(res, medicine, 'Medicine created')
  } catch (error) {
    return Response.error(res, error, 'Failed to create medicine', 500)
  }
}

// Get medicines by disease ID
export const getMedicinesByDisease = async (req, res) => {
  try {
    const { id } = req.params
    const medicines = await medicineService.getMedicinesByDiseaseIdService(id)

    return Response.success(res, medicines, 'Medicines fetched successfully')
  } catch (error) {
    return Response.error(
      res,
      error,
      'Failed to fetch medicines for the disease',
      500
    )
  }
}

// Get all medicines
export const getAllMedicines = async (req, res) => {
  try {
    const medicines = await medicineService.getAllMedicinesService()

    return Response.success(res, medicines, 'List of medicines', 200)
  } catch (error) {
    return Response.error(res, error, 'Failed to fetch medicines', 500)
  }
}

// Get medicine by ID
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await medicineService.getMedicineByIdService(
      req.params.id
    )

    if (!medicine) {
      return Response.notFound(res, 'Medicine not found')
    }

    return Response.success(res, medicine, 'Medicine found', 200)
  } catch (error) {
    return Response.error(res, error, 'Failed to fetch medicine', 500)
  }
}

// Update medicine
export const updateMedicine = async (req, res) => {
  try {
    const updated = await medicineService.updateMedicineService(
      req.params.id,
      req.body
    )

    return Response.success(res, updated, 'Medicine updated', 200)
  } catch (error) {
    return Response.error(res, error, 'Failed to update medicine', 500)
  }
}

// Delete medicine
export const deleteMedicine = async (req, res) => {
  try {
    const deleted = await medicineService.deleteMedicineService(req.params.id)

    return Response.success(res, deleted, 'Medicine deleted', 200)
  } catch (error) {
    return Response.error(res, error, 'Failed to delete medicine', 500)
  }
}
