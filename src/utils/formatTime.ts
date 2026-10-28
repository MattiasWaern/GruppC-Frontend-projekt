import type { Movie } from "../types/movie";



export default function formatTime(movie: Movie){
    if (!movie || !movie.duration_minutes) return "";

    const hours = Math.floor(movie.duration_minutes / 60);
    const minutes = movie.duration_minutes % 60; 

    return `${hours} timmar och ${minutes}`;
}