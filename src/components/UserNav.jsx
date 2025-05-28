import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-sm text-gray-700">👋 {user.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={() => navigate("/auth")}
          className="text-sm text-orange-600 hover:underline"
        >
          Login
        </button>
      )}
    </div>
  );
}
