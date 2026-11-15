// src/pages/HomePage.tsx
import Hero from "../components/Hero";

const HomePage = () => {
    return (
        <div className="flex flex-col gap-28">
            {/* الـ Hero فيه البحث — بيودّي على /properties بالفلاتر المختارة */}
            <Hero />
        </div>
    );
};

export default HomePage;
