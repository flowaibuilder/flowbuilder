import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PublishedSiteViewer from './components/PublishedSiteViewer.jsx'

const hostname = window.location.hostname;
const isSubdomain = hostname !== 'flow.devshahid.me' && hostname.endsWith('.flow.devshahid.me');
const isLocalSubdomain = hostname !== 'localhost' && hostname.endsWith('.localhost');

const params = new URLSearchParams(window.location.search);
const manualSubdomain = params.get('subdomain');

if (manualSubdomain) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <PublishedSiteViewer subdomain={manualSubdomain} />
    </StrictMode>,
  )
} else if (isSubdomain || isLocalSubdomain) {
  const subdomain = hostname.split('.')[0];
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <PublishedSiteViewer subdomain={subdomain} />
    </StrictMode>,
  )
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
