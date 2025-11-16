"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/authStore";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

type UserRole = "customer" | "retailer" | "wholesaler" | "delivery";

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initialize } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  // Role selection
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    (searchParams.get("role") as UserRole) || "customer"
  );

  // Common fields
  const [phone, setPhone] = useState("");

  // Role-specific fields
  const [shopName, setShopName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<
    "bike" | "scooter" | "van" | "truck"
  >("bike");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserId(session.user.id);
      setUserEmail(session.user.email || "");
      setUserName(
        session.user.user_metadata.full_name ||
          session.user.user_metadata.name ||
          ""
      );
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Authentication error. Please try again.");
      return;
    }

    if (!phone) {
      toast.error("Phone number is required");
      return;
    }

    setIsLoading(true);

    try {
      // Create profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        email: userEmail,
        phone,
        full_name: userName,
        role: selectedRole,
      });

      if (profileError) throw profileError;

      // Create role-specific record
      switch (selectedRole) {
        case "customer":
          await supabase.from("customers").insert({
            id: userId,
            street_address: address,
            city,
            state,
            pincode,
          });
          break;

        case "retailer":
          if (!shopName) {
            toast.error("Shop name is required");
            setIsLoading(false);
            return;
          }
          await supabase.from("retailers").insert({
            id: userId,
            shop_name: shopName,
            shop_address: address,
            shop_city: city,
            shop_state: state,
            shop_pincode: pincode,
          });
          break;

        case "wholesaler":
          if (!businessName) {
            toast.error("Business name is required");
            setIsLoading(false);
            return;
          }
          await supabase.from("wholesalers").insert({
            id: userId,
            business_name: businessName,
            business_address: address,
            business_city: city,
            business_state: state,
            business_pincode: pincode,
            gst_number: gstNumber,
          });
          break;

        case "delivery":
          await supabase.from("delivery_persons").insert({
            id: userId,
            vehicle_type: vehicleType,
            vehicle_number: vehicleNumber,
            license_number: licenseNumber,
          });
          break;
      }

      // Reinitialize auth store to load the new user profile
      await initialize();

      toast.success("Profile completed successfully!");
      router.push(`/${selectedRole}/dashboard`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to complete profile";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const roleConfig = {
    customer: { label: "Customer", color: "blue", icon: "🛒" },
    retailer: { label: "Retailer", color: "green", icon: "🏪" },
    wholesaler: { label: "Wholesaler", color: "purple", icon: "📦" },
    delivery: { label: "Delivery Partner", color: "orange", icon: "🚚" },
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 mt-2">
            Just a few more details to get started
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection (if not pre-selected) */}
            {!searchParams.get("role") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Your Role
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {(
                    Object.keys(roleConfig) as Array<keyof typeof roleConfig>
                  ).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-4 border-2 rounded-lg text-center transition ${
                        selectedRole === role
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-3xl mb-1">
                        {roleConfig[role].icon}
                      </div>
                      <div className="font-medium text-sm text-gray-900">
                        {roleConfig[role].label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* User Info Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Signed in as:</p>
              <p className="font-medium text-gray-900">{userName || "User"}</p>
              <p className="text-sm text-gray-600">{userEmail}</p>
            </div>

            {/* Phone Number (Required for all) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number*
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                placeholder="+91 98765 43210"
                required
              />
            </div>

            {/* Role-specific fields */}
            {selectedRole === "customer" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    />
                  </div>
                </div>
              </>
            )}

            {selectedRole === "retailer" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shop Name*
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    placeholder="Your Shop Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shop Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    />
                  </div>
                </div>
              </>
            )}

            {selectedRole === "wholesaler" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name*
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    placeholder="Your Business Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    />
                  </div>
                </div>
              </>
            )}

            {selectedRole === "delivery" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) =>
                      setVehicleType(
                        e.target.value as "bike" | "scooter" | "van" | "truck"
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                  >
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    placeholder="DL 01 AB 1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    placeholder="DL1234567890"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Completing profile...
                </>
              ) : (
                "Complete Profile"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
