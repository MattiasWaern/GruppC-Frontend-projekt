export interface Movie {
  movieId: number;
  title: string;
  description: string;
  duration_minutes: number;
  trailer: string;
  poster: string;
  background_color: string;
  age_limit: number;
  genres: string[];

  director: string | null;
  actors: string | null;
  original_title: string | null;
  original_language: string | null;
  premiere: string | null;
}