import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState, useCallback } from "react";

type Worker = {
    id: string;
    user_id: string;
    script_name: string;
    created_at: string;
    updated_at: string;
};

export default function List() {
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

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-4">List</h1>
            <ul className="space-y-2">
                {workers.length > 0 ? (
                    workers.map((worker) => (
                        <li key={worker.id} className="p-3 bg-gray-100 rounded-md shadow-md">
                            {worker.script_name}
                        </li>
                    ))
                ) : (
                    <li className="p-3 bg-red-100 rounded-md shadow-md">No workers found</li>
                )}
            </ul>
        </div>
    );
}