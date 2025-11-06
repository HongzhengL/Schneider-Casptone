'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import { cn } from './utils';

function Drawer({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
    return <DialogPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
    return <DialogPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
    return <DialogPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
    return <DialogPrimitive.Close data-slot="drawer-close" {...props} />;
}

const DrawerOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
    return (
        <DialogPrimitive.Overlay
            ref={ref}
            data-slot="drawer-overlay"
            className={cn(
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
                className
            )}
            {...props}
        />
    );
});
DrawerOverlay.displayName = DialogPrimitive.Overlay.displayName;

function DrawerContent({
    className,
    children,
    side = 'right',
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { side?: 'left' | 'right' }) {
    return (
        <DrawerPortal data-slot="drawer-portal">
            <DrawerOverlay />
            <DialogPrimitive.Content
                data-slot="drawer-content"
                className={cn(
                    'bg-background fixed z-50 gap-4 border p-6 shadow-lg h-full w-3/4 max-w-sm',
                    side === 'right'
                        ? 'inset-y-0 right-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 drawer-slide-in-from-right drawer-slide-out-to-right'
                        : 'inset-y-0 left-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 drawer-slide-in-from-left drawer-slide-out-to-left',
                    className
                )}
                {...props}
            >
                {children}
                <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                    <XIcon />
                    <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
            </DialogPrimitive.Content>
        </DrawerPortal>
    );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="drawer-header"
            className={cn('flex flex-col gap-2', className)}
            {...props}
        />
    );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="drawer-footer"
            className={cn('flex flex-col gap-2 mt-auto', className)}
            {...props}
        />
    );
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            data-slot="drawer-title"
            className={cn('text-lg leading-none font-semibold', className)}
            {...props}
        />
    );
}

function DrawerDescription({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
    return (
        <DialogPrimitive.Description
            data-slot="drawer-description"
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    );
}

export {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerPortal,
    DrawerTitle,
    DrawerTrigger,
};
