import { useEffect, useState } from "react";
import {Link, useParams} from "react-router-dom";
import type { Movie } from '../types/movie';
import '../styles/detaljsSida.css';


export function MovieDetailsPage(){
    const { id } = useParams <{id: string}>();


    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const controller = new AbortController();


        async function fetchMovie(){
            try{
                setLoading(true);
                setError("");

                const response = await fetch(`api/movies/${id}`, {
                    signal: controller.signal,
                });

                if(!response.ok){
                    throw new Error(
                        response.status === 400
                        ? "Filmen hittades inte"
                        : "Kunde inte hämta filmen"
                    );
                }

                const data: Movie = await response.json();
                setMovie(data);
            } catch(error){
                if (error instanceof Error && error.name !== "AbortError"){
                    setError(error.message);
                }
            } finally{
                if (!controller.signal.aborted){
                    setLoading(false);
                }
            }
        }

        fetchMovie();

        return() => controller.abort();
    }, [id]);
}