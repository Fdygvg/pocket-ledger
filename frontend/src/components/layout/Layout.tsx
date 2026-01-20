import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './navbar';
import Footer from './footer';

const Layout = () => {
    const location = useLocation();
    const isSectionPage = /^\/sections\/[^/]+$/.test(location.pathname);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            {!isSectionPage && <Footer />}
        </div>
    );
};

export default Layout;
