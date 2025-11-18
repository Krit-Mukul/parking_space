import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { ADMIN } from "../api/endpoints";
import LoadingSpinner from "../components/LoadingSpinner";

export default function GenerateReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) =>
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const res = await api.get(ADMIN.REPORT, { params });
      setReport(res.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Generate Report</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Filter Options</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchReport}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {report && !loading && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {report.totalReservations || 0}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Total Reservations
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                ₹{report.totalRevenue?.toFixed(2) || "0.00"}
              </div>
              <div className="text-sm text-gray-600 mt-2">Total Revenue</div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {report.activeReservations || 0}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Active Reservations
              </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {report.totalSlots || 0}
              </div>
              <div className="text-sm text-gray-600 mt-2">Total Slots</div>
            </div>
          </div>

          {report.slotUtilization && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Slot Utilization</h3>
              <div className="space-y-3">
                {report.slotUtilization.map((slot, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <span className="font-medium">{slot.slotNumber}</span>
                    <span className="text-sm text-gray-600">
                      {slot.reservationCount} reservations
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.recentReservations && report.recentReservations.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">
                Recent Reservations
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Slot
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Vehicle
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Start Time
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {report.recentReservations.map((reservation) => (
                      <tr key={reservation._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {reservation.slot?.slotNumber || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          {reservation.vehicle?.number || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(reservation.startAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              reservation.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {reservation.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          ₹{reservation.totalAmount?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!report && !loading && (
        <div className="text-center py-12 text-gray-500">
          <p>Select date range and click Generate Report to view analytics</p>
        </div>
      )}
    </div>
  );
}
