import { useCallback, useState } from "react";
import CustomizeWorker from "~/features/worker/CustomizeWorker";
import { useWorkerInfo } from "~/features/worker/hooks/useWorkerInfo";
import { useWorkers, Worker } from "~/features/worker/hooks/useWorkers";

export default function Workers() {
    const workers = useWorkers();
    const [selectedWorker, setSelectedWorker] = useState<Worker | undefined>(undefined);
    const {workerInfo, getWorkerInfo} = useWorkerInfo();
    const [editedCode, setEditedCode] = useState<string | undefined>(undefined);
    const [editedCron, setEditedCron] = useState<string | undefined>(undefined);

    const code = useCallback(() => {
        return editedCode || workerInfo?.code || "";
    }, [editedCode, workerInfo?.code]);

    const cron = useCallback(() => {
        return editedCron || workerInfo?.schedules[0].cron || "";
    }, [editedCron, workerInfo?.schedules]);

    const keys = useCallback(() => {
        return workerInfo?.settings.bindings.map((binding) => binding.name) || [];
    }, [workerInfo?.settings.bindings]);

    const handleSelectWorker = async (worker: Worker) => {
        setSelectedWorker(worker);
        await getWorkerInfo(worker.id);
    };

    const handleChangeCode = (code: string) => {
        setEditedCode(code);
    };

    const handleChangeCron = (cron: string) => {
        setEditedCron(cron);
    };

    return selectedWorker && workerInfo ? (
        <div>
            <CustomizeWorker
                generateCode={code()}
                onChangeCode={handleChangeCode}
                cronTime={cron()}
                onChangeCronTime={handleChangeCron}
                keys={keys()}
                secretValues={{}}
                onChangeSecretValues={function (key: string, value: string): void {
                    throw new Error("Function not implemented.");
                }}
                onClickDeploy={function (): void {
                    throw new Error("Function not implemented.");
                }}
                loadingDeploying={false}
            />
        </div>
    ) : (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-4">Workers List</h1>
            <ul className="space-y-2">
                {workers.length > 0 ? (
                    workers.map((worker, index) => (
                        <div 
                            tabIndex={index}
                            role="button"
                            key={worker.id}
                            className="p-3 bg-gray-100 rounded-md shadow-md"
                            onClick={() => handleSelectWorker(worker)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSelectWorker(worker);
                            }}>
                                {worker.script_name}
                        </div>
                    ))
                ) : (
                    <li className="p-3 bg-red-100 rounded-md shadow-md">No workers found</li>
                )}
            </ul>
        </div>
    );
}