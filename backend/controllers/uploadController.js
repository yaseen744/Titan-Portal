import { asyncHandler } from '../middleware/errorHandler.js'

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' })
  // Store a RELATIVE path (not an absolute http://host:port/... URL). If we
  // baked in the current BASE_URL/host/port here, any saved photo would
  // permanently break the moment the backend runs on a different port or
  // host (a very common local-dev situation) - the <img> would then fail to
  // load and the UI would silently fall back to the default initials
  // avatar, making it look like the user's chosen photo "disappeared" even
  // though it's sitting safely on disk and in the database. A relative path
  // is always resolved against whatever API origin the frontend is
  // currently talking to (see Avatar.jsx), so it keeps working no matter
  // what port/host the backend happens to be on.
  const url = `/uploads/${req.file.filename}`
  res.status(201).json({ url })
})
