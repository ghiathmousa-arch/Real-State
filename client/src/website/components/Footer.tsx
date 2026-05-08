import { Link } from 'react-router-dom';


// الواجهة الشاملة لكل محتويات الفوتر
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
            to?: string; // اختياري: إذا وجد يصبح رابطاً، وإذا لم يوجد يبقى نصاً
        }[];
    }[];
}

export const footerData: FooterConfig = {
    brand: {
        logoUrl: '/img/real_state_logo-removebg-preview.png', // مسار الشعار الخاص بك
        description: 'نحن نؤمن بأن العقار ليس مجرد جدران، بل هو استثمار في المستقبل وإرث يمتد للأجيال.',
        copyright: '© Syrian Architectural Prestige. All rights reserved 2024 '
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
interface socialLinks {
    src: string
    classes:string
}
const socialContent : socialLinks[]=[
    {
        src:'/img/insgram-icon.webp',
        classes:'w-12 cursore-pointer'
    },
    {
        src:'/img/facebook-icon.webp',
        classes:'w-10 cursore-pointer'
    }
]
const Footer = () => {
    const { brand, sections } = footerData;

    return (
        <div dir="rtl" className="bg-white border-t border-gray-200 pt-10 pb-1 px-6 md:px-20">
            <div className="max-w-7xl mx-auto flex md:flex-row justify-between items-start gap-12">
                
                <div className="flex flex-col items-center max-w-sm gap-20">
                    <p className="text-gray-500 text-[16px]">
                        {brand.description}
                    </p>
                    <div className='flex gap-3'>
                    {socialContent.map((item , index) => (
                        <div key={index} className='flex items-center justify-center rounded-xl text-white'>
                            <img src={item.src} alt="" className={item.classes} />
                            </div>
                    ))}
                    </div>
                </div>
                    <div className='flex flex-col items-center gap-16'>
                            <img 
                        src={brand.logoUrl} 
                        alt="Logo" 
                        className="h-34 w-50 object-contain"
                    />
                    <div className="text-gray-400 text-[15px] mt-2">
                        {brand.copyright}
                    </div>
                    </div>

                <div className="flex gap-16 md:gap-28">
                    {sections.map((section , index) => (
                        <div key={index} className="flex flex-col gap-6">
                            <h3 className="text-[#004E80] font-bold text-lg whitespace-nowrap">
                                {section.title}
                            </h3>
                            
                            <ul className="flex flex-col gap-3">
                                {section.items.map((item, index) => (
                                    <li key={index} className="text-[14px]">
                                        {item.to ? (
                                            <Link 
                                                to={item.to} 
                                                className="text-gray-500 hover:text-[#004E80] transition-all"
                                            >
                                                {item.label}
                                            </Link>
                                        ) : (
                                            <p className="text-gray-400">
                                                {item.label}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

            </div>
                            
        </div>
    );
};

export default Footer;