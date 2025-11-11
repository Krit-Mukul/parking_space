import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { DRIVER } from "../api/endpoints";
import useFormValidation from "../hooks/useFormValidation";
import { reservationSchema } from "../validators/reservationSchema";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ReserveSpot() {
  const navigate = useNavigate();
  const { errors, validate } = useFormValidation(reservationSchema);
  const [vehicles, setVehicles] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({
    vehicleId: "",
    slotNumber: "",
    startAt: "",
    duration: 1,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, slotsRes] = await Promise.all([
        api.get(DRIVER.VEHICLES),
        api.get(DRIVER.SLOTS),
      ]);
      setVehicles(vehiclesRes.data.vehicles || []);
      setSlots(slotsRes.data.slots || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load parking data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === 'duration' ? parseInt(value) || 1 : value 
    });
  };

  const handleSlotClick = (slot) => {
    if (slot.status === 'Available') {
      setSelectedSlot(slot);
      setForm({ ...form, slotNumber: slot.slotNumber });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(form)) return;

    try {
      setSubmitting(true);
      const res = await api.post(DRIVER.RESERVE, form);
      const totalAmount = res.data.reservation.totalAmount?.toFixed(2) || "0.00";
      
      toast.success(`Reservation confirmed! Total: $${totalAmount}`, {
        duration: 4000,
      });

      // Automatically navigate to payment page
      navigate("/make-payment");
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create reservation. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (vehicles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow text-center">
          <h1 className="text-3xl font-bold mb-4">Reserve Parking Spot</h1>
          <p className="text-gray-600 mb-6">
            You need to register a vehicle before making a reservation.
          </p>
          <button
            onClick={() => navigate("/register-vehicle")}
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
          >
            Register Vehicle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Reserve Parking Spot</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Slot Selection Visual Grid */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Select Parking Slot</h2>
          
          {slots.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No parking slots available. Please contact admin.
            </p>
          ) : (
            <>
              <div className="mb-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-700"></div>
                  <span>Selected</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot._id}
                    type="button"
                    onClick={() => handleSlotClick(slot)}
                    disabled={slot.status !== 'Available'}
                    className={`
                      aspect-square p-4 rounded-lg font-semibold text-white
                      transition-all duration-200 transform hover:scale-105
                      ${
                        selectedSlot?._id === slot._id
                          ? "bg-blue-500 border-4 border-blue-700 shadow-lg"
                          : slot.status === 'Available'
                          ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                          : "bg-red-500 cursor-not-allowed opacity-60"
                      }
                    `}
                  >
                    <div className="text-lg">{slot.slotNumber}</div>
                    <div className="text-xs mt-1 opacity-90">
                      {slot.status}
                    </div>
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Selected Slot Details
                  </h3>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p><span className="font-medium">Slot:</span> {selectedSlot.slotNumber}</p>
                    <p><span className="font-medium">Status:</span> {selectedSlot.status}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Reservation Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Reservation Details</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Vehicle *
            </label>
            <select
              name="vehicleId"
              value={form.vehicleId}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a vehicle --</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.number}
                  {vehicle.model && ` - ${vehicle.model}`}
                </option>
              ))}
            </select>
            {errors.vehicleId && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicleId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Selected Slot
            </label>
            <input
              type="text"
              name="slotNumber"
              value={form.slotNumber}
              readOnly
              className="w-full border p-2 rounded bg-gray-50"
              placeholder="Click a slot on the left"
            />
            {errors.slotNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.slotNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Start Time *
            </label>
            <input
              type="datetime-local"
              name="startAt"
              value={form.startAt}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
            />
            {errors.startAt && (
              <p className="text-red-500 text-sm mt-1">{errors.startAt}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Duration (hours) *
            </label>
            <input
              type="number"
              name="duration"
              min="1"
              max="24"
              value={form.duration}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
            />
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Estimated cost: ${(form.duration * (selectedSlot?.hourlyRate || 5)).toFixed(2)}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {submitting ? "Reserving..." : "Reserve Spot"}
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
    </div>
  );
}
