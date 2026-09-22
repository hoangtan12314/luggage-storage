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
    <main className="flex-1 bg-background">
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Đã xảy ra lỗi
        </h1>
        <p className="mt-2 text-muted-foreground">
          Vui lòng thử lại. Nếu vẫn gặp lỗi, hãy quay lại sau.
        </p>
        <Button onClick={reset} className="mt-6">
          Thử lại
        </Button>
      </div>
    </main>
  );
}
