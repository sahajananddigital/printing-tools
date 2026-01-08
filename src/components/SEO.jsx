import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, url }) => {
    const siteTitle = 'Printing Tools';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const baseUrl = 'https://sahajananddigital.github.io/printing-tools';
    const fullUrl = url ? `${baseUrl}${url}` : baseUrl;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />

            <link rel="canonical" href={fullUrl} />
        </Helmet>
    );
};

export default SEO;
