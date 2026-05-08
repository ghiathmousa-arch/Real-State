import { Link } from 'react-router-dom';

interface FooterConfig {
    brand: {
        logoUrl: string;
        description: string;
        copyright: string;
    };
    sections: {
        title: string;
        items: {
            label: string;
            to?: string;
        }[];
    }[];
}

interface socialLinks {
    src: string;
    classes: string;
}

export const footerData: FooterConfig = {
    brand: {
        logoUrl: '/img/real_state_logo-removebg-preview.png',
        description: 'نحن نؤمن بأن العقار ليس مجرد جدران، بل هو استثمار في المستقبل وإرث يمتد للأجيال.',
        copyright: '© Syrian Architectural Prestige 2026'
    },
    sections: [
        {
            title: 'الاستثمار',
            items: [
                { label: 'Investment Guide' },
                { label: 'Local Regulations' }
            ]
        },
        {
            title: 'روابط سريعة',
            items: [
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms of Service', to: '/terms' }
            ]
        }
    ]
};

const socialContent: socialLinks[] = [
    {
        src: '/img/insgram-icon.webp',
        classes: 'w-10 md:w-12 cursor-pointer'
    },
    {
        src: '/img/facebook-icon.webp',
        classes: 'w-8 md:w-10 cursor-pointer'
    }
];

const Footer = () => {
    const { brand, sections } = footerData;

    return (
        <footer dir="rtl" className="bg-white border-t border-gray-200 pt-12 pb-8 px-6 md:px-12 lg:px-20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12 text-center md:text-right">
                
                <div className="flex flex-row gap-10 sm:gap-16 lg:gap-24 order-1 md:order-3">
                    {sections.map((section, index) => (
                        <div key={index} className="flex flex-col gap-4">
                            <h3 className="text-[#004E80] font-bold text-base md:text-lg whitespace-nowrap">
                                {section.title}
                            </h3>
                            <ul className="flex flex-col gap-2 md:gap-3">
                                {section.items.map((item, subIndex) => (
                                    <li key={subIndex} className="text-xs md:text-sm">
                                        {item.to ? (
                                            <Link 
                                                to={item.to} 
                                                className="text-gray-500 hover:text-[#004E80] transition-colors"
                                            >
                                                {item.label}
                                            </Link>
                                        ) : (
                                            <p className="text-gray-400 cursor-default">
                                                {item.label}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-center md:items-start max-w-sm gap-6 md:gap-8 order-2">
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                        {brand.description}
                    </p>
                    <div className="flex gap-4">
                        {socialContent.map((item, index) => (
                            <div key={index} className="transition-transform hover:scale-110">
                                <img src={item.src} alt="social icon" className={item.classes} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. قسم الشعار والحقوق - يظهر في النهاية في الموبايل */}
                <div className="flex flex-col items-center gap-6 md:gap-10 order-3 md:order-1">
                    <img 
                        src={brand.logoUrl} 
                        alt="Logo" 
                        className="h-24 md:h-32 lg:h-34 w-auto object-contain"
                    />
                </div>

            </div>
                <div className="text-gray-400 text-center text-xs md:text-sm">
                        {brand.copyright}
                </div>
        </footer>
    );
};

export default Footer;