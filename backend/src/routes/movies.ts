import { Router } from "express";
import db from "../db.js";


const router = Router();


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
    }
})




export default router