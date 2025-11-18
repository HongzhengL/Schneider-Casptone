import * as React from 'react';
import { cn } from './utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
    max?: number;
    indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({ value = 0, max = 100, className, indicatorClassName, ...props }, ref) => {
        const normalizedMax = Number.isFinite(max) && max > 0 ? max : 100;
        const clampedValue = Math.min(Math.max(value ?? 0, 0), normalizedMax);
        const percentage = (clampedValue / normalizedMax) * 100;

        return (
            <div
                ref={ref}
                role="progressbar"
                aria-valuenow={clampedValue}
                aria-valuemin={0}
                aria-valuemax={normalizedMax}
                className={cn(
                    'relative h-2 w-full overflow-hidden rounded-full bg-muted',
                    className
                )}
                {...props}
            >
                <div
                    className={cn(
                        'h-full w-full flex-1 bg-primary transition-[width] duration-300 ease-out',
                        indicatorClassName
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        );
    }
);
Progress.displayName = 'Progress';

export { Progress };
