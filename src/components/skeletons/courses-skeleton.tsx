export function CoursesSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
            <div className="grid gap-6 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card">
                        <div className="h-40 bg-muted animate-pulse rounded-t-lg" />
                        <div className="p-4 space-y-3">
                            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                            <div className="h-2 w-1/4 bg-muted animate-pulse rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 