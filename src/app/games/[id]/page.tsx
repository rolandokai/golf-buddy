"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useGamesStore, { GameData } from "../../../stores/useGamesStore";
import useCoursesStore, { Course } from "../../../stores/useCoursesStore";

/**
 * GamePage with auto-saving and input validation.
 *
 * 1) The user inputs a "net relative to par" (e.g. -1 for birdie).
 *    - We clamp the input to [minScore, maxScore] per hole's par:
 *      - minScore = -(par - 1)  (e.g. if par=4, minScore = -3)
 *      - maxScore = par * 2     (e.g. if par=4, maxScore = 8)
 * 2) After each valid input, we immediately update the "scores" in Zustand
 *    (auto-save).
 * 3) The Birdie/Eagle multiplier only applies if the typed raw net is -1/-2,
 *    ignoring strokes that reduce final net further.
 */
export default function GamePage() {
    const router = useRouter();
    const { id } = useParams() as { id: string };
    const gameId = Number(id);

    const { games, loadGames, updateGame } = useGamesStore();
    const { courses, loadCourses } = useCoursesStore();

    const [game, setGame] = useState<GameData | null>(null);
    const [course, setCourse] = useState<Course | null>(null);

    // Local copy of net scores [holeIndex][playerIndex]
    const [scores, setScores] = useState<string[][]>([]);

    useEffect(() => {
        loadGames();
        loadCourses();
    }, [loadGames, loadCourses]);

    // Find the game
    useEffect(() => {
        const foundGame = games.find((g) => g.id === gameId);
        if (foundGame) {
            setGame(foundGame);
            setScores(foundGame.scores ?? []);
        }
    }, [games, gameId]);

    // Once we have the game and course, set up initial scores if needed
    useEffect(() => {
        if (game) {
            const foundCourse = courses.find((c) => c.id === game.courseId);
            if (foundCourse) {
                setCourse(foundCourse);

                if (!game.scores || game.scores.length === 0) {
                    const newScores = Array.from({ length: foundCourse.holes.length }, () =>
                        Array.from({ length: game.players.length }, () => "")
                    );
                    setScores(newScores);
                }
            }
        }
    }, [game, courses]);

    /**
     * Determine the valid score range based on hole's par:
     *   - minScore = -(par - 1)
     *   - maxScore = par * 2
     * Then clamp the user's input to [minScore, maxScore].
     */
    function clampScore(rawValue: number, holePar: number): number {
        const minScore = -(holePar - 1);
        const maxScore = holePar * 2;
        if (rawValue < minScore) return minScore;
        if (rawValue > maxScore) return maxScore;
        return rawValue;
    }

    /**
     * Called whenever a user types a new value in the net score box.
     * We validate & clamp the value, update local state, then auto-save to the store.
     */
    const handleScoreChange = (
        holeIndex: number,
        playerIndex: number,
        value: string
    ) => {
        if (!course) return;

        const par = course.holes[holeIndex].par;
        let numeric = parseInt(value, 10);

        // If user typed something non-numeric, just skip the auto-save for now
        if (isNaN(numeric)) {
            // You could optionally set an empty or an error,
            // but let's just store "" if invalid parse
            numeric = 0; // or do nothing
        }

        // clamp
        numeric = clampScore(numeric, par);

        // update local state
        const updatedScores = [...scores];
        updatedScores[holeIndex][playerIndex] = numeric.toString();
        setScores(updatedScores);

        // auto-save to the store
        if (!game) return;
        const updatedGame = { ...game, scores: updatedScores };
        updateGame(updatedGame);
    };

    /**
     * The same pairwise logic for strokesGiven + raw net + birdie/eagle multiplier,
     * except we only consider raw net for determining birdie/eagle.
     */
    function receivesStrokeFrom(
        holeIndex: number,
        giverIndex: number,
        receiverIndex: number
    ): boolean {
        if (!game || !course) return false;

        const strokes = game.strokesGiven[giverIndex]?.[receiverIndex] || 0;
        if (strokes <= 0) return false;

        const sortedHoles = course.holes
            .map((h, idx) => ({ idx, hcp: h.hcp }))
            .sort((a, b) => a.hcp - b.hcp);

        const holeIndexes = sortedHoles.slice(0, strokes).map((o) => o.idx);
        return holeIndexes.includes(holeIndex);
    }

    function getRawMultiplier(rawNet: number): number {
        if (rawNet === -1) return 2; // Birdie
        if (rawNet === -2) return 4; // Eagle
        return 1;
    }

    /**
     * For a single hole, do pairwise comparisons.
     * finalI = rawI minus stroke if i receives from j
     * finalJ = rawJ minus stroke if j receives from i
     * If finalI < finalJ => i wins => multiplier depends on rawI
     */
    function getHolePoints(holeIndex: number): number[] {
        if (!game || !course) return [];
        const n = game.players.length;
        const holePoints = Array(n).fill(0);

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const rawIStr = scores[holeIndex][i];
                const rawJStr = scores[holeIndex][j];
                const rawI = parseInt(rawIStr, 10);
                const rawJ = parseInt(rawJStr, 10);

                if (isNaN(rawI) || isNaN(rawJ)) {
                    // skip incomplete
                    continue;
                }

                let finalI = rawI;
                let finalJ = rawJ;

                if (receivesStrokeFrom(holeIndex, j, i)) {
                    finalI -= 1;
                }
                if (receivesStrokeFrom(holeIndex, i, j)) {
                    finalJ -= 1;
                }

                if (finalI < finalJ) {
                    // i wins
                    const mult = getRawMultiplier(rawI);
                    holePoints[i] += 1 * mult;
                    holePoints[j] -= 1 * mult;
                } else if (finalI > finalJ) {
                    // j wins
                    const mult = getRawMultiplier(rawJ);
                    holePoints[i] -= 1 * mult;
                    holePoints[j] += 1 * mult;
                }
                // tie => no points
            }
        }

        return holePoints;
    }

    function getTotalPointsForPlayer(playerIndex: number): number {
        if (!course) return 0;
        let sum = 0;
        course.holes.forEach((_, holeIdx) => {
            const hp = getHolePoints(holeIdx);
            sum += hp[playerIndex];
        });
        return sum;
    }

    // Summation of typed net scores (rawI) for each player
    function getTotalNetForPlayer(playerIndex: number): number {
        let total = 0;
        scores.forEach((row) => {
            const val = parseInt(row[playerIndex], 10);
            if (!isNaN(val)) {
                total += val;
            }
        });
        return total;
    }

    // If user wants to exit the page
    function handleSaveAndExit() {
        router.push("/");
    }

    if (!game || !course) {
        return (
            <main className="p-4">
                <h1 className="text-xl font-bold">Loading game...</h1>
            </main>
        );
    }

    return (
        <main className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">
                    Game #{game.id} - {course.name}
                </h1>
                <button
                    onClick={handleSaveAndExit}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Save &amp; Exit
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-center">Hole</th>
                        <th className="border p-2 text-center">Par</th>
                        <th className="border p-2 text-center">HCP</th>
                        {game.players.map((p, idx) => (
                            <th key={idx} className="border p-2 text-center">
                                {p.name}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {course.holes.map((hole, holeIndex) => {
                        const holePts = getHolePoints(holeIndex);
                        return (
                            <tr key={holeIndex}>
                                <td className="border p-2 text-center">{holeIndex + 1}</td>
                                <td className="border p-2 text-center">{hole.par}</td>
                                <td className="border p-2 text-center">{hole.hcp}</td>
                                {game.players.map((_, pIdx) => (
                                    <td key={pIdx} className="border p-2">
                                        <div className="flex flex-col items-center">
                                            <input
                                                type="number"
                                                className="border rounded p-1 w-16 text-center"
                                                value={scores[holeIndex]?.[pIdx] || ""}
                                                onChange={(e) =>
                                                    handleScoreChange(holeIndex, pIdx, e.target.value)
                                                }
                                            />
                                            <span className="text-xs text-gray-500">
                          Pts: {holePts[pIdx]}
                        </span>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        );
                    })}

                    {/* Row for total raw net */}
                    <tr className="bg-gray-50 font-semibold">
                        <td colSpan={3} className="border p-2 text-center">
                            Total Net
                        </td>
                        {game.players.map((_, pIdx) => (
                            <td key={pIdx} className="border p-2 text-center">
                                {getTotalNetForPlayer(pIdx)}
                            </td>
                        ))}
                    </tr>

                    {/* Row for total points */}
                    <tr className="bg-gray-100 font-semibold">
                        <td colSpan={3} className="border p-2 text-center">
                            Total Points
                        </td>
                        {game.players.map((_, pIdx) => (
                            <td key={pIdx} className="border p-2 text-center">
                                {getTotalPointsForPlayer(pIdx)}
                            </td>
                        ))}
                    </tr>
                    </tbody>
                </table>
            </div>
        </main>
    );
}
