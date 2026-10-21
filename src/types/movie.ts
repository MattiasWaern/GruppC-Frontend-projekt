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
}