import { useEffect, useState } from "react";
import {Link, useParams} from "react-router-dom";
import type { Movie } from '../types/movie';
import '../styles/detaljsSida.css';


export function MovieDetailsPage(){
    const { id } = useParams <{id: string}>();


    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
}