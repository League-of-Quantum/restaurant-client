"use client";
import { useState, useRef } from "react";
import RecordRTC from "recordrtc";
import ConversationUI from "./ConversationUI";
import Image from "next/image";
import VoiceIndicator from "./VoiceIndicator";

export default function OrderFlow() {
    const [indicatorState, setIndicatorState] = useState("inactive");
    const [isRecording, setIsRecording] = useState(false);
    const [orderActive, setOrderActive] = useState(false);
    const [messages, setMessages] = useState([]); // For conversation messages
    const [orderDetails, setOrderDetails] = useState(null); // For order details
    const wsRef = useRef(null);
    const recorderRef = useRef(null);
    const streamRef = useRef(null);
    const autoRecordRef = useRef(false);
    const recordingInProgressRef = useRef(false);
    const orderActiveRef = useRef(false);

    const initWebSocket = () => {
        const ws = new WebSocket(process.env.NEXT_PUBLIC_SERVER_API);

        ws.onopen = () => {
            console.log("WebSocket connection established");
            ws.send(JSON.stringify({ type: "startOrder" }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Append the message to the conversation log
                setMessages((prevMessages) => [...prevMessages, data]);

                if (data.type === "setLastPrompt") {
                    const promptUrl = data.audioUrl || data.filename;
                    const promptAudio = new Audio(promptUrl);
                    promptAudio.play().catch((err) => console.error("Error playing audio:", err));

                    if (!promptUrl.includes("confirmation")) {
                        autoRecordRef.current = true;
                        promptAudio.addEventListener(
                            "ended",
                            () => {
                                console.log(
                                    "Prompt audio ended, autoRecordRef:",
                                    autoRecordRef.current,
                                    "orderActive:",
                                    orderActiveRef.current
                                );
                                if (!orderActiveRef.current) {
                                    autoRecordRef.current = false;
                                    return;
                                }
                                if (!isRecording && autoRecordRef.current) {
                                    autoRecordRef.current = false;
                                    setTimeout(() => startRecording(), 200);
                                }
                            },
                            { once: true }
                        );
                    }
                } else if (data.type === "orderComplete") {
                    console.log("Order complete message received. Closing WebSocket.");
                    autoRecordRef.current = false
                    stopRecording()
                    setOrderActive(false)
                    orderActiveRef.current = false

                    // If the server includes order details, update the state.
                    if (data.order) {
                        setOrderDetails(data.order);
                    }
                    if (wsRef.current) {
                        wsRef.current.close();
                    }
                }
            } catch (error) {
                console.error("Error parsing WS message:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = (event) => {
            console.log("WebSocket connection closed:", event);
        };

        wsRef.current = ws;
    };

    const unlockAudio = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
    };

    // Start order: clear previous messages/order, open WebSocket, and mark order active.
    const startOrder = () => {
        setMessages([]); // Clear conversation log
        setOrderDetails(null); // Clear previous order details
        initWebSocket();
        unlockAudio();
        setOrderActive(true);
        orderActiveRef.current = true;
    };

    const startRecording = async () => {
        if (recordingInProgressRef.current) {
            console.warn("Already recording!");
            return;
        }
        try {
            recordingInProgressRef.current = true;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            recorderRef.current = new RecordRTC(stream, {
                type: "audio",
                mimeType: "audio/wav",
            });
            recorderRef.current.startRecording();
            setIndicatorState("listening");
            setIsRecording(true);
            console.log("Recording started.");
        } catch (error) {
            console.error("Error accessing microphone:", error);
            recordingInProgressRef.current = false;
        }
    };

    const stopRecording = () => {
        if (!recorderRef.current || !streamRef.current) {
            console.warn("Recorder or stream is not initialized");
            return;
        }
        recorderRef.current.stopRecording(async () => {
            const blob = recorderRef.current.getBlob();
            console.log("Recording stopped, blob ready:", blob.size);

            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            recorderRef.current.destroy();
            recorderRef.current = null;
            setIndicatorState("uploading");
            setIsRecording(false);
            recordingInProgressRef.current = false;

            const s3Url = await uploadToS3(blob);
            if (s3Url) {
                console.log("Uploaded to S3:", s3Url);
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(
                        JSON.stringify({
                            type: "audioUploaded",
                            audioUrl: s3Url,
                        })
                    );
                    console.log("Sent audio URL to WebSocket server");
                }
            }
            setIndicatorState("inactive");
        });
    };

    const uploadToS3 = async (blob) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-url`);
            const { uploadUrl, fileUrl } = await response.json();
            const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                body: blob,
                headers: { "Content-Type": "audio/wav" },
            });
            if (!uploadResponse.ok) throw new Error("S3 upload failed");
            return fileUrl;
        } catch (error) {
            console.error("S3 Upload Error:", error);
            return null;
        }
    };

    return (
        <div className="flex items-center justify-center h-full w-full">
            <div className="w-1/2 h-full flex flex-col items-center justify-center flex-shrink-0">
                {!orderActive ? (
                    <div className="flex flex-col items-center space-y-4">
                        <Image
                            src="/bg.png"
                            width={200}
                            height={200}
                            className="rounded-full border shadow object-cover"
                            alt="icon"
                        />
                        <button
                            onClick={startOrder}
                            className="px-14 py-8 pb-10 bg-blue-500 text-white rounded-lg mb-4 text-7xl font-bold"
                        >
                            주문하기
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="text-white mt-4 text-lg flex flex-col items-center">
                            <div className="mb-8 text-2xl font-bold">{indicatorState === "inactive" ? "잠시만 기다려주세요" : indicatorState === "listening" ? "말씀하세요" : "잠시만 기다려주세요"}</div>
                            {/* Audio indicator: show a red dot when recording */}
                            {isRecording ? (
                                <VoiceIndicator />
                            ) : (
                                <div className="mt-4 flex items-center">
                                    <svg
                                        className="animate-spin h-40 w-40 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z"
                                        ></path>
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="space-x-4 mt-8">
                            <button
                                onClick={stopRecording}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                            >
                                Stop Recording
                            </button>
                        </div>
                    </div>
                )}


                {/* Loading indicator: show spinner when uploading */}
                {/* {indicatorState === "uploading" && (
                    <div className="mt-4 flex items-center">
                        <svg
                            className="animate-spin h-6 w-6 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                            ></path>
                        </svg>
                        <span className="ml-2 text-white">Loading...</span>
                    </div>
                )} */}
            </div>
            {messages.length > 0 && (
                <ConversationUI messages={messages} orderDetails={orderDetails} />
            )}
        </div>
    );
}
