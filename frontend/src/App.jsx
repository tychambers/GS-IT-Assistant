import { useState } from "react";
import axios from "axios";
import PopupBox from "./popup";
import "../styles/styles.css"

const API_BASE = "https://gs-it-assistant.onrender.com";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/ask`, {
        query: question
      });
      setAnswer(res.data.answer);
      setSources(res.data.sources || []);
    } catch (error) {
      setAnswer("Error: " + (error.response?.data?.detail || error.message));
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div className="sour-gummy-title">Globalscape IT Assistant</div>
        <PopupBox />
      </div>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows="4"
          placeholder="Ask your IT question..."
        />
        <br />
        <button className="ask-button" onClick={askQuestion} disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      <div className="response">
        {answer && (
        <div style={{ marginTop: "2rem", background: "#f4f4f4", padding: "1rem", borderRadius: "8px" }}>
          <h3>Answer:</h3>
          <p style={{ lineHeight: "1.6" }}>{answer}</p>

          {sources.length > 0 && (
            <div>
              <h4>References:</h4>
              <ul style={{ paddingLeft: "1rem" }}>
                {sources.map((c, i) => (
                  <li key={i}>
                    <strong>Excerpt:</strong> {c.snippet}...
                    <br />
                    <a href={c.url} target="_blank" rel="noopener noreferrer">
                      View full document
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      </div>

    </div>
  );
}

export default App;
