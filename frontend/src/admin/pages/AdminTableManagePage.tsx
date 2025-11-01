"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../utils/apiBase";
import { useAuthStore } from "../../store/authStore";

// Small inline spinner component so we don't need extra deps
function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-white"
      style={{ width: size, height: size }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );
}

interface Table {
  id: number;
  table_number: number;
  status: "free" | "occupied";
  capacity: number;
}

export default function AdminTableManagePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  // ดึงข้อมูลโต๊ะทั้งหมด
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE}tables`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setTables(data);
    } catch (err) {
      console.error("ไม่สามารถดึงข้อมูลโต๊ะ:", err);
    } finally {
      setLoading(false);
    }
  };

  // เปลี่ยนสถานะโต๊ะ
  const handleToggleTableStatus = async (table: Table) => {
    const newStatus = table.status === "free" ? "occupied" : "free";
    setActionInProgress(table.id);
    try {
      const token = localStorage.getItem("jwtToken");
      await fetch(`${API_BASE}tables/${table.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchTables();
    } catch (err) {
      console.error("เปลี่ยนสถานะโต๊ะไม่สำเร็จ:", err);
      alert("เกิดข้อผิดพลาดขณะเปลี่ยนสถานะโต๊ะ");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    logout();
    navigate("/login");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans min-h-screen bg-gray-50">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            จัดการสถานะโต๊ะ
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ดูและปรับสถานะโต๊ะของร้านคุณแบบเรียลไทม์
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
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
      </header>

      <main>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y table-auto">
              <thead className="bg-gray-100 sticky top-0">
                <tr className="text-gray-600 text-sm uppercase text-left">
                  <th className="py-3 px-4">หมายเลขโต๊ะ</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4">จำนวนที่นั่ง</th>
                  <th className="py-3 px-4 text-center">เปลี่ยนสถานะ</th>
                </tr>
              </thead>

              <tbody className="text-gray-700 text-sm divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-3">
                        <Spinner size={24} />
                        <span>กำลังโหลดข้อมูลโต๊ะ...</span>
                      </div>
                    </td>
                  </tr>
                ) : tables.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-500">
                      ไม่มีข้อมูลโต๊ะ
                    </td>
                  </tr>
                ) : (
                  tables.map((table) => (
                    <tr key={table.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-center font-semibold text-lg">
                        {table.table_number}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                            table.status === "free"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                          {table.status === "free" ? "ว่าง" : "ไม่ว่าง"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {table.capacity}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold shadow transition w-36 ${
                            table.status === "free"
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                          onClick={() => handleToggleTableStatus(table)}
                          disabled={actionInProgress !== null}
                          aria-label={`Toggle table ${table.table_number}`}>
                          {actionInProgress === table.id ? (
                            <>
                              <Spinner size={18} />
                              <span>กำลังบันทึก...</span>
                            </>
                          ) : (
                            <span>
                              {table.status === "free" ? "ปิดโต๊ะ" : "เปิดโต๊ะ"}
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
