import { Link, Outlet } from "@tanstack/react-router";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <nav className="nav">
        <Link to="/" className="nav-link" activeOptions={{ exact: true }}>
          Home
        </Link>
        <Link to="/about" className="nav-link">
          About
        </Link>
        <Link to="/dashboard" className="nav-link">
          Dashboard
        </Link>
        <Link to="/contact" className="nav-link">
          Contact
        </Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
