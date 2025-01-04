'use client';

import Link from 'next/link';

export default function HomePage() {
    return (
        <main className="p-4">
            <h1 className="text-2xl font-bold">Golf Side Games Calculator</h1>
            <nav className="mt-4 flex flex-col space-y-2">
                <Link href="/courses" className="text-blue-600 hover:underline">
                    Manage Courses
                </Link>
                <Link href="/start-game" className="text-blue-600 hover:underline">
                    Start New Game
                </Link>
                <Link href="/games" className="text-blue-600 hover:underline">
                    Game List
                </Link>
            </nav>
        </main>
    );
}
