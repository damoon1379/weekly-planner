'use client'

import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import {useApi} from "@/app/hooks/useApi"
import { useEffect, useState } from "react";
import { formatDate } from "@/components/formatDate";
import AddTaskModal from "@/components/dashboard/AddTaskModal";
import DailyTaskCard from "@/components/dashboard/DailyTaskCard";
import WeeklyProgress from "@/components/dashboard/WeeklyProgress";

interface DailyRecord {
    id: string
    task: string
    date: string
    planned_minutes: number
    actual_minutes: number
    completed: boolean
    notes: string
}

interface Task {
    id:string,
    name:string,
    created_at:string,
}

interface AddTaskData {
    mode: 'existing' | 'new',
    taskId:string,
    taskName:string,
    dates:string[],
    plannedMinutes:number,
}

export default function Home() {
const {accessToken, isAuthLoading, logout} = useAuth()

const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([])
const [error, setError] = useState('')

const [tasksLoading, setTasksLoading] = useState(true)
const [recordsLoading, setRecordsLoading] = useState(true)

const [tasks, setTasks] = useState<Task[]>([])

const [selectedDate, setSelectedDate] = useState(new Date())
const dayIndex = (selectedDate.getDay()+6)%7
const monday = new Date(selectedDate)
monday.setDate(selectedDate.getDate()-dayIndex)

const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)

const [refreshTrigger, setRefreshTrigger] = useState(0)

const {request} = useApi()

useEffect(()=>{
  if(isAuthLoading || !accessToken) return
  setError('')
  setTasksLoading(true)
  async function getTasks(){ 
    try{
    const fetchedTasks = await request("/tasks/",{
      method:"GET"
    })
    setTasks(fetchedTasks)
  }catch(error){
    setError(
      error instanceof Error ? error.message : "Failed to fetch tasks"
    )
  }finally{
    setTasksLoading(false)
  }}
 getTasks()
},[request,isAuthLoading,accessToken])

useEffect(()=>{
  if (isAuthLoading || !accessToken) return

  let isActive = true

  const apiDate = formatDate(selectedDate)

  async function getDailyRecords(){
    setError('')
    setRecordsLoading(true)
    try{
      const dailyrecords = await request(`/daily-records/?date=${apiDate}`,{
        method:"GET"
      })
      if(isActive){
      setDailyRecords(dailyrecords)
      }

    }catch(error){
      if(isActive){
      setError(error instanceof Error ? error.message : "Failed to fetch daily records")
      }
    }finally{
      if(isActive){
      setRecordsLoading(false)
      } 
    }
  }
  getDailyRecords()

  return ()=>{
    isActive = false
  }
},[selectedDate,request,isAuthLoading,accessToken])

const weekDays = Array.from({length:7},(_,index)=>{
  const date = new Date(monday)
  date.setDate(monday.getDate()+index)
  return date
})

function previousWeek(){
  const newDate = new Date(selectedDate)
  newDate.setDate(selectedDate.getDate()-7)
  setSelectedDate(newDate)
  setRefreshTrigger(previous=>previous + 1)
}

function nextWeek(){
  const newDate = new Date(selectedDate)
  newDate.setDate(selectedDate.getDate()+7)
  setSelectedDate(newDate)
  setRefreshTrigger(previous=>previous + 1)

}



async function handleAddTask(data: AddTaskData) {
    setError('')
    let taskId = data.taskId

    try {
        if (data.mode === 'new') {
            const task = await request("/tasks/", {
                method: "POST",
                body: JSON.stringify({ name: data.taskName })
            })

            taskId = task.id
            setTasks(previous => [...previous, task])

        }

        await Promise.all(
            data.dates.map(date =>
                request('/daily-records/', {
                    method: "POST",
                    body: JSON.stringify({
                        task: taskId,
                        date,
                        planned_minutes: data.plannedMinutes
                    })
                })
            )
        )

        // Refresh records for the currently selected date.
        const refreshedRecords = await request(
            `/daily-records/?date=${formatDate(selectedDate)}`,
            { method: "GET" }
        )

        setDailyRecords(refreshedRecords)
        setIsAddTaskOpen(false)
        setRefreshTrigger(previous=>previous + 1)


    } catch (error) {
        setError(
            error instanceof Error ? error.message : "Failed to schedule task"
        )
    }
}


async function handleUpdateRecord(id:string,data:Partial<DailyRecord>){
  setError('')
  try{
    const updatedDailyRecord = await request(`/daily-records/${id}/`,{
      method:"PATCH",
      body:JSON.stringify(data)
    })
    setDailyRecords(previous=> previous.map((record)=>record.id===id ? updatedDailyRecord : record))
    setRefreshTrigger(previous=>previous + 1)

  }catch(error){
    setError(
      error instanceof Error? error.message : "Failed to update daily record"
    )
          throw error
  }
}

async function handleDeleteRecord(id:string){
  setError('')
  try{

    await request(`/daily-records/${id}/`,{
      method:"DELETE",
    })

setDailyRecords(previous =>
    previous.filter(dailyRecord => dailyRecord.id !== id)
)
  setRefreshTrigger(previous=>previous + 1)

  }catch(error){
    setError(
      error instanceof Error ? error.message : "Failed to delete daily record"
    )
    throw error
  }
}
  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-950 text-white">
  <header className="flex items-center justify-between px-8 py-5">
    <h1 className="text-2xl font-bold">
      Weekly Planner
    </h1>

    <button
      onClick={logout}
      className="rounded-lg border border-red-500/40 px-4 py-2 text-red-400 hover:bg-red-500/10"
    >
      Log out
    </button>
  </header>

  <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 px-4 py-6 sm:px-6 lg:px-8">
    {/* Left and right panels go here */}
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-6 shadow-xl shadow-sky-950/20">
    <div className="mb-6 flex items-center justify-between">
        <div>
            <h2 className="text-xl font-bold tracking-wide">
                Daily Tasks
            </h2>
            <p className="mt-1 text-sm text-slate-400">
                Your schedule for the selected day
            </p>
        </div>
    </div>

    {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
        </p>
    )}

    {recordsLoading || tasksLoading ? (
        <p className="text-slate-400">Loading daily records...</p>
    ) : dailyRecords.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
            No tasks scheduled for this day.
        </p>
    ) : (
        <div className="flex flex-col gap-4">
            {dailyRecords.map((dailyrecord) => (
                <DailyTaskCard
                    key={dailyrecord.id}
                    record={dailyrecord}
                    taskName={tasks.find(task => task.id === dailyrecord.task)?.name ?? 'undefined task'}
                    onUpdate={handleUpdateRecord}
                    onDelete={handleDeleteRecord}
                />
            ))}
        </div>
    )}
</div>
        
        
        <div className="flex flex-col gap-6">

    {/* Weekly Calendar */}
    <section className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-3 sm:p-6 shadow-xl shadow-fuchsia-950/10">

        <div className="mb-6 flex items-center justify-between gap-3">
            <button
                onClick={previousWeek}
                className="rounded-lg border border-slate-700 px-3 py-2 text-slate-300 hover:border-sky-400 hover:text-sky-400"
            >
                &lt;
            </button>

            <h2 className="text-center text-sm font-semibold text-slate-200">
                {weekDays[0].toLocaleDateString('en-US', {
                    month: "short",
                    day: "numeric",
                })}
                {" - "}
                {weekDays[6].toLocaleDateString('en-US', {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                })}
            </h2>

            <button
                onClick={nextWeek}
                className="rounded-lg border border-slate-700 px-3 py-2 text-slate-300 hover:border-fuchsia-400 hover:text-fuchsia-400"
            >
                &gt;
            </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weekDays.map((date) => (
                <button
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-1 sm:p-3 transition-all ${
                        date.toDateString() === selectedDate.toDateString()
                            ? 'border-fuchsia-400 bg-gradient-to-br from-sky-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20'
                            : 'border-slate-700 bg-slate-800/70 text-slate-400 hover:border-sky-400 hover:text-sky-300'
                    }`}
                    key={date.toISOString()}
                >
                    <span className="text-[10px] font-medium sm:text-xs">
                        {date.toLocaleDateString('en-US', {
                            weekday: 'short',
                        })}
                    </span>

                    <span className="text-base font-bold sm:text-lg">
                        {date.getDate()}
                    </span>
                </button>
            ))}
        </div>

        <button
            onClick={() => setIsAddTaskOpen(true)}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-sky-500 to-fuchsia-500 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110"
        >
            + Add Task
        </button>
    </section>

    {/* Weekly Progress */}
    <section className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-6 shadow-xl shadow-sky-950/20">
        <h2 className="mb-4 text-lg font-bold">
            Weekly Progress
        </h2>

        <WeeklyProgress
            refreshTrigger={refreshTrigger}
            startDate={formatDate(weekDays[0])}
            endDate={formatDate(weekDays[6])}
        />
    </section>

</div>
  </div>
</main>
       
      {isAddTaskOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <AddTaskModal
            tasks={tasks}
            weekDays={weekDays}
            onClose={() => setIsAddTaskOpen(false)}
            onSubmit={handleAddTask}
            errors={error}
            setErrors={setError}
        />
    </div>
)}
    </AuthGuard>
  );
}