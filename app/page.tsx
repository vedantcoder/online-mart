import Link from "next/link";
import { ShoppingBag, Store, Package, Truck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Online-MART
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-12">
            Multi-Tier Marketplace connecting Customers, Retailers, Wholesalers,
            and Delivery Partners
          </p>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {/* Customer Card */}
            <Link href="/login?role=customer">
              <div className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                    <ShoppingBag className="w-8 h-8 text-blue-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Customer
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    Browse products, place orders, and track deliveries
                  </p>
                </div>
              </div>
            </Link>

            {/* Retailer Card */}
            <Link href="/login?role=retailer">
              <div className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
                    <Store className="w-8 h-8 text-green-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Retailer
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    Manage inventory, handle orders, connect with wholesalers
                  </p>
                </div>
              </div>
            </Link>

            {/* Wholesaler Card */}
            <Link href="/login?role=wholesaler">
              <div className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
                    <Package className="w-8 h-8 text-purple-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Wholesaler
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    Supply to retailers, manage bulk inventory
                  </p>
                </div>
              </div>
            </Link>

            {/* Delivery Card */}
            <Link href="/login?role=delivery">
              <div className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
                    <Truck className="w-8 h-8 text-orange-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Delivery Partner
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    Manage deliveries, update order status
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-12">
            <p className="text-gray-600 mb-4">New to Online-MART?</p>
            <Link
              href="/register"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
