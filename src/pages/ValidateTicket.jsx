import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../api/axios";

export default function ValidateTicket() {
  const [ticketId, setTicketId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanner, setScanner] = useState(null);
  const scanProcessedRef = useRef(false); // Use ref to prevent re-renders from causing issues
  const lastScannedRef = useRef(""); // Track last scanned value to prevent duplicates

  useEffect(() => {
    if (showScanner && !scanner) {
      scanProcessedRef.current = false; // Reset when opening scanner
      lastScannedRef.current = ""; // Reset last scanned
      
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        false
      );

      html5QrcodeScanner.render(onScanSuccess, onScanError);
      setScanner(html5QrcodeScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [showScanner]);

  const onScanSuccess = (decodedText) => {
    // Prevent multiple scans - using ref to avoid state update delays
    if (scanProcessedRef.current) {
      console.log("Already processed a scan, ignoring...");
      return;
    }
    
    // Check if this is a duplicate scan
    if (lastScannedRef.current === decodedText) {
      console.log("Duplicate scan detected, ignoring...");
      return;
    }
    
    // Mark as processed immediately
    scanProcessedRef.current = true;
    lastScannedRef.current = decodedText;
    
    // Stop scanner immediately
    if (scanner) {
      scanner.clear().catch(console.error);
      setScanner(null);
    }
    setShowScanner(false);
    
    try {
      console.log("Scanned QR data:", decodedText); // Debug log
      
      // Try to parse as JSON (our QR code format)
      const qrData = JSON.parse(decodedText);
      console.log("Parsed QR data:", qrData); // Debug log
      
      if (qrData.reservationId) {
        const cleanId = qrData.reservationId.trim();
        console.log("Extracted reservation ID:", cleanId); // Debug log
        
        // Validate ObjectId format (24 hex characters)
        if (!/^[0-9a-fA-F]{24}$/.test(cleanId)) {
          toast.error("Invalid reservation ID format in QR code");
          console.error("Invalid ObjectId format:", cleanId);
          scanProcessedRef.current = false; // Reset on error
          return;
        }
        
        setTicketId(cleanId);
        toast.success("QR Code scanned successfully! 📸", { duration: 2000 });
        
        // Auto-validate after scan
        validateReservation(cleanId);
      } else {
        toast.error("Invalid QR code format - missing reservationId");
        scanProcessedRef.current = false; // Reset on error
      }
    } catch (e) {
      console.error("QR parse error:", e);
      
      // If not JSON, treat as plain reservation ID
      const cleanId = decodedText.trim();
      console.log("Treating as plain ID:", cleanId); // Debug log
      
      // Validate ObjectId format (24 hex characters)
      if (!/^[0-9a-fA-F]{24}$/.test(cleanId)) {
        toast.error("Invalid reservation ID format");
        console.error("Invalid ObjectId format:", cleanId);
        scanProcessedRef.current = false; // Reset on error
        return;
      }
      
      setTicketId(cleanId);
      toast.success("QR Code scanned! 📸", { duration: 2000 });
      validateReservation(cleanId);
    }
  };

  const onScanError = (error) => {
    // Ignore scanning errors (they happen frequently during scanning)
    console.debug(error);
  };

  const validateReservation = async (id) => {
    if (!id?.trim()) {
      toast.error("Please enter a reservation/ticket ID");
      scanProcessedRef.current = false; // Reset on error
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      
      // Call backend to validate the reservation/ticket
      const res = await api.get(`/admin/validate-ticket/${id}`);
      
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
      // Don't reset scanProcessedRef here - keep it to prevent rescanning
    }
  };

  const handleValidate = () => {
    validateReservation(ticketId);
  };

  const toggleScanner = () => {
    if (showScanner && scanner) {
      scanner.clear().catch(console.error);
      setScanner(null);
    }
    setShowScanner(!showScanner);
    // Reset refs when toggling scanner
    scanProcessedRef.current = false;
    lastScannedRef.current = "";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Validate Ticket</h1>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="space-y-4">
          {/* QR Scanner Section */}
          <div className="mb-6">
            <button
              onClick={toggleScanner}
              className={`w-full py-3 px-4 rounded font-medium transition ${
                showScanner
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {showScanner ? "❌ Close QR Scanner" : "📷 Scan QR Code"}
            </button>
          </div>

          {showScanner && (
            <div className="mb-6">
              <div
                id="qr-reader"
                className="rounded-lg overflow-hidden border-2 border-blue-500"
              ></div>
              <p className="text-sm text-gray-600 text-center mt-2">
                📱 Point your camera at the QR code to scan
              </p>
            </div>
          )}

          {/* Manual Entry Section */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OR</span>
            </div>
          </div>

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
              onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
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
                  <span className="font-semibold">₹{result.totalAmount?.toFixed(2) || '0.00'}</span>
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
                    result.status === 'Cancelled'? 'text-red-600' : 
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
        <h3 className="font-semibold mb-3 text-lg">📋 How to Validate Tickets:</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="bg-white p-3 rounded">
            <p className="font-medium mb-2 text-blue-600">📷 Method 1: QR Code Scan (Recommended)</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Click the "Scan QR Code" button above</li>
              <li>Allow camera access when prompted</li>
              <li>Point your camera at the driver's QR code</li>
              <li>Ticket will be validated automatically</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded">
            <p className="font-medium mb-2 text-purple-600">⌨️ Method 2: Manual Entry</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Ask the driver for their Reservation ID</li>
              <li>Enter the ID in the field above</li>
              <li>Click "Validate Ticket" or press Enter</li>
              <li>View the reservation details and payment status</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded">
            <p className="font-medium mb-1">ℹ️ For Drivers:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>After payment, you'll receive a QR code</li>
              <li>Save or screenshot the QR code</li>
              <li>Show it to parking staff for validation</li>
              <li>You can also find your QR code in the Dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
