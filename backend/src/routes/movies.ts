
import { Router } from "express";
import db from "../db.js";
import { Movie } from "../types/movie.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

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

// Lägg till en ny film med genrer
// Endast Admin och Product Owner
router.post("/", requireAdmin, async (req, res) => {
  const {
    title,
    description,
    duration_minutes,
    trailer,
    poster,
    background_color,
    age_limit,
    genreIds,
    director,
    actors,
    original_title,
    original_language,
    premiere,
  } = req.body;


  
  // Kontrollera obligatoriska uppgifter
  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof description !== "string" ||
    !description.trim() ||
    !Number.isInteger(duration_minutes) ||
    duration_minutes <= 0 ||
    typeof background_color !== "string" ||
    !background_color.trim() ||
    !Number.isInteger(age_limit) ||
    age_limit < 0 ||
    !Array.isArray(genreIds) ||
    genreIds.length === 0 ||
    !genreIds.every(
      (id: unknown) =>
        Number.isInteger(id) && (id as number) > 0
    )
  ) {
    res.status(400).json({
      error: "Kontrollera filmens uppgifter och välj minst en genre.",
    });
    return;
  }

  const optionalTextFields = [
    director,
    actors,
    original_title,
    original_language,
  ];

  if (
    optionalTextFields.some(
      (field) =>
        field !== undefined &&
        field !== null &&
        typeof field !== "string"
    )
  ) {
    res.status(400).json({
      error: "Filmuppgifterna måste vara text eller null.",
    });
    return;
  }

  // Kontrollera valfria URL-fält
  if (
    (trailer !== undefined &&
      trailer !== null &&
      typeof trailer !== "string") ||
    (poster !== undefined &&
      poster !== null &&
      typeof poster !== "string")
  ) {
    res.status(400).json({
      error: "Trailer och poster måste vara text eller null.",
    });
    return;
  }

  if (
    premiere !== undefined &&
    premiere !== null &&
    premiere !== "" &&
    (typeof premiere !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(premiere))
  ) {
    res.status(400).json({
      error: "Premiärdatum måste anges i formatet ÅÅÅÅ-MM-DD",
    });
    return;
  }

  let connection;

  try {
    connection = await db.getConnection();

    // Starta databastransaktion
    await connection.beginTransaction();

    // Ta bort eventuella dubbla genre-ID:n
    const uniqueGenreIds = [...new Set(genreIds)] as number[];

    // Kontrollera att alla valda genrer finns
    const [genres] = await connection.query<any[]>(
      `SELECT genreId FROM genre WHERE genreId IN (?)`,
      [uniqueGenreIds]
    );

    if (genres.length !== uniqueGenreIds.length) {
      await connection.rollback();

      res.status(400).json({
        error: "En eller flera valda genrer finns inte.",
      });
      return;
    }

    // Skapa filmen
    const [result] = await connection.query<any>(
      `INSERT INTO movies
        (
          title,
          description,
          duration_minutes,
          trailer,
          poster,
          background_color,
          age_limit,
          director,
          actors,
          original_title,
          original_language,
          premiere
        )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description.trim(),
        duration_minutes,
        trailer || null,
        poster || null,
        background_color.trim(),
        age_limit,
        director?.trim() || null,
        actors?.trim() || null,
        original_title?.trim() || null,
        original_language?.trim() || null,
        premiere || null,
      ]
    );

    const movieId = result.insertId;

    // Koppla filmen till valda genrer
    const genreValues = uniqueGenreIds.map((genreId) => [
      movieId,
      genreId,
    ]);

    await connection.query(
      `INSERT INTO movie_genre (movieId, genreId) VALUES ?`,
      [genreValues]
    );

    // Spara allt tillsammans
    await connection.commit();

    res.status(201).json({
      message: "Filmen har lagts till!",
      movieId,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Kunde inte lägga till film:", error);

    res.status(500).json({
      error: "Kunde inte lägga till filmen.",
    });
  } finally {
    connection?.release();
  }
});

export default router;
