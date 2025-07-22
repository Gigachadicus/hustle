import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Exercise from "./Exercise.js";
import Homepage from "./HomePage.js";
import Login from "./Login.js";
import NoPage from "./Nopage.js";
import PlaylistBuilder from "./Playlistbuilder.js";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />}>
          <Route path="/login" element={<Login  />} />
          <Route path="/exercise" element={<Exercise />} />
          <Route path="*" element={<NoPage />} />
          <Route path="/playlistbuilder" element={<PlaylistBuilder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);