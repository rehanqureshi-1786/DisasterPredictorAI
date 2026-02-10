import type { AppProps } from 'next/app'
import ClientProviders from '@/components/ClientProviders'
import '../app/globals.css'

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ClientProviders>
            <Component {...pageProps} />
        </ClientProviders>
    )
}
