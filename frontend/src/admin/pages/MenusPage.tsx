"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../utils/apiBase";
import { useAuthStore } from "../../store/authStore";

interface Menu {
  id: number;
  name: string;
  category: string;
  base_price: string;
  is_available: boolean;
  image_url: string;
  restaurant_id: number;
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [newMenu, setNewMenu] = useState<Partial<Menu>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedMenu, setEditedMenu] = useState<Partial<Menu>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null); // เพิ่ม state สำหรับยืนยันลบ
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    console.log("JWT Token from localStorage:", token); //  log token
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchMenus = () => {
    console.log("Fetching menus...");
    setLoading(true);
    fetch(`${API_BASE}menus`, {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        console.log("Response status:", res.status);
        if (res.status === 401) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        console.log("Menus fetched:", data);
        setMenus(data);
      })
      .catch((error) => {
        console.error("Failed to fetch menus:", error);
        if (error.message === "Unauthorized") {
          handleLogout();
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // (local spinner removed — use inline SVGs where needed)

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    logout();
    navigate("/login");
  };

  const createMenu = () => {
    if (!newMenu.name || !newMenu.category || !newMenu.base_price) {
      alert("กรุณากรอก Name, Category และ Base Price ให้ครบ");
      return;
    }
    const menuToCreate = {
      ...newMenu,
      base_price: parseFloat(newMenu.base_price as string),
    };
    setCreating(true);
    fetch(`${API_BASE}menus`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(menuToCreate),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create menu");
        return res.json();
      })
      .then(() => {
        fetchMenus();
        setNewMenu({});
      })
      .catch((err) => {
        console.error("Failed to create menu:", err);
        alert("ไม่สามารถเพิ่มเมนูได้ กรุณาลองใหม่");
      })
      .finally(() => setCreating(false));
  };

  const handleEditClick = (menu: Menu) => {
    setEditingId(menu.id);
    setEditedMenu(menu);
  };

  const saveEditedMenu = () => {
    if (!editingId) return;
    setActionInProgress(editingId);
    fetch(`${API_BASE}menus/${editingId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(editedMenu),
    })
      .then(() => {
        setEditingId(null);
        setEditedMenu({});
        fetchMenus();
      })
      .catch((e) => {
        console.error("Save menu failed:", e);
        alert("ไม่สามารถบันทึกการแก้ไขได้");
      })
      .finally(() => setActionInProgress(null));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedMenu({});
  };

  const deleteMenu = (id: number) => {
    setActionInProgress(id);
    fetch(`${API_BASE}menus/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
      .then(() => {
        fetchMenus();
        setDeleteConfirmId(null); // ปิด modal หลังลบ
      })
      .catch((e) => {
        console.error("Delete menu failed:", e);
        alert("ไม่สามารถลบเมนูได้");
      })
      .finally(() => setActionInProgress(null));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF7A00] to-[#FF3D00]">
              จัดการเมนู
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            เพิ่ม แก้ไข และจัดการเมนูอาหารของร้าน
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow transition">
            Logout
          </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="mb-6 p-4 bg-white shadow rounded-lg flex flex-wrap gap-3 items-center">
        <input
          placeholder="ชื่อเมนู"
          className="border p-2 rounded flex-1"
          value={newMenu.name || ""}
          onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
        />
        <input
          placeholder="ประเภท"
          className="border p-2 rounded flex-1"
          value={newMenu.category || ""}
          onChange={(e) => setNewMenu({ ...newMenu, category: e.target.value })}
        />
        <input
          placeholder="ราคา"
          type="number"
          className="border p-2 rounded w-28"
          value={newMenu.base_price || ""}
          onChange={(e) =>
            setNewMenu({ ...newMenu, base_price: e.target.value })
          }
        />
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={!!newMenu.is_available}
            onChange={(e) =>
              setNewMenu({ ...newMenu, is_available: e.target.checked })
            }
            className="form-checkbox h-5 w-5 text-green-500"
          />
          <span className="ml-2 text-gray-700">พร้อมขาย</span>
        </label>
        <input
          placeholder="Image URL"
          className="border p-2 rounded flex-1"
          value={newMenu.image_url || ""}
          onChange={(e) =>
            setNewMenu({ ...newMenu, image_url: e.target.value })
          }
        />
        <button
          onClick={createMenu}
          disabled={creating}
          className={`bg-blue-700 text-white px-5 py-2 rounded-xl shadow transition inline-flex items-center gap-2 ${
            creating ? "opacity-80 cursor-wait" : "hover:bg-blue-800"
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
                  strokeWidth="4"
                  fill="none"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span>กำลังเพิ่ม...</span>
            </>
          ) : (
            "เพิ่มเมนู"
          )}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto min-w-[800px]">
            <thead className="bg-gray-100">
              <tr className="text-gray-600 text-sm uppercase text-left">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">รูป</th>
                <th className="py-3 px-4">ชื่อเมนู</th>
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4">ราคา</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {menus.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    ไม่มีเมนูในระบบ
                  </td>
                </tr>
              ) : (
                menus.map((menu) => (
                  <tr key={menu.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{menu.id}</td>
                    <td className="py-3 px-4">
                      <img
                        src={menu.image_url}
                        alt={menu.name}
                        className="w-14 h-14 object-cover rounded-lg shadow-sm"
                        onError={(e) =>
                          (e.currentTarget.src =
                            "https://placehold.co/64x64/E2E8F0/888?text=No+Img")
                        }
                      />
                    </td>
                    <td className="py-3 px-4">
                      {editingId === menu.id ? (
                        <input
                          value={editedMenu.name || ""}
                          onChange={(e) =>
                            setEditedMenu({
                              ...editedMenu,
                              name: e.target.value,
                            })
                          }
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        menu.name
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingId === menu.id ? (
                        <input
                          value={editedMenu.category || ""}
                          onChange={(e) =>
                            setEditedMenu({
                              ...editedMenu,
                              category: e.target.value,
                            })
                          }
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        menu.category
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingId === menu.id ? (
                        <input
                          value={editedMenu.base_price || ""}
                          onChange={(e) =>
                            setEditedMenu({
                              ...editedMenu,
                              base_price: e.target.value,
                            })
                          }
                          type="number"
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        `${menu.base_price} บาท`
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingId === menu.id ? (
                        <input
                          type="checkbox"
                          checked={!!editedMenu.is_available}
                          onChange={(e) =>
                            setEditedMenu({
                              ...editedMenu,
                              is_available: e.target.checked,
                            })
                          }
                        />
                      ) : (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            menu.is_available
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                          {menu.is_available ? "พร้อมขาย" : "หมด"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {editingId === menu.id ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={saveEditedMenu}
                            disabled={actionInProgress !== null}
                            className="bg-green-500 text-white px-3 py-1 rounded-xl hover:bg-green-600 transition w-20 inline-flex items-center justify-center gap-2">
                            {actionInProgress === menu.id ? (
                              <svg
                                className="animate-spin h-4 w-4"
                                viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                              </svg>
                            ) : null}
                            <span>บันทึก</span>
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={actionInProgress !== null}
                            className="bg-gray-400 text-white px-3 py-1 rounded-xl hover:bg-gray-500 transition w-20">
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(menu)}
                            disabled={actionInProgress !== null}
                            className="bg-yellow-500 text-white px-3 py-1 rounded-xl hover:bg-yellow-300 transition w-20">
                            แก้ไข
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(menu.id)}
                            disabled={actionInProgress !== null}
                            className="bg-red-500 text-white px-3 py-1 rounded-xl hover:bg-red-600 transition w-20">
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

      {/* Modal ยืนยันการลบ */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xs mx-4">
            <h2 className="text-lg font-bold mb-4 text-red-600">
              ยืนยันการลบเมนู
            </h2>
            <p className="mb-4">คุณต้องการลบเมนูนี้จริงหรือไม่?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 text-gray-800"
                onClick={() => setDeleteConfirmId(null)}>
                ยกเลิก
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                onClick={() => deleteMenu(deleteConfirmId)}>
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
