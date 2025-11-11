import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { DRIVER } from "../api/endpoints";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, reservationsRes] = await Promise.all([
        api.get(DRIVER.VEHICLES),
        api.get(DRIVER.RESERVATIONS),
      ]);
      setVehicles(vehiclesRes.data.vehicles || []);
      setReservations(reservationsRes.data.reservations || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      await api.delete(DRIVER.CANCEL_RESERVATION(reservationId));
      alert("Reservation cancelled successfully");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      alert(
        error.response?.data?.error ||
          "Failed to cancel reservation. Please try again."
      );
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Driver Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => navigate("/register-vehicle")}
          className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition"
        >
          <h3 className="text-xl font-semibold">Register Vehicle</h3>
          <p className="mt-2">Add a new vehicle to your account</p>
        </button>

        <button
          onClick={() => navigate("/reserve-spot")}
          className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition"
        >
          <h3 className="text-xl font-semibold">Reserve Spot</h3>
          <p className="mt-2">Book a parking spot</p>
        </button>

        <button
          onClick={() => navigate("/make-payment")}
          className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition"
        >
          <h3 className="text-xl font-semibold">Make Payment</h3>
          <p className="mt-2">Pay for your reservations</p>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">My Vehicles</h2>
          {vehicles.length === 0 ? (
            <p className="text-gray-500">No vehicles registered yet</p>
          ) : (
            <ul className="space-y-3">
              {vehicles.map((vehicle) => (
                <li
                  key={vehicle._id}
                  className="border p-3 rounded hover:bg-gray-50"
                >
                  <div className="font-semibold">{vehicle.number}</div>
                  {vehicle.model && (
                    <div className="text-sm text-gray-600">{vehicle.model}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">My Reservations</h2>
          {reservations.filter(r => r.status !== 'Cancelled').length === 0 ? (
            <p className="text-gray-500">No active reservations</p>
          ) : (
            <ul className="space-y-3">
              {reservations
                .filter(r => r.status !== 'Cancelled')
                .map((reservation) => (
                <li
                  key={reservation._id}
                  className="border p-3 rounded hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">
                        ID: <span className="font-mono">{reservation._id}</span>
                      </div>
                      <div className="font-semibold">
                        Slot: {reservation.slot?.slotNumber || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Vehicle: {reservation.vehicle?.number || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Start: {new Date(reservation.startAt).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        End: {new Date(reservation.endAt).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Duration: {reservation.duration || 0} hour(s)
                      </div>
                      <div className="text-sm text-gray-600">
                        Status:{" "}
                        <span
                          className={`font-semibold ${
                            reservation.status === "Active"
                              ? "text-green-600"
                              : reservation.status === "Cancelled"
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {reservation.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Payment:{" "}
                        <span
                          className={`font-semibold ${
                            reservation.paymentStatus === "paid"
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {reservation.paymentStatus === "paid" ? "Paid" : "Pending"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold text-blue-600 mb-2">
                        ${reservation.totalAmount?.toFixed(2) || "0.00"}
                      </div>
                      {reservation.status === "Active" && (
                        <button
                          onClick={() => handleCancelReservation(reservation._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
