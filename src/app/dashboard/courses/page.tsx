import { Suspense } from 'react'
import { CoursesSkeleton } from '@/components/skeletons/courses-skeleton'

function CoursesContent() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Courses</h1>
            {/* Your courses content here */}
        </div>
    )
}

export default function Courses() {
    return (
        <Suspense fallback={<CoursesSkeleton />}>
            <CoursesContent />
        </Suspense>
    )
}
