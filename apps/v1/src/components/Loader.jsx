import { Loader2 } from 'lucide-react';

export default function Loader() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-[#070A10]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
                <div className="h-1.5 w-32 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full w-1/2 rounded-full bg-violet-500 animate-loading-bar" />
                </div>
            </div>
        </div>
    );
}
