import React, { useState, useCallback } from "react";
import "./index.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState("en");
  const [error, setError] = useState("");

  const detectLanguage = useCallback(async (text) => {
    if (!("ai" in self) || !("languageDetector" in self.ai)) {
      console.error("Language Detector API not supported.");
      setError("Feature unavailable: Language detection.");
      return null;
    }

    try {
      const languageDetector = await self.ai.languageDetector.create();
      const results = await languageDetector.detect(text);
      return results[0]?.detectedLanguage || null;
    } catch (detectionError) {
      console.error("Language detection error:", detectionError);
      setError(
        "Could not detect the language. Please try again."
      );
      return null;
    }
  }, []);

  const summarizeText = useCallback(async (text) => {
    if (!("ai" in self) || !("summarizer" in self.ai)) {
      console.error("Summarizer API not supported.");
      setError("Feature unavailable: Text summarization.");
      return null;
    }

    try {
      const summarizer = await self.ai.summarizer.create({
        task: "summarization",
        format: "plain-text",
        length: "short",
      });
      const summary = await summarizer.summarize(text);
      return summary?.summary || summary || "Failed to generate summary.";
    } catch (error) {
      console.error("Summarization error:", error);
      setError(
        "Summarization failed. Please check your input and try again."
      );
      return null;
    }
  }, []);

  const translateText = useCallback(async (text, sourceLang, targetLang) => {
    if (!("ai" in self) || !("translator" in self.ai)) {
      console.error("Translator API not supported.");
      setError("Feature unavailable: Text translation.");
      return null;
    }

    try {
      const translator = await self.ai.translator.create({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });
      return await translator.translate(text);
    } catch (error) {
      console.error("Translation error:", error);
      setError(
        "Translation failed. Check if the language pair is supported."
      );
      return null;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) {
      setError("Input field is empty. Please enter some text.");
      return;
    }

    setError("");
    const detectedLanguage = await detectLanguage(userInput);
    const newMessage = {
      text: userInput,
      language: detectedLanguage || "Unknown",
      summary: null,
      translation: null,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserInput("");
  };

  const handleSummarize = async (index) => {
    const message = messages[index];
    if (!message.text) return;

    const summary = await summarizeText(message.text);
    if (summary) {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[index] = { ...updatedMessages[index], summary };
        return updatedMessages;
      });
    }
  };

  const handleTranslate = async (index) => {
    const message = messages[index];
    if (!message.text) return;

    const translation = await translateText(
      message.text,
      message.language,
      selectedTargetLanguage
    );
    if (translation) {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[index] = { ...updatedMessages[index], translation };
        return updatedMessages;
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-6 justify-between">
      <h1 className="text-center text-2xl font-bold mb-4 text-blue-400">AI-Powered Text Processor</h1>

      <div className="w-full max-w-4xl mx-auto bg-gray-800 p-4 rounded-lg overflow-y-auto max-h-96 custom-scrollbar">
        {messages.map((message, index) => (
          <div key={index} className="bg-gray-700 rounded-lg mb-3 p-3">
            <p className="text-lg text-gray-100">{message.text}</p>
            <p className="text-sm text-gray-400">Language: {message.language}</p>

            {message.text.length > 150 && message.language === "en" && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
                onClick={() => handleSummarize(index)}
              >
                Summarize
              </button>
            )}

            <div className="flex items-center gap-2 mt-2">
              <select
                className="bg-gray-600 text-white rounded p-2"
                value={selectedTargetLanguage}
                onChange={(e) => setSelectedTargetLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="pt">Portuguese</option>
                <option value="es">Spanish</option>
                <option value="ru">Russian</option>
                <option value="tr">Turkish</option>
                <option value="fr">French</option>
              </select>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => handleTranslate(index)}
              >
                Translate
              </button>
            </div>

            {message.summary && (
              <div className="mt-2 text-yellow-400">
                <strong>Summary:</strong> {message.summary}
              </div>
            )}

            {message.translation && (
              <div className="mt-2 text-green-400">
                <strong>Translation:</strong> {message.translation}
              </div>
            )}
          </div>
        ))}
      </div>

      <form className="w-full max-w-4xl mx-auto bg-gray-800 p-4 rounded-lg flex flex-col gap-2" onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 bg-gray-700 text-white rounded"
          placeholder="Please enter a text..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Send
        </button>
      </form>

      {error && (
        <div className="text-red-500 text-center mt-2">{error}</div>
      )}
    </div>
  );
}

export default App;
