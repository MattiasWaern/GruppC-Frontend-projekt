export interface Movie {
  movieId: number;
  title: string;
  description: string;
  duration_minutes: number;
  trailer: string | null;
  poster: string | null;
  background_color: string | null;
  age_limit: number;
  genres: string[];
}