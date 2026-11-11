
'use client'

import { useState } from "react"

interface DailyRecord {
    id: string
    task: string
    date: string
    planned_minutes: number
    actual_minutes: number
    completed: boolean
    notes: string
}

interface DailyTaskCardProps {
    record: DailyRecord
    taskName: string
    onUpdate: (id: string, data: Partial<DailyRecord>) => Promise<void>
    onDelete: (id: string) => Promise<void>
}

export default function DailyTaskCard({
    record,
    taskName,
    onUpdate,
    onDelete
}: DailyTaskCardProps) {

    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const [plannedMinutes, setPlannedMinutes] = useState(record.planned_minutes)
    const [actualMinutes, setActualMinutes] = useState(record.actual_minutes)
    const [completed, setCompleted] = useState(record.completed)
    const [notes, setNotes] = useState(record.notes)

    async function handleUpdate() {
        setError('')

        if (plannedMinutes <= 0 || actualMinutes < 0) {
            setError('Please enter valid minutes.')
            return
        }

        setIsSaving(true)

        try {
            await onUpdate(record.id, {
                planned_minutes: plannedMinutes,
                actual_minutes: actualMinutes,
                completed,
                notes
            })
            setIsEditing(false)
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to update the record")
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDelete() {
        const confirmed = window.confirm("Are you sure you want to delete this record?")
        if (!confirmed) return

        setError('')
        setIsDeleting(true)

        try {
            await onDelete(record.id)
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to delete the record")
        } finally {
            setIsDeleting(false)
        }
    }

    function handleCancel() {
        setIsEditing(false)
        setPlannedMinutes(record.planned_minutes)
        setActualMinutes(record.actual_minutes)
        setCompleted(record.completed)
        setNotes(record.notes)
        setError('')
    }

    const inputStyle = "mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-400"

    return (
        <article className="rounded-xl border border-slate-700/70 bg-slate-800/60 p-3 sm:p-5 transition hover:border-sky-500/40">

            {error && (
                <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                </p>
            )}

            {isEditing ? (
                <div className="flex flex-col gap-5">

                    <div>
                        <h3 className="text-lg font-bold text-sky-300">
                            Edit daily record
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                            {taskName}
                        </p>
                    </div>

                    <label className="text-sm text-slate-300">
                        Planned minutes
                        <input
                            className={inputStyle}
                            value={plannedMinutes}
                            onChange={e => setPlannedMinutes(Number(e.target.value))}
                            type="number"
                            min={1}
                        />
                    </label>

                    <label className="text-sm text-slate-300">
                        Actual minutes
                        <input
                            className={inputStyle}
                            value={actualMinutes}
                            onChange={e => setActualMinutes(Number(e.target.value))}
                            type="number"
                            min={0}
                        />
                    </label>

                    <label className="flex items-center gap-3 text-sm text-slate-300">
                        <input
                            checked={completed}
                            onChange={e => setCompleted(e.target.checked)}
                            type="checkbox"
                            className="h-4 w-4 accent-fuchsia-500"
                        />
                        Completed
                    </label>

                    <label className="text-sm text-slate-300">
                        Notes
                        <textarea
                            className={inputStyle}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                        />
                    </label>

                    <div className="flex gap-3">
                        <button
                            onClick={handleUpdate}
                            disabled={isSaving}
                            type="button"
                            className="flex-1 rounded-lg bg-gradient-to-r from-sky-500 to-fuchsia-500 py-2 font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save changes'}
                        </button>

                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            type="button"
                            className="rounded-lg border border-slate-600 px-4 py-2 text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div>

                    <div className="mb-5 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                        <h3 className="min-w-0 break-words break-all text-lg font-bold text-white">
                            {taskName}
                        </h3>

                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            record.completed
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-amber-500/15 text-amber-400'
                        }`}>
                            {record.completed ? 'Completed' : 'In progress'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-slate-900/70 p-3">
                            <p className="text-xs text-slate-400">
                                Planned time
                            </p>
                            <p className="mt-1 text-xl font-bold text-sky-400">
                                {record.planned_minutes}
                                <span className="ml-1 text-xs font-normal text-slate-400">min</span>
                            </p>
                        </div>

                        <div className="rounded-lg bg-slate-900/70 p-3">
                            <p className="text-xs text-slate-400">
                                Actual time
                            </p>
                            <p className="mt-1 text-xl font-bold text-fuchsia-400">
                                {record.actual_minutes}
                                <span className="ml-1 text-xs font-normal text-slate-400">min</span>
                            </p>
                        </div>
                    </div>

                    {record.notes && (
                        <div className="mt-4 border-l-2 border-sky-500/50 pl-3">
                            <p className="text-xs text-slate-400">Notes</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">
                                {record.notes}
                            </p>
                        </div>
                    )}

                    <div className="mt-5 flex justify-end gap-3 border-t border-slate-700/70 pt-4">
                        <button
                            onClick={() => setIsEditing(true)}
                            type="button"
                            className="rounded-lg border border-sky-500/40 px-4 py-2 text-sm text-sky-400 transition hover:bg-sky-500/10"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            disabled={isDeleting}
                            onClick={handleDelete}
                            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            )}
        </article>
    )
}
