import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const loadFileRoutes = function (app) {
  app.use('/public', express.static(path.join(__dirname, '../../public')))// Serves resources from public folder

  app.route('/').get((req, res) => {
    res.send('Band Manager API')
  })
}

export default loadFileRoutes