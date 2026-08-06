import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.jojot.app',
  appName: 'JojoT',
  webDir: 'dist',
  backgroundColor: '#ffffff',
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff',
    },
  },
}

export default config
