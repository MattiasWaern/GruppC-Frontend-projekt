import db from './db.js'
import express from 'express'


try {
  const [rows] = await db.query('SELECT NOW() AS now')

  console.log('Databasanslutning fungerar!')
  console.log(rows)
} catch (error) {
  console.error('Kunde inte ansluta till databasen:', error)
}

const app = express()
const PORT = 3000;

app.use(express.json())


app.get('/api/health', (_req, res) => {
  res.json({message: 'API fungerar'})
})


app.listen(PORT, () => {
  console.log(`Backend Körs på http://localhost:${PORT} `)
})