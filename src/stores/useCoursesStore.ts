"use client";

import { create } from "zustand";

export interface Hole {
    par: number;
    hcp: number;
}

export interface Course {
    id: number;
    name: string;
    holes: Hole[];
}

interface CoursesState {
    courses: Course[];
    loadCourses: () => void;
    addCourse: (course: Course) => void;
    updateCourse: (course: Course) => void;
    deleteCourse: (courseId: number) => void;
}

/**
 * Our default courses that should always exist when the app is first loaded.
 */
const defaultCourses: Course[] = [
    {
        "id": 1735971331517,
        "name": "Modern Golf & Country Club",
        "holes": [
            { "par": 5, "hcp": 15 },
            { "par": 4, "hcp": 3 },
            { "par": 3, "hcp": 9 },
            { "par": 4, "hcp": 17 },
            { "par": 5, "hcp": 7 },
            { "par": 3, "hcp": 11 },
            { "par": 4, "hcp": 1 },
            { "par": 4, "hcp": 5 },
            { "par": 4, "hcp": 13 },
            { "par": 4, "hcp": 14 },
            { "par": 3, "hcp": 6 },
            { "par": 4, "hcp": 18 },
            { "par": 4, "hcp": 2 },
            { "par": 5, "hcp": 4 },
            { "par": 4, "hcp": 16 },
            { "par": 4, "hcp": 12 },
            { "par": 3, "hcp": 10 },
            { "par": 5, "hcp": 8 }
        ]
    },
    {
        "id": 1736003908460,
        "name": "Imperial Klub Golf",
        "holes": [
            { "par": 4, "hcp": 15 },
            { "par": 4, "hcp": 1 },
            { "par": 4, "hcp": 9 },
            { "par": 4, "hcp": 5 },
            { "par": 3, "hcp": 13 },
            { "par": 5, "hcp": 7 },
            { "par": 3, "hcp": 17 },
            { "par": 4, "hcp": 11 },
            { "par": 5, "hcp": 3 },
            { "par": 4, "hcp": 12 },
            { "par": 5, "hcp": 10 },
            { "par": 4, "hcp": 8 },
            { "par": 4, "hcp": 4 },
            { "par": 3, "hcp": 18 },
            { "par": 4, "hcp": 6 },
            { "par": 3, "hcp": 14 },
            { "par": 4, "hcp": 16 },
            { "par": 5, "hcp": 2 }
        ]
    },
    {
        "id": 1736004039252,
        "name": "Gading Raya Golf Club",
        "holes": [
            { "par": 4, "hcp": 4 },
            { "par": 5, "hcp": 8 },
            { "par": 3, "hcp": 16 },
            { "par": 4, "hcp": 12 },
            { "par": 4, "hcp": 2 },
            { "par": 4, "hcp": 18 },
            { "par": 3, "hcp": 14 },
            { "par": 5, "hcp": 10 },
            { "par": 4, "hcp": 6 },
            { "par": 5, "hcp": 17 },
            { "par": 4, "hcp": 3 },
            { "par": 3, "hcp": 7 },
            { "par": 4, "hcp": 9 },
            { "par": 3, "hcp": 15 },
            { "par": 4, "hcp": 5 },
            { "par": 4, "hcp": 1 },
            { "par": 4, "hcp": 13 },
            { "par": 5, "hcp": 11 }
        ]
    },
    {
        "id": 1736004253197,
        "name": "Kedaton Golf and Country Club",
        "holes": [
            { "par": 4, "hcp": 13 },
            { "par": 5, "hcp": 9 },
            { "par": 4, "hcp": 3 },
            { "par": 4, "hcp": 11 },
            { "par": 3, "hcp": 7 },
            { "par": 5, "hcp": 15 },
            { "par": 4, "hcp": 5 },
            { "par": 3, "hcp": 17 },
            { "par": 4, "hcp": 1 },
            { "par": 4, "hcp": 6 },
            { "par": 4, "hcp": 14 },
            { "par": 3, "hcp": 16 },
            { "par": 4, "hcp": 4 },
            { "par": 5, "hcp": 10 },
            { "par": 4, "hcp": 8 },
            { "par": 3, "hcp": 12 },
            { "par": 5, "hcp": 18 },
            { "par": 4, "hcp": 2 }
        ]
    },
    {
        "id": 1736004371690,
        "name": "Tigaraksa Golf Residens",
        "holes": [
            { "par": 5, "hcp": 8 },
            { "par": 4, "hcp": 18 },
            { "par": 5, "hcp": 16 },
            { "par": 4, "hcp": 12 },
            { "par": 3, "hcp": 14 },
            { "par": 4, "hcp": 4 },
            { "par": 4, "hcp": 2 },
            { "par": 3, "hcp": 6 },
            { "par": 4, "hcp": 10 },
            { "par": 4, "hcp": 13 },
            { "par": 5, "hcp": 3 },
            { "par": 4, "hcp": 17 },
            { "par": 3, "hcp": 11 },
            { "par": 5, "hcp": 1 },
            { "par": 4, "hcp": 5 },
            { "par": 4, "hcp": 15 },
            { "par": 4, "hcp": 7 },
            { "par": 3, "hcp": 9 }
        ]
    },
    {
        "id": 1736004492100,
        "name": "Permata Sentul Golf & Country Club",
        "holes": [
            { "par": 4, "hcp": 3 },
            { "par": 5, "hcp": 11 },
            { "par": 4, "hcp": 1 },
            { "par": 4, "hcp": 5 },
            { "par": 5, "hcp": 9 },
            { "par": 3, "hcp": 17 },
            { "par": 4, "hcp": 7 },
            { "par": 3, "hcp": 13 },
            { "par": 3, "hcp": 15 },
            { "par": 4, "hcp": 12 },
            { "par": 3, "hcp": 14 },
            { "par": 4, "hcp": 8 },
            { "par": 4, "hcp": 4 },
            { "par": 4, "hcp": 6 },
            { "par": 3, "hcp": 16 },
            { "par": 5, "hcp": 2 },
            { "par": 4, "hcp": 18 },
            { "par": 5, "hcp": 10 }
        ]
    },
    {
        "id": 1736004588290,
        "name": "Klub Golf Bogor Raya",
        "holes": [
            { "par": 5, "hcp": 10 },
            { "par": 4, "hcp": 12 },
            { "par": 3, "hcp": 18 },
            { "par": 4, "hcp": 14 },
            { "par": 4, "hcp": 4 },
            { "par": 4, "hcp": 2 },
            { "par": 3, "hcp": 16 },
            { "par": 5, "hcp": 8 },
            { "par": 4, "hcp": 6 },
            { "par": 4, "hcp": 17 },
            { "par": 3, "hcp": 13 },
            { "par": 5, "hcp": 7 },
            { "par": 4, "hcp": 5 },
            { "par": 4, "hcp": 3 },
            { "par": 3, "hcp": 9 },
            { "par": 5, "hcp": 11 },
            { "par": 3, "hcp": 15 },
            { "par": 4, "hcp": 1 }
        ]
    }
];

/**
 * Zustand store for courses.
 * When loadCourses() is called:
 *   1) If localStorage has 'courses', we load them.
 *   2) If not, we set defaultCourses and write them to localStorage.
 */
const useCoursesStore = create<CoursesState>((set, get) => ({
    courses: [],
    loadCourses: () => {
        const stored = localStorage.getItem("courses");
        if (stored) {
            // localStorage already has some courses => use them
            set({ courses: JSON.parse(stored) });
        } else {
            // No courses in localStorage => use the default courses
            set({ courses: defaultCourses });
            localStorage.setItem("courses", JSON.stringify(defaultCourses));
        }
    },
    addCourse: (course) => {
        const updated = [...get().courses, course];
        localStorage.setItem("courses", JSON.stringify(updated));
        set({ courses: updated });
    },
    updateCourse: (course) => {
        const updated = get().courses.map((c) => (c.id === course.id ? course : c));
        localStorage.setItem("courses", JSON.stringify(updated));
        set({ courses: updated });
    },
    deleteCourse: (courseId) => {
        const updated = get().courses.filter((c) => c.id !== courseId);
        localStorage.setItem("courses", JSON.stringify(updated));
        set({ courses: updated });
    }
}));

export default useCoursesStore;
