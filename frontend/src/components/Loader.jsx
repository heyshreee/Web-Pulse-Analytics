import { Loader2 } from 'lucide-react';

export default function Loader() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-[#070A10]">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
                <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse text-sm">Loading...</p>
            </div>
        </div>
    );
}
