'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useCoursesStore, { Course } from '@/stores/useCoursesStore';

export default function NewCoursePage() {
    const router = useRouter();
    const { addCourse } = useCoursesStore();
    const [name, setName] = useState('');
    const [holes, setHoles] = useState(
        Array.from({ length: 18 }, () => ({ par: 4, hcp: 1 }))
    );

    const handleHoleChange = (index: number, field: 'par' | 'hcp', value: string) => {
        const updated = [...holes];
        updated[index][field] = parseInt(value, 10);
        setHoles(updated);
    };

    const handleSave = () => {
        const newCourse: Course = {
            id: Date.now(),
            name,
            holes,
        };
        addCourse(newCourse);
        router.push('/courses');
    };

    return (
        <main className="p-4">
            <h1 className="text-xl font-bold mb-4">Create New Course</h1>
            <div className="mb-4">
                <label className="block mb-1">Course Name:</label>
                <input
                    type="text"
                    value={name}
                    className="border rounded p-2 w-full"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome Course"
                />
            </div>

            <div>
                <h3 className="font-semibold mb-2">Holes (Par & Hcp)</h3>
                <div className="space-y-2">
                    {holes.map((hole, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <span>Hole {i + 1}:</span>
                            <div>
                                <label className="mr-1">Par:</label>
                                <input
                                    type="number"
                                    value={hole.par}
                                    className="border rounded w-16 p-1"
                                    onChange={(e) => handleHoleChange(i, 'par', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="mr-1">Hcp:</label>
                                <input
                                    type="number"
                                    value={hole.hcp}
                                    className="border rounded w-16 p-1"
                                    onChange={(e) => handleHoleChange(i, 'hcp', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <button
                onClick={handleSave}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                Save Course
            </button>
        </main>
    );
}