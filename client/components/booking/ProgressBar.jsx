import React from 'react';

export default function ProgressBar({ currentStep = 1 }) {
  const steps = [
    { num: 1, title: 'Select service' },
    { num: 2, title: 'Flight information' },
    { num: 3, title: 'Passengers details' },
    { num: 4, title: 'Additional services' },
    { num: 5, title: 'Contact information' },
  ];

  return (
    <div className="w-full border-b border-gray-100 bg-white py-4 shadow-sm md:py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 overflow-x-auto px-4 md:gap-0 md:px-12">
        {steps.map((step, idx) => {
          const isCompleted = step.num < currentStep || (step.num === 1 && currentStep > 1);
          const isActive = step.num === currentStep;
          const isPending = step.num > currentStep;

          return (
            <React.Fragment key={step.num}>
              <div className="flex min-w-0 shrink-0 flex-col gap-1 focus:outline-none cursor-default group md:shrink md:gap-1.5">
                <span className={`text-xs font-bold transition-colors sm:text-sm ${isActive || isCompleted ? 'text-[#0f172a]' : 'text-gray-500'}`}>
                  <span className="md:hidden">{step.num}</span>
                  <span className="hidden md:inline">{step.num}. {step.title}</span>
                </span>
                
                <span className={`hidden text-xs font-semibold items-center gap-1.5 transition-colors sm:flex ${isActive ? 'text-[#2a3bb1]' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {isCompleted && (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  )}
                  {isActive && (
                    <span className="w-2.5 h-2.5 bg-[#2a3bb1] rounded-full animate-pulse mr-0.5"></span>
                  )}
                  {isPending && (
                    <svg className="w-3.5 h-3.5 opacity-60" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.5-12.293a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414l2.293-2.293 2.293 2.293a1 1 0 101.414-1.414l-3-3z" clipRule="evenodd"/></svg>
                  )}
                  <span className="hidden lg:inline">{isCompleted ? 'Completed' : isActive ? 'In progress' : 'Not completed'}</span>
                </span>
                <span className={`h-1 w-8 rounded-full sm:w-10 md:hidden ${isActive || isCompleted ? 'bg-[#2a3bb1]' : 'bg-gray-200'}`} />
              </div>
              
              {idx < steps.length - 1 && (
                <svg className="mx-1 hidden h-4 w-4 shrink-0 text-gray-300 md:mx-2 md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="mt-2 px-4 text-xs font-semibold text-[#2a3bb1] md:hidden">
        Step {currentStep}: {steps[currentStep - 1]?.title}
      </p>
    </div>
  );
}
