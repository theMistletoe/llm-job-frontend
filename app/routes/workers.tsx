import { useAuth } from "@clerk/clerk-react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import CustomizeWorker from "~/features/worker/CustomizeWorker";
import { useWorkerInfo } from "~/features/worker/hooks/useWorkerInfo";
import { useWorkers, Worker } from "~/features/worker/hooks/useWorkers";

export default function Workers() {
    const workers = useWorkers();
    const [selectedWorker, setSelectedWorker] = useState<Worker | undefined>(undefined);
    const {workerInfo, getWorkerInfo} = useWorkerInfo();
    const [editedCode, setEditedCode] = useState<string | undefined>(undefined);
    const [editedCron, setEditedCron] = useState<string | undefined>(undefined);
    const [editedSecretValues, setEditedSecretValues] = useState<{ [key: string]: string } | undefined>(undefined);

    const { getToken } = useAuth();

    const secretValues = useCallback(() => {
        if (editedSecretValues) return editedSecretValues;
        if (workerInfo?.settings.bindings) {
            return workerInfo.settings.bindings.reduce((acc: { [key: string]: string }, binding) => {
                acc[binding.name] = "(filtered)";
                return acc;
            }, {});
        }
        return {};
    }, [editedSecretValues, workerInfo?.settings.bindings]);

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

    const handleChangeSecretValues = (key: string, value: string) => {
        setEditedSecretValues((prev) => ({...prev, [key]: value}));
    };

    // editedCodeが元のコードから編集されているかどうかを判定する関数
    const isEditedCode = () => {
        if (!editedCode || !workerInfo?.code) return false;
        return editedCode !== workerInfo?.code;
    };

    const isEditedCron = () => {
        if (!editedCron || !workerInfo?.schedules[0].cron) return false;
        return editedCron !== workerInfo?.schedules[0].cron;
    };

    const isEditedSecretValues = () => {
        if (!editedSecretValues || !workerInfo?.settings.bindings) return false;
        const originalValues = workerInfo.settings.bindings.reduce((acc: { [key: string]: string }, binding) => {
            acc[binding.name] = "(filtered)";
            return acc;
        }, {});
        return JSON.stringify(editedSecretValues) !== JSON.stringify(originalValues);
    };

    const handleClickDeploy = async () => {
        if (!selectedWorker) {
            toast.error("No worker selected!");
            return;
        }

        if (!isEditedCode() && !isEditedCron() && !isEditedSecretValues()) {
            toast.error("No changes to deploy!");
            return;
        }

        const url = `https://aicron.apimistletoe.workers.dev/workers/${selectedWorker?.id}`;
        const body: { codeContents?: string, cronInfo?: string, secretKeyVars?: { [key: string]: string } } = {};
        if (isEditedCode()) {
            body.codeContents = code();
        }
        if (isEditedCron()) {
            body.cronInfo = cron();
        }
        if (isEditedSecretValues()) {
            body.secretKeyVars = secretValues();
        }

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await getToken()}`,
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('Success:', responseData);
            toast.success("Worker has been deployed!");
        } catch (error) {
            console.error('Failed to update worker:', error);
            toast.error("Failed to deploy worker!");
        }
    }

    return selectedWorker && workerInfo ? (
        <div>
            <CustomizeWorker
                workerName={selectedWorker.script_name}
                generateCode={code()}
                onChangeCode={handleChangeCode}
                cronTime={cron()}
                onChangeCronTime={handleChangeCron}
                keys={keys()}
                secretValues={secretValues()}
                onChangeSecretValues={handleChangeSecretValues}
                onClickDeploy={handleClickDeploy}
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