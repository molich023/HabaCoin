import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Habacoin Global',
    short_name: 'Habacoin',
    description: 'The Global Social Utility Network',
    start_url: '/',
    display: 'standalone',
    background_color: '#27ae60',
    theme_color: '#27ae60',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
