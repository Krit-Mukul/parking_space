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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredVehicle, setRegisteredVehicle] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validateVehicleNumber = (value) => {
    const regex = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;
    return regex.test(value);
  };

  const handleNumberBlur = () => {
    if (form.number && !validateVehicleNumber(form.number)) {
      toast.error('❌ Invalid format! Use AA00A0000 or AA00AA0000 (e.g., MH12AB1234)', {
        duration: 4000,
      });
    } else if (form.number && validateVehicleNumber(form.number)) {
      toast.success('✅ Valid vehicle number format!', {
        duration: 2000,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(form)) return;

    try {
      setSubmitting(true);
      await api.post(DRIVER.VEHICLES, form);
      toast.success("Vehicle registered successfully! 🚗");
      setRegisteredVehicle(form.number);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error registering vehicle:", error);
      
      // Check if vehicle already exists
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "";
      
      if (errorMessage.toLowerCase().includes("already registered") || 
          errorMessage.toLowerCase().includes("already exists") ||
          errorMessage.toLowerCase().includes("duplicate") ||
          error.response?.status === 409) {
        toast.error("⚠️ Vehicle already registered! This vehicle number is already in the system.", {
          duration: 4000,
        });
      } else {
        toast.error(
          errorMessage || "Failed to register vehicle. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReserveSpot = () => {
    setShowSuccessModal(false);
    navigate("/reserve-spot");
  };

  const handleGoToDashboard = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
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
              onChange={(e) => {
                // Convert to uppercase automatically
                const value = e.target.value.toUpperCase();
                handleChange({ target: { name: 'number', value } });
              }}
              onBlur={handleNumberBlur}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="e.g., MH12AB1234 or DL01A1234"
              maxLength="12"
            />
            {errors.number && (
              <p className="text-red-500 text-sm mt-1">{errors.number}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Format: AA00A0000 or AA00AA0000 (e.g., MH12AB1234, DL01A1234)
            </p>
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 backdrop-contrast-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Vehicle Registered Successfully!
                </h3>
                <p className="text-sm text-gray-600">
                  {registeredVehicle}
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Would you like to reserve a parking spot now?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleReserveSpot}
                className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition font-medium"
              >
                Reserve Spot
              </button>
              <button
                onClick={handleGoToDashboard}
                className="flex-1 bg-gray-300 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
