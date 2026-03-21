import { getHealth } from "@/lib/api/health";
import { ApiError } from "@/lib/api/client";

export default async function Home() {
  let serverStatus = "unreachable";
  let serverMessage = "Server is not connected";

  try {
    const health = await getHealth();
    serverStatus = health.status;
    serverMessage = `${health.service} at ${new Date(
      health.timestamp
    ).toLocaleString()}`;
  } catch (error) {
    if (error instanceof ApiError) {
      serverMessage = `${error.message} (HTTP ${error.statusCode})`;
    } else {
      serverMessage = "Unexpected error while connecting to API";
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-8 font-sans dark:bg-black">
      <main className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Game Math starter architecture
        </h1>

        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Client-server foundation is ready. You can start implementing features.
        </p>

        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            API connectivity
          </h2>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Status:{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {serverStatus}
              </span>
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {serverMessage}
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Next development steps
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-zinc-600 dark:text-zinc-400">
            <li>Add domain modules in `server/src/routes` and `server/src/controllers`.</li>
            <li>Create shared DTOs/contracts for API payloads.</li>
            <li>Add auth and database layer.</li>
            <li>Cover core flows with integration tests.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
