require('dotenv').config()

const express = require('express')
const path = require('node:path')

const app = express()
const mainRouter = require('./routers/mainRouter')

app.use(express.static(path.join(__dirname, './public')));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }))

app.use('/', mainRouter)

const port = process.env.port || 3000

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})