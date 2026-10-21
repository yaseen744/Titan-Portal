import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadRoot = path.join(__dirname, '..', 'uploads')

if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadRoot),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg'
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, unique)
  },
})

function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|webp|gif/
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)
  if (ok) return cb(null, true)
  cb(new Error('Only image files (jpg, png, webp, gif) are allowed.'))
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})
