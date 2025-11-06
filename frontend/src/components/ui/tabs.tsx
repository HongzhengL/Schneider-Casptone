'use client';

import * as React from 'react';

import { cn } from './utils';

interface TabsContextValue {
    value: string;
    onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

type TabsProps = React.ComponentProps<'div'> & {
    value: string;
    onValueChange?: (value: string) => void;
};

function Tabs({ value, onValueChange, className, children, ...props }: TabsProps) {
    const context = React.useMemo<TabsContextValue>(
        () => ({
            value,
            onValueChange,
        }),
        [value, onValueChange]
    );

    return (
        <TabsContext.Provider value={context}>
            <div className={cn('space-y-4', className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

type TabsListProps = React.ComponentProps<'div'>;

function TabsList({ className, ...props }: TabsListProps) {
    return (
        <div
            className={cn(
                'bg-white border border-gray-200 rounded-full p-1 text-sm font-medium',
                className
            )}
            {...props}
        />
    );
}

type TabsTriggerProps = React.ComponentProps<'button'> & {
    value: string;
};

function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
    const context = React.useContext(TabsContext);

    if (!context) {
        throw new Error('TabsTrigger must be used within Tabs');
    }

    const isActive = context.value === value;

    return (
        <button
            type="button"
            className={cn(
                'flex-1 rounded-full px-4 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                isActive ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100',
                className
            )}
            onClick={() => context.onValueChange?.(value)}
            {...props}
        >
            {children}
        </button>
    );
}

type TabsContentProps = React.ComponentProps<'div'> & {
    value: string;
};

function TabsContent({ value, className, children, ...props }: TabsContentProps) {
    const context = React.useContext(TabsContext);

    const isActive = context && context.value === value;

    return (
        <div className={cn(className)} aria-hidden={!isActive} hidden={!isActive} {...props}>
            {isActive ? children : null}
        </div>
    );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
