import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import Navbar from "../components/Navbar";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/profile/me")
      .then(({ data }) => setProfile(data.profile))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="text-center py-20 text-gray-400">Loading...</div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-md mx-auto p-6 text-center py-20">
        <p className="text-gray-500 mb-4">No profile yet.</p>
        <button onClick={() => navigate("/profile/edit")}
          className="bg-rose-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-rose-600 transition">
          Create Profile
        </button>
      </div>
    </div>
  );

  const handleReplaceCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      // Delete old cover first
      if (profile.profilePhotos?.[0]) {
        await api.delete("/profile/photo", { data: { url: profile.profilePhotos[0] } });
      }
      // Upload new cover
      const fd = new FormData();
      fd.append("photos", file);
      const { data } = await api.put("/profile/update", fd);
      // Move new photo to front
      const photos = data.profile.profilePhotos;
      const newCover = photos[photos.length - 1];
      const rest = photos.slice(0, photos.length - 1);
      data.profile.profilePhotos = [newCover, ...rest];
      setProfile(data.profile);
      toast.success("Cover photo updated!");
    } catch {
      toast.error("Failed to update cover photo");
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto p-4">

        <div className="bg-white rounded-3xl shadow-md overflow-hidden">
          {/* Cover photo */}
          <div className="relative">
            <img
              src={profile.profilePhotos?.[0] || `https://ui-avatars.com/api/?name=${profile.name}&size=400&background=fda4af&color=fff`}
              className="w-full h-72 object-cover"
              alt={profile.name}
            />
            {/* Edit button overlay */}
            <button
              onClick={() => coverInputRef.current.click()}
              disabled={coverUploading}
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow hover:bg-white transition disabled:opacity-60"
            >
              {coverUploading ? (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                </svg>
              )}
              {coverUploading ? "Uploading..." : "Edit"}
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleReplaceCover} />
          </div>

          {/* Extra photos */}
          {profile.profilePhotos?.length > 1 && (
            <div className="flex gap-2 px-4 pt-3 overflow-x-auto">
              {profile.profilePhotos.slice(1).map((url, i) => (
                <img key={i} src={url} className="w-20 h-20 rounded-xl object-cover shrink-0" alt="" />
              ))}
            </div>
          )}

          <div className="p-5 space-y-4">
            {/* Name + age */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{profile.name}, {profile.age}</h2>
              <p className="text-rose-500 font-medium text-sm mt-0.5">
                {profile.college} • {profile.branch}
                {profile.gender === "Male" ? <span className="ml-1">• M</span> : profile.gender === "Female" ? <span className="ml-1">• F</span> : ""}
              </p>
              <p className="text-gray-400 text-sm">{profile.course} • Year {profile.year}</p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Bio</p>
                <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>
              </div>
            )}

            {/* Interests */}
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

        {/* Edit Profile button */}
        <button
          onClick={() => navigate("/profile/edit")}
          className="w-full mt-4 bg-rose-500 text-white py-3 rounded-2xl font-semibold hover:bg-rose-600 transition"
        >
          ✏️ Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
