const router = require("express").Router()

const { register, verify, login, getAuthenticatedUser } = require("../../app/controllers/api/AuthController")

const { registerValidation, loginValidation, auth } = require("../../app/middlewares/auth")

router.post("/register", registerValidation, register)
router.get("/verify/:token", verify)
router.post("/login", loginValidation, login)
router.get("/", auth, getAuthenticatedUser)

module.exports = router