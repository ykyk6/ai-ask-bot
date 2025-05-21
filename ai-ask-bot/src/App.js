import "./App.css";
import React from "react";
import ChatBot from "./ChatBot.js";

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <h1>AI 問答系統</h1>
      </header> */}
      <main>
        <ChatBot />
      </main>
    </div>
  );
}

export default App;
