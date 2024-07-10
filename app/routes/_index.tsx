import { SignIn, SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import CustomizeCronJob from "~/features/worker/CustomizeWorker";
import { useDeployWorker } from "~/features/worker/hooks/useDeployWorker";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix SPA" },
    { name: "description", content: "Welcome to Remix (SPA Mode)!" },
  ];
};

export default function Index() {
  const [input, setInput] = useState<string>("Please send email three trending news items from https://news.yahoo.co.jp/rss/topics/top-picks.xml for today's Japan.");
  const [pageState, setPageState] = useState<"init"|"customizing">("init");
  const [generateCode, setGenerateCode] = useState<string>("");
  const [loadingGenerating, setLoadingGenerating] = useState<boolean>(false);
  const [keys, setKeys] = useState<string[]>([]);
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});

  const [cronTime, setCronTime] = useState<string>("*/5 * * * *");
  const { createDeploy, loadingDeploying } = useDeployWorker();

  const { getToken } = useAuth();

  const handleClickGenerate = async () => {
    try {
      setPageState("customizing");
      setLoadingGenerating(true);
      const result = await fetch("https://aicron.apimistletoe.workers.dev/ai/script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({ reqiurements:input }),
      });
      const data = await result.json();
      setGenerateCode(data.generateCode);

      const res = await fetch("https://aicron.apimistletoe.workers.dev/ai/maskedscript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({ inputCode:data.generateCode }),
      });
      const maskeddata = await res.json();
      console.log(JSON.parse(maskeddata.result));
      setGenerateCode(JSON.parse(maskeddata.result).modified_code);
      setKeys(JSON.parse(maskeddata.result).secret_env_names);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingGenerating(false);
    }
  };

  const handleClickDeploy = () => {
    createDeploy(generateCode, cronTime, formValues);
  };

  const LoadingDots = () => {
    const [dots, setDots] = useState('.');
  
    useEffect(() => {
      const intervalId = setInterval(() => {
        setDots(dots => dots.length < 3 ? dots + '.' : '.');
      }, 500); // 500ms間隔で点を追加
  
      return () => clearInterval(intervalId); // コンポーネントのアンマウント時にタイマーをクリア
    }, []);
  
    return <span>{dots}</span>;
  };

  const handleChange = (key: string, value: string) => {
    setFormValues(prevValues => ({
      ...prevValues,
      [key]: value
    }));
  };

  const LoadingSpinner = () => (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      <div className="mt-8">
        <p className="text-2xl font-bold text-blue-500">Wait for Code Generating <LoadingDots /></p>
      </div>
    </div>
  );

  // Place the LoadingSpinner component in your code
  if (loadingGenerating) return <LoadingSpinner />;

  return (
    <>
    <SignedIn>
      <div className="font-sans leading-8">
        {pageState === "init" && (
          <div className="m-5">
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-2xl">What cron job do you ship?</h1>
              <textarea
                className="w-full h-96 text-lg p-2 rounded-md border-2 border-gray-300 mt-5"
                value={input}
                placeholder="Please log three trending news items from https://news.yahoo.co.jp/rss/topics/top-picks.xml for today's Japan."
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                className="px-5 py-2 text-lg font-bold text-white bg-blue-500 border-none rounded-md cursor-pointer mt-5"
                onClick={handleClickGenerate}
              >
                Generate
              </button>
            </div>
          </div>
        )}
        {pageState === "customizing" && (
          <CustomizeCronJob
            workerName="New Worker"
            generateCode={generateCode}
            onChangeCode={setGenerateCode}
            cronTime={cronTime}
            onChangeCronTime={setCronTime}
            keys={keys}
            secretValues={formValues}
            onChangeSecretValues={handleChange}
            onClickDeploy={handleClickDeploy}
            loadingDeploying={loadingDeploying}
          />
        )}
      </div>
    </SignedIn>
    <SignedOut>
      <div className="flex flex-col justify-center items-center h-screen">
        <SignIn />
      </div>
    </SignedOut>
    </>
  );
}
