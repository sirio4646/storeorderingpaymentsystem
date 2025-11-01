import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../../utils/apiBase";
import { useAuthStore } from "../../store/authStore";
import Spinner from "../../components/Spinner";
import type { CartItem } from "./OrderFoodPage";

interface Props {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export default function CartPage({ cart, setCart }: Props) {
  const navigate = useNavigate();
  const { table_number } = useParams<{ table_number: string }>();
  const parsedTableNumber = Number(table_number);
  const [checkingOut, setCheckingOut] = useState(false);

  const updateItem = (menu_id: number, quantity: number, notes: string) => {
    setCart(
      cart.map((item) =>
        item.menu_id === menu_id ? { ...item, quantity, notes } : item
      )
    );
  };

  const removeFromCart = (menu_id: number) => {
    setCart(cart.filter((item) => item.menu_id !== menu_id));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.quantity * item.price_at_order,
    0
  );

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("ตะกร้าว่าง! กรุณาเลือกอาหารก่อนชำระเงิน");
      return;
    }

    const token = useAuthStore.getState().token;
    if (!token) {
      alert("กรุณา login ก่อนสั่งอาหาร");
      return;
    }

    try {
      setCheckingOut(true);
      const orderData = {
        table_number: parsedTableNumber,
        total_amount: Number(totalAmount.toFixed(2)),
        status: "pending",
        payment_status: "unpaid",
        items: cart.map((item) => ({
          menu_id: item.menu_id,
          quantity: item.quantity,
          price_at_order: item.price_at_order,
          notes: item.notes || "",
        })),
      };

      const response = await axios.post(`${API_BASE}orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.order_id) {
        alert("ออเดอร์ถูกสร้างแล้ว");
        navigate(`/payment/${response.data.order_id}`);
      } else {
        alert("สร้างออเดอร์ไม่สำเร็จ กรุณาลองอีกครั้ง");
      }
    } catch (err: any) {
      console.error("Checkout error:", err.response?.data || err);
      alert("สร้างออเดอร์ไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4 sm:p-6 text-gray-800 font-sans">
      {/* ปุ่มย้อนกลับ + Cart */}
      <div className="flex justify-between items-start mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-[#FF6500] rounded-xl hover:shadow-md transition border border-[#FFE6C7]">
          <span className="text-lg">←</span>
          <span className="font-medium">ย้อนกลับ</span>
        </button>

        <button
          onClick={() => navigate(`/cart/${table_number}`)}
          className="flex items-center gap-3 bg-gradient-to-r from-[#FF7A00] to-[#FF3D00] text-white px-4 py-2 rounded-full shadow-lg hover:opacity-95 transition">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 3h2l.4 2M7 13h10l4-8H5.4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-semibold">ตะกร้า</span>
          {cart.length > 0 && (
            <span className="bg-white text-[#FF6500] px-2 py-1 rounded-full text-sm font-semibold">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-[#FF6500]">
        ตะกร้าสินค้า (โต๊ะ {parsedTableNumber})
      </h1>

      <div className="w-full max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-12 text-lg">
            ตะกร้าว่างเปล่า
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {cart.map((item) => (
              <li key={item.menu_id} className="py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl hover:shadow-sm transition bg-white">
                  {/* รูป + ชื่อ + หมายเหตุ */}
                  <div className="flex-1 flex gap-4 w-full sm:w-auto">
                    <img
                      src={item.image_url || "https://via.placeholder.com/80"}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 flex flex-col gap-2">
                      <h4 className="font-semibold text-base sm:text-lg text-gray-800">
                        {item.name}
                      </h4>
                      <input
                        type="text"
                        value={item.notes}
                        placeholder="หมายเหตุ เช่น ไม่เผ็ด"
                        onChange={(e) =>
                          updateItem(
                            item.menu_id,
                            item.quantity,
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6500] hover:bg-gray-50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* ปุ่มเพิ่ม/ลดจำนวน */}
                  <div className="flex items-center gap-1 mt-2 sm:mt-0">
                    <button
                      onClick={() =>
                        updateItem(
                          item.menu_id,
                          Math.max(item.quantity - 1, 1),
                          item.notes
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-[#FFF6EB] hover:bg-[#FFE6C7] active:scale-95 transition-transform text-lg font-bold border border-[#FFE6C7]">
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.menu_id,
                          parseInt(e.target.value) || 1,
                          item.notes
                        )
                      }
                      className="w-12 text-center px-1 py-2 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6500] text-base"
                    />
                    <button
                      onClick={() =>
                        updateItem(item.menu_id, item.quantity + 1, item.notes)
                      }
                      className="px-3 py-2 rounded-xl bg-[#FFF6EB] hover:bg-[#FFE6C7] active:scale-95 transition-transform text-lg font-bold border border-[#FFE6C7]">
                      +
                    </button>
                  </div>

                  {/* ราคาต่อรายการ + ปุ่มลบ */}
                  <div className="flex flex-col sm:items-end gap-2 mt-2 sm:mt-0 min-w-[120px] text-right">
                    <span className="font-bold text-[#26355D] text-base sm:text-lg truncate">
                      ฿{(item.quantity * item.price_at_order).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.menu_id)}
                      className="px-4 py-2 bg-white text-[#FF6500] rounded-xl border border-[#FFB566] hover:shadow-sm transition text-sm sm:text-base">
                      ลบ
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] sm:w-[640px] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-lg flex items-center justify-between gap-4 z-50">
        <div>
          <div className="text-sm text-gray-500">ยอดรวม</div>
          <div className="text-lg font-bold text-gray-900">
            ฿{totalAmount.toFixed(2)}
          </div>
        </div>
        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          className={`px-6 py-3 bg-gradient-to-r from-[#FF7A00] to-[#FF3D00] text-white font-semibold rounded-xl shadow-lg inline-flex items-center gap-2 ${
            checkingOut ? "opacity-80 cursor-wait" : "hover:opacity-95"
          }`}>
          {checkingOut ? (
            <>
              <Spinner size={18} /> กำลังสร้างออเดอร์...
            </>
          ) : (
            "ชำระเงิน"
          )}
        </button>
      </div>
    </div>
  );
}
