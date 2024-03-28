import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
// import { toyService } from "./services/toy.service.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import { logger } from "./services/logger.service.js"
logger.info("server.js loaded...")

const app = express()

// Express App Config
app.use(cookieParser())
app.use(express.json())
app.use(express.static("public"))

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "public")))
  console.log("__dirname: ", __dirname)
} else {
  // Configuring CORS
  const corsOptions = {
    origin: [
      "http://127.0.0.1:4040",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  }
  app.use(cors(corsOptions))
}

import { authRoutes } from "./api/auth/auth.routes.js"
import { userRoutes } from "./api/user/user.routes.js"
import { toyRoutes } from "./api/toy/toy.routes.js"

// routes
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/toy", toyRoutes)

app.get("/**", (req, res) => {
  res.sendFile(path.resolve("public/index.html"))
})

// app.get("/api/toy", (req, res) => {
//   const { filterBy = {}, sort = {} } = req.query.params

//   toyService
//     .query(filterBy, sort)
//     .then((toys) => {
//       res.send(toys)
//     })
//     .catch((err) => {
//       console.log("Had issues getting toys", err)
//       res.status(400).send({ msg: "Had issues getting toys" })
//     })
// })

// app.get("/api/toy/:id", (req, res) => {
//   const toyId = req.params.id
//   toyService
//     .getById(toyId)
//     .then((toy) => {
//       res.send(toy)
//     })
//     .catch((err) => {
//       console.log("Had issues getting toy", err)
//       res.status(400).send({ msg: "Had issues getting toy" })
//     })
// })

// app.delete("/api/toy/:id", (req, res) => {
//   const toyId = req.params.id
//   toyService
//     .remove(toyId)
//     .then(() => {
//       res.end("Done!")
//     })
//     .catch((err) => {
//       console.log("Had issues deleting toy", err)
//       res.status(400).send({ msg: "Had issues deleteing toy" })
//     })
// })

// app.post("/api/toy", (req, res) => {
//   const toy = req.body
//   toyService
//     .save(toy)
//     .then((savedToy) => {
//       res.send(savedToy)
//     })
//     .catch((err) => {
//       console.log("Had issues adding toy", err)
//       res.status(400).send({ msg: "Had issues adding toy" })
//     })
// })

// app.put("/api/toy/:id", (req, res) => {
//   const toy = req.body
//   toyService
//     .save(toy)
//     .then((savedToy) => {
//       res.send(savedToy)
//     })
//     .catch((err) => {
//       console.log("Had issues updating toy", err)
//       res.status(400).send({ msg: "Had issues updating toy" })
//     })
// })

const port = process.env.PORT || 4040
app.listen(port, () => {
  logger.info("Server is running on port:" + port)
})
