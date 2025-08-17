import React, { useState } from "react";
import "../styles/styles.css";

function PopupBox() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Button to open */}
      <button className="toolbar-button" onClick={() => setIsOpen(true)}>
        More Info
      </button>

      {/* Popup */}
      {isOpen && (
        <div className="popup" onClick={() => setIsOpen(false)}>
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              X
            </button>
            <h2>Globalscape IT Assistant</h2>
            <p>GS IT assistant is a web app powered by the chatgpt engine. It uses the following Knowlegde Bases for it's master mind repository:
                <ul>
                    <li>EFT 8.2 KB</li>
                    <li>EFT Arcus KB</li>
                    <li>Globalscape Helpdocs</li>
                </ul>
                Ask it questions about things that would be found in any of these KBs and it will provide informative responses, and reference relevant documentation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PopupBox;