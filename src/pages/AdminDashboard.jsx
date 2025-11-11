import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ADMIN } from "../api/endpoints";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSlots: 0,
    activeReservations: 0,
    totalRevenue: 0,
    registeredUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [detailView, setDetailView] = useState(null); // 'revenue', 'reservations', null
  const [detailData, setDetailData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get(ADMIN.REPORT);
      setStats({
        totalSlots: res.data.totalSlots || 0,
        activeReservations: res.data.activeReservations || 0,
        totalRevenue: res.data.totalRevenue || 0,
        registeredUsers: res.data.totalUsers || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueDetails = async () => {
    try {
      setDetailLoading(true);
      const res = await api.get('/admin/payments');
      setDetailData(res.data.payments || []);
      setDetailView('revenue');
    } catch (error) {
      console.error("Error fetching revenue details:", error);
      alert("Failed to load revenue details");
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchReservationDetails = async () => {
    try {
      setDetailLoading(true);
      const res = await api.get('/admin/reservations');
      setDetailData(res.data.reservations || []);
      setDetailView('reservations');
    } catch (error) {
      console.error("Error fetching reservation details:", error);
      alert("Failed to load reservation details");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailView = () => {
    setDetailView(null);
    setDetailData([]);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate("/admin/manage-slots")}
          className="bg-blue-600 text-white p-8 rounded-lg hover:bg-blue-700 transition text-left"
        >
          <div className="text-4xl mb-3">🅿️</div>
          <h3 className="text-xl font-semibold mb-2">Manage Slots</h3>
          <p className="text-sm opacity-90">
            Create, update, and manage parking slots
          </p>
        </button>

        <button
          onClick={() => navigate("/admin/generate-report")}
          className="bg-green-600 text-white p-8 rounded-lg hover:bg-green-700 transition text-left"
        >
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-xl font-semibold mb-2">Generate Report</h3>
          <p className="text-sm opacity-90">
            View analytics and generate reports
          </p>
        </button>

        <button
          onClick={() => navigate("/admin/validate-ticket")}
          className="bg-purple-600 text-white p-8 rounded-lg hover:bg-purple-700 transition text-left"
        >
          <div className="text-4xl mb-3">✓</div>
          <h3 className="text-xl font-semibold mb-2">Validate Ticket</h3>
          <p className="text-sm opacity-90">
            Validate parking tickets and reservations
          </p>
        </button>

        <button
          onClick={() => navigate("/admin/add-admin")}
          className="bg-orange-600 text-white p-8 rounded-lg hover:bg-orange-700 transition text-left"
        >
          <div className="text-4xl mb-3">👤➕</div>
          <h3 className="text-xl font-semibold mb-2">Add New Admin</h3>
          <p className="text-sm opacity-90">
            Create new admin accounts
          </p>
        </button>
      </div>

      <div className="mt-12 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded cursor-default">
            <div className="text-2xl font-bold text-blue-600">{stats.totalSlots}</div>
            <div className="text-sm text-gray-600">Total Slots</div>
          </div>
          <button 
            onClick={fetchReservationDetails}
            className="bg-green-50 p-4 rounded hover:bg-green-100 transition text-left"
          >
            <div className="text-2xl font-bold text-green-600">{stats.activeReservations}</div>
            <div className="text-sm text-gray-600">Active Reservations</div>
            <div className="text-xs text-green-600 mt-1">Click for details →</div>
          </button>
          <button 
            onClick={fetchRevenueDetails}
            className="bg-purple-50 p-4 rounded hover:bg-purple-100 transition text-left"
          >
            <div className="text-2xl font-bold text-purple-600">${stats.totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-xs text-purple-600 mt-1">Click for details →</div>
          </button>
          <div className="bg-orange-50 p-4 rounded cursor-default">
            <div className="text-2xl font-bold text-orange-600">{stats.registeredUsers}</div>
            <div className="text-sm text-gray-600">Registered Users</div>
          </div>
        </div>
      </div>

      {/* Detail View Modal */}
      {detailView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold">
                {detailView === 'revenue' ? 'Payment Details' : 'Active Reservations'}
              </h3>
              <button
                onClick={closeDetailView}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {detailLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                </div>
              ) : detailView === 'revenue' ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">User</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Amount</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Method</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Reservation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {detailData.map((payment) => (
                        <tr key={payment._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {payment.user?.name || payment.user?.email || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">
                            ${payment.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm capitalize">
                            {payment.method || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono">
                            {payment.reservation?._id || payment.reservation || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {detailData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No payment records found
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold">User</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Slot</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Vehicle</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Start Time</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">End Time</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Duration</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {detailData.map((reservation) => (
                        <tr key={reservation._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            {reservation.user?.name || reservation.user?.email || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold">
                            {reservation.slot?.slotNumber || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {reservation.vehicle?.number || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(reservation.startAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(reservation.endAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {reservation.duration || 0}h
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                            ${reservation.totalAmount?.toFixed(2) || '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {detailData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No active reservations found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
