import React from "react";

type CustomizeWorkerProps = {
    generateCode: string;
    onChangeCode: (code: string) => void;
    cronTime: string;
    onChangeCronTime: (time: string) => void;
    keys: string[];
    secretValues: { [key: string]: string };
    onChangeSecretValues: (key: string, value: string) => void;
    onClickDeploy: () => void;
    loadingDeploying: boolean;
}

const CustomizeWorker: React.FC<CustomizeWorkerProps> = ({
  generateCode,
  onChangeCode,
  cronTime,
  onChangeCronTime,
  keys,
  secretValues,
  onChangeSecretValues,
  onClickDeploy,
  loadingDeploying,
}) => {
  return (
    <div className="m-5">
      <div className="flex flex-col justify-center items-center w-full">
        <div>
          <h1 className="text-2xl">Customize your cron job</h1>
        </div>
        <div className="flex justify-around w-full">
          <div className="w-3/5">
            <h2 className="text-xl">Generated Code</h2>
            <textarea
              value={generateCode}
              onChange={(e) => onChangeCode(e.target.value)}
              className="w-full h-96 text-lg p-2 rounded-md border-2 border-gray-300 mt-5"
            />
          </div>
          <div className="w-2/5 ml-8">
            <h2 className="text-xl">Cron Time</h2>
            <input
              value={cronTime}
              placeholder="ex) */5 * * * *"
              onChange={(e) => onChangeCronTime(e.target.value)}
              className="w-72 text-lg p-2 rounded-md border-2 border-gray-300 mt-5"
            />
            <div>
              <a
                href="https://developers.cloudflare.com/workers/configuration/cron-triggers/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 cursor-pointer mt-2 underline hover:text-blue-700"
              >
                ※ Cron Time Format
              </a>
            </div>
            <div className="mt-16">
              <h2 className="text-xl">Set secret env vars</h2>
              {keys.map((key) => (
                <div key={key}>
                  <label>
                    {key}:
                    <input
                      type="text"
                      value={secretValues[key] || ""}
                      onChange={(e) => onChangeSecretValues(key, e.target.value)}
                      className="text-lg p-2 rounded-md border-2 border-gray-300 mt-5"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-5">
          <button
            className="px-5 py-2 text-lg font-bold text-white bg-blue-500 border-none rounded-md cursor-pointer"
            onClick={onClickDeploy}
          >
            {loadingDeploying ? (
              <span className="animate-spin">Deploying...</span>
            ) : (
              "Deploy"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeWorker;