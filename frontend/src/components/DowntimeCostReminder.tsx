// Component to display persistent fixed cost per day and show downtime reminders.
// This component uses a Radix Dialog to present a simple modal with
// reminders about the cost of waiting. It displays a trigger element in the
// header that shows the fixed cost per day; clicking it opens a dialog
// listing how much money is lost for each day of downtime.
import React from 'react';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';

interface DowntimeCostReminderProps {
    /**
     * The driver's fixed costs per day, used to calculate downtime losses.
     */
    fixedCostPerDay: number;
}

/**
 * A simple downtime cost reminder. It renders a line of text showing the
 * fixed cost per day in the header. When clicked, it opens a dialog
 * explaining how much revenue is lost by waiting 1 or 2 days.
 */
export function DowntimeCostReminder({
    fixedCostPerDay,
}: DowntimeCostReminderProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {/* The trigger is styled subtly to fit within the orange header. */}
                <div className="mt-1 text-orange-100 text-sm underline cursor-pointer">
                    Fixed/day: ${fixedCostPerDay}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Downtime Cost Reminders</DialogTitle>
                    <DialogDescription>
                        Waiting to accept a load reduces your earnings. Here’s how
                        much downtime costs based on your fixed expenses.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 text-sm">
                    {[1, 2].map((day) => (
                        <p key={day}>
                            Wait {day} day{day > 1 ? 's' : ''}: −$
                            {day * fixedCostPerDay} from this week
                        </p>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}