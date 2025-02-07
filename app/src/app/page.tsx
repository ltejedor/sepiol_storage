"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main>
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-sm rounded-lg bg-white p-8 text-center shadow-lg">
          <h2 className="mb-6 text-xl font-bold">Robot Management System</h2>
          <div className="space-y-4">
            <button
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Create a New Embodiment Class
            </button>
            <button
              className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              Register a New Robot
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
