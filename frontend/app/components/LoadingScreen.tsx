// components/LoadingScreen.tsx

export default function LoadingScreen() {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />
  
          <p className="text-sm font-medium text-slate-400 tracking-wide">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }