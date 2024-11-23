import { inter } from '@/app/ui/fonts'
import Link from 'next/link'

export default function AuthCodeError() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
                <h2 className={`${inter.className} text-3xl font-bold text-gray-900`}>
                    Authentication Error
                </h2>
                <p className="text-gray-600">
                    There was an error processing your verification. Please try signing up again.
                </p>
                <div className="mt-4">
                    <Link
                        href="/signup"
                        className="text-indigo-600 hover:text-indigo-500"
                    >
                        Return to sign up
                    </Link>
                </div>
            </div>
        </div>
    )
} 