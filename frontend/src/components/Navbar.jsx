import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/dashboard", label: "Discover" },
  { to: "/matches", label: "Matches" },
  { to: "/profile", label: "Profile" },
];

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm px-4 py-3 flex justify-between items-center relative z-50">
      {/* Logo */}
      <Link to="/dashboard" className="text-lg font-bold text-rose-500">
        💘 Collexa
      </Link>

      {/* Nav links — always visible */}
      <div className="flex gap-4 sm:gap-6 text-sm font-medium text-gray-600">
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`hover:text-rose-500 transition-colors ${
              pathname === to ? "text-rose-500 font-semibold" : ""
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Desktop: blocked + logout */}
      <div className="hidden sm:flex items-center gap-4">
        <Link
          to="/blocked"
          className={`text-sm font-medium hover:text-rose-500 transition-colors ${
            pathname === "/blocked" ? "text-rose-500 font-semibold" : "text-gray-600"
          }`}
        >
          Blocked
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-gray-600 hover:text-rose-500 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Mobile: hamburger for logout */}
      <div className="sm:hidden relative">
        <button
          className="text-gray-600 text-lg focus:outline-none"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? "✕" : "☰"}
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 bg-white shadow-md rounded-md w-36">
            <Link
              to="/blocked"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-rose-500 border-b border-gray-100"
            >
              Blocked Users
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm font-medium text-rose-500 hover:text-rose-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
