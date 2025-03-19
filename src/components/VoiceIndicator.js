import { useState, useEffect, useRef } from 'react';

export default function VoiceIndicator() {
    const [amplitude, setAmplitude] = useState(1);
    const animationFrameId = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        const setupAudio = async () => {
            try {
                // Request microphone access and store the stream in ref
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
                const audioContext = new AudioContext();
                const analyser = audioContext.createAnalyser();
                const microphone = audioContext.createMediaStreamSource(stream);
                microphone.connect(analyser);

                analyser.fftSize = 256; // Lower FFT size for faster updates
                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const updateAmplitude = () => {
                    analyser.getByteTimeDomainData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        const normalized = dataArray[i] - 128;
                        sum += Math.abs(normalized);
                    }
                    const avg = sum / dataArray.length;
                    // Normalize amplitude: 1 + (avg/32) for scaling outer circle
                    const newAmplitude = 1 + avg / 32;
                    setAmplitude(newAmplitude);
                    animationFrameId.current = requestAnimationFrame(updateAmplitude);
                };

                updateAmplitude();
            } catch (error) {
                console.error("Error accessing microphone:", error);
            }
        };

        setupAudio();

        return () => {
            // Cancel the animation frame
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            // Stop all audio tracks if stream exists
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    return (
        <div className="relative flex items-center justify-center">
            {/* Outer circle that grows based on amplitude */}
            <div
                style={{
                    transform: `scale(${amplitude})`,
                    transition: 'transform 0.1s ease-out',
                }}
                className="absolute w-40 h-40 bg-orange-500 rounded-full opacity-50"
            ></div>
            {/* Inner static circle */}
            <div className="relative w-36 h-36 bg-orange-500 rounded-full"></div>
        </div>
    );
}
