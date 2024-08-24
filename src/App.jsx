import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Map from "./components/Map";
import Home from "./components/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </Router>
  );
}

export default App;
