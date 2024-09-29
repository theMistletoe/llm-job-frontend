import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Worker } from "~/features/worker/hooks/useWorkers";
import { useNavigate } from "@remix-run/react";


type Code = string;

type Placement = Record<string, unknown>;

type Binding = {
    name: string;
    type: 'secret_text';
};

type Settings = {
    placement: Placement;
    compatibility_date: string;
    compatibility_flags: string[];
    usage_model: string;
    tags: string[];
    tail_consumers: string[];
    logpush: boolean;
    bindings: Binding[];
};

type Schedule = {
    cron: string;
    created_on: string;
    modified_on: string;
};

export type WorkerInfo = {
    worker: Worker;
    code: Code;
    settings: Settings;
    schedules: Schedule[];
};


export const useWorkerInfo = (workerId: string | undefined) => {
    const [workerInfo, setWorkerInfo] = useState<WorkerInfo | undefined>(undefined);
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const getWorkerInfo = useCallback(async () => {
        if (!workerId) {
            setWorkerInfo(undefined);
            return;
        }
        setWorkerInfo(undefined);
        const token = await getToken();
        try {
            const response = await fetch(`https://aicron.apimistletoe.workers.dev/workers/${workerId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            console.dir(data);
            
            setWorkerInfo(data);
        } catch (error) {
            console.error("Failed to fetch workers:", error);
            setWorkerInfo(undefined);
        }
    }, [workerId, getToken]);

    useEffect(() => {
        getWorkerInfo();
    }, [getWorkerInfo, workerId]);

    const deleteWorker = async (workerId: string) => {
        const token = await getToken();
        const response = await fetch(`https://aicron.apimistletoe.workers.dev/workers/${workerId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        setWorkerInfo(undefined);
        navigate("/workers");
    };

    return {workerInfo, deleteWorker};
};