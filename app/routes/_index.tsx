import { SignIn, SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

  const [loadingDeploying, setLoadingDeploying] = useState<boolean>(false);
  const [cronTime, setCronTime] = useState<string>("*/5 * * * *");

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

  const handleClickDeploy = async () => {

    setLoadingDeploying(true);
    try {
      const result = await fetch("https://aicron.apimistletoe.workers.dev/workers/scripts", {
        method: "PUT",
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
      const data = await result.json();
      console.log(data);
      toast.success("Deployed successfully!");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingDeploying(false);
    }
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
                    onChange={(e) => setGenerateCode(e.target.value)}
                    className="w-full h-96 text-lg p-2 rounded-md border-2 border-gray-300 mt-5"
                  />
                </div>
                <div className="w-2/5 ml-8">
                  <h2 className="text-xl">Cron Time</h2>
                  <input
                    value={cronTime}
                    placeholder="ex) */5 * * * *"
                    onChange={(e) => setCronTime(e.target.value)}
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
                    {keys.map(key => (
                      <div key={key}>
                        <label>
                          {key}:
                          <input
                            type="text"
                            value={formValues[key] || ''}
                            onChange={(e) => handleChange(key, e.target.value)}
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
                  onClick={handleClickDeploy}
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
