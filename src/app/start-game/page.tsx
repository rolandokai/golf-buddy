'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useCoursesStore from '@/stores/useCoursesStore';
import useGamesStore, { Player, GameData } from '@/stores/useGamesStore';

export default function StartGamePage() {
    const router = useRouter();
    const { courses, loadCourses } = useCoursesStore();
    const { addGame, loadGames } = useGamesStore();

    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [players, setPlayers] = useState<Player[]>([{ name: '', handicap: 0 }]);
    const [startingHole, setStartingHole] = useState(1);

    // strokesGiven[giver][receiver]
    const [strokesGiven, setStrokesGiven] = useState<number[][]>([[0]]);

    useEffect(() => {
        loadCourses();
        loadGames();
    }, [loadCourses, loadGames]);

    // Resize strokesGiven when players array changes
    useEffect(() => {
        const n = players.length;
        setStrokesGiven((prev) => {
            const newMatrix: number[][] = Array.from({ length: n }, (_, i) =>
                Array.from({ length: n }, (_, j) => (prev[i]?.[j] ?? 0))
            );
            return newMatrix;
        });
    }, [players]);

    const handlePlayerChange = (
        index: number,
        field: 'name' | 'handicap',
        value: string
    ) => {
        const updated = [...players];
        if (field === 'handicap') {
            updated[index].handicap = Math.max(0, parseInt(value, 10) || 0);
        } else {
            updated[index].name = value;
        }
        setPlayers(updated);
    };

    const addPlayer = () => {
        setPlayers([...players, { name: '', handicap: 0 }]);
    };

    const removePlayer = (index: number) => {
        setPlayers((prev) => prev.filter((_, i) => i !== index));
    };

    /**
     * Handle setting strokesGiven[giverIndex][receiverIndex].
     * If this is > 0, we must ensure the "reverse" (receiver->giver) is 0 and disabled.
     */
    const handleStrokesChange = (
        giverIndex: number,
        receiverIndex: number,
        value: string
    ) => {
        let numeric = parseInt(value, 10);
        if (isNaN(numeric) || numeric < 0) {
            numeric = 0; // No negatives allowed
        }
        setStrokesGiven((prev) => {
            const updated = prev.map((row) => [...row]);

            // If user sets strokesGiven[giver][receiver] > 0,
            // then we must set strokesGiven[receiver][giver] = 0 (and disable its input).
            if (numeric > 0) {
                updated[receiverIndex][giverIndex] = 0;
            }
            updated[giverIndex][receiverIndex] = numeric;
            return updated;
        });
    };

    const handleStartGame = () => {
        if (!selectedCourseId) return;

        const newGame: GameData = {
            id: Date.now(),
            courseId: selectedCourseId,
            players,
            startingHole,
            strokesGiven,
            scores: [],
        };
        addGame(newGame);
        router.push(`/games/${newGame.id}`);
    };

    return (
        <main className="p-4">
            <h1 className="text-xl font-bold mb-4">Start New Game</h1>
            <div className="mb-4">
                <label className="block mb-1">Choose Course:</label>
                <select
                    value={selectedCourseId ?? ''}
                    onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                    className="border rounded p-2 w-full"
                >
                    <option value="">-- Select --</option>
                    {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="block mb-1">Starting Hole:</label>
                <input
                    type="number"
                    min={1}
                    max={18}
                    value={startingHole}
                    onChange={(e) => setStartingHole(Number(e.target.value))}
                    className="border rounded p-2 w-full"
                />
            </div>

            <h3 className="text-lg font-semibold mb-2">Players & Handicaps</h3>
            <div className="space-y-4">
                {players.map((p, i) => (
                    <div key={i} className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder={`Player ${i + 1} Name`}
                            value={p.name}
                            onChange={(e) => handlePlayerChange(i, 'name', e.target.value)}
                            className="border rounded p-2"
                        />
                        <div>
                            <label className="mr-1">Handicap:</label>
                            <input
                                type="number"
                                min={0}
                                value={p.handicap}
                                onChange={(e) => handlePlayerChange(i, 'handicap', e.target.value)}
                                className="border rounded w-20 p-2"
                            />
                        </div>
                        <button
                            onClick={() => removePlayer(i)}
                            className="text-red-600 hover:underline ml-2"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
            <button
                onClick={addPlayer}
                className="my-4 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
                + Add Player
            </button>

            {players.length > 1 && (
                <>
                    <h3 className="text-lg font-semibold mb-2">One-Way Handicap Strokes</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        If <strong>giver→receiver</strong> is &gt; 0, then <strong>receiver→giver</strong>{' '}
                        must be 0. No negative values allowed.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="border-collapse min-w-max">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 text-center">Giver \ Receiver</th>
                                {players.map((receiver, rIdx) => (
                                    <th key={rIdx} className="border p-2 text-center">
                                        {receiver.name || `P${rIdx + 1}`}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {players.map((giver, gIdx) => (
                                <tr key={gIdx}>
                                    <td className="border p-2 bg-gray-50">
                                        {giver.name || `P${gIdx + 1}`}
                                    </td>
                                    {players.map((_, rIdx) => {
                                        const disabled =
                                            // disabled if same player
                                            gIdx === rIdx ||
                                            // or if the "opposite direction" has > 0
                                            strokesGiven[rIdx]?.[gIdx] > 0;

                                        return (
                                            <td key={rIdx} className="border p-2 text-center">
                                                {gIdx === rIdx ? (
                                                    <span className="text-gray-400">—</span>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={strokesGiven[gIdx]?.[rIdx] ?? 0}
                                                        disabled={disabled}
                                                        onChange={(e) =>
                                                            handleStrokesChange(gIdx, rIdx, e.target.value)
                                                        }
                                                        className="border rounded w-16 p-1 text-center"
                                                    />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <br/>

            <button
                onClick={handleStartGame}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                Start Game
            </button>

            <br/><br/><br/>

            <button
                onClick={() => router.push("/")}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 mt-4"
            >
                Back to Home
            </button>
        </main>
    );
}
