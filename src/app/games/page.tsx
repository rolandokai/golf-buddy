"use client";

import { useEffect } from "react";
import Link from "next/link";
import useGamesStore, { GameData } from "../../stores/useGamesStore";
import useCoursesStore from "../../stores/useCoursesStore";
import {useRouter} from "next/navigation";

/**
 * The GamesPage displays:
 * 1) A list of all saved games (from useGamesStore).
 * 2) Basic info: game ID, course name, players.
 * 3) A "handicap matrix" that shows strokesGiven[giver][receiver].
 *    - If a player gives X strokes to another, we show that integer.
 *    - If X=0, we can show "0" or a dash, depending on preference.
 * 4) A link to continue each game => /games/[id].
 */
export default function GamesPage() {
    const router = useRouter();
    const { games, loadGames, deleteGame } = useGamesStore();
    const { courses, loadCourses } = useCoursesStore();

    useEffect(() => {
        loadGames();
        loadCourses();
    }, [loadGames, loadCourses]);

    return (
        <main className="p-4">
            <h1 className="text-xl font-bold mb-4">Games List</h1>
            {games.length === 0 ? (
                <p>No games found. Start one!</p>
            ) : (
                <ul className="space-y-6">
                    {games.map((game: GameData) => {
                        // Find the course name
                        const courseName =
                            courses.find((c) => c.id === game.courseId)?.name || "Unknown Course";

                        return (
                            <li
                                key={game.id}
                                className="border p-4 rounded shadow-sm bg-white"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold">
                                        Game #{game.id} - {courseName}
                                    </div>
                                    <div className="flex space-x-2">
                                        <Link
                                            href={`/games/${game.id}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Continue
                                        </Link>
                                        <button
                                            onClick={() => deleteGame(game.id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <strong>Players:</strong>{" "}
                                    {game.players.map((p) => p.name).join(", ")}
                                </div>

                                {/* Player-to-Player Handicap Data */}
                                <div className="mt-3">
                                    <strong>Handicap Matrix (Giver → Receiver):</strong>
                                    <div className="overflow-x-auto mt-2">
                                        <table className="border-collapse min-w-max text-sm">
                                            <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border p-2 text-center">Giver \ Receiver</th>
                                                {game.players.map((receiver, rIdx) => (
                                                    <th key={rIdx} className="border p-2 text-center">
                                                        {receiver.name}
                                                    </th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {game.players.map((giver, gIdx) => (
                                                <tr key={gIdx}>
                                                    <td className="border p-2 bg-gray-50 font-medium">
                                                        {giver.name}
                                                    </td>
                                                    {game.players.map((_, rIdx) => {
                                                        if (gIdx === rIdx) {
                                                            // same player => show dash or empty
                                                            return (
                                                                <td
                                                                    key={rIdx}
                                                                    className="border p-2 text-center text-gray-400"
                                                                >
                                                                    —
                                                                </td>
                                                            );
                                                        }
                                                        const strokes = game.strokesGiven[gIdx]?.[rIdx] || 0;
                                                        return (
                                                            <td key={rIdx} className="border p-2 text-center">
                                                                {strokes}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <button
                onClick={() => router.push("/")}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 mt-4"
            >
                Back to Home
            </button>
        </main>
    );
}
