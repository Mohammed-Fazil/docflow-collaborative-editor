import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function DashboardPage() {
  const { logout } = useAuth();

  const [message, setMessage] = useState("");

  const fetchProfile = async () => {
    try {
      const response = await api.get("/me");

      setMessage(response.data);
    } catch (error) {
      console.error(error);

      alert("Failed to fetch profile");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>

      <button
        onClick={fetchProfile}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Fetch Profile
      </button>

      <p className="mb-6 text-lg">{message}</p>

      <button
        onClick={() => {
          logout();

          window.location.href = "/login";
        }}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}

export default DashboardPage;
