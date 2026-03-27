import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <Link to="/dashboard" className="text-2xl font-bold text-rose-500">💘 Collexa</Link>
      <div className="flex gap-4 text-sm font-medium text-gray-600">
        <Link to="/dashboard" className="hover:text-rose-500">Discover</Link>
        <Link to="/matches" className="hover:text-rose-500">Matches</Link>
        <Link to="/profile" className="hover:text-rose-500">Profile</Link>
        <button onClick={handleLogout} className="hover:text-rose-500">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
