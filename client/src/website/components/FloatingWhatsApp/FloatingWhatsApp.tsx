import React from "react";

const WhatsAppIcon = ({ size = 28 }: { size?: number }) => (
  <img src="/img/whatsapp.svg" width={size} height={size} alt="WhatsApp" />
);

interface FloatingWhatsAppProps {
  message?: string;
  position?: "left" | "right";
}

const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  message = "مرحباً، أنا مهتم بأحد العقارات",
  position = "left"
}) => {
  const WHATSAPP_NUMBER = "963985148289";
  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 z-50 group ${position === "left" ? "left-6" : "right-6"}`}
      aria-label="WhatsApp"
    >
      <div className="relative flex flex-col items-center">
        {/* عبارة "تواصل معنا" تظهر دايماً فوق الزر */}
        <div className="mb-2 bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg animate-bounce">
          تواصل معنا
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800" />
        </div>

        {/* الزر الرئيسي */}
        <div className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer">
          <WhatsAppIcon size={28} />
        </div>
      </div>
    </a>
  );
};

export default FloatingWhatsApp;