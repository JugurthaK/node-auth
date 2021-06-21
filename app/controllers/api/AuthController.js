const { success, error, validation } = require('../../helpers/responseApi')
const { randomString } = require('../../helpers/common')
const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')
const Verification = require('../../models/Verification')
const config = require('config')

/**
 * @desc Register a new User
 * @method POST /api/auth/register
 * @access public
 */

exports.register = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(422).json(validation(errors.array()))

  const { name, email, password } = req.body

  try {

    // Check if user not already in base
    let user = await User.findOne({ email: email.toLowerCase() })
    if (user)
      return res.status(422).json(validation({msg: "Email already registered"}))

    let newUser = new User({
      name,
      email: email.toLowerCase().replace(/\s+/, ""),
      password
    })

    // Create a hash
    const hash = await bcrypt.genSalt(10)
    newUser.password = await bcrypt.hash(password, hash)

    // Save the User
    await newUser.save();

    let verification = new Verification({
      token: randomString(50),
      userId: newUser._id,
      type: "Register new account"
    })

    await verification.save()

    res.status(201).json(
      success("Register success, please activate your account", {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          verified: newUser.verfied,
          verifiedAt: newUser.verifiedAt,
          createdAt: newUser.createdAt
        },
        verification
      },
      res.statusCode
    )
    )
  } catch (err) {
    console.error(err.message)
    res.status(500).json(error("Server error", res.statusCode))
  }
}

/**
 * @desc verify a new user
 * @method GET api/auth/verify/:token
 * @access public
 */

exports.verify = async (req, res) => {
  const { token } = req.params

  try {
    let verification = await Verification.findOne({
      token,
      type: "Register new account"
    })

    if (!verification)
      return res
      .status(404)
      .json(error("No verification data found", res.statusCode))

    let user = await User.findOne({_id: verification.userId}).select("-password")
    user = await User.findByIdAndUpdate(user._id, {
      $set: {
        verified: true,
        verifiedAt: new Date()
      }
    })

    verification = await Verification.findByIdAndRemove(verification._id)

    res
    .status(200)
    .json(success("You successfully verified your account"), null, res.statusCode)

  } catch(err) {
    console.error(err)
    res.status(500).json(error("Server error", res.statusCode))
  }
}

/**
 * @desc Login a user
 * @methond POST /api/auth/login
 * @access public
 */

exports.login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(422).json(validation(errors.array()))

  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) return res.status(422).json(validation("Invalid credentials"))

    let checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) return res.status(422).json(validation("Invalid credentials"))

    if (user && !user.verified)
      return res.status(400).json(error("Your account is not verified", res.statusCode))

    const payload = {
      user: {
        id: user._id,
        name: user.name,
        emaile: user.email
      }
    }
    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err

        res.status(200)
        .json(success("Login Success", { token }, res.statusCode))
      }
    )
  } catch (err) {
    console.error(err)
    res.statusCode(500).json(error("Server error", res.statusCode))
  }
}

/**
 * @desc Resend new verification token
 * @method POST /api/auth/verify/resend
 * @access public
 */

exports.resendVerification = async (req, res) => {
  const { email } = req.body

  if (!email)
    return res.status(422).json(validation([{msg: "Email is required"}]))

  try {
    const user = await User.findOne({email: email.toLowerCase()})

    if (!user)
      return res.status(404).json(error("Email not foud", res.statusCode))

    let verification = await Verification.findOne({
      userId: user._id,
      type: "Register new account"
    })

    if (verification)
      verification = await Verification.findOneAndRemove(verification._id)

    let newVerification = new Verification({
      token: randomString(50),
      userId: user._id,
      type: "Register new account"
    })

    await newVerification.save()

    res.status(201)
    .json(
      success("Verification has been sent", {verification: newVerification}, res.statusCode)
    )
  } catch (err) {
    console.error(err)
    res.status(500).json(error("Server error", res.statusCode))
  }
}

/**
 * @desc Get authenticated user
 * @method GET /api/auth
 * @access private
 */

exports.getAuthenticatedUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user)
      return res.status(404).json(error("User not found", res.statusCode))
    res.status(200)
    .json(success(`Hello ${user.name}`, {user}, res.statusCode))
  } catch (err) {
    console.error(err)
    res,status(500).json(error("Server error", res.statusCode))
  }
}