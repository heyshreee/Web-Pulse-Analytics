import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ fullScreen = true, className = "" }) => {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
                    <div className="h-1.5 w-32 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full w-1/2 rounded-full bg-violet-500 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
        </div>
    );
};

export default Spinner;
