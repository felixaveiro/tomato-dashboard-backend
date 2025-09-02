// server.js
import express from 'express'
import dotenv from 'dotenv'
import dotenvFlow from 'dotenv-flow'
import prisma from './src/models/prismaClient.js'

import swaggerUI from 'swagger-ui-express'
import cors from 'cors'
import swaggerSpec from './src/docs/swagger.js'
import mainRouter from './src/routes/index.js'
import seedDiseasesIfEmpty from './prisma/seed.js'

dotenv.config()
dotenvFlow.config({
  default_node_env: 'development',
  silent: true
})
console.log('Current environment:', process.env.NODE_ENV)
const app = express()
app.use(express.json())

app.use(cors())
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec))
// Routes
app.use('/api', mainRouter)

app.use('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>🍅 Tomato Disease Detection API</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f9f9f9;
          color: #333;
          padding: 2rem;
          line-height: 1.6;
        }
        h1 {
          color: #d03801;
        }
        a {
          color: #007bff;
          text-decoration: none;
          font-weight: bold;
        }
        a:hover {
          text-decoration: underline;
        }
        .container {
          max-width: 800px;
          margin: auto;
          background: #fff;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .footer {
          margin-top: 2rem;
          font-size: 0.9rem;
          color: #555;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🍅 Tomato Disease Detection API</h1>
        <p>Welcome! This API allows farmers and agronomists to detect tomato diseases from leaf images, manage advice, medicines, feedback, and users.</p>

        <h2>📖 Documentation</h2>
        <p>Explore and test all endpoints easily via our Swagger docs:</p>
        <p>👉 <a href="/api-docs" target="_blank">Open API Documentation (Swagger UI)</a></p>

        <h2>💡 Features</h2>
        <ul>
          <li>🧠 Detect tomato leaf diseases with AI</li>
          <li>📋 Get tailored agronomist advice</li>
          <li>💊 View and manage medicines</li>
          <li>🗣️ Submit and respond to feedback</li>
          <li>👤 Secure user authentication</li>
        </ul>

        <div class="footer">
          <p>Developed by <strong>Imanariyo Baptiste</strong></p>
          <p>
            🌐 <a href="https://imanariyo-portfolio-web.vercel.app/" target="_blank">Visit Portfolio</a><br />
            📧 <a href="mailto:imanariyobaptiste@gmail.com">imanariyobaptiste@gmail.com</a><br />
            📱 +250 787 795 163
          </p>
        </div>
      </div>
    </body>
    </html>
  `)
})

async function startServer () {
  try {
    await prisma.$connect()
    console.log('Connected to the database!')


    await seedDiseasesIfEmpty()

    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}/api-docs`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

startServer()
