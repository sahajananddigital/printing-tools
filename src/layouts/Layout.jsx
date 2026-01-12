import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Home, Printer } from 'lucide-react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
                        <Printer className="w-6 h-6" />
                        <span>Printing Tools</span>
                    </Link>
                    <nav>
                        <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                            Home
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                {children || <Outlet />}
            </main>

            <footer className="bg-gray-50 border-t border-gray-200 py-6">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    Built for efficiency. Run entirely in your browser.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
