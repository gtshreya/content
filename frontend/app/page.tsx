"use client";
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURATION ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;

// --- SVG ICONS ---
const UploadIcon = () => (
    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
);
const Spinner = () => (
    <motion.div 
        className="w-6 h-6 border-4 border-t-transparent border-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
);
const ResetIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9a9 9 0 0115.12-3.903" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 15a9 9 0 01-15.12-3.903" /></svg>
);

// --- MAIN PAGE ---
export default function LiteAnalyzerPage() {
    const [text, setText] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const resetState = () => {
        setText("");
        setSuggestions([]);
        setError("");
    };

    const handleFile = async (file: File) => {
        if (isLoading) return;
        resetState();
        setIsLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            // 1. Extract Text
            const extractRes = await axios.post(`${API_BASE_URL}/extract`, formData);
            const extractedText = extractRes.data.text;
            if (!extractedText) {
                setError("No text could be extracted from this file.");
                setIsLoading(false);
                return;
            }
            setText(extractedText);

            // 2. Get Suggestions
            const suggestRes = await axios.post(`${API_BASE_URL}/suggest`, { text: extractedText });
            setSuggestions(suggestRes.data.suggestions || []);

        } catch (err: any) {
            setError(err.response?.data?.error || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Drag and Drop Handlers ---
    const handleDragEvent = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
        else if (e.type === 'dragleave') setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-900 text-gray-200 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-500">
            <AnimatePresence>
                {!text && (
                    <motion.div
                        key="uploader"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="w-full max-w-2xl flex flex-col items-center"
                    >
                        <Header />
                        <FileUploader onDragEvent={handleDragEvent} onDrop={handleDrop} onFileChange={handleFileChange} isDragging={isDragging} isLoading={isLoading} />
                        {error && <ErrorMessage message={error} />}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {text && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="w-full max-w-4xl flex flex-col"
                    >
                        <ResultsHeader onReset={resetState} />
                        <div className="mt-4 flex flex-col gap-6">
                            <ResultsPanel title="Extracted Text" content={text} />
                            <ResultsPanel title="Suggested #" content={suggestions.join(' ')} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- UI SUB-COMPONENTS ---
const Header = () => (
    <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
            Content Extractor
        </h1>
        <p className="mt-2 text-lg text-slate-400">
            Instantly pull text and generate hashtags from your documents.
        </p>
    </div>
);

const FileUploader = ({ onDragEvent, onDrop, onFileChange, isDragging, isLoading }: any) => (
    <div 
        onDragEnter={onDragEvent} 
        onDragOver={onDragEvent} 
        onDragLeave={onDragEvent} 
        onDrop={onDrop}
        className={`relative w-full h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer
        ${isDragging ? 'border-sky-400 bg-sky-900/50 scale-105' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'}`}
    >
        <input type="file" id="file-upload" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={onFileChange} disabled={isLoading} />
        <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            <AnimatePresence>
                {isLoading ? (
                    <motion.div key="spinner" initial={{scale:0.5}} animate={{scale:1}}><Spinner /></motion.div>
                ) : (
                    <motion.div key="content" initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col items-center text-center p-4">
                        <UploadIcon />
                        <p className="mt-4 text-lg font-medium text-slate-300">
                            Drop a file here or <span className="font-bold text-sky-400">click to browse</span>
                        </p>
                        <p className="text-sm text-slate-500">Supports PDF, PNG, and JPG</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </label>
    </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-center text-red-400 bg-red-900/50 px-4 py-2 rounded-lg"
    >
        {message}
    </motion.div>
);

const ResultsHeader = ({ onReset }: { onReset: () => void }) => (
    <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
        <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            onClick={onReset} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
            <ResetIcon />
            New File
        </motion.button>
    </div>
);

const ResultsPanel = ({ title, content }: { title: string, content: string }) => (
    <div className="bg-slate-800/70 rounded-2xl p-6 flex flex-col">
        <h3 className="text-lg font-bold text-sky-400 mb-3 flex-shrink-0">{title}</h3>
        <div className="overflow-y-auto pr-2 max-h-[40vh]">
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                {content}
            </p>
        </div>
    </div>
);

