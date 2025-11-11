import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { AUTH } from "../api/endpoints";
import useFormValidation from "../hooks/useFormValidation";
import { registerSchema } from "../validators/authSchema";

export default function AddAdmin() {
  const navigate = useNavigate();
  const { errors, validate } = useFormValidation(registerSchema);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(form)) return;

    try {
      setLoading(true);
      await api.post(AUTH.ADMIN_SIGNUP, form);
      toast.success("New admin account created successfully! 👨‍💼");
      // Reset form
      setForm({ name: "", email: "", password: "" });
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Add admin error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create admin account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Add New Admin</h1>
          <p className="text-gray-600">Create a new administrator account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter admin name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
            {errors?.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
            {errors?.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter secure password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
            {errors?.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Password must be at least 6 characters long
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-yellow-600 text-xl mr-3">⚠️</div>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">Important</h4>
                <p className="text-sm text-yellow-700">
                  This will create a new administrator account with full access to the system. 
                  Make sure to share the credentials securely with the new admin.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Creating..." : "Create Admin Account"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
