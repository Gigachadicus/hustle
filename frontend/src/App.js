import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Exercise from "./Exercise.js";
import Homepage from "./Homepage.js";
import Login from "./Login.js";
import NoPage from "./Nopage.js";
import PlaylistBuilder from "./Playlistbuilder.js";
// import Subscription from "./Subscription.js"; // You'll need to create this component

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/exercise" element={<Exercise />} />
        <Route path="/playlistbuilder" element={<PlaylistBuilder />} />
        {/* <Route path="/subscription" element={<Subscription />} /> */}
        <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);