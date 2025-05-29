import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RegisterForm({ onSwitch }) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Invalid email format";
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await register(email, password, name);
      navigate("/profile");
    } catch (error) {
      if (error.response?.data?.error) {
        setErrors({ email: error.response.data.error });
      } else {
        setErrors({ email: "Registration failed. Please try again." });
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join our community of food lovers</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
      <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
        <input
              id="name"
              name="name"
              autoComplete="name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          type="text"
              placeholder="Enter your name or nickname"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
      </div>

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
              name="new-password"
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          type="password"
              placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
        )}
      </div>

      <button
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
        type="submit"
      >
            Create Account
      </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
        Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitch}
                className="text-orange-500 hover:text-orange-600 font-medium focus:outline-none focus:underline"
              >
                Sign In
              </button>
      </p>
          </div>
    </form>
      </div>
    </div>
  );
}
