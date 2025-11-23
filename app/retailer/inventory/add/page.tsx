"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [categoryId, setCategoryId] = useState("");
  const [unit, setUnit] = useState("piece");
  const [stock, setStock] = useState("0");
  const [price, setPrice] = useState("0");
  const [mrp, setMrp] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!res.ok) return;
        const j = await res.json();
        setCategories(j.categories || []);
      } catch {}
    }
    fetchCategories();
  }, []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!categoryId) {
      setError("Please select a category");
      return;
    }
    if (!unit.trim()) {
      setError("Unit is required");
      return;
    }

    setLoading(true);
    try {
      // upload single image
      let imageUrls: string[] = [];
      if (file) {
        const form = new FormData();
        form.append("file0", file);
        const r = await fetch("/api/uploads", {
          method: "POST",
          body: form,
          credentials: "same-origin",
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Image upload failed");
        imageUrls = j.urls ? [j.urls[0]] : [];
      }

      const payload = {
        name,
        description: description || null,
        category_id: categoryId || null,
        base_price: price ? Number(price) : null,
        unit,
        stock: Number(stock || 0),
        price: price ? Number(price) : null,
        mrp: mrp ? Number(mrp) : null,
        low_stock_threshold: lowStockThreshold ? Number(lowStockThreshold) : 5,
        images: imageUrls,
        specifications: {},
      };

      const res = await fetch("/api/retailer/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to create product");

      setSuccess("Product created");
      setTimeout(() => router.push("/retailer/inventory"), 700);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
            <p className="text-sm text-gray-600 mt-1">
              Create a new inventory item
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/retailer/dashboard")}
              className="px-3 py-2 bg-gray-800 text-white rounded-md"
            >
              ← Dashboard
            </button>
            <button
              onClick={() => router.push("/retailer/inventory")}
              className="px-3 py-2 bg-white border border-gray-200 rounded-md"
            >
              Back to inventory
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow grid gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
            />
          </div>

          <div className="flex gap-3">
            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700">
                Unit
              </label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
                placeholder="e.g., piece, kg"
              />
            </div>

            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
              />
            </div>

            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700">
                Low stock threshold
              </label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled className="text-gray-500">
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="text-gray-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                MRP
              </label>
              <input
                type="number"
                step="0.01"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product image (only 1)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="mt-2"
            />
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="preview"
                className="w-24 h-24 object-cover rounded-md border mt-3"
              />
            )}
          </div>

          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => router.push("/retailer/inventory")}
              className="px-4 py-2 bg-white border border-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
