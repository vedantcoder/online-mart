"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [unit, setUnit] = useState("piece");
  const [stock, setStock] = useState("0");
  const [specs, setSpecs] = useState("{}");
  const [files, setFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    setFiles(list);
    if (!list) {
      setPreviewUrls([]);
      return;
    }
    const urls: string[] = [];
    for (let i = 0; i < list.length; i++) {
      try {
        urls.push(URL.createObjectURL(list[i]));
      } catch {}
    }
    setPreviewUrls(urls);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Product name is required");
      return;
    }

    setLoading(true);
    try {
      // upload images
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        const form = new FormData();
        for (let i = 0; i < files.length; i++) form.append("file" + i, files[i]);
        const r = await fetch("/api/uploads", { method: "POST", body: form, credentials: "same-origin" });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Image upload failed");
        imageUrls = j.urls || [];
      }

      const specifications = (() => {
        try {
          return specs ? JSON.parse(specs) : {};
        } catch {
          throw new Error("Specifications must be valid JSON");
        }
      })();

      const payload = {
        name,
        sku: sku || null,
        description: description || null,
        category_id: categoryId || null,
        base_price: basePrice ? Number(basePrice) : null,
        unit,
        stock: Number(stock || 0),
        images: imageUrls,
        specifications,
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
            <p className="text-sm text-gray-600 mt-1">Create a new inventory item</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/retailer/dashboard")} className="px-3 py-2 bg-gray-800 text-white rounded-md">
              ← Dashboard
            </button>
            <button onClick={() => router.push("/retailer/inventory")} className="px-3 py-2 bg-white border border-gray-200 rounded-md">
              Back to inventory
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2" />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">SKU</label>
              <input value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2" />
            </div>

            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <input value={unit} onChange={(e) => setUnit(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2" />
            </div>

            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category ID (optional)</label>
              <input value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Base price</label>
              <input type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Specifications (JSON)</label>
            <textarea value={specs} onChange={(e) => setSpecs(e.target.value)} rows={3} className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Product images</label>
            <input type="file" accept="image/*" multiple onChange={onFilesChange} className="mt-2" />
            <div className="flex gap-3 mt-3">
              {previewUrls.map((u, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={u} alt={`preview-${i}`} className="w-24 h-24 object-cover rounded-md border" />
              ))}
            </div>
          </div>

          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}

          <div className="flex items-center justify-end gap-3 mt-2">
            <button type="button" onClick={() => router.push("/retailer/inventory")} className="px-4 py-2 bg-white border border-gray-200 rounded-md">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {loading ? "Saving..." : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}