import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import StreamDropdown from "../components/StreamDropdown";
import YearDropdown from "../components/YearDropdown";
import InstituteDropdown from "../components/InstituteDropdown";

const STREAMS = ["CSE","IT","AI","DSE","ECE","EEE","EE","ME","CE","CHE","VLSI","PED","EP","AE","BME","BT","MET","PHYSICS","CHEMISTRY","BIO","MATH"];

const EditProfile = () => {
  const [form, setForm] = useState({ name: "", age: "", college: "", course: "", branch: "", year: "", bio: "", interests: "" });
  const [photos, setPhotos] = useState([]);
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/profile/me").then(({ data }) => {
      if (data.profile) {
        setExisting(data.profile);
        setForm({
          name: data.profile.name,
          age: data.profile.age,
          college: data.profile.college || "",
          course: data.profile.course || "",
          branch: data.profile.branch,
          year: data.profile.year,
          bio: data.profile.bio,
          interests: data.profile.interests.join(", "),
        });
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "interests") fd.append(k, JSON.stringify(v.split(",").map((i) => i.trim()).filter(Boolean)));
        else fd.append(k, v);
      });
      photos.forEach((p) => fd.append("photos", p));

      if (existing) {
        await api.put("/profile/update", fd);
        toast.success("Profile updated!");
      } else {
        await api.post("/profile/create", fd);
        toast.success("Profile created!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{existing ? "Edit Profile" : "Create Profile"}</h2>

        {existing?.profilePhotos?.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {existing.profilePhotos.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} className="w-20 h-20 rounded-xl object-cover" alt="photo" />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const { data } = await api.delete("/profile/photo", { data: { url } });
                      setExisting(data.profile);
                      toast.success("Photo removed");
                    } catch {
                      toast.error("Failed to remove photo");
                    }
                  }}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[["name", "Name"], ["age", "Age", "number"], ["course", "Course Name"], ["bio", "Bio"]].map(([key, label, type = "text"]) => (
            <input
              key={key}
              type={type}
              placeholder={label}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={key !== "bio"}
            />
          ))}

          <InstituteDropdown value={form.college} onChange={(v) => setForm({ ...form, college: v })} placeholder="Select Institute" required />
          <StreamDropdown value={form.branch} onChange={(v) => setForm({ ...form, branch: v })} placeholder="Select Stream" required />
          <YearDropdown value={form.year} onChange={(v) => setForm({ ...form, year: v })} required />
          <input
            type="text"
            placeholder="Interests (comma separated)"
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
            value={form.interests}
            onChange={(e) => setForm({ ...form, interests: e.target.value })}
          />

          <label className="w-full border rounded-xl px-4 py-3 flex items-center gap-2 cursor-pointer hover:border-rose-300 transition text-gray-500 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="truncate">
              {photos.length > 0 ? photos.map((f) => f.name).join(", ") : "Upload Images"}
            </span>
            <input type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => setPhotos([...e.target.files])} />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 text-white py-3 rounded-xl font-semibold hover:bg-rose-600 disabled:opacity-50 transition"
          >
            {loading ? "Saving..." : existing ? "Update Profile" : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
