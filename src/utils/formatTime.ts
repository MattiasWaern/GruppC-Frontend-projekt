import type { Movie } from "../types/movie";

export default function formatTime(movie: Movie){
    if (!movie || !movie.duration_minutes) return "";

    const hours = Math.floor(movie.duration_minutes / 60);
    const minutes = movie.duration_minutes % 60; 


    const formatted = hours > 1
        ? `${hours} timmar och ${minutes} minuter`
        : `${hours} timme och ${minutes} minuter`;

    return formatted;
}