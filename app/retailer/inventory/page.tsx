"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProductRow = {
  id: string;
  name: string;
  images?: string[] | null;
  category_id?: string | null;
  stock?: number | null;
  base_price?: number | null;
  created_at?: string | null;
};

export default function InventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/retailer/products", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load products");
      setProducts(json || []);
    } catch (err: any) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your products</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/retailer/dashboard")}
              className="px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
            >
              ← Dashboard
            </button>

            <button
              onClick={() => router.push("/retailer/inventory/add")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add Product
            </button>

            <button
              onClick={load}
              className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Products</p>
            <p className="text-2xl font-bold mt-2">{products.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Low stock</p>
            <p className="text-2xl font-bold mt-2">{products.filter(p => (p.stock ?? 0) < 5).length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Last added</p>
            <p className="text-2xl font-bold mt-2">{products[0]?.name ?? "—"}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total value</p>
            <p className="text-2xl font-bold mt-2">
              ₹
              {products.reduce((s, p) => s + Number(p.base_price ?? 0) * Number(p.stock ?? 0), 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading products…</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No products yet. Click{" "}
              <button onClick={() => router.push("/retailer/inventory/add")} className="text-blue-600 underline">
                Add Product
              </button>{" "}
              to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          {p.images && p.images.length ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{p.category_id ?? "-"}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-700">{p.stock ?? 0}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-700">₹{Number(p.base_price ?? 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500">
                        {p.created_at ? new Date(p.created_at).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}