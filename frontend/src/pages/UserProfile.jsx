import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import Navbar from "../components/Navbar";

const UserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/users/profile/${userId}`)
      .then(({ data }) => setProfile(data.profile))
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-400">Loading...</div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-500">Profile not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto p-4">
        <button onClick={() => navigate(-1)} className="text-xs text-rose-500 hover:text-rose-600 mt-1 font-medium">
          ← Back
        </button>

        <div className="bg-white rounded-3xl shadow-md overflow-hidden">
          <img
            src={profile.profilePhotos?.[0] || `https://ui-avatars.com/api/?name=${profile.name}&size=400&background=fda4af&color=fff`}
            className="w-full h-72 object-cover"
            alt={profile.name}
          />

          {profile.profilePhotos?.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {profile.profilePhotos.slice(1).map((url, i) => (
                <img key={i} src={url} className="w-20 h-20 rounded-xl object-cover shrink-0" alt="" />
              ))}
            </div>
          )}

          <div className="p-5 space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{profile.name}, {profile.age}</h2>
              <p className="text-rose-500 font-medium">
                {profile.college} • {profile.branch}
                {profile.gender === "Male" ? <span className="ml-1">• M</span> : profile.gender === "Female" ? <span className="ml-1">• F</span> : ""}
              </p>
              <p className="text-gray-400 text-sm">{profile.course} • Year {profile.year}</p>
            </div>

            {profile.bio && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Bio</p>
                <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>
              </div>
            )}

            {profile.interests?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((i) => (
                    <span key={i} className="bg-rose-50 text-rose-500 text-xs px-3 py-1 rounded-full">{i}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate(`/chat/${userId}`)}
          className="w-full mt-4 bg-rose-500 text-white py-3 rounded-2xl font-semibold hover:bg-rose-600 transition"
        >
          💬 Send Message
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
