const express = require("express")
const app = express()
const connectToMongoDB = require('./config/db')

app.use(express.json({extended: false}))

connectToMongoDB()

app.use("/api/auth", require('./routes/api/auth'))
app.use("/api/password", require('./routes/api/forgotPassword'))

app.listen(5000, () => console.log(`Server running on port 5000`))