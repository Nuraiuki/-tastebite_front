import Slider from "react-slick";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const mealIds = [
  "53082", "52957", "53005", "52908", "52958",
  "52841", "52819", "52765", "52870", "53083", "52779"
];

export default function RecipeCarousel() {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const promises = mealIds.map((id) =>
          axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        );
        const results = await Promise.all(promises);
        const fetchedMeals = results.map((res) => res.data.meals[0]);
        setMeals(fetchedMeals);
      } catch (error) {
        console.error("Ошибка загрузки блюд:", error);
      }
    };

    fetchMeals();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,              
    autoplaySpeed: 3000,          
    swipeToSlide: true,           
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 }
      }
    ]
  };

  return (
    <div className="mb-12 max-w-7xl mx-auto px-4">
      <Slider {...settings}>
        {meals.map((meal) => (
          <div key={meal.idMeal} className="px-2">
            <Link to={`/meal/${meal.idMeal}`}>
              <div className="relative group overflow-hidden rounded-2xl">
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <p className="text-sm opacity-80 mb-1">🔥 85% would make this again</p>
                  <h2 className="text-2xl font-bold leading-tight">{meal.strMeal}</h2>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
}
