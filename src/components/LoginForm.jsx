import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ onSwitch }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleLogin = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Invalid email format";
    }

    

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = login(email, password);
    if (!success) {
      setErrors({ global: "Invalid email or password" });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
      <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
        <input
              id="email"
              name="email"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          type="email"
              placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
      </div>
 
      <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
        <input
              id="password"
              name="password"
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          type="password"
              placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
        )}
      </div>

          {errors.global && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-500">{errors.global}</p>
            </div>
          )}

      <button
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
        type="submit"
      >
            Sign In
      </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSwitch}
                className="text-orange-500 hover:text-orange-600 font-medium focus:outline-none focus:underline"
              >
                Create Account
              </button>
      </p>
          </div>
    </form>
      </div>
    </div>
  );
}
