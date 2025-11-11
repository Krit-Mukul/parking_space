import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import Dashboard from "./pages/Dashboard";
import RegisterVehicle from "./pages/RegisterVehicle";
import ReserveSpot from "./pages/ReserveSpot";
import MakePayment from "./pages/MakePayment";
import AdminDashboard from "./pages/AdminDashboard";
import ManageSlots from "./pages/ManageSlots";
import GenerateReport from "./pages/GenerateReport";
import ValidateTicket from "./pages/ValidateTicket";
import AddAdmin from "./pages/AddAdmin";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            
            {/* Driver Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register-vehicle"
              element={
                <ProtectedRoute>
                  <RegisterVehicle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reserve-spot"
              element={
                <ProtectedRoute>
                  <ReserveSpot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/make-payment"
              element={
                <ProtectedRoute>
                  <MakePayment />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-slots"
              element={
                <ProtectedRoute adminOnly>
                  <ManageSlots />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/generate-report"
              element={
                <ProtectedRoute adminOnly>
                  <GenerateReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/validate-ticket"
              element={
                <ProtectedRoute adminOnly>
                  <ValidateTicket />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-admin"
              element={
                <ProtectedRoute adminOnly>
                  <AddAdmin />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
