import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaFacebookSquare, FaInstagramSquare } from "react-icons/fa";
import SEO_CONFIG from '../../seo.config';


const Footer = () => {
    const { t } = useTranslation();

    const socialContent = [
        {
            icon: <FaFacebookSquare size={28} />,
            link: SEO_CONFIG.social.facebook,
            className: "text-[#1877F2] hover:text-sky-400"
        },
        {
            icon: <FaInstagramSquare size={28} />,
            link: SEO_CONFIG.social.instagram,
            className: "text-[#1877F2] hover:text-sky-400"
        }
    ];

    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pt-10 pb-6 px-6 md:px-16 transition-colors">
            <div className="max-w-7xl mx-auto">

                {/* الصف الرئيسي */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-8">

                    {/* Brand */}
                    <div className="flex flex-col items-center sm:items-start gap-4 text-center sm:text-start">
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            {t('footer.description')}
                        </p>
                        <div className="flex gap-3">
                            {socialContent.map((item, index) => (
                                <a
                                    key={index}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`transition-colors duration-300 ${item.className}`}
                                >
                                    {item.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Logo & Copyright — يظهر في المنتصف على الديسكتوب فقط */}
                    <div className="hidden lg:flex flex-col items-center gap-4">
                        <img
                            src="/img/real_state_logo-removebg-preview.png"
                            alt="Logo"
                            className="h-20 object-contain dark:brightness-125"
                        />
                        <p className="text-gray-400 text-xs text-center">
                            {t('footer.copyright')}
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex justify-center sm:justify-end gap-12 sm:gap-16">
                        {['investment', 'quick_links'].map((sectionKey) => {
                            const sectionData = t(`footer.sections.${sectionKey}`, { returnObjects: true }) as any;
                            const itemsArray = Array.isArray(sectionData?.items) ? sectionData.items : [];

                            return (
                                <div key={sectionKey} className="flex flex-col gap-3">
                                    <h3 className="text-[#004E80] dark:text-blue-400 font-bold text-base">
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

                {/* Logo على الموبايل والتابلت — يظهر تحت */}
                <div className="flex lg:hidden flex-col items-center gap-3 pt-6 border-t border-gray-100 dark:border-slate-800">
                    <img
                        src="/img/real_state_logo-removebg-preview.png"
                        alt="Logo"
                        className="h-16 object-contain dark:brightness-125"
                    />
                    <p className="text-gray-400 text-xs text-center">
                        {t('footer.copyright')}
                    </p>
                </div>

            </div>
        </footer >
    );
};

export default Footer;