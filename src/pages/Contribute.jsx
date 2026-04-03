import React from 'react';
import { Github, Bug, GitPullRequest, MessageSquare } from 'lucide-react';
import SEO from '../components/SEO';

const Contribute = () => {
    const GITHUB_URL = "https://github.com/sahajananddigital/printing-tools";

    const sections = [
        {
            title: "Report a Bug",
            description: "Found something that isn't working? Let us know so we can fix it.",
            icon: <Bug className="w-6 h-6 text-red-500" />,
            link: `${GITHUB_URL}/issues/new?template=bug_report.md`,
            buttonText: "Open an Issue"
        },
        {
            title: "Suggest a Feature",
            description: "Have an idea for a new tool or improvement? We'd love to hear it.",
            icon: <MessageSquare className="w-6 h-6 text-purple-500" />,
            link: `${GITHUB_URL}/issues/new?template=feature_request.md`,
            buttonText: "Make a Suggestion"
        },
        {
            title: "Contribute Code",
            description: "Want to help build these tools? Pull requests are always welcome.",
            icon: <GitPullRequest className="w-6 h-6 text-green-500" />,
            link: GITHUB_URL,
            buttonText: "View Repository"
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4">
            <SEO 
                title="Contribute - Printing Tools"
                description="Help improve Printing Tools by reporting issues, suggesting features, or contributing code on GitHub."
                url="/contribute"
            />

            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Contribute to Printing Tools</h1>
                <p className="text-lg text-gray-600">
                    This project is open-source and built by the community. Your help makes it better for everyone.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {sections.map((section, index) => (
                    <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            {section.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h3>
                        <p className="text-gray-500 text-sm mb-8 flex-1">
                            {section.description}
                        </p>
                        <a 
                            href={section.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                        >
                            {section.buttonText}
                        </a>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 rounded-3xl p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                    <Github className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Find us on GitHub</h2>
                <p className="text-blue-800 mb-8 max-w-xl mx-auto">
                    Explore the source code, star the project, or browse existing issues. Everything happens in the open.
                </p>
                <a 
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                    <Github className="w-5 h-5" />
                    Visit GitHub Repository
                </a>
            </div>
        </div>
    );
};

export default Contribute;
