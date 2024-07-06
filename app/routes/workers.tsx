import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState, useCallback } from "react";

type Worker = {
    id: string;
    user_id: string;
    script_name: string;
    created_at: string;
    updated_at: string;
};

export default function Workers() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [selectedWorker, setSelectedWorker] = useState<Worker | undefined>(undefined);
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

    return !selectedWorker ? (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-4">List</h1>
            <ul className="space-y-2">
                {workers.length > 0 ? (
                    workers.map((worker, index) => (
                        <div tabIndex={index} role="button" key={worker.id} className="p-3 bg-gray-100 rounded-md shadow-md" onClick={() => setSelectedWorker(worker)} onKeyDown={(e) => {
                            if (e.key === "Enter") setSelectedWorker(worker);
                            }}>
                                {worker.script_name}
                        </div>
                    ))
                ) : (
                    <li className="p-3 bg-red-100 rounded-md shadow-md">No workers found</li>
                )}
            </ul>
        </div>
    ) : (
        <div>
            <h1>{selectedWorker.script_name}</h1>
        </div>
    );
}