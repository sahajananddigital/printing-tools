import React, { useCallback, useState } from 'react';

const DropZone = ({ onFileSelect, multiple = false, accept = "application/pdf" }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const validateFile = useCallback((file) => {
        if (!accept || accept === '*' || accept === '*/*') return true;

        // Handle "image/*"
        if (accept === 'image/*') {
            return file.type.startsWith('image/');
        }

        // Handle "application/pdf"
        if (accept === 'application/pdf') {
            return file.type === 'application/pdf';
        }

        // Handle comma separated list e.g. "image/png, image/jpeg"
        const acceptedTypes = accept.split(',').map(t => t.trim());
        return acceptedTypes.some(type => {
            if (type.endsWith('/*')) {
                const prefix = type.split('/')[0];
                return file.type.startsWith(prefix + '/');
            }
            return file.type === type;
        });
    }, [accept]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files);

            if (multiple) {
                const validFiles = droppedFiles.filter(validateFile);
                if (validFiles.length > 0) {
                    onFileSelect(validFiles);
                } else {
                    alert(`Please upload supported files (${accept}).`);
                }
            } else {
                const file = droppedFiles[0];
                if (validateFile(file)) {
                    onFileSelect(file);
                } else {
                    alert(`Please upload a supported file (${accept}).`);
                }
            }
        }
    }, [onFileSelect, multiple, validateFile, accept]);

    const handleFileInput = useCallback((e) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);

            if (multiple) {
                const validFiles = selectedFiles.filter(validateFile);
                if (validFiles.length > 0) {
                    onFileSelect(validFiles);
                }
            } else {
                if (validateFile(selectedFiles[0])) {
                    onFileSelect(selectedFiles[0]);
                }
            }
        }
    }, [onFileSelect, multiple, validateFile]);

    const getHelperText = () => {
        if (accept === 'application/pdf') return "Only PDF files are supported";
        if (accept === 'image/*') return "Supported formats: JPG, PNG";
        return `Supported formats: ${accept}`;
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
        ${isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }
      `}
        >
            <input
                type="file"
                accept={accept}
                multiple={multiple}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileInput}
            />

            <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-full shadow-sm">
                    <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {multiple ? "Click to upload multiple files or drag and drop" : "Click to upload or drag and drop"}
                    </h3>
                    <p className="text-gray-500 mt-1">
                        {getHelperText()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DropZone;
