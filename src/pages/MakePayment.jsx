import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { DRIVER } from "../api/endpoints";
import useFormValidation from "../hooks/useFormValidation";
import { paymentSchema } from "../validators/paymentSchema";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MakePayment() {
  const navigate = useNavigate();
  const { errors, validate } = useFormValidation(paymentSchema);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({
    reservationId: "",
    paymentMethod: "credit_card",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await api.get(DRIVER.RESERVATIONS);
      // Filter unpaid and active reservations only
      const unpaid = (res.data.reservations || []).filter(
        (r) => r.paymentStatus === "pending" && r.status === "Active"
      );
      setReservations(unpaid);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(form)) return;

    if (!selectedReservation) {
      toast.error("Please select a reservation first");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(DRIVER.PAY, {
        reservationId: form.reservationId,
        method: form.paymentMethod,
        amount: selectedReservation.totalAmount || 0,
      });
      toast.success(
        `Payment successful! Amount: $${res.data.payment.amount?.toFixed(2)} 💳`,
        { duration: 4000 }
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Error making payment:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to process payment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedReservation = reservations.find(
    (r) => r._id === form.reservationId
  );

  if (loading) return <LoadingSpinner />;

  if (reservations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow text-center">
          <h1 className="text-3xl font-bold mb-4">Make Payment</h1>
          <p className="text-gray-600 mb-6">
            You have no pending payments at this time.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Make Payment</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Reservation *
            </label>
            <select
              name="reservationId"
              value={form.reservationId}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a reservation --</option>
              {reservations.map((reservation) => (
                <option key={reservation._id} value={reservation._id}>
                  Slot {reservation.slot?.slotNumber || "N/A"} -{" "}
                  {new Date(reservation.startTime).toLocaleDateString()} - $
                  {reservation.totalAmount?.toFixed(2) || "0.00"}
                </option>
              ))}
            </select>
            {errors.reservationId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.reservationId}
              </p>
            )}
          </div>

          {selectedReservation && (
            <div className="bg-gray-50 p-4 rounded border">
              <h3 className="font-semibold mb-2">Reservation Details</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Slot:</span>{" "}
                  {selectedReservation.slot?.slotNumber}
                </p>
                <p>
                  <span className="font-medium">Start Time:</span>{" "}
                  {new Date(selectedReservation.startTime).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {selectedReservation.status}
                </p>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  Total Amount: $
                  {selectedReservation.totalAmount?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Method *
            </label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="wallet">Wallet</option>
            </select>
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1">
                {errors.paymentMethod}
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting || !form.reservationId}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition disabled:bg-gray-400"
            >
              {submitting ? "Processing..." : "Make Payment"}
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
