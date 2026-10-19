import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { MovieDetailsPage } from "./pages/detaljsSida";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/movies/:id"
          element={<MovieDetailsPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
