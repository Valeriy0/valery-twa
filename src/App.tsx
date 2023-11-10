import styles from "../styles/global.module.scss"
import { Main, Partners, About } from './components';
import { Routes, Route } from "react-router-dom";
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import '@twa-dev/sdk';
import './App.css'

declare global {
  interface Window {
      Telegram:any;
  }
}

function App() {
  const [tonConnectUI, setOptions] = useTonConnectUI();
  return (
    <>
      <Routes>
        <Route  path="/" element={<Main />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/about" element={<About />} />
        <Route  path="/:info" element={<Main />} />
      </Routes>
    </>
  )
}

export default App
