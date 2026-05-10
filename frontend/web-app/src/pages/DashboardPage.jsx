import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const { logout } = useAuth();

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to DocFlow</h1>

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
