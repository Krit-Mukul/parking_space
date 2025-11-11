import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { DRIVER } from "../api/endpoints";
import useFormValidation from "../hooks/useFormValidation";
import { vehicleSchema } from "../validators/vehicleSchema";

export default function RegisterVehicle() {
  const navigate = useNavigate();
  const { errors, validate } = useFormValidation(vehicleSchema);
  const [form, setForm] = useState({
    number: "",
    model: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(form)) return;

    try {
      setSubmitting(true);
      await api.post(DRIVER.VEHICLES, form);
      toast.success("Vehicle registered successfully! 🚗");
      navigate("/reserve-spot");
    } catch (error) {
      console.error("Error registering vehicle:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to register vehicle. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Register Vehicle</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Vehicle Number *
            </label>
            <input
              type="text"
              name="number"
              value={form.number}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., ABC-1234 or MH01AB1234"
            />
            {errors.number && (
              <p className="text-red-500 text-sm mt-1">{errors.number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Model (Optional)</label>
            <input
              type="text"
              name="model"
              value={form.model}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Honda City, Toyota Fortuner"
            />
            {errors.model && (
              <p className="text-red-500 text-sm mt-1">{errors.model}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {submitting ? "Registering..." : "Register Vehicle"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
