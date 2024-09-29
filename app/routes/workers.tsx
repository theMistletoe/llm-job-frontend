import { useNavigate } from "@remix-run/react";
import { useWorkers, Worker } from "~/features/worker/hooks/useWorkers";

export default function Workers() {
    const workers = useWorkers();
    const navigate = useNavigate();

    const handleSelectWorker = async (worker: Worker) => {
        navigate(`/${worker.id}`);
    };

    if (workers.length === 0) {
        return <div className="p-5">
            <h1 className="text-2xl font-bold mb-4">Workers List</h1>
            <p className="text-gray-600 mb-4">No workers found. Create a new worker to get started.</p>
            <div className="flex justify-center">
                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                    Create New Worker
                </button>
            </div>
        </div>
    }

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-4">Workers List</h1>
            <ul className="space-y-2">
                {workers.map((worker, index) => (
                    <div 
                        tabIndex={index}
                        role="button"
                        key={worker.id}
                        className="p-3 bg-gray-100 rounded-md shadow-md"
                        onClick={() => handleSelectWorker(worker)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSelectWorker(worker);
                        }}>
                            <div className="flex justify-between items-center">
                                <span>{worker.script_name}</span>
                                <span className="text-gray-500 text-sm">created at {worker.created_at}</span>
                            </div>
                    </div>
                ))}
            </ul>
        </div>
    );
}