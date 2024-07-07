import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

export type Worker = {
    id: string;
    user_id: string;
    script_name: string;
    created_at: string;
    updated_at: string;
};

export const useWorkers = () => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const { getToken } = useAuth();

    const getWorkers = useCallback(async () => {
        const token = await getToken();
        try {
            const response = await fetch("https://aicron.apimistletoe.workers.dev/workers", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setWorkers(data || []);
        } catch (error) {
            console.error("Failed to fetch workers:", error);
            setWorkers([]);
        }
    }, [getToken]);

    useEffect(() => {
        getWorkers();
    }, [getWorkers]);

    return workers;
};