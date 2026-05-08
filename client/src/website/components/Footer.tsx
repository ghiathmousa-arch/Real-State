import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    const socialContent = [
        { src: '/img/insgram-icon.webp', classes: 'w-12 cursor-pointer' },
        { src: '/img/facebook-icon.webp', classes: 'w-10 cursor-pointer' }
    ];

    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pt-10 pb-6 px-6 md:px-20 transition-colors">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                
                {/* Brand Section */}
                <div className="flex flex-col items-center md:items-start max-w-sm gap-6">
                    <p className="text-gray-500 dark:text-gray-400 text-center md:text-start">
                        {t('footer.description')}
                    </p>
                    <div className='flex gap-3'>
                        {socialContent.map((item, index) => (
                            <div key={index} className='flex items-center justify-center rounded-xl'>
                                <img src={item.src} alt="social" className={item.classes} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logo & Copyright */}
                <div className='flex flex-col items-center gap-6'>
                    <img src="/img/real_state_logo-removebg-preview.png" alt="Logo" className="h-24 object-contain dark:brightness-125" />
                    <div className="text-gray-400 text-sm">
                        {t('footer.copyright')}
                    </div>
                </div>

                {/* Links Sections */}
                <div className="flex gap-16 md:gap-28">
                    {['investment', 'quick_links'].map((sectionKey) => {
                        // جلب بيانات القسم مع التأكد من أنها كائن (Object)
                        const sectionData = t(`footer.sections.${sectionKey}`, { returnObjects: true }) as any;
                        
                        // التأكد من أن العناصر عبارة عن مصفوفة لتجنب خطأ .map is not a function
                        const itemsArray = Array.isArray(sectionData?.items) ? sectionData.items : [];

                        return (
                            <div key={sectionKey} className="flex flex-col gap-4">
                                <h3 className="text-[#004E80] dark:text-blue-400 font-bold text-lg">
                                    {sectionData?.title || sectionKey}
                                </h3>
                                <ul className="flex flex-col gap-2">
                                    {itemsArray.map((item: any, idx: number) => (
                                        <li key={idx} className="text-sm">
                                            {item.to ? (
                                                <Link to={item.to} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-all">
                                                    {item.label}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400">{item.label}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </footer>
    );
};
// تأكد من وجود هذا السطر في النهاية لحل مشكلة "does not provide an export named 'default'"
export default Footer;