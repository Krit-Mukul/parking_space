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
  const [refreshingSlots, setRefreshingSlots] = useState(false);
  const [vehicleReservations, setVehicleReservations] = useState([]);

  // Calculate min and max datetime for validation
  const getMinDateTime = () => {
    const now = new Date();
    // Round up to next hour for better UX
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  const getMaxDateTime = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7); // 7 days from now
    return maxDate.toISOString().slice(0, 16);
  };

  useEffect(() => {
    fetchVehicles();
    fetchAllReservations();
  }, []);

  // Fetch slots whenever startAt or duration changes
  useEffect(() => {
    if (form.startAt && form.duration) {
      fetchSlots(form.startAt, form.duration);
    }
  }, [form.startAt, form.duration]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const vehiclesRes = await api.get(DRIVER.VEHICLES);
      setVehicles(vehiclesRes.data.vehicles || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to load vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReservations = async () => {
    try {
      const reservationsRes = await api.get(DRIVER.RESERVATIONS);
      // Filter only active reservations
      const activeReservations = (reservationsRes.data.reservations || []).filter(
        r => r.status === 'Active'
      );
      setVehicleReservations(activeReservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const fetchSlots = async (startAt, duration) => {
    try {
      setRefreshingSlots(true);
      // Send the requested time period to get accurate availability
      const params = new URLSearchParams({
        startAt: startAt,
        duration: duration.toString()
      });
      const slotsRes = await api.get(`${DRIVER.SLOTS}?${params}`);
      setSlots(slotsRes.data.slots || []);
      
      // Clear selected slot if it's no longer available
      if (selectedSlot) {
        const updatedSelectedSlot = slotsRes.data.slots.find(
          s => s._id === selectedSlot._id
        );
        if (!updatedSelectedSlot || updatedSelectedSlot.status !== 'Available') {
          setSelectedSlot(null);
          setForm(prev => ({ ...prev, slotNumber: '' }));
          toast.info("Selected slot is not available for this time period", {
            duration: 3000
          });
        }
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Failed to load parking slots. Please try again.");
    } finally {
      setRefreshingSlots(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'duration') {
      // Allow empty string or valid numbers
      const numValue = value === '' ? '' : parseInt(value);
      setForm({ ...form, [name]: numValue });
    } else if (name === 'startAt') {
      // Validate date/time selection
      const selectedDate = new Date(value);
      const now = new Date();
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 7);

      if (selectedDate < now) {
        toast.error('Cannot select a past date and time! ⏰', {
          duration: 3000
        });
        return;
      }

      if (selectedDate > maxDate) {
        toast.error('Can only book up to 7 days in advance! 📅', {
          duration: 3000
        });
        return;
      }

      setForm({ ...form, [name]: value });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSlotClick = (slot) => {
    if (slot.status === 'Available') {
      setSelectedSlot(slot);
      setForm({ ...form, slotNumber: slot.slotNumber });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Additional validation for date/time
    const selectedDate = new Date(form.startAt);
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);

    if (selectedDate < now) {
      toast.error('Cannot book for a past date and time! Please select a future time. ⏰', {
        duration: 4000
      });
      return;
    }

    if (selectedDate > maxDate) {
      toast.error('Can only book up to 7 days in advance! 📅', {
        duration: 4000
      });
      return;
    }
    
    if (!validate(form)) return;

    try {
      setSubmitting(true);
      const res = await api.post(DRIVER.RESERVE, form);
      const totalAmount = res.data.reservation.totalAmount?.toFixed(2) || "0.00";
      
      toast.success(`Reservation confirmed! Total: ₹${totalAmount}`, {
        duration: 4000,
      });

      // Automatically navigate to payment page
      navigate("/make-payment");
    } catch (error) {
      console.error("Error creating reservation:", error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        // Vehicle already has a booking during this time
        toast.error(
          error.response?.data?.message || 
          'This vehicle already has a booking during this time period! 🚗',
          {
            duration: 5000,
            style: {
              background: '#FEE2E2',
              color: '#991B1B',
              border: '2px solid #DC2626'
            }
          }
        );
      } else if (error.response?.status === 400) {
        // Slot conflict
        toast.error(
          error.response?.data?.error || 
          'This parking slot is already reserved for the selected time period! 🚫',
          {
            duration: 4000
          }
        );
      } else {
        // Generic error
        toast.error(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create reservation. Please try again."
        );
      }
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Select Parking Slot</h2>
            {refreshingSlots && (
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Updating...</span>
              </div>
            )}
          </div>
          
          {!form.startAt || !form.duration ? (
            <div className="text-center py-12 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
              <svg className="mx-auto h-12 w-12 text-blue-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-blue-600 font-medium">
                Please select start time and duration first
              </p>
              <p className="text-blue-500 text-sm mt-1">
                Slot availability will be shown based on your selected time
              </p>
            </div>
          ) : slots.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No parking slots available for the selected time period.
            </p>
          ) : (
            <>
              <div className="mb-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-4 bg-green-500 rounded"></div>
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

              <div className="grid grid-cols-5 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot._id}
                    type="button"
                    onClick={() => handleSlotClick(slot)}
                    disabled={slot.status !== 'Available'}
                    className={`
                      aspect-square p-2 rounded-lg font-semibold text-white text-sm
                      transition-all duration-200 transform hover:scale-105
                      ${
                        selectedSlot?._id === slot._id
                          ? "bg-blue-500 border-2 border-blue-700 shadow-lg"
                          : slot.status === 'Available'
                          ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                          : "bg-red-500 cursor-not-allowed opacity-60"
                      }
                    `}
                  >
                    <div className="text-base">{slot.slotNumber}</div>
                    <div className="text-xs mt-0.5 opacity-90">
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
            
            {/* Show existing reservations for selected vehicle */}
            {form.vehicleId && vehicleReservations.length > 0 && (
              (() => {
                const selectedVehicleReservations = vehicleReservations.filter(
                  r => r.vehicle?._id === form.vehicleId || r.vehicle === form.vehicleId
                );
                if (selectedVehicleReservations.length > 0) {
                  return (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-800 mb-1">
                            ⚠️ This vehicle has existing bookings:
                          </p>
                          <ul className="text-xs text-yellow-700 space-y-1">
                            {selectedVehicleReservations.map((res, idx) => (
                              <li key={idx}>
                                <strong>Slot {res.slot?.slotNumber || 'N/A'}:</strong>{' '}
                                {new Date(res.startAt).toLocaleString('en-IN', { 
                                  dateStyle: 'short', 
                                  timeStyle: 'short' 
                                })} - {new Date(res.endAt).toLocaleString('en-IN', { 
                                  dateStyle: 'short', 
                                  timeStyle: 'short' 
                                })}
                              </li>
                            ))}
                          </ul>
                          <p className="text-xs text-yellow-600 mt-2 italic">
                            Make sure your new booking doesn't overlap with these times.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()
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
            <p className="text-xs text-gray-600 mb-2">
              📅 You can book from now up to 7 days in advance
            </p>
            <div className="flex gap-2">
              <input
                type="datetime-local"
                name="startAt"
                value={form.startAt}
                onChange={handleChange}
                min={getMinDateTime()}
                max={getMaxDateTime()}
                className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (form.startAt) {
                    toast.success('Start time confirmed! ⏰', { duration: 2000 });
                  } else {
                    toast.error('Please select a start time first');
                  }
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-medium"
              >
                OK
              </button>
            </div>
            {errors.startAt && (
              <p className="text-red-500 text-sm mt-1">{errors.startAt}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Duration (hours) * <span className="text-xs text-gray-500">(1-24 hours)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="duration"
                min="1"
                max="24"
                value={form.duration}
                onChange={handleChange}
                className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Enter hours (1-24)"
              />
              <button
                type="button"
                onClick={() => {
                  if (form.duration >= 1 && form.duration <= 24) {
                    toast.success(`Duration set to ${form.duration} hour${form.duration > 1 ? 's' : ''}! ⏱️`, { duration: 2000 });
                  } else {
                    toast.error('Please enter a duration between 1-24 hours');
                  }
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-medium"
              >
                OK
              </button>
            </div>
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Estimated cost: ₹{(form.duration * 10).toFixed(2)} (₹10/hour)
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
