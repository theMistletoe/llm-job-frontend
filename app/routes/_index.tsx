import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix SPA" },
    { name: "description", content: "Welcome to Remix (SPA Mode)!" },
  ];
};

export default function Index() {
  const [input, setInput] = useState<string>("Please log three trending news items from https://news.yahoo.co.jp/rss/topics/top-picks.xml for today's Japan.");
  const [pageState, setPageState] = useState<"init"|"customizing">("init");
  const [generateCode, setGenerateCode] = useState<string>("");
  const [loadingGenerating, setLoadingGenerating] = useState<boolean>(false);

  const handleGenerate = () => {
    setPageState("customizing");
    setLoadingGenerating(true);
    fetch("https://aisample.apimistletoe.workers.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userinput:input }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setGenerateCode(data.generateCode);
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setLoadingGenerating(false);
      });
  };

  if (loadingGenerating) return <div>Loading...</div>;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      {pageState === "init" && (
        <>
          <h1>What cron job do you ship?</h1>
          <textarea
          style={{ width: "100%", height: "200px" }}
          value={input}
          placeholder="Please log three trending news items from https://news.yahoo.co.jp/rss/topics/top-picks.xml for today's Japan."
          onChange={(e) => setInput(e.target.value)}
          />
          <button
          style={{
            padding: "10px 20px",
            fontSize: "1.2em",
            fontWeight: "bold",
            color: "white",
            backgroundColor: "blue",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={handleGenerate}
          >
            Generate
          </button>
        </>
      )}
      {pageState === "customizing" && (
        <>
          <h1>Customize your cron job</h1>
          <textarea
          style={{ width: "100%", height: "200px" }}
          value={generateCode}
          onChange={(e) => setGenerateCode(e.target.value)}
          />
          <button
          style={{
            padding: "10px 20px",
            fontSize: "1.2em",
            fontWeight: "bold",
            color: "white",
            backgroundColor: "blue",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => {
            console.log(generateCode);
          }}
          >
            Deploy
          </button>
        </>
      )}
    </div>
  );
}
