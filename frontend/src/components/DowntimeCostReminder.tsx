// Component to display persistent fixed cost per day and show downtime reminders.
// This component uses a Radix Drawer to present a side panel with
// reminders about the cost of waiting. It displays a trigger element in the
// header that shows the fixed cost per day; clicking it opens a drawer
// listing how much money is lost for each day of downtime in a cyclical format.
import React, { useState, useEffect } from 'react';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from './ui/drawer';

interface DowntimeCostReminderProps {
    /**
     * The driver's fixed costs per day, used to calculate downtime losses.
     */
    fixedCostPerDay: number;
}

/**
 * A simple downtime cost reminder. It renders a line of text showing the
 * daily fixed cost in the header. When clicked, it opens a drawer
 * explaining how much revenue is lost by waiting 1 or 2 days, displayed
 * in a cyclical format that rotates through the messages.
 */
export function DowntimeCostReminder({ fixedCostPerDay }: DowntimeCostReminderProps) {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // Messages to cycle through
    const messages = [
        { days: 1, text: `Wait 1 day: −$${fixedCostPerDay} from this week` },
        { days: 2, text: `Wait 2 days: −$${2 * fixedCostPerDay}` },
    ];

    // Cycle through messages every 3 seconds when drawer is open
    useEffect(() => {
        if (!isOpen) {
            setCurrentMessageIndex(0); // Reset to first message when drawer closes
            return;
        }

        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [isOpen, messages.length]);

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                {/* The trigger is styled subtly to fit within the orange header. */}
                <button
                    type="button"
                    className="mt-1 text-orange-100 text-sm underline cursor-pointer bg-transparent border-none p-0 text-left"
                >
                    Fixed/day ${fixedCostPerDay}
                </button>
            </DrawerTrigger>
            <DrawerContent className="sm:max-w-md">
                <DrawerHeader>
                    <DrawerTitle>Downtime Cost Reminders</DrawerTitle>
                    <DrawerDescription>
                        Waiting to accept a load reduces your earnings. Here's how much downtime
                        costs based on your fixed expenses.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-4 p-4">
                    {/* Display all messages in a cyclical format */}
                    <div className="space-y-3">
                        {messages.map((message, index) => (
                            <div
                                key={message.days}
                                className={`p-3 rounded-lg border transition-all duration-500 ${
                                    index === currentMessageIndex
                                        ? 'bg-primary/10 border-primary text-foreground scale-105'
                                        : 'bg-accent border-border text-muted-foreground opacity-70'
                                }`}
                            >
                                <p className="text-sm font-medium">{message.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
