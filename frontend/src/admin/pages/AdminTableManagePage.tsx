"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface Table {
  id: number;
  table_number: number;
  status: "free" | "occupied";
  capacity: number;
}

export default function AdminTableManagePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);

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
      const res = await fetch("http://localhost:5000/api/tables", {
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
    try {
      const token = localStorage.getItem("jwtToken");
      await fetch(`http://localhost:5000/api/tables/${table.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTables();
    } catch (err) {
      console.error("เปลี่ยนสถานะโต๊ะไม่สำเร็จ:", err);
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
    <div className="p-6 font-sans min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">จัดการสถานะโต๊ะ</h1>
        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition">
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr className="text-gray-600 text-sm uppercase text-left">
              <th className="py-3 px-4">หมายเลขโต๊ะ</th>
              <th className="py-3 px-4">สถานะ</th>
              <th className="py-3 px-4">จำนวนที่นั่ง</th>
              <th className="py-3 px-4 text-center">เปลี่ยนสถานะ</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : tables.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  ไม่มีข้อมูลโต๊ะ
                </td>
              </tr>
            ) : (
              tables.map((table) => (
                <tr key={table.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-center font-semibold text-lg">
                    {table.table_number}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium
                        ${
                          table.status === "free"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                      {table.status === "free" ? "ว่าง" : "ไม่ว่าง"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">{table.capacity}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      className={`px-5 py-2 rounded-lg font-bold shadow transition w-28
                        ${
                          table.status === "free"
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      onClick={() => handleToggleTableStatus(table)}>
                      {table.status === "free" ? "ปิดโต๊ะ" : "เปิดโต๊ะ"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
