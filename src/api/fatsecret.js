import axios from "axios";

export const searchNutrition = async (ingredient) => {
  try {
    const res = await axios.get(`http://localhost:4000/api/nutrition?q=${ingredient}`);
    return res.data;
  } catch (err) {
    console.error("FatSecret fetch error:", err);
    return null;
  }
};
