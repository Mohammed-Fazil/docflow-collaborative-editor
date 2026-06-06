import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { login } from "../api/authApi";

import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();

  const { login: saveLogin } = useAuth();

  /*
    FORM STATE
  */

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  /*
    UI STATE
  */

  const [loading, setLoading] = useState(false);

  /*
    SUBMIT
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await login({
        email,

        password,
      });

      /*
        SAVE TOKENS
      */

      saveLogin(
        response.accessToken,

        response.refreshToken,

        {
          email,
        },
      );

      /*
        NAVIGATE
      */

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT */}

      <div className="hidden lg:flex w-1/2 bg-[#5B5BD6] text-white flex-col justify-center px-20">
        <h1 className="text-6xl font-bold leading-tight mb-6">
          Write.
          <br />
          Collaborate.
          <br />
          Flow.
        </h1>

        <p className="text-xl text-white/80 max-w-md">
          DocFlow helps teams create, edit, and collaborate on documents in real
          time.
        </p>
      </div>

      {/* RIGHT */}

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
          <div className="mb-10">
            <h2 className="text-4xl font-bold mb-2">Welcome back</h2>

            <p className="text-gray-500">Login to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B5BD6]"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B5BD6]"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5B5BD6] hover:bg-[#4B4BC7] transition text-white p-4 rounded-xl font-semibold"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500">
            Don’t have an account?{" "}
            <Link to="/register" className="text-[#5B5BD6] font-semibold">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
