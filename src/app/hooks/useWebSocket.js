import { useEffect, useRef } from "react";

export function useWebSocket(url) {
    const wsRef = useRef(null);

    useEffect(() => {
        if (!wsRef.current) {
            const ws = new WebSocket(url);
            ws.onopen = () => console.log("WebSocket connection established");
            ws.onmessage = (event) => console.log("Received message:", event.data);
            ws.onerror = (error) => console.error("WebSocket error:", error);
            ws.onclose = (event) => console.log("WebSocket connection closed:", event);
            wsRef.current = ws;
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [url]);

    return wsRef;
}
