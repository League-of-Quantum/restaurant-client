"use client"; // Ensure it runs only on the client

import { useState, useRef } from "react";
import RecordRTC from "recordrtc";

export default function AudioRecorder() {
    const [audioBlob, setAudioBlob] = useState(null);
    const [indicatorState, setIndicatorState] = useState("inactive");
    const recorderRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            recorderRef.current = new RecordRTC(stream, { type: "audio" });
            recorderRef.current.startRecording();
            setIndicatorState("listening");
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopRecording = () => {
        if (recorderRef.current) {
            recorderRef.current.stopRecording(() => {
                const blob = recorderRef.current.getBlob();
                setAudioBlob(blob);
                setIndicatorState("speaking");
                setTimeout(() => setIndicatorState("inactive"), 2000);
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full">
            {/* 🎤 Audio Visualizer */}
            <div
                className={`w-48 h-48 rounded-full transition-all ${indicatorState === "listening"
                        ? "bg-green-500 scale-110"
                        : indicatorState === "speaking"
                            ? "bg-orange-500 scale-105"
                            : "bg-gray-500"
                    }`}
            />
            <p className="text-white mt-4 text-lg">{indicatorState.toUpperCase()}</p>

            {/* Buttons */}
            <div className="mt-4 space-x-4">
                <button onClick={startRecording} className="px-4 py-2 bg-green-500 text-white rounded-lg">
                    Start
                </button>
                <button onClick={stopRecording} className="px-4 py-2 bg-red-500 text-white rounded-lg">
                    Stop
                </button>
            </div>

            {/* Audio Playback */}
            {audioBlob && (
                <div className="mt-4">
                    <audio controls>
                        <source src={typeof window !== "undefined" ? window.URL.createObjectURL(audioBlob) : ""} type="audio/wav" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
        </div>
    );
}
