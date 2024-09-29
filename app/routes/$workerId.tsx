import { useAuth } from "@clerk/clerk-react";
import { useParams } from "@remix-run/react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import CustomizeWorker from "~/features/worker/CustomizeWorker";
import { useWorkerInfo } from "~/features/worker/hooks/useWorkerInfo";

export default function Workers() {
    const { workerId } = useParams();
    const {workerInfo, deleteWorker} = useWorkerInfo(workerId);
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
        if (!workerInfo) {
            toast.error("No worker selected!");
            return;
        }

        if (!isEditedCode() && !isEditedCron() && !isEditedSecretValues()) {
            toast.error("No changes to deploy!");
            return;
        }

        const url = `https://aicron.apimistletoe.workers.dev/workers/${workerInfo?.worker.id}`;
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

    const handleClickDelete = async () => {
        if (!workerInfo) {
            toast.error("No worker selected!");
            return;
        }

        if (window.confirm("Are you sure you want to delete this worker?")) {
            await deleteWorker(workerInfo.worker.id);
        }
    };

    return workerInfo && (
      <CustomizeWorker
          workerName={workerInfo?.worker.script_name}
          generateCode={code()}
          onChangeCode={handleChangeCode}
          cronTime={cron()}
          onChangeCronTime={handleChangeCron}
          keys={keys()}
          secretValues={secretValues()}
          onChangeSecretValues={handleChangeSecretValues}
          onClickDeploy={handleClickDeploy}
          loadingDeploying={false}
          onClickDelete={handleClickDelete}
      />
    );
}