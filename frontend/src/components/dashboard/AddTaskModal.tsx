
'use client'

import { useState, useEffect } from "react"
import { formatDate } from "../formatDate"

interface Task {
    id: string,
    name: string,
    created_at: string
}

interface AddTaskModalProps {
    tasks: Task[],
    onSubmit: (data: AddTaskData) => void,
    onClose: () => void,
    weekDays: Date[],
    errors:string,
    setErrors:(error:string)=>void
}

interface AddTaskData {
    mode: 'existing' | 'new',
    taskId: string,
    taskName: string,
    dates: string[],
    plannedMinutes: number,
}

export default function AddTaskModal({
    errors,
    setErrors,
    tasks,
    onClose,
    onSubmit,
    weekDays,
}: AddTaskModalProps) {

    const [mode, setMode] = useState<'existing' | 'new'>('existing')
    const [selectedTask, setSelectedTask] = useState('')
    const [newTaskName, setNewTaskName] = useState('')
    const [selectedDates, setSelectedDates] = useState<string[]>([])
    const [error, setError] = useState('')
    const [plannedMinutes, setPlannedMinutes] = useState(0)
    const [isAdding, setIsAdding] = useState(false)

    
    function handleSubmit() {
        setError('')
        setIsAdding(true)

        if (mode === 'existing' && !selectedTask) {
            setError('Please select one of the existing tasks')
            setIsAdding(false)
            return
        }

        if (mode === 'new' && !newTaskName.trim()) {
            setError("Please enter a task name")
            setIsAdding(false)
            return
        }

        if (selectedDates.length === 0) {
            setError('Select at least one date')
            setIsAdding(false)
            return
        }

        if (plannedMinutes <= 0) {
            setError('Planned minutes must be at least one')
            setIsAdding(false)
            return
        }

        onSubmit({
            mode,
            taskId: selectedTask,
            taskName: newTaskName.trim(),
            dates: selectedDates,
            plannedMinutes,
        })


    }

    const inputStyle = "mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-3 text-white outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-400"

    return (
        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-fuchsia-950/30">

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="bg-gradient-to-r from-sky-400 to-fuchsia-400 bg-clip-text text-2xl font-bold text-transparent">
                        Add Task
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Schedule your tasks for the week
                    </p>
                </div>

                <button
                    type="button"
                    onClick={()=>{
                        setErrors('')
                        onClose()
                    }}
                    className="rounded-lg px-3 py-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                    ✕
                </button>
            </div>

            {/* Task mode */}
            <div className="mb-5">
                <label className="text-sm font-medium text-slate-300">
                    Task type
                </label>

                <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'existing' | 'new')}
                    className={inputStyle}
                >
                    <option value="existing">Select existing task</option>
                    <option value="new">Create new task</option>
                </select>
            </div>

            {/* Existing or new task */}
            <div className="mb-6">
                {mode === 'existing' ? (
                    <>
                        <label className="text-sm font-medium text-slate-300">
                            Choose a task
                        </label>

                        <select
                            value={selectedTask}
                            onChange={(e) => setSelectedTask(e.target.value)}
                            className={inputStyle}
                        >
                            <option value="">Choose a task</option>

                            {tasks.map((task) => (
                                <option value={task.id} key={task.id}>
                                    {task.name}
                                </option>
                            ))}
                        </select>
                    </>
                ) : (
                    <>
                        <label className="text-sm font-medium text-slate-300">
                            New task name
                        </label>

                        <input
                            type="text"
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            placeholder="Enter a new task name"
                            className={inputStyle}
                        />
                    </>
                )}
            </div>

            {/* Date selection */}
            <div className="mb-6">
                <h2 className="mb-3 text-sm font-medium text-slate-300">
                    Select dates
                </h2>

                <div className="grid grid-cols-4 gap-2">
                    {weekDays.map((date) => {
                        const formattedDate = formatDate(date)
                        const isSelected = selectedDates.includes(formattedDate)

                        return (
                            <label
                                key={formattedDate}
                                className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-3 text-sm transition ${
                                    isSelected
                                        ? 'border-sky-400 bg-sky-500/15 text-sky-300'
                                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    value={formattedDate}
                                    checked={isSelected}
                                    className="accent-sky-400"
                                    onChange={(e) => {
                                        e.target.checked
                                            ? setSelectedDates(previous => [...previous, formattedDate])
                                            : setSelectedDates(previous => previous.filter(date => date !== formattedDate))
                                    }}
                                />

                                {date.toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    day: 'numeric'
                                })}
                            </label>
                        )
                    })}
                </div>
            </div>

            {/* Planned minutes */}
            <div className="mb-6">
                <label className="text-sm font-medium text-slate-300">
                    Planned minutes
                </label>

                <input
                    type="number"
                    value={plannedMinutes}
                    min="1"
                    onChange={(e) => setPlannedMinutes(Number(e.target.value))}
                    className={inputStyle}
                />
            </div>

            {/* Error */}
            {error && (
                <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    type="button"
                    disabled={isAdding && !Boolean(errors)}
                    onClick={handleSubmit}
                    className="flex-1 rounded-lg bg-gradient-to-r from-sky-500 to-fuchsia-500 px-4 py-3 font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
                >
                    {isAdding && !Boolean(errors) ? 'Saving...' : 'Schedule Task'}
                </button>

                <button
                    type="button"
                    onClick={()=>{
                        setErrors('')
                        onClose()
                    }}
                    className="rounded-lg border border-slate-700 px-5 py-3 text-slate-300 transition hover:bg-slate-800"
                >
                    Cancel
                </button>
                {errors && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {errors}
        </p>
    )}
            </div>
        </div>
    )
}
