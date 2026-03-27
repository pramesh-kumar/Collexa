import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/signup", form);
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
      await api.post("/auth/verify-otp", { email: form.email, otp });
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
            <input
              type="email"
              placeholder="Email (iitmandi.ac.in)"
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 text-white py-3 rounded-xl font-semibold hover:bg-rose-600 disabled:opacity-50 transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-gray-500 text-center">OTP sent to <b>{form.email}</b></p>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full border rounded-xl px-4 py-3 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-300"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 text-white py-3 rounded-xl font-semibold hover:bg-rose-600 disabled:opacity-50 transition"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-rose-500 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
