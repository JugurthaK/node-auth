const mongoose = require('mongoose')

const connectToMongoDB = async () => {
  try {
    mongoose.connect("mongodb://127.0.0.1:27017/auth", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }, () => {
      console.log('Connected to MongoDB...')
    })

  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}

module.exports = connectToMongoDB