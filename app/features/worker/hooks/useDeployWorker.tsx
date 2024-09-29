import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "@remix-run/react";

type DeployedWorkerResponse = {
  status: string,
  statusText: string,
  workerId: string
}

export const useDeployWorker = () => {
  const [loadingDeploying, setLoadingDeploying] = useState<boolean>(false);
  const { getToken } = useAuth();

  const navigate = useNavigate();

  const createDeploy = async (generateCode: string, cronTime: string, formValues: { [key: string]: string }) => {

    setLoadingDeploying(true);
    try {
      const result = await fetch("https://aicron.apimistletoe.workers.dev/workers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({ 
          codeConetnts: generateCode,
          cronInfo: cronTime,
          secretKeyVars: formValues,
        }),
      });
      const data = await result.json() as DeployedWorkerResponse;
      console.log(data);
      navigate(`/workers/${data.workerId}`);
      toast.success("Deployed successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Deploy failed!");
    } finally {
      setLoadingDeploying(false);
    }
  };

  return { createDeploy, loadingDeploying };
};