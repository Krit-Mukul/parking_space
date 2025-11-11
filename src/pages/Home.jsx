import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl font-bold mb-4">Smart Parking System</h1>
          <p className="text-xl mb-8">
            Find, Reserve, and Pay for Parking Spots Easily
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition">
            <div className="text-center">
              <div className="text-blue-600 text-5xl mb-4">🚗</div>
              <h2 className="text-2xl font-bold mb-4">For Drivers</h2>
              <p className="text-gray-600 mb-6">
                Register your vehicle, reserve parking spots, and make payments
                online
              </p>
              <Link
                to="/login"
                className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Driver Login
              </Link>
              <Link
                to="/signup"
                className="inline-block bg-white text-blue-600 py-3 px-8 rounded-lg hover:bg-gray-100 transition font-semibold border-2 border-blue-600 mt-3 ml-2"
              >
                Driver Sign Up
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition">
            <div className="text-center">
              <div className="text-purple-600 text-5xl mb-4">👨‍💼</div>
              <h2 className="text-2xl font-bold mb-4">For Admins</h2>
              <p className="text-gray-600 mb-6">
                Manage parking slots, validate tickets, and generate reports
              </p>
              <Link
                to="/admin/login"
                className="inline-block bg-purple-600 text-white py-3 px-8 rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-white">
          <h3 className="text-2xl font-semibold mb-8">Features</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-white border-opacity-30">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-bold text-lg mb-2 text-black">Quick Reservations</h4>
              <p className="text-sm text-black opacity-90">Book parking spots in seconds</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-white border-opacity-30">
              <div className="text-4xl mb-3">💳</div>
              <h4 className="font-bold text-lg mb-2 text-black">Easy Payments</h4>
              <p className="text-sm text-black opacity-90">Multiple payment methods supported</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-white border-opacity-30">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="font-bold text-lg mb-2 text-black">Real-time Updates</h4>
              <p className="text-sm text-black opacity-90">Track your reservations live</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
