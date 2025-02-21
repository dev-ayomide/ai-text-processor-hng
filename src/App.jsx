import { useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [error, setError] = useState("");

  async function detectLanguage(text) {
    if (!("ai" in self) || !("languageDetector" in self.ai)) {
      console.error("Language Detector API not supported.");
      return null;
    }
    try {
      const detector = await self.ai.languageDetector.create();
      const results = await detector.detect(text);
      return results.length > 0 ? results[0].detectedLanguage : null;
    } catch (error) {
      console.error("Language detection error:", error);
      return null;
    }
  }

  async function summarizeText(text) {
    if (!("ai" in self) || !("summarizer" in self.ai)) {
      console.error("Summarizer API not supported.");
      return null;
    }
    try {
      const summarizer = await self.ai.summarizer.create({
        task: "summarization",
        format: "plain-text",
        length: "short",
      });
      const result = await summarizer.summarize(text);
      return result ? result.summary || result : "Summarization failed";
    } catch (error) {
      console.error("Summarization error:", error);
      return "Error in summarization";
    }
  }

  async function translateText(text, sourceLang, targetLang) {
    if (!("ai" in self) || !("translator" in self.ai)) {
      console.error("Translator API not supported.");
      return;
    }
    try {
      const translator = await self.ai.translator.create({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });
      return await translator.translate(text);
    } catch (error) {
      console.error("Translation error:", error);
      return null;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setError("Please enter text before submitting.");
      return;
    }
    setError("");
    const detectedLanguage = await detectLanguage(inputText);
    const newMessage = { text: inputText, detectedLanguage, summary: "", translation: "" };
    setMessages([...messages, newMessage]);
    setInputText("");
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
    const translation = await translateText(message.text, message.detectedLanguage, selectedLanguage);
    if (translation) {
      const updatedMessages = [...messages];
      updatedMessages[index].translation = translation;
      setMessages(updatedMessages);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between p-6 bg-gray-900 text-white">
      <h1 className="text-center text-2xl font-bold">AI-Powered Text Processor</h1>

      <div className="w-full max-w-2xl mx-auto bg-gray-800 p-4 rounded-lg overflow-y-auto h-96">
        {messages.map((msg, index) => (
          <div key={index} className="p-3 bg-gray-700 rounded-lg mb-3">
            <p className="text-lg">{msg.text}</p>
            <p className="text-sm text-gray-400">Detected: {msg.detectedLanguage}</p>

            {msg.text.length > 150 && msg.detectedLanguage === "en" && (
              <button onClick={() => handleSummarize(index)} className="mt-2 bg-blue-500 p-2 rounded">
                Summarize
              </button>
            )}

            <div className="flex items-center gap-2 mt-2">
              <select className="bg-gray-600 p-2 rounded" onChange={(e) => setSelectedLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="pt">Portuguese</option>
                <option value="es">Spanish</option>
                <option value="ru">Russian</option>
                <option value="tr">Turkish</option>
                <option value="fr">French</option>
              </select>
              <button onClick={() => handleTranslate(index)} className="bg-green-500 p-2 rounded">
                Translate
              </button>
            </div>

            {msg.summary && <p className="mt-2 text-yellow-400">{msg.summary}</p>}
            {msg.translation && <p className="mt-2 text-green-400">{msg.translation}</p>}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 w-full max-w-2xl mx-auto bg-gray-800 p-4 rounded-lg">
        <textarea
          className="w-full p-2 bg-gray-700 rounded"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your text here..."
        />
        <button onClick={handleSubmit} className="bg-blue-600 p-3 rounded">
          Send
        </button>
      </div>

      {error && <p className="text-red-500 text-center mt-2">{error}</p>}
    </div>
  );
}

export default App;
