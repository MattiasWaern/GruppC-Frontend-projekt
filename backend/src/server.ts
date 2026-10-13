import db from './db.js'
import express from 'express'
import movieRouter from './routes/movies.js'
import genreRouter from './routes/genres.js'
import viewingRouter from './routes/viewings.js'
import theatersRouter from './routes/theater.js'
import userRoutes from './routes/users.js'
import aboutUsRouter from './routes/aboutUs.js'

// Kan ta bort detta senare
try {
  const [rows] = await db.query('SELECT NOW() AS now')

  console.log('Databasanslutning fungerar!')
  console.log(rows)
} catch (error) {
  console.error('Kunde inte ansluta till databasen:', error)
}
// ---



const app = express()
const PORT = 3000;

app.use(express.json())


app.get('/api/health', (_req, res) => {
  res.json({message: 'API fungerar'})
})

app.use('/api/movies', movieRouter)
app.use('/api/genres', genreRouter)
app.use("/api/viewings", viewingRouter);
app.use('/api/users', userRoutes)
app.use('/api/theaters', theatersRouter)
app.use('/api/about-us', aboutUsRouter)
app.listen(PORT, () => {
  console.log(`Backend Körs på http://localhost:${PORT} `)
})

