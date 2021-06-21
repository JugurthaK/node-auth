const { check } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')

exports.registerValidation = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Email is required").not().isEmpty(),
  check("password", "Password is required").not().isEmpty()
]

exports.loginValidation = [
  check("email", "Email is required").not().isEmpty(),
  check("password", "Password is required").not().isEmpty()
]

exports.auth = async (req, res, next) => {
  const authorizationHeader = req.header('Authorization')
  const [bearer, token] = authorizationHeader.split(" ")

  if (bearer !== "Bearer")
    return res.status(400)
    .json(error("The type must be a bearer", res.statusCode))

  if (!token) return res.status(404).json(error("Token not found"))

  try {
    const jwtData = await jwt.verify(token, config.get("jwtSecret"))

    if (!jwtData) return res.status(401).json(error("Unauthorized", res.statusCode))

    req.user = jwtData.user

    next()
  } catch (err) {
    console.error(err)
    res.status(401).json(error("Unauthorized", res.statusCode))
  }
}