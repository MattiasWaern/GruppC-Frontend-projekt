import { Router } from "express";
import type { RowDataPacket } from "mysql2";
import db from "../db.js";
import { Movie } from "../types/movie.js";

const router = Router();

// Hämta alla filmer med deras genrer
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query<Movie[]>(`
      SELECT
        m.*,
        COALESCE(
          JSON_ARRAYAGG(g.name),
          JSON_ARRAY()
        ) AS genres
      FROM movies m
      LEFT JOIN movie_genre mg
        ON m.movieId = mg.movieId
      LEFT JOIN genre g
        ON mg.genreId = g.genreId
      GROUP BY m.movieId
      ORDER BY m.title
    `);

    const movies = rows.map((movie) => ({
      ...movie,
      genres: movie.genres
        ? movie.genres.filter(
            (genre): genre is string => genre !== null
          )
        : [],
    }));

    res.json(movies);
  } catch (error) {
    console.error("Kunde inte hämta filmer:", error);

    res.status(500).json({
      error: "Kunde inte hämta filmer",
    });
  }
});

// Hämta en film med dess genrer
router.get("/:id", async (req, res) => {
  const movieId = Number(req.params.id);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    res.status(400).json({
      error: "Ogiltigt film-ID",
    });
    return;
  }

  try {
    const [rows] = await db.query<Movie[]>(
      `
        SELECT
          m.*,
          COALESCE(
            JSON_ARRAYAGG(g.name),
            JSON_ARRAY()
          ) AS genres
        FROM movies m
        LEFT JOIN movie_genre mg
          ON m.movieId = mg.movieId
        LEFT JOIN genre g
          ON mg.genreId = g.genreId
        WHERE m.movieId = ?
        GROUP BY m.movieId
      `,
      [movieId]
    );

    if (rows.length === 0) {
      res.status(404).json({
        error: "Filmen hittades inte",
      });
      return;
    }

    const movie = rows[0];

    res.json({
      ...movie,
      genres: movie.genres
        ? movie.genres.filter(
            (genre): genre is string => genre !== null
          )
        : [],
    });
  } catch (error) {
    console.error("Kunde inte hämta filmen:", error);

    res.status(500).json({
      error: "Kunde inte hämta filmen",
    });
  }
});

export default router;
