import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
