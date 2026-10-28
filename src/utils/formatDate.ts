import type { Movie } from "../types/movie";



export default function formatTime(movie: Movie){
    if (!movie) return;

    const formattedTime = (movie.duration_minutes / 60);

    return formattedTime;
}