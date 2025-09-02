import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import fs from 'fs' // add this to delete the local file later

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})
const uploadCloudinary = async file => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'imagesfolder',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'js', 'docx']
    })

    // Optional: delete local file after upload
    fs.unlinkSync(file.path)

    return result.secure_url
  } catch (error) {
    console.log('Cloudinary upload error:', error.message)
    throw error
  }
}

export default uploadCloudinary
