import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Home, Printer, Github, Bug } from 'lucide-react';

const Layout = ({ children }) => {
    const GITHUB_URL = "https://github.com/sahajananddigital/printing-tools";

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
                        <Printer className="w-6 h-6" />
                        <span>Printing Tools</span>
                    </Link>
                    <nav className="flex items-center">
                        <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                            Home
                        </Link>
                        <Link to="/docs" className="ml-6 text-gray-600 hover:text-blue-600 transition-colors">
                            Docs
                        </Link>
                        <Link to="/contribute" className="ml-6 text-gray-600 hover:text-blue-600 transition-colors">
                            Contribute
                        </Link>
                        <a 
                            href={GITHUB_URL} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="ml-6 text-gray-400 hover:text-gray-900 transition-colors"
                            title="GitHub Repository"
                        >
                            <Github className="w-5 h-5" />
                        </a>
                    </nav>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                {children || <Outlet />}
            </main>

            <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-auto">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-gray-500 text-sm">
                        <div className="space-y-4">
                            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                <Printer className="w-6 h-6 text-blue-600" />
                                <span>Printing Tools</span>
                            </Link>
                            <p className="max-w-xs">
                                A suite of fast, secure, and privacy-focused printing utilities that run entirely in your browser.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><Link to="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
                                <li><Link to="/docs" className="hover:text-blue-600 transition-colors">Documentation</Link></li>
                                <li><Link to="/contribute" className="hover:text-blue-600 transition-colors">Contribute</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-4">Support & Issues</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a 
                                        href={`${GITHUB_URL}/issues`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="hover:text-blue-600 transition-colors flex items-center gap-2"
                                    >
                                        <Bug className="w-4 h-4" />
                                        Report an Issue
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        href={GITHUB_URL} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="hover:text-blue-600 transition-colors flex items-center gap-2"
                                    >
                                        <Github className="w-4 h-4" />
                                        Contribute on GitHub
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 mt-12 pt-8 text-center">
                        <p>© {new Date().getFullYear()} Printing Tools. Built for efficiency.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
