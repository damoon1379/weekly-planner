
'use client'

import { useApi } from "@/app/hooks/useApi";
import { useEffect, useState } from "react";

interface WeeklyProgressProps {
    startDate: string,
    endDate: string,
    refreshTrigger: number,
}

interface WeeklyProgressData {
    total_planned: number,
    total_actual: number,
    total_records: number,
    completed_records: number,
    completion_percentage: number,
}

export default function WeeklyProgress({
    startDate,
    endDate,
    refreshTrigger
}: WeeklyProgressProps) {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [weeklyProgressData, setWeeklyProgressData] =
        useState<WeeklyProgressData | null>(null)
    const [showResult, setShowResult] = useState(false)

    const { request } = useApi()

    async function getWeeklyResults() {
        setError('')
        setLoading(true)

        try {
            const data = await request(
                `/weekly-progress/?start_date=${startDate}&end_date=${endDate}`,
                { method: "GET" }
            )

            setWeeklyProgressData(data)
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch weekly results'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (showResult) {
            getWeeklyResults()
        }
    }, [showResult, refreshTrigger, startDate, endDate, request])

    const percentage = Math.min(
        100,
        Math.max(0, weeklyProgressData?.completion_percentage ?? 0)
    )

    return (
        <div>

            {error && (
                <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                </p>
            )}

            {showResult ? (
                <div className="flex flex-col gap-5">

                    {loading ? (
                        <p className="text-sm text-slate-400">
                            Loading weekly progress...
                        </p>
                    ) : weeklyProgressData && (
                        <>
                            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                                <p className="text-sm text-slate-400">
                                    Completion rate
                                </p>

                                <p className="mt-2 text-4xl font-bold bg-gradient-to-r from-sky-400 to-fuchsia-400 bg-clip-text text-transparent">
                                    {weeklyProgressData.completion_percentage}%
                                </p>

                                <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-700">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-fuchsia-500 transition-all duration-700"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    {weeklyProgressData.completed_records} of {weeklyProgressData.total_records} tasks completed
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">

                                <div className="rounded-xl bg-slate-800/70 p-4">
                                    <p className="text-xs text-slate-400">
                                        Planned time
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-sky-400">
                                        {weeklyProgressData.total_planned}
                                        <span className="ml-1 text-xs font-normal text-slate-400">
                                            min
                                        </span>
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-800/70 p-4">
                                    <p className="text-xs text-slate-400">
                                        Actual time
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-fuchsia-400">
                                        {weeklyProgressData.total_actual}
                                        <span className="ml-1 text-xs font-normal text-slate-400">
                                            min
                                        </span>
                                    </p>
                                </div>

                            </div>

                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Total scheduled records</span>
                                <span className="font-semibold text-white">
                                    {weeklyProgressData.total_records}
                                </span>
                            </div>
                        </>
                    )}

                    <button
                        onClick={() => setShowResult(false)}
                        type="button"
                        className="self-end rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                    >
                        Close
                    </button>

                </div>
            ) : (
                <button
                    onClick={() => setShowResult(true)}
                    type="button"
                    className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-fuchsia-500 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110"
                >
                    Show Weekly Progress
                </button>
            )}

        </div>
    )
}
