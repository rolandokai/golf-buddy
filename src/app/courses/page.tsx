'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import useCoursesStore from '@/stores/useCoursesStore';
import {useRouter} from "next/navigation";

export default function CoursesPage() {
    const router = useRouter();
    const { courses, loadCourses, deleteCourse } = useCoursesStore();

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    return (
        <main className="p-4">
            <h1 className="text-xl font-bold mb-4">Courses</h1>
            <Link
                href="/courses/new"
                className="inline-block mb-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
                Create New Course
            </Link>

            {courses.length === 0 ? (
                <p>No courses found. Create one!</p>
            ) : (
                <ul className="space-y-6">
                    {courses.map((course) => (
                        <li key={course.id} className="border p-4 rounded shadow-sm">
                            <div className="font-semibold text-lg">{course.name}</div>
                            <div className="mt-2">
                                <div className="font-medium">Par/Hcp Data:</div>
                                <ul className="list-disc list-inside">
                                    {course.holes.map((hole, i) => (
                                        <li key={i}>
                                            Hole {i + 1}: Par {hole.par}, Hcp {hole.hcp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-2 flex space-x-2">
                                <Link
                                    href={`/courses/${course.id}/edit`}
                                    className="text-blue-600 hover:underline"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => deleteCourse(course.id)}
                                    className="text-red-600 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
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
