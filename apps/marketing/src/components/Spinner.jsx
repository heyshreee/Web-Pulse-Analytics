import { Loader2 } from 'lucide-react';

const Spinner = ({ fullScreen = true, className = '' }) => {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-[#050505]/90">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-7 w-7 text-[#FFFFFF] animate-spin" aria-hidden="true" />
                    <div className="h-[2px] w-28 bg-[#1D1D1D] overflow-hidden">
                        <div className="h-full w-1/2 bg-[#FFFFFF] animate-loading-bar" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <Loader2 className="h-5 w-5 text-[#FFFFFF] animate-spin" aria-hidden="true" />
        </div>
    );
};

export default Spinner;
