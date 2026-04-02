import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

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

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      toast("Double Tap To Delete Account", { icon: "⚠️", duration: 4000 });
      setTimeout(() => setDeleteConfirm(false), 4000);
      return;
    }
    try {
      await api.delete("/auth/account");
      logout();
      toast.success("Account deleted");
      navigate("/login");
    } catch {
      toast.error("Failed to delete account");
    }
  };

  const menuItemClass = "w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:text-rose-500 border-b border-gray-100 block";

  return (
    <nav className="bg-white shadow-sm px-4 py-3 flex justify-between items-center relative z-50 sticky top-0">
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
            className={`relative hover:text-rose-500 transition-colors ${
              pathname === to ? "text-rose-500 font-semibold" : ""
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Desktop: Blocked + Logout visible, hamburger for rest */}
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

        {/* Desktop hamburger */}
        <div className="relative">
          <button
            className="text-gray-600 text-lg focus:outline-none"
            onClick={() => setOpen((o) => !o)}
            aria-label="More"
          >
            {open ? "✕" : "☰"}
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white shadow-md rounded-md w-48 z-50">
                <Link to="/groups" onClick={() => setOpen(false)} className={menuItemClass}>
                  Group Chat 👥
                </Link>
                <Link to="/interview" onClick={() => setOpen(false)} className={menuItemClass}>
                  Interview Experiences
                </Link>
                <button
                  onClick={() => { setOpen(false); handleDeleteAccount(); }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:text-red-600"
                >
                  Delete Account
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile hamburger */}
      <div className="sm:hidden relative">
        <button
          className="text-gray-600 text-lg focus:outline-none"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? "✕" : "☰"}
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-1 bg-white shadow-md rounded-md w-48 z-50">
              <Link to="/blocked" onClick={() => setOpen(false)} className={menuItemClass}>
                Blocked Users
              </Link>
              <Link to="/groups" onClick={() => setOpen(false)} className={menuItemClass}>
                Group Chat 👥
              </Link>
              <Link to="/interview" onClick={() => setOpen(false)} className={menuItemClass}>
                Interview Experiences
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm font-medium text-rose-500 hover:text-rose-600 border-b border-gray-100"
              >
                Logout
              </button>
              <button
                onClick={() => { setOpen(false); handleDeleteAccount(); }}
                className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:text-red-600"
              >
                Delete Account
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
