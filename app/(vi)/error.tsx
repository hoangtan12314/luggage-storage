"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Đã xảy ra lỗi
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Vui lòng thử lại. Nếu vẫn gặp lỗi, hãy quay lại sau.
        </p>
        <Button onClick={reset} className="mt-6">
          Thử lại
        </Button>
      </div>
    </main>
  );
}
