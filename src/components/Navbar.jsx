import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    logout();
    // Use replace to prevent going back to protected routes
    navigate("/", { replace: true });
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">
            🅿️ Smart Parking
          </Link>

          <div className="flex items-center gap-4">
            {token ? (
              <>
                {location.pathname.includes("/admin") ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="text-gray-700 hover:text-blue-600 transition"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/manage-slots"
                      className="text-gray-700 hover:text-blue-600 transition"
                    >
                      Manage Slots
                    </Link>
                    <Link
                      to="/admin/generate-report"
                      className="text-gray-700 hover:text-blue-600 transition"
                    >
                      Reports
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-gray-700 hover:text-blue-600 transition"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/register-vehicle"
                      className="text-gray-700 hover:text-blue-600 transition"
                    >
                      Register Vehicle
                    </Link>
                    <Link
                      to="/reserve-spot"
                      className="text-gray-700 hover:text-blue-600 transition"
                    >
                      Reserve
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Driver Login
                </Link>
                <Link
                  to="/admin/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Admin Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
