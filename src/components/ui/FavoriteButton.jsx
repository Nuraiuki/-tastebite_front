import { Heart } from "lucide-react";

const FavoriteButton = ({ isFavorite, onToggle }) => (
  <button
    onClick={onToggle}
    className="absolute top-4 left-4 bg-white/70 hover:bg-white rounded-full p-2 transition"
    aria-label="Toggle Favorite"
  >
    <Heart
      className="w-6 h-6"
      fill={isFavorite ? "red" : "none"}
      color={isFavorite ? "red" : "gray"}
    />
  </button>
);

export default FavoriteButton;
