"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { supabase } from "@/lib/supabase/client";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Camera,
  ArrowLeft,
} from "lucide-react";

interface CustomerProfile {
  id: string;
  email: string;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}

export default function CustomerProfile() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    street_address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, phone, full_name, avatar_url")
        .eq("id", user?.getId())
        .single();

      if (profileError) throw profileError;

      // Get customer-specific data
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("street_address, city, state, pincode")
        .eq("id", user?.getId())
        .single();

      if (customerError && customerError.code !== "PGRST116")
        throw customerError;

      const combinedProfile: CustomerProfile = {
        id: profileData.id,
        email: profileData.email,
        phone: profileData.phone,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        street_address: customerData?.street_address || null,
        city: customerData?.city || null,
        state: customerData?.state || null,
        pincode: customerData?.pincode || null,
      };

      setProfile(combinedProfile);
      setFormData({
        full_name: combinedProfile.full_name || "",
        phone: combinedProfile.phone || "",
        street_address: combinedProfile.street_address || "",
        city: combinedProfile.city || "",
        state: combinedProfile.state || "",
        pincode: combinedProfile.pincode || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.getRole() !== "customer") {
      router.push(`/${user?.getRole()}/dashboard`);
      return;
    }

    loadProfile();
  }, [isAuthenticated, user, router, loadProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq("id", user?.getId());

      if (profileError) throw profileError;

      // Update customer data
      const { error: customerError } = await supabase.from("customers").upsert({
        id: user?.getId(),
        street_address: formData.street_address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      });

      if (customerError) throw customerError;

      await loadProfile();
      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      street_address: profile?.street_address || "",
      city: profile?.city || "",
      state: profile?.state || "",
      pincode: profile?.pincode || "",
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/customer/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Avatar Section */}
          <div className="p-8 border-b">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-linear-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                  {profile.full_name
                    ? profile.full_name.charAt(0).toUpperCase()
                    : profile.email.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors">
                  <Camera size={16} className="text-gray-600" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.full_name || "Update your name"}
                </h2>
                <p className="text-gray-600">{profile.email}</p>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Edit size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User size={16} className="inline mr-2" />
                      Full Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            full_name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {profile.full_name || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail size={16} className="inline mr-2" />
                      Email
                    </label>
                    <p className="text-gray-900 py-2">{profile.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-2" />
                      Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {profile.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <MapPin size={20} className="inline mr-2" />
                  Delivery Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Street Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.street_address}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            street_address: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your street address"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {profile.street_address || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your city"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {profile.city || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your state"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {profile.state || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData({ ...formData, pincode: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your pincode"
                        maxLength={6}
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {profile.pincode || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
