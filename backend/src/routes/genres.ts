import { Router } from 'express'
import db from '../db.js'


const router = Router();

// Hämta alla genrer
router.get('/', async(_req, res) => {
    try {
        const [rows] = await db.query(`
                SELECT genreId, name
                FROM genre
                ORDER BY name
            `)

            res.json(rows)
    } catch (error){
        console.error('Kunde inte hämta genrer:', error)
        res.status(500).json({error: 'Kunde inte hämta genrer'})
    }
})