"use client";

import dynamic from "next/dynamic";

// Importing with SSR disabled
const AudioRecorder = dynamic(() => import("@/components/AudioRecorder"), { ssr: false });

export default function Home() {
  return (
    <div className="flex h-screen">
      {/* Left Side - Audio Recorder */}
      <div className="w-full bg-neutral-900 flex items-center justify-center">
        <AudioRecorder />
      </div>
    </div>
  );
}
