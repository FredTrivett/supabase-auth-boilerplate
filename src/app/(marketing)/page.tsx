import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <>
      <section className="h-[70svh] flex items-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-[48rem] mx-auto">
          <h1 className="font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Grow your business with{" "}
            <span className="text-primary">Growvy</span>
          </h1>
          <p className="text-muted-foreground sm:text-xl sm:leading-8">
            The all-in-one platform for entrepreneurs. Manage your courses, products, and grow your business.
          </p>
          <div className="space-x-4">
            <Link href="/signup">
              <Button size="lg" className="px-8">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">Login</Button>
            </Link>
          </div>
        </div>
      </section>
      <section className="h-[300svh]">

      </section>
    </>
  )
}
