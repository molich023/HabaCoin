import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HabaCoin Global Network',
    short_name: 'HabaCoin',
    description: 'Universal Move-to-Earn Platform & Multi-Fiat Settlement Utility Network',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#000000',
    theme_color: '#27ae60',
    icons: [
      {
        src: '/wasm/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/wasm/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      },
    ],
  };
}

