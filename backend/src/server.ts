import db from './db.js'

try {
  const [rows] = await db.query('SELECT NOW() AS now')

  console.log('Databasanslutning fungerar!')
  console.log(rows)
} catch (error) {
  console.error('Kunde inte ansluta till databasen:', error)
}