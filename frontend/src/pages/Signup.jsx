import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import StreamDropdown from "../components/StreamDropdown";
import YearDropdown from "../components/YearDropdown";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", password: "", name: "", course: "", branch: "", year: "", age: "" });
  const [otp, setOtp] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!agreed) { toast.error("Please accept the Terms & Conditions"); return; }
    setLoading(true);
    try {
      await api.post("/auth/signup", { email: form.email, password: form.password });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", {
        email: form.email, otp,
        name: form.name, course: form.course, branch: form.branch, year: form.year, age: form.age,
      });
      toast.success("Email verified! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-rose-500 text-center mb-2">💘 Collexa</h1>
        <p className="text-center text-gray-500 mb-6">
          {step === 1 ? "Create your account" : "Verify your email"}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name */}
            <input type="text" placeholder="Full Name" required
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={form.name} onChange={(e) => set("name", e.target.value)} />

            {/* Email */}
            <input type="email" placeholder="Email (iitmandi.ac.in)" required
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={form.email} onChange={(e) => set("email", e.target.value)} />

            {/* Password */}
            <input type="password" placeholder="Password" required
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={form.password} onChange={(e) => set("password", e.target.value)} />

            {/* Course */}
            <input type="text" placeholder="Course Name (e.g. B.Tech)"
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={form.course} onChange={(e) => set("course", e.target.value)} />

            {/* Stream */}
            <StreamDropdown value={form.branch} onChange={(v) => set("branch", v)} placeholder="Stream" required />

            {/* Year + Age */}
            <div className="flex gap-3">
              <div className="flex-1">
                <YearDropdown value={form.year} onChange={(v) => set("year", v)} required />
              </div>
              <input type="number" placeholder="Age" min={16} max={40} required
                className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                value={form.age} onChange={(e) => set("age", e.target.value)} />
            </div>

            {/* T&C */}
            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 accent-rose-500 w-4 h-4 shrink-0" />
              <label htmlFor="terms" className="text-sm text-gray-500">
                I agree to the{" "}
                <button type="button" onClick={() => setShowTerms(true)}
                  className="text-rose-500 font-medium hover:underline">
                  Terms & Conditions
                </button>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-rose-500 text-white py-3 rounded-xl font-semibold hover:bg-rose-600 disabled:opacity-50 transition">
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-gray-500 text-center">OTP sent to <b>{form.email}</b></p>
            <input type="text" placeholder="Enter 6-digit OTP" maxLength={6} required
              className="w-full border rounded-xl px-4 py-3 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={otp} onChange={(e) => setOtp(e.target.value)} />
            <button type="submit" disabled={loading}
              className="w-full bg-rose-500 text-white py-3 rounded-xl font-semibold hover:bg-rose-600 disabled:opacity-50 transition">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-rose-500 font-medium hover:underline">Login</Link>
        </p>
      </div>

      {/* T&C Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTerms(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Terms & Conditions</h2>
            <div className="text-sm text-gray-600 space-y-3">
              <p><b>1. Eligibility</b> — Collexa is exclusively for IIT students with a valid <i>iitmandi.ac.in</i> email address.</p>
              <p><b>2. Respectful Conduct</b> — Users must treat others with respect. Harassment, abuse, or inappropriate content is strictly prohibited.</p>
              <p><b>3. Authentic Information</b> — You agree to provide accurate and truthful information in your profile.</p>
              <p><b>4. Privacy</b> — Your data is used solely to operate the platform. We do not share your personal information with third parties.</p>
              <p><b>5. Content</b> — You are responsible for all content you share. Offensive, explicit, or harmful content will result in account termination.</p>
              <p><b>6. Account Security</b> — Keep your credentials secure. You are responsible for all activity under your account.</p>
              <p><b>7. Termination</b> — We reserve the right to suspend or terminate accounts that violate these terms.</p>
            </div>
            <button onClick={() => { setAgreed(true); setShowTerms(false); }}
              className="w-full mt-6 bg-rose-500 text-white py-2.5 rounded-xl font-semibold hover:bg-rose-600 transition">
              I Agree
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
