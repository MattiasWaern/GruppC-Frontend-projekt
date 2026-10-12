import { Router } from "express";
import db from "../db.js";


const router = Router();

// Hämta alla filmer med deras genrer
router.get('/', async (_req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
            m.*,
            GROUP_CONCAT(g.name ORDER BY g.name SEPARATOR ',') AS genres
            FROM movies m
            LEFT JOIN movie_genre mg ON m.movieId = mg.movieID
            LEFT JOIN genre g ON mg.genreId = g.genreId
            GROUP BY m.movieId
            ORDER BY m.title
            `)

            res.json(rows)
    } catch(error){
        console.error('Kunde inte hämta fimer:', error)
        res.status(500).json({ error: 'Kunde inte hämta filmer'})
    }
})

// Hämta en film med dess genrer
router.get('/:id', async(req, res) => {
    const movieId = Number(req.params.id)

    if (!Number.isInteger(movieId) ||movieId <= 0){
        res.status(400).json({error: 'Ogiltigt film-ID'})
        return
    }


    try{
        const [rows] = await db.query(`
           SELECT 
           m.*,
           GROUP_CONCAT(g.name ORDER BY g.name SEPERATOR '.') AS genres
           FROM movies m
           LEFT JOIN movie_genre mg ON m.movieId = mg.movieId
           LEFT JOIN genre g ON mg.genreId = g.genreId
           WHERE m.movieId = ?
           GROUP BY m.movieId
            `,
            [movieId],
        )

        const movies = rows as Record<string, unknown>[]

        if(movies.length === 0 ) {
            res.status(404).json({error: 'Filmen hittades inte'})
            return
        }

        res.json(movies[0])


    } catch(error){
        console.error('Kunde inte jämta filmen:', error)
        res.status(500).json({error: 'Kunde inte hämta filmen'})
    }
})

export default router