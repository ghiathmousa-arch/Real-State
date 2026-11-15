import { Outlet } from 'react-router-dom';

// غلاف صفحات الموقع العام. البحث صار بيودّي على /properties?... (الفلاتر بالـ URL)،
// فما عاد في searchContext ولا فلترة هون.
const Layout = () => (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        <Outlet />
    </div>
);

export default Layout;
