import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import useFormValidation from "../hooks/useFormValidation";
import { registerSchema } from "../validators/authSchema";

export default function AdminSignup() {
  const navigate = useNavigate();
  const { signup, login } = useAuth();
  const { errors, validate } = useFormValidation(registerSchema);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePasswordBlur = () => {
    if (form.password) {
      const result = registerSchema.shape.password.safeParse(form.password);
      if (!result.success) {
        const errorMessage = result.error?.issues?.[0]?.message || "Invalid password format";
        toast.error(errorMessage, { duration: 4000 });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(form)) {
      if (errors.password) {
        toast.error(errors.password, { duration: 4000 });
      }
      return;
    }

    try {
      setLoading(true);
      await signup(form, true); // isAdmin = true
      // Automatically log in after signup
      await login(form.email, form.password, true);
      toast.success("Admin registration successful! Welcome! 🎉");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      
      // Check if admin already exists
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "";
      
      if (errorMessage.toLowerCase().includes("already exists") || 
          errorMessage.toLowerCase().includes("already registered") ||
          error.response?.status === 409) {
        toast.error("⚠️ Admin already exists! Please login instead.", {
          duration: 4000,
        });
      } else {
        toast.error(
          errorMessage || "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-4">Admin Sign Up</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                onBlur={handlePasswordBlur}
                className="w-full border p-2 rounded pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Password must be at least 6 characters with 1 number, 1 special character (!@#$%^&*), and 1 letter
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white rounded py-2 hover:bg-purple-700 transition disabled:bg-gray-400"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/admin/login" className="text-purple-600 hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
