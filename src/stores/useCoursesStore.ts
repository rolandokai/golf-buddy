'use client';

import { create } from 'zustand';

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
    deleteCourse: (id: number) => void;
}

const useCoursesStore = create<CoursesState>((set, get) => ({
    courses: [],
    loadCourses: () => {
        const stored = localStorage.getItem('courses');
        if (stored) {
            set({ courses: JSON.parse(stored) });
        }
    },
    addCourse: (course) => {
        const updated = [...get().courses, course];
        localStorage.setItem('courses', JSON.stringify(updated));
        set({ courses: updated });
    },
    updateCourse: (course) => {
        const updated = get().courses.map((c) =>
            c.id === course.id ? course : c
        );
        localStorage.setItem('courses', JSON.stringify(updated));
        set({ courses: updated });
    },
    deleteCourse: (id) => {
        const updated = get().courses.filter((c) => c.id !== id);
        localStorage.setItem('courses', JSON.stringify(updated));
        set({ courses: updated });
    },
}));

export default useCoursesStore;
