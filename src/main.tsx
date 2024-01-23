import { Buffer } from 'buffer';
// window.Buffer = Buffer;

import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { HashRouter as Router } from "react-router-dom";

declare global {
  interface Window {
      Telegram:any;
  }
}

// this manifest is used temporarily for development purposes
const manifestUrl = 'https://raw.githubusercontent.com/ton-connect/demo-dapp/master/public/tonconnect-manifest.json';
window.Telegram.WebApp.expand();
window.Telegram.WebApp.ready();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
)