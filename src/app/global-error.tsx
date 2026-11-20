"use client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black text-white text-center">
          <h1 className="text-4xl font-bold mb-4">500 - Internal Server Error</h1>
          <p className="text-gray-400 mb-8 max-w-md">
            A critical error occurred at the application boundary. Our engineering team has been notified.
          </p>
        </div>
      </body>
    </html>
  );
}
