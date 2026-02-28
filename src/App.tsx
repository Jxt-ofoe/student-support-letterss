import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Read from "./pages/Read";
import Write from "./pages/Write";
import Support from "./pages/Support";
import About from "./pages/About";
import Admin from "./pages/Admin";
import { ThemeProvider } from "./context/ThemeContext";
import { useEffect } from "react";
import { nanoid } from "nanoid";

export default function App() {
  useEffect(() => {
    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      visitorId = nanoid();
      localStorage.setItem("visitor_id", visitorId);
    }

    fetch("/api/visitors/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId }),
    }).catch(err => console.error("Failed to record visit:", err));
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-soft-beige dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/read" element={<Read />} />
              <Route path="/write" element={<Write />} />
              <Route path="/support" element={<Support />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}
