"use client";
import { useEffect, useState } from "react";
import { API_BASE } from "../../utils/apiBase";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface OrderItem {
  menu_id: number;
  quantity: number;
  price_at_order: string;
  menu_name: string;
  menu_image: string;
}

interface Order {
  id: number;
  table_number: number;
  total_amount: string;
  status: string;
  payment_status: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<Order | null>(null);
  const [actionToConfirm, setActionToConfirm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const token = localStorage.getItem("jwtToken"); // ดึง token

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    logout();
    navigate("/login");
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`${API_BASE}orders`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Failed to fetch orders:", err))
      .finally(() => setLoading(false));
  };

  const updateOrderStatus = (id: number, status: string) => {
    // ถ้าเสร็จสิ้น ให้เปลี่ยน payment_status เป็น paid ด้วย
    const body: any = { status };
    if (status === "completed") {
      body.payment_status = "paid";
    }
    setActionInProgress(id);
    fetch(`${API_BASE}orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
      .then(() => fetchOrders())
      .catch((e) => console.error("Update order failed:", e))
      .finally(() => setActionInProgress(null));
  };

  const handleActionClick = (order: Order, action: string) => {
    setOrderToConfirm(order);
    setActionToConfirm(action);
    setShowConfirmModal(true);
  };
  const handleConfirmAction = () => {
    if (orderToConfirm && actionToConfirm)
      updateOrderStatus(orderToConfirm.id, actionToConfirm);
    setShowConfirmModal(false);
    setOrderToConfirm(null);
    setActionToConfirm("");
    handleCloseItemsModal();
  };
  const handleCancelAction = () => {
    setShowConfirmModal(false);
    setOrderToConfirm(null);
    setActionToConfirm("");
  };
  const handleViewItems = (order: Order) => setSelectedOrder(order);
  const handleCloseItemsModal = () => setSelectedOrder(null);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF7A00] to-[#FF3D00]">
              Orders
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ตรวจสอบและจัดการออเดอร์เรียลไทม์
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl shadow hover:bg-red-700 transition"
            aria-label="Logout">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">
          <svg className="animate-spin mx-auto h-6 w-6" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <div>กำลังโหลดออเดอร์...</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4 gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.id}
                  </h3>
                  <div className="mt-1 text-sm text-gray-500">
                    โต๊ะ{" "}
                    <span className="font-medium text-gray-800">
                      {order.table_number}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === "completed"
                        ? "bg-green-50 text-green-700"
                        : order.status === "cancelled"
                        ? "bg-red-50 text-red-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}>
                    {order.status.toUpperCase()}
                  </span>

                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded ${
                      order.payment_status === "paid"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}>
                    {order.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-500">ยอดรวม</div>
                <div className="text-2xl font-bold text-gray-900">
                  {order.total_amount} ฿
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewItems(order)}
                    disabled={actionInProgress !== null}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    ดูรายละเอียด
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleActionClick(order, "completed")}
                        disabled={actionInProgress !== null}
                        className="bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition">
                        เสร็จสิ้น
                      </button>
                      <button
                        onClick={() => handleActionClick(order, "cancelled")}
                        disabled={actionInProgress !== null}
                        className="bg-red-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition">
                        ยกเลิก
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal ยืนยัน */}
      {showConfirmModal && orderToConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">ยืนยันการกระทำ</h2>
            <p className="mb-4">
              คุณแน่ใจหรือไม่ที่จะเปลี่ยนสถานะออเดอร์ของโต๊ะ{" "}
              <span className="font-semibold">
                {orderToConfirm.table_number}
              </span>{" "}
              เป็น{" "}
              <span className="font-semibold">
                {actionToConfirm === "completed" ? "เสร็จสิ้น" : "ยกเลิก"}
              </span>
              ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 text-gray-800"
                onClick={handleCancelAction}>
                ยกเลิก
              </button>
              <button
                className={`px-4 py-2 rounded-xl text-white ${
                  actionToConfirm === "completed"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                onClick={handleConfirmAction}>
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal รายการอาหาร */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-40">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4"> รายการอาหาร</h2>
            <p className="mb-2 text-gray-700">
              โต๊ะ:{" "}
              <span className="font-semibold">
                {selectedOrder.table_number}
              </span>
            </p>
            <p className="mb-4 text-gray-700">
              ยอดรวม:{" "}
              <span className="font-semibold">
                {selectedOrder.total_amount} ฿
              </span>
            </p>

            <div className="space-y-4">
              {selectedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start border rounded-xl p-3 shadow-sm">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 mr-4">
                    {item.menu_image ? (
                      <img
                        src={item.menu_image}
                        alt={item.menu_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{item.menu_name}</p>
                    <p className="text-gray-600 text-sm">
                      จำนวน: {item.quantity}
                    </p>
                    <p className="text-gray-600 text-sm">
                      ราคา: {item.price_at_order} ฿
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              {selectedOrder.status === "pending" && (
                <>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-600"
                    onClick={() =>
                      handleActionClick(selectedOrder, "completed")
                    }>
                    {" "}
                    เสร็จสิ้น
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-600"
                    onClick={() =>
                      handleActionClick(selectedOrder, "cancelled")
                    }>
                    {" "}
                    ยกเลิก
                  </button>
                </>
              )}
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-xl hover:bg-gray-500"
                onClick={handleCloseItemsModal}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
