import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import TextareaAutosize from "react-textarea-autosize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import ClipLoader from "react-spinners/ClipLoader";

const App = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/gemini", {
        prompt: input,
      });
      setResponse(res.data.text);
    } catch (error) {
      console.log("error calling the gemini", error);
      setResponse("Error Generating Response");
    } finally {
      setIsLoading(false);
    }
  };

  const parseTextToHTML = (text) => {
    // Replace **bold** with <strong>bold</strong>
    let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Replace `code` with <code>code</code>
    html = html.replace(/`(.*?)`/g, "<code>$1</code>");

    // Replace new lines with <br>
    html = html.replace(/\n/g, "<br>");

    // Add more parsing rules as needed

    return html;
  };

  const renderHighlightedResponse = (text) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;

    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      const [fullMatch, lang, code] = match;
      const index = match.index;

      // Push the text before the code block
      if (index > lastIndex) {
        parts.push(text.substring(lastIndex, index));
      }

      // Push the code block with syntax highlighting
      parts.push({ lang, code });
      lastIndex = index + fullMatch.length;
    }

    // Push the remaining text after the last code block
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.map((part, index) => {
      if (typeof part === "string") {
        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: parseTextToHTML(part) }}
          />
        );
      } else {
        return (
          <div className="code-block-container">
            <CopyButton textToCopy={part.code} />
            <SyntaxHighlighter
              key={index}
              language={part.lang || "text"}
              style={coy}
            >
              {part.code}
            </SyntaxHighlighter>
          </div>
        );
      }
    });
  };
  const CopyButton = ({ textToCopy }) => {
    const handleCopy = () => {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          alert("Copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    };

    return (
      <button onClick={handleCopy} className="copy-button">
        <FontAwesomeIcon icon={faCopy} />
      </button>
    );
  };
  return (
    <div className="App">
      <h1>Gemini App</h1>
      <form onSubmit={handleSubmit}>
        <TextareaAutosize
          minRows={3}
          maxRows={10}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your query"
          className="textare"
        />
        <button type="submit" className="sendicon" disabled={isLoading}>
          {isLoading ? (
            <ClipLoader size={20} color={"#ffffff"} loading={isLoading} />
          ) : (
            <FontAwesomeIcon icon={faPaperPlane} size="lg" />
          )}
        </button>
      </form>
      <div className="response-container">
        <h2>AI Response</h2>
        {isLoading ? (
          <ClipLoader size={50} color={"#123abc"} loading={isLoading} />
        ) : (
          <div className="response-content">
            {renderHighlightedResponse(response)}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
