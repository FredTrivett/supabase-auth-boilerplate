import { Suspense } from 'react'
import { ShopSkeleton } from '@/components/skeletons/shop-skeleton'

function ShopContent() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Shop</h1>
            {/* Your shop content here */}
        </div>
    )
}

export default function Shop() {
    return (
        <Suspense fallback={<ShopSkeleton />}>
            <ShopContent />
        </Suspense>
    )
}
