// components/ErrorState.tsx

type ErrorStateProps = {
    error?: string | null;
  };
  
  export default function ErrorState({
    error,
  }: ErrorStateProps) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-bold text-rose-400 mb-2">
            Something went wrong
          </h2>
  
          <p className="text-sm text-slate-400">
            {error || "Failed to load project."}
          </p>
        </div>
      </div>
    );
  }