import { useState } from "react";
import api from "../api/axios";

export default function ValidateTicket() {
  const [ticketId, setTicketId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    if (!ticketId.trim()) {
      alert("Please enter a reservation/ticket ID");
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      
      // Call backend to validate the reservation/ticket
      const res = await api.get(`/admin/validate-ticket/${ticketId}`);
      
      setResult({
        valid: true,
        ...res.data.reservation,
      });
    } catch (error) {
      console.error("Error validating ticket:", error);
      setResult({
        valid: false,
        message: error.response?.data?.error || "Ticket not found or invalid",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Validate Ticket</h1>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter Ticket ID or Reservation ID
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="e.g., 507f1f77bcf86cd799439011"
              className="w-full border p-3 rounded focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handleValidate}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 transition disabled:bg-gray-400"
          >
            {loading ? "Validating..." : "Validate Ticket"}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-6 border-2 rounded-lg">
            <div
              className={`text-center mb-4 ${
                result.valid ? "text-green-600" : "text-red-600"
              }`}
            >
              <div className="text-5xl mb-2">
                {result.valid ? "✓" : "✗"}
              </div>
              <div className="text-xl font-bold">
                {result.valid ? "Valid Ticket" : "Invalid Ticket"}
              </div>
            </div>

            {result.valid ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Reservation ID:</span>
                  <span className="font-mono">{result._id}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Slot Number:</span>
                  <span>{result.slot?.slotNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Vehicle:</span>
                  <span>{result.vehicle?.number || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Start Time:</span>
                  <span>{new Date(result.startAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">End Time:</span>
                  <span>{new Date(result.endAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Duration:</span>
                  <span>{result.duration || 0} hour(s)</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Amount:</span>
                  <span className="font-semibold">${result.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Payment Status:</span>
                  <span className={`font-semibold ${result.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {result.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`capitalize font-semibold ${
                    result.status === 'Active' ? 'text-green-600' : 
                    result.status === 'Completed' ? 'text-blue-600' : 
                    'text-gray-600'
                  }`}>
                    {result.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-red-600">
                <p>{result.message}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 max-w-2xl mx-auto bg-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-3 text-lg">📋 How to Get Reservation ID:</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="bg-white p-3 rounded">
            <p className="font-medium mb-1">For Drivers:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Go to your Dashboard</li>
              <li>Find your reservation in "My Reservations"</li>
              <li>Copy the Reservation ID (shown in the reservation details)</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded">
            <p className="font-medium mb-1">For Admins:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Get the reservation ID from the driver</li>
              <li>Enter it in the field above</li>
              <li>Validate to check reservation status, payment, and timing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
