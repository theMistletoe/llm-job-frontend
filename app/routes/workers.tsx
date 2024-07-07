import { useState } from "react";
import { useWorkers, Worker } from "~/features/worker/hooks/useWorkers";

export default function Workers() {
    const workers = useWorkers();
    const [selectedWorker, setSelectedWorker] = useState<Worker | undefined>(undefined);

    return !selectedWorker ? (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-4">List</h1>
            <ul className="space-y-2">
                {workers.length > 0 ? (
                    workers.map((worker, index) => (
                        <div 
                            tabIndex={index}
                            role="button"
                            key={worker.id}
                            className="p-3 bg-gray-100 rounded-md shadow-md"
                            onClick={() => setSelectedWorker(worker)}
                            onKeyDown={(e) => {
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