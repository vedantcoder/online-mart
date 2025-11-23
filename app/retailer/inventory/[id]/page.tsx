"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditInventoryPage() {
  const router = useRouter();
  const params = useParams();
  const inventoryId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [unit, setUnit] = useState("piece");
  const [stock, setStock] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [mrp, setMrp] = useState<number | null>(null);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [invRes, catRes] = await Promise.all([
          fetch(`/api/retailer/products/${inventoryId}`, { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);
        const invJson = await invRes.json();
        const catJson = await catRes.json();
        if (!invRes.ok)
          throw new Error(invJson?.error || "Failed to load item");
        setCategories(catJson?.categories || []);

        const inv = invJson.inventory;
        setName(inv?.product?.name || "");
        setDescription(inv?.product?.description || "");
        setCategoryId(inv?.product?.category_id || null);
        setUnit(inv?.product?.unit || "piece");
        setStock(Number(inv?.quantity || 0));
        setPrice(Number(inv?.price || 0));
        setMrp(inv?.mrp !== null ? Number(inv?.mrp) : null);
        setLowStockThreshold(Number(inv?.low_stock_threshold ?? 5));
        const primaryImage = (inv?.product?.product_images || []).find(
          (i: any) => i.is_primary
        )?.image_url;
        setImagePreview(primaryImage || null);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    if (inventoryId) load();
  }, [inventoryId]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setImageFile(f);
    setImagePreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      let uploadedUrl: string | undefined;
      if (imageFile) {
        const form = new FormData();
        form.append("file0", imageFile);
        const r = await fetch("/api/uploads", { method: "POST", body: form });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Image upload failed");
        uploadedUrl = j?.urls?.[0];
      }

      const res = await fetch("/api/retailer/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventory_id: inventoryId,
          name,
          description,
          category_id: categoryId,
          unit,
          quantity: stock,
          price,
          mrp,
          low_stock_threshold: lowStockThreshold,
          image_url: uploadedUrl,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to save");
      setSuccess("Saved");
      setTimeout(() => router.push("/retailer/inventory"), 600);
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
            <p className="text-sm text-gray-600 mt-1">
              Update product and inventory details
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/retailer/inventory")}
              className="px-3 py-2 bg-white border border-gray-200 rounded-md"
            >
              Back
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>
        ) : (
          <form
            onSubmit={handleSave}
            className="bg-white p-6 rounded-lg shadow grid gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={categoryId || ""}
                  onChange={(e) => setCategoryId(e.target.value || null)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm p-2"
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  MRP
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={mrp ?? 0}
                  onChange={(e) => setMrp(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Low stock threshold
                </label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Primary Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="mt-1"
                />
                {imagePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded border mt-2"
                  />
                )}
              </div>
            </div>

            {success && <div className="text-green-600">{success}</div>}
            {error && <div className="text-red-600">{error}</div>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/retailer/inventory")}
                className="px-4 py-2 bg-white border border-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
