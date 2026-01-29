"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            locale={ptBR}
            showOutsideDays={showOutsideDays}
            formatters={{
                formatWeekdayName: (day) => day.toLocaleDateString("pt-BR", { weekday: "narrow" }).toUpperCase().replace(".", ""),
            }}
            className={cn("p-4 md:p-6 bg-white dark:bg-slate-900", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-6",
                caption: "flex justify-center pt-1 relative items-center mb-6",
                caption_label: "text-sm md:text-base font-black text-slate-800 dark:text-white uppercase tracking-widest",
                nav: "space-x-1 flex items-center absolute w-full justify-between top-1 inset-x-0 px-2",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-8 w-8 bg-white dark:bg-slate-800 p-0 text-slate-400 hover:text-primary hover:bg-primary/5 hover:border-primary/30 rounded-xl transition-all shadow-sm border-gray-100 dark:border-gray-800 z-50"
                ),
                nav_button_previous: "",
                nav_button_next: "",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full justify-between mb-3",
                head_cell:
                    "text-slate-400 dark:text-slate-500 rounded-md w-9 md:w-10 font-bold text-[0.6rem] uppercase tracking-widest flex items-center justify-center h-8",
                row: "flex w-full mt-1 justify-between",
                cell: "h-9 w-9 md:h-10 md:w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-primary/5 [&:has([aria-selected])]:bg-primary/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 md:h-10 md:w-10 p-0 font-bold aria-selected:opacity-100 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl md:rounded-2xl transition-all active:scale-95 duration-200"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "!bg-primary !text-white hover:!bg-primary hover:!text-white shadow-xl shadow-primary/25 font-black transform scale-[1.05] z-10 !rounded-xl md:!rounded-2xl ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-2 ring-primary/20",
                day_today: "bg-slate-50 dark:bg-slate-800 text-primary font-black border-2 border-primary/20",
                day_outside:
                    "day-outside text-slate-300 dark:text-slate-600 opacity-30 aria-selected:bg-primary/10 aria-selected:text-slate-500 aria-selected:opacity-30",
                day_disabled: "text-slate-300 dark:text-slate-600 opacity-30",
                day_range_middle:
                    "aria-selected:bg-primary/10 aria-selected:text-primary",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
                    return <Icon className="h-4 w-4" />;
                },
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
