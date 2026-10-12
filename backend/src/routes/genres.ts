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


router.get('/:id/movies',async (req,res) => {
    const genreId = Number(req.params.id)

    if(!Number.isInteger(genreId) || genreId <= 0 ){
        res.status(400).json({error: 'Ogiltigt genreId'})
        return
    }

    try{
        const [rows] = await db.query(`
                SELECT m.*
                FROM movies m
                INNER JOIN movie_genre mg ON m.movieId = mg.movieId
                WHERE mg.genreId = ?
                ORDER BY m.title
            `,
            [genreId]
        )

        res.json(rows)
    } catch(error){
        console.error('Kunde inte hämta filmer för genrer:', error)
        res.status(500).json({error: 'Kunde inte hämta filmer för genren'})
    }
})


export default router