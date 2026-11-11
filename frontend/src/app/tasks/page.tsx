'use client'

import {useState,useEffect} from 'react'
import AuthGuard from '@/components/AuthGuard'
import { useApi } from '../hooks/useApi'

interface Task {
    id:string,
    name:string,
    created_at:string,
}

export default function TaskPage(){
    const [tasks, setTasks] = useState<Task[]>([])
    const {request} = useApi()
    const [error,setError] = useState('')
    const [loading, setLoading] = useState(true)

    const [newTaskName, setNewTaskName] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)

    const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
    const [isEditingTask, setIsEditingTask] = useState(false)
    const [editingTaskName, setEditingTaskName] = useState('')

    useEffect(()=>{
        async function getTasks(){
            try {
            const receivedTasks = await request("/tasks/",{
                method:'GET'
            })
            setTasks(receivedTasks)
        }catch(error){
          setError(error instanceof Error? error.message : "failed to fetch tasks")
        }finally{
            setLoading(false)
        }
        }
        getTasks()
    },[request])

    async function createTask(){
        if(!newTaskName.trim()) return
        setIsCreating(true)
        setError('')
        try{
            const data = await request('/tasks/',{
                method:"POST",
                body:JSON.stringify({
                    name:newTaskName.trim()
                })
            })
            setTasks((previous)=>([...previous,data]))
            setNewTaskName('')
        }catch(error){
            setError(error instanceof Error? error.message : 'Failed to create task')
        }finally{
            setIsCreating(false)
        }
    }


    async function deleteTask(id:string){
        setError('')
        setDeletingTaskId(id)
        try{
            await request(`/tasks/${id}/`,{
                method:"DELETE"
            })
            setTasks(tasks=>tasks.filter(task=>task.id !== id))
        }catch(error){
            setError(error instanceof Error ? error.message : 'Failed to delete task')
        }finally{
            setDeletingTaskId(null)
        }
    }

    async function editTask(id:string){
        if(!editingTaskName.trim()) return 
        setError('')
        setIsEditingTask(true)
        try{
            const data = await request(`/tasks/${id}/`,{
                method:'PATCH',
                body:JSON.stringify({
                    name:editingTaskName.trim()
                })
            })
            
            setTasks(tasks=>(tasks.map(task=>task.id === id ? data : task)))
            setEditingTaskId(null)
            setEditingTaskName('')
            
        }catch(error){
            setError(error instanceof Error ? error.message : 'Failed to edit task')
        }finally{
            setIsEditingTask(false)
        }
    }
    return(
        <AuthGuard>
            <main className='min-h-screen flex flex-col'>
                <div>
                    <form className='flex justify-center items-center gap-4 py-4 px-4' onSubmit={(event)=>{
                        event.preventDefault()
                        createTask()
                    }}>
                        <div className='flex justify-center items-center gap-2'>
                        <label htmlFor="newTaskName">Task name</label>
                        <input type="text"
                        id="newTaskName"
                        value={newTaskName}
                        onChange={(e)=>setNewTaskName(e.target.value)}
                        className='border p-2 rounded'
                        disabled={isCreating}
                        required
                        />
                        </div>
                        <button type='submit'
                        className='border bg-blue-500 text-white p-2 rounded'
                        disabled={isCreating}> {isCreating ? 'Creating...' : 'Add Task'}</button>
                    </form>
                </div>
                {error && <p>{error}</p>}
                {loading ? (
                <p>Loading tasks...</p>
            ) 
             
             : (
                <div className='flex flex-col justify-center items-center py-6 px-4 gap-4'>
                    <h1  className='font-bold text-xl '>My tasks</h1>
                    {tasks.map((task) =>  editingTaskId===task.id ? (
                <div key={task.id}>
                    <form className='flex justify-center items-center gap-4 py-4 px-4' onSubmit={(event)=>{
                        event.preventDefault()
                        editTask(task.id)
                    }}>
                        <div className='flex justify-center items-center gap-2'>
                        <label htmlFor="editTaskName">Task name</label>
                        <input type="text"
                        id="editTaskName"
                        value={editingTaskName}
                        onChange={(e)=>setEditingTaskName(e.target.value)}
                        className='border p-2 rounded'
                        required
                        />
                        </div>

                        <button 
                        type='submit'
                        disabled={isEditingTask}
                        className='border bg-blue-500 text-white p-2 rounded'>
                        {isEditingTask ? 'Saving' : 'Save'}
                        </button>

                        <button
                        onClick={()=>{
                            setEditingTaskId(null)
                            setEditingTaskName('')
                        }} 
                        type='button'
                        disabled={isEditingTask}
                        className='border bg-red-500 text-white p-2 rounded'> 
                        Cancel
                        </button>
                    </form>
                </div>
             ): (
                        <div  className='flex gap-4' key={task.id}>
                            <div>
                            <p ><span className='font-bold'> Name: </span>{task.name}</p>
                            <p>Created at: {task.created_at}</p>
                            </div>
                            
                            <button className='border rounded p-2 bg-blue-500 text-white w-25'
                            onClick={()=>{
                                setEditingTaskId(task.id)
                                setEditingTaskName(task.name)
                            }}
                            >
                            {task.id===editingTaskId ? 'Editing' : 'Edit'}
                            </button>

                            <button className='border rounded p-2 bg-red-500 text-white w-25'
                             onClick={()=>deleteTask(task.id)}
                             disabled={deletingTaskId===task.id}>
                            {deletingTaskId===task.id? 'Deleting...' : 'Delete'}
                            </button>

                        </div>
                    ))}
                </div>
            )}
            </main>
        </AuthGuard>
    )
}