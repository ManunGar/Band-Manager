import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import multer from 'multer'
import { User } from '../models/sequelize.js'

// Function to add filename to request body after uploading to Cloudinary
const addFilenameToBody = async (req, fieldName, model, idPathParamName) => {
  if (req.file?.fieldname === fieldName) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET
    })
    //Delete old file from Cloudinary
    if (req.params[idPathParamName]) {
      const entity = await model.findByPk(req.params[idPathParamName])
      if (!entity) { return res.status(404).send({ errors: [{ type: 'Not found', msg: `${idPathParamName} no encontrado` }] }) }
      if (entity.imagen && entity.imagen.includes('bandmanager')) {
        const imageId = 'bandmanager/' + entity.imagen.split('/bandmanager/')[1].split('.')[0]
        await cloudinary.uploader.destroy(imageId)
      }
    }
    //Add file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "bandmanager" })
    if (fs.existsSync(req.file.path)) await fs.unlinkSync(req.file.path) // Delete local file after upload
    req.body[fieldName] = result.secure_url
  }
}
// Function to add profile picture to request body after uploading to Cloudinary
const addProfilePictureToBody = async (req) => {
  const user = req.user;
  if (req.file?.fieldname === 'profile_picture') {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET
    })
    //Delete old file from Cloudinary
    if (user?.id) {
      const entity = await User.findByPk(user.id)
      if (!entity) { return res.status(404).send({ errors: [{ type: 'Not found', msg: `Usuario no encontrado` }] }) }
      if (entity.profile_picture && entity.profile_picture.includes('bandmanager')) {
        const imageId = 'bandmanager/' + entity.profile_picture.split('/bandmanager/')[1].split('.')[0]
        await cloudinary.uploader.destroy(imageId)
      }
    }
    //Add file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "bandmanager" })
    if (fs.existsSync(req.file.path)) await fs.unlinkSync(req.file.path) // Delete local file after upload
    req.body.profile_picture = result.secure_url
  }
}

// Function to delete file from Cloudinary
const deleteFileFromCloudinary = async (fileUrl) => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
  })
  if (fileUrl && fileUrl.includes('bandmanager')) {
    const imageId = 'bandmanager/' + fileUrl.split('/bandmanager/')[1].split('.')[0]
    await cloudinary.uploader.destroy(imageId)
  }
}

const handleFilesUpload = (fileName, folder, model, idPathParamName) => (req, res, next) => {
  // Configure multer storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, folder)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  // Initialize multer with the defined storage
  const upload = multer({ storage: storage }).single(fileName)
  // Use multer to handle the file upload
  upload(req, res, async (err) => {
    if (err) {
      res.status(500).send({ error: err.message })
    } else {
      next()
    }
  })
}

const handleFilesDestroy = (model, idPathParamName) => async (req, res, next) => {
  const entity = await model.findByPk(req.params[idPathParamName])
  if (!entity) { return res.status(404).send({ errors: [{ type: 'Not found', msg: `${idPathParamName} no encontrado` }] }) }
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
  })
  //Delete from Cloudinary
  if (entity.imagen && entity.imagen.includes('bandmanager')) {
    const imageId = 'bandmanager/' + entity.imagen.split('/bandmanager/')[1].split('.')[0]
    await cloudinary.uploader.destroy(imageId)
  }
  next()
}

export { addFilenameToBody, addProfilePictureToBody, deleteFileFromCloudinary, handleFilesDestroy, handleFilesUpload }

