import React, { useState, useRef, useEffect } from 'react';
import TurndownService from 'turndown';
import { marked } from 'marked';
import { ArrowLeft, Copy, Check, FileText, ClipboardPaste, RotateCcw, Layout, Eye, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const GoogleDocToMarkdown = () => {
    const [markdown, setMarkdown] = useState('');
    const [htmlPreview, setHtmlPreview] = useState('');
    const [copied, setCopied] = useState(false);
    const [copiedMd, setCopiedMd] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, converted
    const [viewMode, setViewMode] = useState('both'); // both, editor, preview
    const editableRef = useRef(null);

    const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        emDelimiter: '*'
    });

    // Handle Google Docs' bold and italic in spans
    turndownService.addRule('google-docs-bold', {
        filter: (node) => {
            return (
                node.nodeName === 'SPAN' &&
                (node.style.fontWeight === '700' || node.style.fontWeight === 'bold' || node.style.fontWeight === '600')
            );
        },
        replacement: (content) => `**${content}**`
    });

    turndownService.addRule('google-docs-italic', {
        filter: (node) => {
            return (
                node.nodeName === 'SPAN' &&
                (node.style.fontStyle === 'italic')
            );
        },
        replacement: (content) => `*${content}*`
    });

    // Custom rule for Google Docs lists
    turndownService.addRule('google-docs-list', {
        filter: ['li'],
        replacement: function (content, node) {
            content = content
                .replace(/^\n+/, '') 
                .replace(/\n+$/, '\n')
                .replace(/\n/gm, '\n    ');
            let prefix = '* ';
            let parent = node.parentNode;
            if (parent.nodeName === 'OL') {
                let start = parent.getAttribute('start');
                let index = Array.prototype.indexOf.call(parent.children, node);
                prefix = (start ? Number(start) + index : index + 1) + '. ';
            }
            return (
                prefix + content + (node.nextSibling && !/\n$/.test(content) ? '\n' : '')
            );
        }
    });

    const processHtml = (html) => {
        if (!html) return;
        try {
            const md = turndownService.turndown(html);
            setMarkdown(md);
            setStatus('converted');
        } catch (err) {
            console.error('Conversion error:', err);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const html = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');

        if (html) {
            processHtml(html);
        } else if (text) {
            setMarkdown(text);
            setStatus('converted');
        }
    };

    useEffect(() => {
        if (markdown) {
            const parsedHtml = marked.parse(markdown);
            setHtmlPreview(parsedHtml);
        } else {
            setHtmlPreview('');
        }
    }, [markdown]);

    const handleCopyPreview = async () => {
        if (!htmlPreview) return;
        try {
            const htmlContent = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.5; color: #24292f;">
                    ${htmlPreview}
                </div>
            `;
            const blobHtml = new Blob([htmlContent], { type: 'text/html' });
            const blobText = new Blob([markdown], { type: 'text/plain' });
            const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
            await navigator.clipboard.write(data);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            try {
                await navigator.clipboard.writeText(markdown);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (e) { console.error(e); }
        }
    };

    const handleReset = () => {
        setMarkdown('');
        setHtmlPreview('');
        setStatus('idle');
    };

    return (
        <div className="max-w-6xl mx-auto px-4">
            <SEO
                title="Google Doc to Markdown Converter - Preserve Formatting for Samsung Notes"
                description="Effortlessly convert Google Docs rich text to Markdown or HTML. Perfect for preserving bold, italics, and lists when pasting into Samsung Notes or other Markdown editors."
                keywords="google docs to markdown, rich text to markdown, gdocs to md, samsung notes formatting, convert google doc to markdown, online markdown converter"
                url="/google-doc-to-markdown"
            />

            <div className="mb-6">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Google Doc to Markdown</h1>
                        <p className="text-gray-600 mt-1">Paste your Google Doc content below to convert it.</p>
                    </div>
                    {markdown && (
                        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                            <button onClick={() => setViewMode('editor')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${viewMode === 'editor' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}><Code className="w-4 h-4" /> Code</button>
                            <button onClick={() => setViewMode('preview')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${viewMode === 'preview' ? 'bg-purple-50 text-purple-600' : 'text-gray-600'}`}><Eye className="w-4 h-4" /> Preview</button>
                            <button onClick={() => setViewMode('both')} className={`hidden lg:flex px-3 py-1.5 rounded-md text-sm font-medium items-center gap-1.5 ${viewMode === 'both' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}><Layout className="w-4 h-4" /> Split</button>
                        </div>
                    )}
                </div>
            </div>

            <div className={`grid gap-6 ${viewMode === 'both' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Input Area */}
                {(viewMode === 'both' || viewMode === 'editor') && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                <ClipboardPaste className="w-5 h-5 text-blue-600" />
                                1. Paste Here
                            </h3>
                            {markdown && (
                                <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"><RotateCcw className="w-4 h-4" /> Reset</button>
                            )}
                        </div>

                        {status === 'idle' ? (
                            <div 
                                ref={editableRef}
                                contentEditable
                                onPaste={handlePaste}
                                className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50/50 min-h-[300px] flex flex-col items-center justify-center focus:outline-none focus:border-blue-500 focus:bg-white"
                            >
                                <div className="p-4 bg-blue-50 rounded-full mb-4">
                                    <ClipboardPaste className="w-10 h-10 text-blue-600" />
                                </div>
                                <p className="text-gray-700 font-bold">Tap here and Paste</p>
                                <p className="text-gray-500 text-sm mt-2">Rich text from Google Docs will be converted automatically</p>
                                
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                            const items = await navigator.clipboard.read();
                                            for (const item of items) {
                                                if (item.types.includes('text/html')) {
                                                    const blob = await item.getType('text/html');
                                                    processHtml(await blob.text());
                                                    return;
                                                }
                                            }
                                            const text = await navigator.clipboard.readText();
                                            if (text) { setMarkdown(text); setStatus('converted'); }
                                        } catch (err) { alert('Please long-press and select Paste'); }
                                    }}
                                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors"
                                >
                                    Paste from Clipboard
                                </button>
                            </div>
                        ) : (
                            <textarea
                                value={markdown}
                                onChange={(e) => setMarkdown(e.target.value)}
                                className="w-full h-[500px] p-4 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        )}
                    </div>
                )}

                {/* Preview Area */}
                {(viewMode === 'both' || viewMode === 'preview') && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full min-h-[500px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-purple-600" />
                                2. Copy Result
                            </h3>
                            {markdown && (
                                <button
                                    onClick={handleCopyPreview}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow hover:opacity-90 transition-all font-medium flex items-center gap-2"
                                >
                                    {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy for Samsung Notes</>}
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-auto border border-gray-100 rounded-lg p-6 bg-white shadow-inner">
                            {markdown ? (
                                <div id="preview-container" className="markdown-preview" dangerouslySetInnerHTML={{ __html: htmlPreview }} />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 italic">
                                    <FileText className="w-12 h-12 mb-2 opacity-10" />
                                    <p>Your preview will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .markdown-preview { font-family: -apple-system, sans-serif; font-size: 16px; line-height: 1.6; color: #24292f; }
                .markdown-preview h1, .markdown-preview h2 { border-bottom: 1px solid #eee; padding-bottom: 0.3em; margin-top: 1.2em; margin-bottom: 0.6em; font-weight: 700; }
                .markdown-preview h1 { font-size: 1.8em; }
                .markdown-preview h2 { font-size: 1.4em; }
                .markdown-preview p { margin-bottom: 1em; }
                .markdown-preview ul, .markdown-preview ol { padding-left: 1.5em; margin-bottom: 1em; }
                .markdown-preview ul { list-style-type: disc; }
                .markdown-preview ol { list-style-type: decimal; }
                .markdown-preview strong { font-weight: 700; }
                .markdown-preview em { font-style: italic; }
            `}} />
        </div>
    );
};

export default GoogleDocToMarkdown;
