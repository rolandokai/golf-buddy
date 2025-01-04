'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useCoursesStore, { Course } from '@/stores/useCoursesStore';

export default function EditCoursePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = Number(searchParams.get('id')); // from the dynamic route
    const { courses, loadCourses, updateCourse } = useCoursesStore();

    const [course, setCourse] = useState<Course | null>(null);

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    useEffect(() => {
        const found = courses.find((c) => c.id === id);
        if (found) {
            setCourse(found);
        }
    }, [courses, id]);

    const handleHoleChange = (index: number, field: 'par' | 'hcp', value: string) => {
        if (!course) return;
        const updatedHoles = [...course.holes];
        updatedHoles[index][field] = parseInt(value, 10);
        setCourse({ ...course, holes: updatedHoles });
    };

    const handleSave = () => {
        if (!course) return;
        updateCourse(course);
        router.push('/courses');
    };

    if (!course) {
        return (
            <main className="p-4">
                <p>Loading...</p>
            </main>
        );
    }

    return (
        <main className="p-4">
            <h1 className="text-xl font-bold mb-4">Edit Course: {course.name}</h1>
            <div className="mb-4">
                <label className="block mb-1">Course Name:</label>
                <input
                    type="text"
                    value={course.name}
                    className="border rounded p-2 w-full"
                    onChange={(e) => setCourse({ ...course, name: e.target.value })}
                />
            </div>

            <h3 className="font-semibold mb-2">Holes (Par & Hcp)</h3>
            <div className="space-y-2">
                {course.holes.map((hole, i) => (
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

            <button
                onClick={handleSave}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Save Changes
            </button>
        </main>
    );
}
