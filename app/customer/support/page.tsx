"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface Query {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  order?: {
    order_number: string;
  };
  resolution_notes?: string;
}

export default function CustomerSupportPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.getRole() !== "customer") {
      router.push(`/${user?.getRole()}/dashboard`);
      return;
    }

    loadQueries();
  }, [isAuthenticated, user, router]);

  const loadQueries = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/queries");
      const data = await response.json();
      setQueries(data.queries || []);
    } catch (error) {
      console.error("Error loading queries:", error);
      toast.error("Failed to load support queries");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit query");
      }

      toast.success("Query submitted successfully!");
      setShowForm(false);
      setFormData({ subject: "", description: "", priority: "medium" });
      await loadQueries();
    } catch (error) {
      console.error("Error submitting query:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit query"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="text-blue-500" size={20} />;
      case "in_progress":
        return <AlertCircle className="text-yellow-500" size={20} />;
      case "resolved":
      case "closed":
        return <CheckCircle className="text-green-500" size={20} />;
      default:
        return <MessageSquare className="text-gray-500" size={20} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 font-bold";
      case "high":
        return "text-orange-600 font-semibold";
      case "medium":
        return "text-blue-600";
      case "low":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Customer Support
            </h1>
            <p className="text-gray-600 mt-2">
              Get help with your orders and queries
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-medium"
          >
            <Plus size={20} />
            New Query
          </button>
        </div>

        {/* Create Query Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Submit a Query
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-900"
                  placeholder="Provide detailed information about your query..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Query"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-900"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Queries List */}
        {queries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No queries yet
            </h3>
            <p className="text-gray-600 mb-6">
              Have a question or issue? Submit your first query
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Create Query
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {queries.map((query) => (
              <div
                key={query.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(query.status)}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {query.subject}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>
                          {new Date(query.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                        {query.order && (
                          <span className="text-blue-600">
                            Order #{query.order.order_number}
                          </span>
                        )}
                        <span className={getPriorityColor(query.priority)}>
                          {query.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      query.status
                    )}`}
                  >
                    {query.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{query.description}</p>

                {query.resolution_notes && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-900 mb-1">
                      Resolution
                    </p>
                    <p className="text-sm text-green-800">
                      {query.resolution_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
