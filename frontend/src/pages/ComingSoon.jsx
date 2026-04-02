import { useNavigate, useLocation } from "react-router-dom";

const ComingSoon = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isGroup = pathname === "/groups";

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center">
        <p className="text-5xl mb-4">{isGroup ? "👥" : "📝"}</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isGroup ? "Create Group" : "Interview Experiences"}
        </h1>
        <p className="text-gray-400 mb-6">This feature is coming soon! 🚀</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-rose-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-rose-600 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
