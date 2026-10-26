import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ListOrdered,
  Activity,
  LogOut,
  Package
} from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [ordersRes, logsRes] = await Promise.all([
          fetch("http://localhost:8000/admin/orders"),
          fetch("http://localhost:8000/admin/logs")
        ]);

        if (!ordersRes.ok) {
          throw new Error(`Orders API error: ${ordersRes.status}`);
        }

        if (!logsRes.ok) {
          throw new Error(`Logs API error: ${logsRes.status}`);
        }

        const ordersData = await ordersRes.json();
        const logsData = await logsRes.json();

        console.log("Orders API:", ordersData);
        console.log("Logs API:", logsData);

        // Support both:
        // { orders: [...] }
        // and directly returned [...]
        const receivedOrders = Array.isArray(ordersData)
          ? ordersData
          : ordersData.orders;

        const receivedLogs = Array.isArray(logsData)
          ? logsData
          : logsData.logs;

        setOrders(Array.isArray(receivedOrders) ? receivedOrders : []);
        setLogs(Array.isArray(receivedLogs) ? receivedLogs : []);

      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        setError(err.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">

      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-10">

        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <ShieldAlert className="w-8 h-8 text-emerald-400" />

          <h1 className="text-xl font-black tracking-wider">
            SYSTEM
            <br />
            <span className="text-emerald-400">ADMIN</span>
          </h1>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-2 px-4">

          {/* ORDERS BUTTON */}
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all font-bold ${
              activeTab === "orders"
                ? "bg-emerald-500 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <ListOrdered className="w-5 h-5" />
            <span>E-Commerce Orders</span>
          </button>

          {/* LOGS BUTTON */}
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all font-bold ${
              activeTab === "logs"
                ? "bg-emerald-500 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Diagnosis Logs</span>
          </button>

        </div>

        {/* EXIT ADMIN */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center space-x-2 w-full p-3 bg-slate-800 hover:bg-red-500 text-white rounded-lg transition-colors font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Admin</span>
          </button>
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-10 bg-slate-50">

        {/* HEADER */}
        <div className="mb-8">

          <h2 className="text-3xl font-black text-slate-800">
            {activeTab === "orders"
              ? "Sales & Orders Hub"
              : "AI Diagnostic Tracking"}
          </h2>

          <p className="text-slate-500 mt-1 font-medium">
            {activeTab === "orders"
              ? "Monitor your pharmacy revenue and recent customer transactions."
              : "Audit trail of patient symptoms and AI model predictions."}
          </p>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Activity className="w-10 h-10 text-emerald-500 animate-spin" />
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
            <h3 className="font-black text-lg mb-2">
              Failed to load admin data
            </h3>

            <p className="text-sm">
              {error}
            </p>

            <p className="text-xs mt-3 text-red-500">
              Check that your FastAPI backend is running on port 8000.
            </p>
          </div>
        )}

        {/* CONTENT */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            {/* ================= ORDERS TABLE ================= */}
            {activeTab === "orders" && (
              <table className="w-full text-left border-collapse">

                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">

                    <th className="p-4 font-black">
                      Order ID
                    </th>

                    <th className="p-4 font-black">
                      Customer
                    </th>

                    <th className="p-4 font-black">
                      Amount
                    </th>

                    <th className="p-4 font-black">
                      Items
                    </th>

                    <th className="p-4 font-black">
                      Date
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {orders.length === 0 ? (

                    <tr>
                      <td
                        colSpan="5"
                        className="p-8 text-center text-slate-400 font-medium"
                      >
                        No orders found.
                      </td>
                    </tr>

                  ) : (

                    orders.map((order, index) => {

                      // IMPORTANT:
                      // Prevents "undefined.map()" error
                      const items = Array.isArray(order?.items)
                        ? order.items
                        : [];

                      return (
                        <tr
                          key={order?.payment_id || index}
                          className="hover:bg-slate-50 transition-colors"
                        >

                          {/* ORDER ID */}
                          <td className="p-4 font-mono text-xs font-bold text-slate-500">
                            {order?.payment_id || "N/A"}
                          </td>

                          {/* CUSTOMER */}
                          <td className="p-4 font-bold text-slate-800">
                            {order?.username || "Unknown"}
                          </td>

                          {/* AMOUNT */}
                          <td className="p-4 font-black text-emerald-600">
                            ₹{order?.amount_paid ?? 0}
                          </td>

                          {/* ITEMS */}
                          <td className="p-4">

                            {items.length === 0 ? (

                              <span className="text-xs text-slate-400">
                                No item details
                              </span>

                            ) : (

                              <div className="flex flex-col gap-1">

                                {items.map((item, idx) => (

                                  <span
                                    key={idx}
                                    className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded inline-flex items-center w-max"
                                  >

                                    <Package className="w-3 h-3 mr-1" />

                                    {item?.name || "Unknown Item"}

                                    {" "}

                                    (x{item?.qty ?? 1})

                                  </span>

                                ))}

                              </div>

                            )}

                          </td>

                          {/* DATE */}
                          <td className="p-4 text-sm text-slate-500 font-medium">
                            {order?.timestamp || "N/A"}
                          </td>

                        </tr>
                      );

                    })

                  )}

                </tbody>
              </table>
            )}

            {/* ================= LOGS TABLE ================= */}
            {activeTab === "logs" && (
              <table className="w-full text-left border-collapse">

                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">

                    <th className="p-4 font-black">
                      Patient
                    </th>

                    <th className="p-4 font-black w-1/3">
                      Symptoms Described
                    </th>

                    <th className="p-4 font-black">
                      AI Prediction
                    </th>

                    <th className="p-4 font-black">
                      Confidence
                    </th>

                    <th className="p-4 font-black">
                      Date
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {logs.length === 0 ? (

                    <tr>
                      <td
                        colSpan="5"
                        className="p-8 text-center text-slate-400 font-medium"
                      >
                        No diagnostic logs found.
                      </td>
                    </tr>

                  ) : (

                    logs.map((log, index) => (

                      <tr
                        key={log?.id || index}
                        className="hover:bg-slate-50 transition-colors"
                      >

                        {/* PATIENT */}
                        <td className="p-4 font-bold text-slate-800">
                          {log?.username || "Unknown"}
                        </td>

                        {/* SYMPTOMS */}
                        <td className="p-4 text-sm text-slate-600 italic">

                          {Array.isArray(log?.symptoms)
                            ? log.symptoms.join(", ")
                            : log?.symptoms || "No symptoms recorded"}

                        </td>

                        {/* AI PREDICTION */}
                        <td className="p-4">

                          <span
                            className={`text-xs font-black px-3 py-1 rounded-full ${
                              log?.predicted_disease === "Unknown" ||
                              log?.predicted_disease === "Blocked by Guardrail"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >

                            {log?.predicted_disease || "Unknown"}

                          </span>

                        </td>

                        {/* CONFIDENCE */}
                        <td className="p-4 font-black text-slate-700">
                          {log?.confidence ?? 0}%
                        </td>

                        {/* DATE */}
                        <td className="p-4 text-sm text-slate-500 font-medium">
                          {log?.timestamp || "N/A"}
                        </td>

                      </tr>

                    ))

                  )}

                </tbody>
              </table>
            )}

          </div>
        )}

      </div>
    </div>
  );
}