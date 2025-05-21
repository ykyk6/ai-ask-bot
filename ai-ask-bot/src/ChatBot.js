import React, { useState, useRef, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import axios from "axios";

// 主題色定義
const darkTheme = {
  "--deep-space": "#0f1123",
  "--nebula-purple": "#7b42ab",
  "--cosmic-blue": "#2e3d96",
  "--star-gold": "#ffc857",
  "--cosmic-pink": "#ff6b97",
  "--glass-opacity": "rgba(255,255,255,0.07)",
  "--text-color": "white",
};
const lightTheme = {
  "--deep-space": "#e0f7ff",
  "--nebula-purple": "#58b2dc",
  "--cosmic-blue": "#00a0e4",
  "--star-gold": "#ffc145",
  "--cosmic-pink": "#ff7676",
  "--glass-opacity": "rgba(255,255,255,0.55)",
  "--text-color": "#2d3748",
};

const GlobalStyle = createGlobalStyle`
  :root {
    ${({ themeVars }) =>
      Object.entries(themeVars)
        .map(([k, v]) => `${k}: ${v};`)
        .join("\n")}
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Futura', 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', 'Microsoft JhengHei', sans-serif;
  }
  body {
    background: var(--deep-space);
    color: var(--text-color);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    font-family: 'Futura', 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', 'Microsoft JhengHei', sans-serif;
  }
  input, select, button, a {
    font-family: 'Futura', 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', 'Microsoft JhengHei', sans-serif;
  }
`;

const Stars = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  pointer-events: none;
  z-index: 0;
`;

const CosmicSpheres = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
`;

const CosmicSphere = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  pointer-events: none;
`;

const Sphere1 = styled(CosmicSphere)`
  width: 350px;
  height: 350px;
  background: radial-gradient(
    circle at 30% 30%,
    var(--cosmic-blue),
    transparent
  );
  top: -100px;
  right: -100px;
  opacity: 0.2;
`;
const Sphere2 = styled(CosmicSphere)`
  width: 500px;
  height: 500px;
  background: radial-gradient(
    circle at 70% 70%,
    var(--nebula-purple),
    transparent
  );
  bottom: -200px;
  left: -150px;
  opacity: 0.25;
`;
const Sphere3 = styled(CosmicSphere)`
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle at 50% 50%,
    var(--cosmic-pink),
    transparent
  );
  top: 50%;
  right: 10%;
  opacity: 0.15;
`;
const Container = styled.div`
  max-width: 1200px;
  width: 90%;
  margin: 0 auto;
  padding: 2rem 0;
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  @media (max-width: 950px) {
    width: 92%;
    padding: 1.5rem 0;
  }
`;
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  @media (max-width: 950px) {
    margin-bottom: 1.5rem;
  }
`;
const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  background: ${({ theme }) =>
    theme === "light"
      ? "linear-gradient(to right, var(--cosmic-blue), var(--star-gold))"
      : "linear-gradient(to right, white, var(--star-gold))"};
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: flex;
  align-items: center;
  @media (max-width: 950px) {
    font-size: 1.4rem;
    margin-bottom: 0;
  }
`;
const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 10px;
  background: linear-gradient(135deg, var(--cosmic-blue), var(--nebula-purple));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 950px) {
    width: 32px;
    height: 32px;
    margin-right: 8px;
    border-radius: 8px;
  }
`;
const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
  @media (max-width: 950px) {
    display: none;
  }
  a {
    color: ${({ theme }) => (theme === "light" ? "#236283" : "white")};
    text-decoration: none;
    opacity: 0.85;
    font-weight: 500;
    transition: color 0.3s, opacity 0.3s;
    &:hover {
      color: ${({ theme }) =>
        theme === "light" ? "#00a0e4" : "var(--star-gold)"};
      opacity: 1;
    }
  }
  select {
    margin-left: 1.5rem;
    background: var(--deep-space);
    color: ${({ theme }) => (theme === "light" ? "#236283" : "white")};
    border: 1.5px solid var(--cosmic-blue);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    box-shadow: 0 0 0 1.5px var(--nebula-purple);
    font-size: 1rem;
    transition: box-shadow 0.2s, border-color 0.2s;
  }
  select:focus,
  select:hover {
    outline: none;
    border-color: var(--star-gold);
    box-shadow: 0 0 0 2.5px var(--star-gold);
  }
`;
const ThemeSwitch = styled.button`
  background: var(--glass-opacity);
  border: 1.5px solid var(--cosmic-blue);
  color: var(--text-color);
  border-radius: 8px;
  padding: 0.4rem 1.1rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: 0 0 0 1.5px var(--nebula-purple);
  &:hover,
  &:focus {
    background: var(--cosmic-blue);
    color: var(--star-gold);
    border-color: var(--star-gold);
    box-shadow: 0 0 0 2.5px var(--star-gold);
    outline: none;
  }
`;
const NavThemeSwitch = styled(ThemeSwitch)`
  margin-left: 1.2rem;
`;
const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: ${({ theme }) => (theme === "dark" ? "white" : "var(--cosmic-blue)")};
  transition: all 0.3s ease;
  z-index: 1002;

  @media (max-width: 950px) {
    display: block;
  }

  &:hover {
    opacity: 0.8;
  }
`;
const MobileNavOverlay = styled.div`
  display: none;
  @media (max-width: 950px) {
    display: ${({ open }) => (open ? "block" : "none")};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 950;
    opacity: ${({ open }) => (open ? 1 : 0)};
    transition: opacity 0.3s ease;
  }
`;
const MobileNavMenu = styled.div`
  display: none;
  @media (max-width: 950px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    right: 0;
    width: 80%;
    max-width: 300px;
    height: 100vh;
    background: ${({ theme }) =>
      theme === "light" ? "transparent" : "transparent"};
    backdrop-filter: blur(20px);
    z-index: 1001;
    padding: 5rem 1.5rem 2rem;
    box-shadow: -2px 0 16px rgba(0, 0, 0, 0.18);
    border-left: 1.5px solid rgba(255, 255, 255, 0.13);
    overflow-y: auto;
    transform-origin: top right;
    transform: ${({ open }) =>
      open ? "scale(1) translateX(0)" : "scale(0.95) translateX(20px)"};
    opacity: ${({ open }) => (open ? 1 : 0)};
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    visibility: ${({ open }) => (open ? "visible" : "hidden")};

    a {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: ${({ theme }) => (theme === "light" ? "#236283" : "white")};
      font-size: 1.1rem;
      padding: 0.75rem;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      margin: 0.5rem 0;
      opacity: ${({ open }) => (open ? 1 : 0)};
      transform: ${({ open }) =>
        open ? "translateY(0)" : "translateY(-10px)"};
      transition: all 0.3s ease;
      transition-delay: ${({ open, index }) =>
        open ? `${0.1 + index * 0.05}s` : "0s"};

      &:hover {
        background: ${({ theme }) =>
          theme === "light"
            ? "rgba(0, 0, 0, 0.05)"
            : "rgba(255, 255, 255, 0.1)"};
        color: var(--star-gold);
      }
    }

    select {
      opacity: ${({ open }) => (open ? 1 : 0)};
      transform: ${({ open }) =>
        open ? "translateY(0)" : "translateY(-10px)"};
      transition: all 0.3s ease;
      transition-delay: ${({ open }) => (open ? "0.25s" : "0s")};
    }

    button {
      opacity: ${({ open }) => (open ? 1 : 0)};
      transform: ${({ open }) =>
        open ? "translateY(0)" : "translateY(-10px)"};
      transition: all 0.3s ease;
      transition-delay: ${({ open }) => (open ? "0.3s" : "0s")};
    }

    .divider {
      height: 1px;
      background: ${({ theme }) =>
        theme === "light"
          ? "rgba(35, 98, 131, 0.2)"
          : "rgba(255, 255, 255, 0.1)"};
      margin: 1rem 0;
    }

    select {
      width: 100%;
      font-size: 1.1rem;
      background: ${({ theme }) =>
        theme === "light" ? "rgba(224, 247, 255, 0.5)" : "transparent"};
      color: ${({ theme }) => (theme === "light" ? "#236283" : "white")};
      border: 1.7px solid var(--cosmic-blue);
      border-radius: 0.5rem;
      padding: 0.75rem;
      margin: 0.5rem 0;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(10px);
      appearance: none;
      outline: none;

      &:hover {
        border-color: var(--star-gold);
        box-shadow: 0 0 0 2.5px var(--star-gold);
      }

      &:focus {
        border-color: var(--star-gold);
        box-shadow: none;
      }

      option {
        background: ${({ theme }) =>
          theme === "light"
            ? "rgba(224, 247, 255, 0.9)"
            : "rgba(15, 17, 35, 0.9)"};
        color: ${({ theme }) => (theme === "light" ? "#236283" : "white")};
        padding: 0.5rem;
      }
    }

    button {
      width: 100%;
      font-size: 1.1rem;
      background: ${({ theme }) =>
        theme === "light"
          ? "rgba(255, 255, 255, 0.06)"
          : "rgba(255, 255, 255, 0.05)"};
      color: ${({ theme }) => (theme === "light" ? "#236283" : "white")};
      border: 1.5px solid var(--cosmic-blue);
      border-radius: 0.5rem;
      padding: 0.75rem;
      margin: 0.5rem 0;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;

      &:hover {
        border-color: var(--star-gold);
        box-shadow: 0 0 0 2.5px var(--star-gold);
        background: ${({ theme }) =>
          theme === "light"
            ? "rgba(0, 160, 228, 0.1)"
            : "rgba(255, 255, 255, 0.1)"};
        color: var(--star-gold);
      }
    }
  }
`;
const Hero = styled.section`
  text-align: center;
  margin: 2rem 0 4rem;
  @media (max-width: 950px) {
    margin: 1.5rem 0 2.5rem;
  }
`;
const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  background: ${({ theme }) =>
    theme === "light"
      ? "linear-gradient(to right, var(--cosmic-blue), var(--star-gold))"
      : "linear-gradient(to right, white, var(--star-gold), var(--cosmic-pink))"};
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  @media (max-width: 950px) {
    font-size: 1.9rem;
    margin-top: -10px;
  }
`;
const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.8;
  max-width: 760px;
  margin: 0 auto;
  line-height: 1.6;
  @media (max-width: 950px) {
    font-size: 14px;
  }
`;
const GlassCard = styled.div`
  background: ${({ theme }) =>
    theme === "light" ? "rgb(255 255 255 / 40%)" : "var(--glass-opacity)"};
  backdrop-filter: ${({ theme }) =>
    theme === "light" ? "blur(32px) saturate(1.2)" : "blur(20px)"};
  border-radius: 24px;
  border: ${({ theme }) =>
    theme === "light"
      ? "2px solid #b5e3fa"
      : "1px solid rgba(255, 255, 255, 0.1)"};
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  @media (max-width: 950px) {
    padding: 1.2rem;
  }
  @media (max-width: 950px) {
    border-radius: 20px;
    padding: 1.5rem;
  }
`;
const QAContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 880px;
  margin: 0 auto;
  width: 100%;
  @media (max-width: 950px) {
    gap: 1.5rem;
    max-width: 98vw;
  }
`;
const InputContainer = styled.div`
  position: relative;
`;
const InputField = styled.input`
  width: 100%;
  padding: 1.2rem 1.5rem;
  padding-right: 4rem;
  background: rgba(255, 255, 255, 0.05);
  border: ${({ theme }) =>
    theme === "light"
      ? "1px solid rgb(35 98 131 / 20%)"
      : "1px solid rgba(255, 255, 255, 0.1)"};
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  font-size: 1rem;
  color: var(--text-color);
  transition: all 0.3s;
  &:focus {
    outline: none;
    border-color: var(--star-gold);
    box-shadow: 0 0 0 3px rgba(255, 200, 87, 0.1);
  }
  &::placeholder {
    color: ${({ theme }) =>
      theme === "light" ? "#b0b8c9" : "rgba(255, 255, 255, 0.5)"};
  }
  @media (max-width: 950px) {
    font-size: 0.98rem;
    padding: 1rem 1.1rem;
    padding-right: 3rem;
  }
  @media (max-width: 950px) {
    font-size: 0.95rem;
    padding: 1rem 3rem 1rem 1rem;
    border-radius: 16px;
  }
`;
const SendBtn = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) =>
    theme === "light"
      ? "linear-gradient(135deg, var(--cosmic-blue), #4ecdc4)"
      : "linear-gradient(135deg, var(--nebula-purple), var(--cosmic-blue))"};
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  &:hover {
    transform: translateY(-50%) scale(1.05);
    box-shadow: 0 0 20px rgba(123, 66, 171, 0.5);
  }
  @media (max-width: 950px) {
    width: 36px;
    height: 36px;
    right: 10px;
  }
`;
const QuickQuestions = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 0.8rem;
  margin-top: 1rem;
  padding-bottom: 1rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  cursor: grab;
  user-select: none;
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  &:active {
    cursor: grabbing;
  }

  @media (max-width: 950px) {
    gap: 0.6rem;
    margin-top: 1.2rem;
    padding-bottom: 0.5rem;
  }
`;
const QuickQuestion = styled.div`
  background: var(--glass-opacity);
  border: ${({ theme }) =>
    theme === "light"
      ? "1px solid rgb(35 98 131 / 20%)"
      : "1px solid rgba(255, 255, 255, 0.1)"};
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  color: ${({ theme }) => (theme === "light" ? "#2d3748" : "white")};
  flex-shrink: 0;
  white-space: nowrap;
  margin: 0.2rem 0;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--star-gold);
    transform: translateY(-2px);
  }

  @media (max-width: 950px) {
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
  }
`;
const ChatArea = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  @media (max-width: 950px) {
    margin-top: 1rem;
    gap: 1rem;
  }
  @media (max-width: 950px) {
    margin-top: 1.5rem;
    gap: 1.2rem;
  }
`;
const Message = styled.div`
  display: flex;
  gap: 1rem;
  max-width: 80%;
  &.user-message {
    align-self: flex-end;
  }
  &.ai-message {
    align-self: flex-start;
  }
  @media (max-width: 950px) {
    max-width: 95%;
    gap: 0.7rem;
  }
  @media (max-width: 950px) {
    max-width: 90%;
    gap: 0.8rem;
  }
`;
const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme, className }) => {
    if (theme === "light") {
      if (className && className.includes("ai-avatar")) {
        return "linear-gradient(135deg, var(--cosmic-blue), #4ecdc4)";
      } else {
        return "linear-gradient(135deg, var(--star-gold), var(--cosmic-pink))";
      }
    }
    return className && className.includes("ai-avatar")
      ? "linear-gradient(135deg, var(--cosmic-blue), var(--star-gold))"
      : "linear-gradient(135deg, var(--cosmic-pink), var(--nebula-purple))";
  }};
  color: ${({ theme, className }) =>
    theme === "light" && (!className || !className.includes("ai-avatar"))
      ? "#fff"
      : "#fff"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  &.ai-avatar {
    background: ${({ theme }) =>
      theme === "light"
        ? "linear-gradient(135deg, var(--cosmic-blue), #4ecdc4)"
        : "linear-gradient(135deg, var(--cosmic-blue), var(--star-gold))"};
  }
  @media (max-width: 950px) {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
    border-radius: 50%;
  }
`;
const LoadingDots = styled.div`
  display: flex;
  gap: 0.3rem;
  padding: 0.5rem;
  align-items: center;
  justify-content: center;

  .dot {
    width: 8px;
    height: 8px;
    background: var(--star-gold);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;
const MessageContent = styled.div`
  padding: 1rem 1.5rem;
  border-radius: 18px;
  line-height: 1.5;
  color: ${({ theme }) => (theme === "light" ? "#2d3748" : "inherit")};
  &.user-message {
    background: ${({ theme }) =>
      theme === "light"
        ? "linear-gradient(135deg, var(--star-gold), var(--cosmic-pink))"
        : "linear-gradient(135deg, var(--nebula-purple), var(--cosmic-blue))"};
    color: ${({ theme }) => (theme === "light" ? "#fff" : "inherit")};
    border-top-right-radius: 0;
    text-align: right;
  }
  &.ai-message {
    background: var(--glass-opacity);
    border: ${({ theme }) =>
      theme === "light"
        ? "1px solid rgb(35 98 131 / 20%)"
        : "1px solid rgba(255, 255, 255, 0.1)"};
    border-top-left-radius: 0;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
    text-align: left;
    min-height: 60px;
    display: flex;
    align-items: center;
  }
  @media (max-width: 950px) {
    padding: 0.8rem 1rem;
    border-radius: 16px;
    font-size: 0.95rem;
  }
`;
const Footer = styled.footer`
  margin-top: 5rem;
  text-align: center;
  padding: 2rem 0;
  opacity: 0.7;
  font-size: 0.9rem;
  @media (max-width: 950px) {
    margin-top: 2rem;
    padding: 1.5rem 0;
    font-size: 12px;
  }
`;

const LANGUAGES = {
  zh: {
    name: "中文",
    title: "擔保系統AI自動問答",
    subtitle: "針對您所遇到的系統問題，即時回覆您對應方針",
    placeholder: "請輸入您的問題...",
    quickQuestions: [
      "利息畫面表示不正確",
      "EM畫面表示不正確",
      "交易送信失敗",
      "交易操作失敗",
    ],
    welcome:
      "您好！我是您的金融智能助手。有任何問題，請隨時詢問，我很樂意為您提供協助。",
    navLinks: ["首頁", "服務", "關於我們", "聯絡我們"],
  },
  en: {
    name: "English",
    title: "AI Q&A for Collateral System",
    subtitle: "Instant response for your system issues.",
    placeholder: "Please enter your question...",
    quickQuestions: [
      "Interest screen is displaying incorrectly",
      "EM screen is displaying incorrectly",
      "Transaction submission failed",
      "Transaction operation failed",
    ],
    welcome:
      "Hello! I am your financial AI assistant. Feel free to ask any questions, I am happy to help you.",
    navLinks: ["Home", "Services", "About", "ContactUs"],
  },
  ja: {
    name: "日本語",
    title: "担保システムAI応答",
    subtitle:
      "お客様が直面しているシステム上の問題に対し、適切な対応方針をご案内いたします。",
    placeholder: "ご質問を入力してください...",
    quickQuestions: [
      "EM画面の表示不正",
      "取引送信に失敗した",
      "取引操作に失敗した",
      "利息画面の表示不正",
    ],
    welcome:
      "こんにちは！私はあなたの金融AIアシスタントです。どんな質問でもお気軽にどうぞ。",
    navLinks: ["ホーム", "サービス", "会社概要", "問合せ"],
  },
};

function createStars() {
  const arr = [];
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const size = Math.random() * 2;
    const delay = Math.random() * 5;
    arr.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          background: "white",
          borderRadius: "50%",
          opacity: 0.7,
          animation: `twinkle 5s infinite`,
          animationDelay: `${delay}s`,
        }}
        className="star"
      />
    );
  }
  return arr;
}

function ChatBot() {
  const [lang, setLang] = useState("zh");
  const langData = LANGUAGES[lang];
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { type: "ai", content: langData.welcome },
  ]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const themeVars = theme === "dark" ? darkTheme : lightTheme;
  const chatAreaRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const quickQuestionsRef = useRef(null);
  const dragStartTime = useRef(0);

  useEffect(() => {
    console.log("Current theme:", theme);
  }, [theme]);

  useEffect(() => {
    setMessages([{ type: "ai", content: langData.welcome }]);
  }, [lang]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleThemeChange = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    console.log("Changing theme from", theme, "to", newTheme);
    setTheme(newTheme);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { type: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://ai-ask-bot.vercel.app/api/query",
        { question: input }
      );
      console.log("Response:", response.data);
      setMessages((msgs) => [
        ...msgs,
        { type: "ai", content: response.data.answer },
      ]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((msgs) => [
        ...msgs,
        { type: "ai", content: "抱歉，連接出現問題，請稍後再試。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSend();
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - quickQuestionsRef.current.offsetLeft);
    setScrollLeft(quickQuestionsRef.current.scrollLeft);
    dragStartTime.current = Date.now();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - quickQuestionsRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    quickQuestionsRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleQuickQuestion = (q) => {
    if (Date.now() - dragStartTime.current > 200) return;

    setInput(q);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  return (
    <>
      <GlobalStyle themeVars={themeVars} />
      <Stars>{createStars()}</Stars>
      <CosmicSpheres>
        <Sphere1 />
        <Sphere2 />
        <Sphere3 />
      </CosmicSpheres>
      <Container>
        <Header>
          <Logo theme={theme}>
            <LogoIcon>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3L4 6V11C4 16.52 12 21 12 21C12 21 20 16.52 20 11V6L12 3Z"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M12 11V14"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="9" r="1" fill="white" />
              </svg>
            </LogoIcon>
            Collateral AI
          </Logo>
          <Nav theme={theme}>
            {langData.navLinks.map((text, idx) => (
              <a href="#" key={idx}>
                {text}
              </a>
            ))}
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              {Object.entries(LANGUAGES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.name}
                </option>
              ))}
            </select>
            <NavThemeSwitch
              onClick={handleThemeChange}
              aria-label="切換日間/夜間模式"
              title={theme === "dark" ? "light" : "dark"}
            >
              {theme === "dark" ? "☀️ light" : "🌙 dark"}
            </NavThemeSwitch>
          </Nav>
          <MenuButton onClick={() => setMenuOpen((v) => !v)} theme={theme}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect y="5" width="24" height="2" rx="1" fill="currentColor" />
              <rect y="11" width="24" height="2" rx="1" fill="currentColor" />
              <rect y="17" width="24" height="2" rx="1" fill="currentColor" />
            </svg>
          </MenuButton>
          <MobileNavOverlay
            open={menuOpen}
            onClick={() => setMenuOpen(false)}
          />
          <MobileNavMenu open={menuOpen} theme={theme}>
            {langData.navLinks.map((text, idx) => (
              <a href="#" key={idx} onClick={() => setMenuOpen(false)}>
                {text}
              </a>
            ))}
            <select
              value={lang}
              onChange={(e) => {
                setLang(e.target.value);
                setMenuOpen(false);
              }}
            >
              {Object.entries(LANGUAGES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.name}
                </option>
              ))}
            </select>
            <ThemeSwitch
              onClick={handleThemeChange}
              aria-label="切換日間/夜間模式"
              style={{ marginTop: "1.2rem" }}
            >
              {theme === "dark" ? "☀️ light" : "🌙 dark"}
            </ThemeSwitch>
          </MobileNavMenu>
        </Header>
        <Hero>
          <Title theme={theme}>{langData.title}</Title>
          <Subtitle>{langData.subtitle}</Subtitle>
        </Hero>
        <QAContainer as={GlassCard} theme={theme}>
          <InputContainer>
            <InputField
              type="text"
              className="input-field"
              placeholder={langData.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={loading}
              theme={theme}
            />
            <SendBtn
              className="send-btn"
              onClick={handleSend}
              disabled={loading}
              theme={theme}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </SendBtn>
          </InputContainer>
          <QuickQuestions
            className="quick-questions"
            theme={theme}
            ref={quickQuestionsRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {langData.quickQuestions.map((q, i) => (
              <QuickQuestion
                key={i}
                onClick={() => handleQuickQuestion(q)}
                theme={theme}
              >
                {q}
              </QuickQuestion>
            ))}
          </QuickQuestions>
          <ChatArea className="chat-area" ref={chatAreaRef}>
            {messages.map((msg, i) => (
              <Message
                key={i}
                className={msg.type === "user" ? "user-message" : "ai-message"}
              >
                {msg.type === "ai" && (
                  <Avatar className="ai-avatar" theme={theme}>
                    AI
                  </Avatar>
                )}
                <MessageContent
                  className={
                    msg.type === "user" ? "user-message" : "ai-message"
                  }
                  theme={theme}
                >
                  {msg.content}
                </MessageContent>
                {msg.type === "user" && <Avatar theme={theme}>You</Avatar>}
              </Message>
            ))}
            {loading && (
              <Message className="ai-message">
                <Avatar className="ai-avatar" theme={theme}>
                  AI
                </Avatar>
                <MessageContent className="ai-message" theme={theme}>
                  <LoadingDots>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </LoadingDots>
                </MessageContent>
              </Message>
            )}
          </ChatArea>
        </QAContainer>
        <Footer>© 2025 Collateral AI Ask System | Privacy Policy</Footer>
      </Container>
    </>
  );
}

export default ChatBot;
