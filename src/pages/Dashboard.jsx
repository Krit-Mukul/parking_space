import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import api from "../api/axios";
import { DRIVER } from "../api/endpoints";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, vehicleId: null, vehicleNumber: "" });
  const [cancelModal, setCancelModal] = useState({ show: false, reservationId: null, slotNumber: "" });
  const [qrModal, setQrModal] = useState({ show: false, reservation: null });
  const [showCompleted, setShowCompleted] = useState(false);
  const qrRef = useRef(null);

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
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (vehicleId, vehicleNumber) => {
    setDeleteModal({ show: true, vehicleId, vehicleNumber });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, vehicleId: null, vehicleNumber: "" });
  };

  const handleDeleteVehicle = async () => {
    const vehicleId = deleteModal.vehicleId;
    closeDeleteModal();

    try {
      await api.delete(DRIVER.DELETE_VEHICLE(vehicleId));
      toast.success("Vehicle deleted successfully! 🚗");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to delete vehicle. Please try again."
      );
    }
  };

  const openCancelModal = (reservationId, slotNumber) => {
    setCancelModal({ show: true, reservationId, slotNumber });
  };

  const closeCancelModal = () => {
    setCancelModal({ show: false, reservationId: null, slotNumber: "" });
  };

  const handleCancelReservation = async () => {
    const reservationId = cancelModal.reservationId;
    closeCancelModal();

    try {
      await api.delete(DRIVER.CANCEL_RESERVATION(reservationId));
      toast.success("Reservation cancelled successfully!");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to cancel reservation. Please try again."
      );
    }
  };

  const openQrModal = (reservation) => {
    setQrModal({ show: true, reservation });
  };

  const closeQrModal = () => {
    setQrModal({ show: false, reservation: null });
  };

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `parking-ticket-${qrModal.reservation._id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success('QR Code downloaded! 📥', { duration: 2000 });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
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
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{vehicle.number}</div>
                      {vehicle.model && (
                        <div className="text-sm text-gray-600">{vehicle.model}</div>
                      )}
                    </div>
                    <button
                      onClick={() => openDeleteModal(vehicle._id, vehicle.number)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">My Reservations</h2>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`text-sm px-4 py-2 rounded transition font-medium ${
                showCompleted
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {showCompleted ? "Hide Completed" : "Show Completed"}
            </button>
          </div>
          {reservations.filter(r => r.status !== 'Cancelled' && (showCompleted || r.status !== 'Completed')).length === 0 ? (
            <p className="text-gray-500">
              {showCompleted ? "No reservations found" : "No active reservations"}
            </p>
          ) : (
            <ul className="space-y-3">
              {reservations
                .filter(r => r.status !== 'Cancelled' && (showCompleted || r.status !== 'Completed'))
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
                        ₹{reservation.totalAmount?.toFixed(2) || "0.00"}
                      </div>
                      <div className="flex flex-col gap-2">
                        {reservation.paymentStatus === "paid" && (
                          <button
                            onClick={() => openQrModal(reservation)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition whitespace-nowrap"
                          >
                            📱 View QR
                          </button>
                        )}
                        {reservation.status === "Active" && (
                          <button
                            onClick={() => openCancelModal(reservation._id, reservation.slot?.slotNumber)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Delete Vehicle Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0  backdrop-contrast-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Vehicle</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete vehicle:
                </p>
                <p className="font-semibold text-lg text-gray-900 bg-gray-50 p-3 rounded border">
                  {deleteModal.vehicleNumber}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Make sure this vehicle has no active reservations.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVehicle}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Delete Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reservation Confirmation Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 backdrop-contrast-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cancel Reservation</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to cancel the reservation for:
                </p>
                <p className="font-semibold text-lg text-gray-900 bg-gray-50 p-3 rounded border">
                  Slot: {cancelModal.slotNumber || "N/A"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  The parking slot will be released and available for others.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeCancelModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Keep Reservation
                </button>
                <button
                  onClick={handleCancelReservation}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                >
                  Cancel Reservation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal.show && qrModal.reservation && (
        <div className="fixed inset-0 backdrop-contrast-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Parking Ticket QR Code</h3>
                  <p className="text-sm text-gray-500">Scan for validation</p>
                </div>
                <button
                  onClick={closeQrModal}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* QR Code */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-4">
                <div className="flex justify-center mb-3" ref={qrRef}>
                  <QRCodeSVG
                    value={JSON.stringify({
                      reservationId: qrModal.reservation._id,
                      slotNumber: qrModal.reservation.slot?.slotNumber,
                      vehicleNumber: qrModal.reservation.vehicle?.number,
                      startAt: qrModal.reservation.startAt,
                      endAt: qrModal.reservation.endAt,
                      amount: qrModal.reservation.totalAmount,
                      status: qrModal.reservation.status,
                      paymentStatus: qrModal.reservation.paymentStatus,
                    })}
                    size={200}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <p className="text-center text-sm text-gray-600">
                  📱 Show this QR code to parking staff
                </p>
              </div>

              {/* Reservation Details */}
              <div className="bg-gray-50 p-4 rounded border mb-4">
                <h4 className="font-semibold mb-3 text-sm text-gray-700">Reservation Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reservation ID:</span>
                    <span className="font-mono text-xs">{qrModal.reservation._id?.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parking Slot:</span>
                    <span className="font-semibold">{qrModal.reservation.slot?.slotNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-semibold">{qrModal.reservation.vehicle?.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Time:</span>
                    <span>{new Date(qrModal.reservation.startAt).toLocaleString('en-IN', { 
                      dateStyle: 'short', 
                      timeStyle: 'short' 
                    })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Time:</span>
                    <span>{new Date(qrModal.reservation.endAt).toLocaleString('en-IN', { 
                      dateStyle: 'short', 
                      timeStyle: 'short' 
                    })}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-semibold text-gray-700">Amount:</span>
                    <span className="font-bold text-green-600">
                      ₹{qrModal.reservation.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold capitalize ${
                      qrModal.reservation.status === 'Active' ? 'text-green-600' :
                      qrModal.reservation.status === 'Completed' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      {qrModal.reservation.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition font-medium"
                >
                  📥 Download
                </button>
                <button
                  onClick={closeQrModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition font-medium"
                >
                  Close
                </button>
              </div>

              {/* Tip */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Tip:</strong> Save this QR code or take a screenshot. Present it at the parking entrance for quick validation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
