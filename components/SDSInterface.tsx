"use client";

import React, { useState, useRef } from 'react';
import { sdsService } from '../services/sdsService';

interface SDSDisplayProps {
    sds: {
        chemical: {
            name: string;
            casNumber?: string;
        };
        sections: Array<{
            number: number;
            title: string;
            content: string[];
        }>;
        hazardClass?: string[];
        pictograms?: string[];
        precautionaryStatements?: string[];
        emergencyProcedures?: string[];
        australianStandards?: string[];
        updated: string;
        source: string;
    };
}

const SDSDisplay: React.FC<SDSDisplayProps> = ({ sds }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">
            SAFETY DATA SHEET
        </h2>
        <div className="text-sm text-gray-600 mb-4 text-center">
            According to Safe Work Australia Codes of Practice
        </div>

        {/* Chemical Information */}
        <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">{sds.chemical.name}</h3>
            {sds.chemical.casNumber && (
                <p className="text-gray-600">CAS Number: {sds.chemical.casNumber}</p>
            )}
            <p className="text-gray-600">
                Last Updated: {new Date(sds.updated).toLocaleDateString()}
            </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
            {sds.sections.map(section => (
                <div key={section.number} className="border-t pt-4">
                    <h4 className="font-bold mb-2">
                        {section.number}. {section.title}
                    </h4>
                    <ul className="list-disc pl-6 space-y-1">
                        {section.content.map((line, i) => (
                            <li key={i} className="text-gray-700">{line}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>

        {/* Hazard Classification */}
        {sds.hazardClass && sds.hazardClass.length > 0 && (
            <div className="border-t pt-4 mt-6">
                <h4 className="font-bold mb-2">Hazard Classification</h4>
                <ul className="list-disc pl-6 space-y-1">
                    {sds.hazardClass.map((hazard, i) => (
                        <li key={i} className="text-gray-700">{hazard}</li>
                    ))}
                </ul>
            </div>
        )}

        {/* GHS Pictograms */}
        {sds.pictograms && sds.pictograms.length > 0 && (
            <div className="border-t pt-4 mt-6">
                <h4 className="font-bold mb-2">GHS Pictograms</h4>
                <div className="grid grid-cols-4 gap-4">
                    {sds.pictograms.map((pictogram, i) => (
                        <img
                            key={i}
                            src={`/images/ghs/${pictogram}.svg`}
                            alt={pictogram}
                            className="w-16 h-16"
                        />
                    ))}
                </div>
            </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-sm text-gray-600">
            <p>Source: {sds.source}</p>
            <p>Generated: {new Date().toLocaleString()}</p>
        </div>
    </div>
);

const SDSInterface: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sds, setSDS] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);

    const handleSearch = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await sdsService.getSDSByName(searchTerm);
            setSDS(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch SDS');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            setError(null);
            const buffer = await file.arrayBuffer();
            const result = await sdsService.getSDSFromPhoto(Buffer.from(buffer));
            setSDS(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process photo');
        } finally {
            setLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            chunks.current = [];

            recorder.ondataavailable = (e) => {
                chunks.current.push(e.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunks.current, { type: 'audio/webm' });
                const buffer = await blob.arrayBuffer();
                try {
                    setLoading(true);
                    setError(null);
                    const result = await sdsService.getSDSFromVoice(Buffer.from(buffer));
                    setSDS(result);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to process voice input');
                } finally {
                    setLoading(false);
                }
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            setError('Failed to start recording');
        }
    };

    const stopRecording = () => {
        mediaRecorder?.stop();
        setIsRecording(false);
        setMediaRecorder(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8 text-center">
                    Safety Data Sheet Lookup
                </h1>

                {/* Input Methods */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="space-y-6">
                        {/* Text Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search by Chemical Name
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Enter chemical name..."
                                    className="flex-1 rounded-md border border-gray-300 px-4 py-2"
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Photo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Photo of Label
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={loading}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full"
                                >
                                    Upload Photo
                                </button>
                            </div>
                        </div>

                        {/* Voice Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Voice Search
                            </label>
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={loading}
                                className={`${
                                    isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'
                                } text-white px-4 py-2 rounded-md w-full`}
                            >
                                {isRecording ? 'Stop Recording' : 'Start Voice Search'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* SDS Display */}
                {sds && <SDSDisplay sds={sds} />}
            </div>
        </div>
    );
};

export default SDSInterface;
