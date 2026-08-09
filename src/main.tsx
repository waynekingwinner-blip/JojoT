import React from 'react'
import ReactDOM from 'react-dom/client'

/* Fonts are bundled, not fetched. A native build has no business
   depending on fonts.googleapis.com: it flashes fallback type on
   first paint, dies offline, and puts a third-party request in the
   privacy disclosure for no benefit.

   Note the family names — the variable packages register
   'Playfair Display Variable' and 'Caveat Variable', not the plain
   names, so --font-display / --font-hand list both. */
import '@fontsource-variable/playfair-display/wght.css'
import '@fontsource-variable/playfair-display/wght-italic.css'
import '@fontsource-variable/caveat/wght.css'
import '@fontsource/poppins/latin-300.css'
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-700.css'

import App from './App'
import { AppProvider } from './lib/store'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
)
