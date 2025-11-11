import { useState, useEffect } from "react";
import api from "../api/axios";
import { ADMIN } from "../api/endpoints";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ManageSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [form, setForm] = useState({
    slotNumber: "",
    status: "Available",
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await api.get(ADMIN.SLOTS);
      setSlots(res.data.slots || []);
    } catch (error) {
      console.error("Error fetching slots:", error);
      alert("Failed to load slots");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlot) {
        await api.put(`${ADMIN.SLOTS}/${editingSlot._id}`, form);
        alert("Slot updated successfully!");
      } else {
        await api.post(ADMIN.SLOTS, form);
        alert("Slot created successfully!");
      }
      setShowForm(false);
      setEditingSlot(null);
      setForm({ slotNumber: "", status: "Available" });
      fetchSlots();
    } catch (error) {
      console.error("Error saving slot:", error);
      alert(error.response?.data?.message || "Failed to save slot");
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setForm({
      slotNumber: slot.slotNumber,
      status: slot.status,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSlot(null);
    setForm({ slotNumber: "", status: "Available" });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Parking Slots</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          + Add New Slot
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingSlot ? "Edit Slot" : "Create New Slot"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Slot Number *
                </label>
                <input
                  type="text"
                  name="slotNumber"
                  value={form.slotNumber}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                  placeholder="e.g., A1, B5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status *</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                {editingSlot ? "Update Slot" : "Create Slot"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Slot Number
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {slots.map((slot) => (
                <tr key={slot._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{slot.slotNumber}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        slot.status === 'Available'
                          ? "bg-green-100 text-green-800"
                          : slot.status === 'Occupied'
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {slot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(slot)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {slots.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No slots found. Create your first slot!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
