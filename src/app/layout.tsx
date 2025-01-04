import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Golf Side Games Calculator',
    description: 'A Next.js app for golf side games scoring',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className="min-h-screen bg-gray-50 text-gray-800">
        {children}
        </body>
        </html>
    );
}
