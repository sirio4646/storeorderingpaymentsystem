"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../utils/apiBase";
import { useAuthStore } from "../../store/authStore";

interface Employee {
  id: number;
  full_name: string;
  position: string;
  phone_number: string;
  salary: string;
  hire_date: string;
  restaurant_id: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedEmployee, setEditedEmployee] = useState<Partial<Employee>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null
  );
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const jwtToken = localStorage.getItem("jwtToken");

  // --- Fetch employees ---
  const fetchEmployees = () => {
    setLoading(true);
    fetch(`${API_BASE}employees`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    })
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Failed to fetch employees:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // --- Create Employee ---
  const createEmployee = () => {
    if (
      !newEmployee.full_name ||
      !newEmployee.position ||
      !newEmployee.salary
    ) {
      setValidationMessage(
        "กรุณากรอกข้อมูลให้ครบถ้วน: ชื่อเต็ม, ตำแหน่ง และเงินเดือน"
      );
      return;
    }
    setValidationMessage(null);
    const currentISODate = new Date().toISOString().split("T")[0];
    setCreating(true);
    fetch(`${API_BASE}employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        full_name: newEmployee.full_name,
        position: newEmployee.position,
        phone_number: newEmployee.phone_number,
        salary: newEmployee.salary,
        hire_date: currentISODate,
      }),
    })
      .then(() => {
        fetchEmployees();
        setNewEmployee({});
      })
      .catch((e) => {
        console.error("Create employee failed:", e);
        alert("ไม่สามารถสร้างพนักงานได้ กรุณาลองใหม่");
      })
      .finally(() => setCreating(false));
  };

  // --- Edit Employee ---
  const handleEditClick = (employee: Employee) => {
    setEditingId(employee.id);
    setEditedEmployee(employee);
  };

  const saveEditedEmployee = () => {
    if (!editingId) return;
    setActionInProgress(editingId);
    fetch(`${API_BASE}employees/${editingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(editedEmployee),
    })
      .then(() => {
        setEditingId(null);
        setEditedEmployee({});
        fetchEmployees();
      })
      .catch((e) => {
        console.error("Save edited employee failed:", e);
        alert("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่");
      })
      .finally(() => setActionInProgress(null));
  };

  // --- Delete Employee ---
  const deleteEmployee = (id: number) => {
    setActionInProgress(id);
    fetch(`${API_BASE}employees/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwtToken}` },
    })
      .then(() => fetchEmployees())
      .catch((e) => {
        console.error("Delete failed:", e);
        alert("ไม่สามารถลบพนักงานได้ กรุณาลองใหม่");
      })
      .finally(() => setActionInProgress(null));
  };

  const handleDeleteClick = (employee: Employee) => {
    setConfirmDeleteId(employee.id);
    setEmployeeToDelete(employee);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      deleteEmployee(confirmDeleteId);
      setConfirmDeleteId(null);
      setEmployeeToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
    setEmployeeToDelete(null);
  };

  // --- Logout ---
  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    logout();
    navigate("/login");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header + Logout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#FF6500]">
            จัดการข้อมูลพนักงาน
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            เพิ่ม แก้ไข หรือลบข้อมูลพนักงานของร้านคุณ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            disabled={loading}
            className={`px-4 py-2 rounded-lg shadow-md text-white transition ${
              loading ? "bg-red-400 cursor-wait" : "bg-red-600 hover:bg-red-700"
            }`}>
            {loading ? "กำลังโหลด..." : "Logout"}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        {validationMessage && (
          <div className="mb-3 text-red-600 font-medium">
            {validationMessage}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <input
            placeholder="ชื่อเต็ม"
            className="border border-gray-300 p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-[#FF6500]"
            value={newEmployee.full_name || ""}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, full_name: e.target.value })
            }
          />
          <input
            placeholder="ตำแหน่ง"
            className="border border-gray-300 p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-[#FF6500]"
            value={newEmployee.position || ""}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, position: e.target.value })
            }
          />
          <input
            placeholder="เบอร์โทร"
            className="border border-gray-300 p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-[#FF6500]"
            value={newEmployee.phone_number || ""}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, phone_number: e.target.value })
            }
          />
          <input
            placeholder="เงินเดือน"
            className="border border-gray-300 p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-[#FF6500]"
            value={newEmployee.salary || ""}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, salary: e.target.value })
            }
          />
          <button
            onClick={createEmployee}
            disabled={creating}
            className={`bg-[#FF6500] text-white px-5 py-2 rounded-lg shadow-md transition font-semibold inline-flex items-center gap-2 ${
              creating ? "opacity-80 cursor-wait" : "hover:bg-[#FF7F33]"
            }`}>
            {creating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                <span>กำลังสร้าง...</span>
              </>
            ) : (
              "สร้าง"
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto min-w-[700px]">
            <thead>
              <tr className="bg-[#FF6500]/20 text-gray-700">
                <th className="py-3 px-4 text-left">รหัส</th>
                <th className="py-3 px-4 text-left">ชื่อเต็ม</th>
                <th className="py-3 px-4 text-left">ตำแหน่ง</th>
                <th className="py-3 px-4 text-right">เงินเดือน</th>
                <th className="py-3 px-4 text-left">เบอร์โทร</th>
                <th className="py-3 px-4 text-left">วันที่เริ่มงาน</th>
                <th className="py-3 px-4 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    ไม่มีข้อมูลพนักงาน
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-t odd:bg-white even:bg-[#FFF5E6] hover:bg-[#FFE0B3] transition">
                    <td className="py-3 px-4 font-medium">{emp.id}</td>
                    <td className="py-3 px-4">
                      {editingId === emp.id ? (
                        <input
                          value={editedEmployee.full_name || ""}
                          onChange={(e) =>
                            setEditedEmployee({
                              ...editedEmployee,
                              full_name: e.target.value,
                            })
                          }
                          className="border p-1 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6500]"
                        />
                      ) : (
                        emp.full_name
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingId === emp.id ? (
                        <input
                          value={editedEmployee.position || ""}
                          onChange={(e) =>
                            setEditedEmployee({
                              ...editedEmployee,
                              position: e.target.value,
                            })
                          }
                          className="border p-1 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6500]"
                        />
                      ) : (
                        emp.position
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {editingId === emp.id ? (
                        <input
                          value={editedEmployee.salary || ""}
                          onChange={(e) =>
                            setEditedEmployee({
                              ...editedEmployee,
                              salary: e.target.value,
                            })
                          }
                          className="border p-1 w-full rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-[#FF6500]"
                        />
                      ) : (
                        emp.salary
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingId === emp.id ? (
                        <input
                          value={editedEmployee.phone_number || ""}
                          onChange={(e) =>
                            setEditedEmployee({
                              ...editedEmployee,
                              phone_number: e.target.value,
                            })
                          }
                          className="border p-1 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6500]"
                        />
                      ) : (
                        emp.phone_number
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingId === emp.id ? (
                        <input
                          type="date"
                          value={editedEmployee.hire_date || ""}
                          onChange={(e) =>
                            setEditedEmployee({
                              ...editedEmployee,
                              hire_date: e.target.value,
                            })
                          }
                          className="border p-1 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6500]"
                        />
                      ) : (
                        emp.hire_date
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {editingId === emp.id ? (
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm shadow-md transition inline-flex items-center gap-2"
                          onClick={saveEditedEmployee}
                          disabled={actionInProgress !== null}>
                          {actionInProgress === emp.id ? (
                            <svg
                              className="animate-spin h-4 w-4"
                              viewBox="0 0 24 24">
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
                          ) : null}
                          <span>บันทึก</span>
                        </button>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm shadow-md transition"
                            onClick={() => handleEditClick(emp)}
                            disabled={actionInProgress !== null}>
                            แก้ไข
                          </button>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm shadow-md transition"
                            onClick={() => handleDeleteClick(emp)}
                            disabled={actionInProgress !== null}>
                            ลบ
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDeleteId && employeeToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              ยืนยันการลบพนักงาน
            </h2>
            <p className="mb-6 text-gray-700">
              คุณแน่ใจหรือไม่ว่าต้องการลบพนักงาน{" "}
              <span className="font-bold">{employeeToDelete.full_name}</span> ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
                onClick={handleCancelDelete}>
                ยกเลิก
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                onClick={handleConfirmDelete}>
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
