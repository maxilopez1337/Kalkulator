
import React from 'react';
import { Check } from '../icons/Icons';

export const StepIndicator = ({ currentStep, steps, onStepClick }: { currentStep: number; steps: string[]; onStepClick: (idx: number) => void }) => (
  <div className="w-full bg-white overflow-x-auto scrollbar-hide">
    <div className="flex items-center min-w-max md:min-w-full">
        {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        let containerClass = "flex-1 flex items-center justify-center gap-2 py-3 px-4 md:px-2 cursor-pointer transition-colors relative border-r border-[#edebe9] last:border-r-0 hover:bg-[#f3f2f1] min-w-[120px] md:min-w-0";
        let textClass = "text-[12px] font-semibold uppercase tracking-tight text-[#605e5c]";
        let iconClass = "w-6 h-6 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[10px] border border-[#8a8886] text-[#605e5c] flex-shrink-0";

        if (isActive) {
            containerClass += " bg-white";
            textClass = "text-[12px] font-bold uppercase tracking-tight text-brand";
            iconClass = "w-6 h-6 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[10px] bg-brand text-white border border-brand flex-shrink-0";
        } else if (isCompleted) {
            containerClass += " bg-[#f9f9f9]";
            textClass = "text-[12px] font-medium uppercase tracking-tight text-[#0078d4]";
            iconClass = "w-6 h-6 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[10px] bg-[#0078d4] text-white border border-[#0078d4] flex-shrink-0";
        }
        
        return (
            <div 
            key={index} 
            className={containerClass}
            onClick={() => onStepClick(index)}
            >
                {/* Active Bottom Bar */}
                {isActive && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-brand"></div>}
                
                <div className={iconClass}>
                    {isCompleted ? <Check /> : index + 1}
                </div>
                <div className={`${textClass} whitespace-nowrap`}>{step}</div>
            </div>
        );
        })}
    </div>
  </div>
);
