// app/manifest.js

export default function manifest() {
    return {
        name: 'League of Quantum',
        short_name: 'LeagueQuantum',
        description: 'Experience the future of dining with League of Quantum.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png'
            },
            {
                src: '/icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png'
            }
        ]
    }
}
