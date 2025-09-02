import { createDetectionService,
  getDetectionByIdService,
  deleteDetectionService,
  getAllDetectionsService, 
  getMyDetectionsService} from "../../services/detection.service.js"
import uploadCloudinary from "../../utils/cloudinary.js"
import { formatUser } from "../../utils/formatUser.js"
// import { formatUserr } from "../../../media"
import axios from "axios";

import FormData from 'form-data' 
const MODEL_API_URL = ' http://127.0.0.1:6000/predict'

import fs from 'fs'
import Response from "../../utils/response.js";
export const createDetection = async (req, res) => {
  try {

    const farmerId = req.farmerId
    if (!farmerId ) {
      return Response.error(res, "farmerId (from token) is required", 400)
    }
    const { latitude, longitude } = req.body
    let image = ""
    let diseaseName = ""
    let confidence = 0
    if (req.files && req.files.image) {
      const file = req.files.image[0];
      const form = new FormData();
      form.append('image', fs.createReadStream(file.path))

      const response = await axios.post(MODEL_API_URL, form, {
        headers: form.getHeaders()
      })
      diseaseName = response.data.diseaseName
      confidence = response.data.confidence
      image = await uploadCloudinary(file);
    }
    else if (req.body.imageUrl && req.body.diseaseName && req.body.confidence) {
      image = req.body.imageUrl;
      diseaseName = req.body.diseaseName;
      confidence = parseFloat(req.body.confidence);
    }else {
      return Response.error(res, "Missing image, imageUrl, or prediction data", 400);
    }
    // fs.unlink(file.path, (err) => {
    //   if (err) {
    //     console.error('Error deleting uploaded file:', err);
    //   } else {
    //     console.log('File deleted:', file.path);
    //   }
    // });
  
  
    const data = {
      farmerId,
      image,
      diseaseName,
      confidence,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null
    }
    const detection = await createDetectionService(data)
    return Response.success(res, detection, "Detection created successfully", 201)
  } catch (error) {
    console.error("Error creating detection:", error)
    return Response.error(res, "Failed to create detection", error.message)
  }
}

// Get detection by ID
export const getDetectionById = async (req, res) => {
  try {
    const { id } = req.params
    const detection = await getDetectionByIdService(id)

    if (!detection) {
      return Response.error(res, 'Detection not found', 404)
    }

    // Format user data in nested objects
    if (detection.farmer?.user) {
      detection.farmer.user = formatUser(detection.farmer.user)
    }
    detection.advices?.forEach(advice => {
      if (advice.agronomist?.user) {
        advice.agronomist.user = formatUser(advice.Agronomist.user)
      }
    })

    return Response.success(res, detection, 'Detection fetched successfully')
  } catch (error) {
    console.error('Error fetching detection:', error)
    return Response.error(res, 'Failed to fetch detection', 500, error.message)
  }
}

// Delete detection by ID
export const deleteDetection = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await deleteDetectionService(id)

    if (!deleted) {
      return Response.error(res, 'Detection not found', 404)
    }

    return Response.success(res, deleted, 'Detection deleted successfully')
  } catch (error) {
    console.error('Error deleting detection:', error)
    return Response.error(res, 'Failed to delete detection', 500, error.message)
  }
}

// List all detections (optionally filtered by farmer)
export const getAllDetections = async (req, res) => {
  try {
    const farmerId = req.query.farmerId || null
    const detections = await getAllDetectionsService(farmerId)

    // Format farmer user info for each detection
    detections.forEach(detection => {
      if (detection.farmer?.user) {
        detection.farmer.user = formatUser(detection.farmer.user)
      }
    })

    return Response.success(res, detections, 'Detections fetched successfully')
  } catch (error) {
    console.error('Error fetching detections:', error)
    return Response.error(res, 'Failed to fetch detections', 500, error.message)
  }
}

export const getMyDetections = async (req, res) => {
  try {
    const farmerId = req.farmerId;

    if (!farmerId) {
      return Response.error(res, "Farmer ID not found in token", 401);
    }

    const detections = await getMyDetectionsService(farmerId);

    detections.forEach(detection => {
      if (detection.farmer?.user) {
        detection.farmer.user = formatUser(detection.farmer.user);
      }
    });

    return Response.success(res, detections, "My detections fetched successfully");
  } catch (error) {
    console.error("Error fetching my detections:", error);
    return Response.error(res, "Failed to fetch detections", 500, error.message);
  }
};