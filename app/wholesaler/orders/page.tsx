'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Order = {
    id: string;
    retailerName: string;
    quantity: number;
    status: string;
    placedAt: string;
};

export default function WholesalerOrdersPage() {
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Replace this fetch with your real API endpoint: /api/wholesaler/orders
        async function load() {
            try {
                setLoading(true);
                // Example placeholder data; swap with real fetch call
                const example: Order[] = [
                    { id: 'WD-1002', retailerName: 'Acme Grocery', quantity: 240, status: 'Pending', placedAt: '2025-11-20T10:00:00Z' },
                    { id: 'WD-1001', retailerName: 'GreenMart', quantity: 120, status: 'Delivered', placedAt: '2025-11-18T08:30:00Z' },
                ];
                // Simulate fetch delay
                await new Promise((r) => setTimeout(r, 400));
                setOrders(example);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <main className="p-6">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Orders</h1>
                    <p className="text-sm text-gray-600">All wholesaler orders and status</p>
                </div>
                <Link href="/wholesaler/dashboard" className="text-sm underline">
                    Back to dashboard
                </Link>
            </header>

            {loading && <div className="text-sm text-gray-600">Loading orders…</div>}

            {!loading && orders && orders.length === 0 && (
                <div className="text-sm text-gray-600">No orders found.</div>
            )}

            <div className="space-y-3">
                {orders?.map((o) => (
                    <div key={o.id} className="p-4 border rounded bg-white">
                        <div className="flex justify-between">
                            <div>
                                <div className="font-medium">{o.id}</div>
                                <div className="text-sm text-gray-600">Retailer: {o.retailerName}</div>
                            </div>
                            <div className="text-sm text-gray-700">Qty: {o.quantity}</div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">Status: {o.status} • Placed: {new Date(o.placedAt).toLocaleString()}</div>
                        <div className="mt-3 flex gap-2">
                            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">View</button>
                            <button className="px-3 py-1 bg-gray-200 rounded text-sm">Message Retailer</button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}