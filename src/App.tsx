import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'

function App() {
  const [greetMsg, setGreetMsg] = useState('')
  const [name, setName] = useState('')

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke('greet', { name }))
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-cozy-card rounded-2xl shadow-cozy p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-cozy-text">Welcome to PubMetric</h1>
          <p className="text-cozy-muted">Your cozy, local CRM for managing leads.</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-cozy-text">
              Your Name
            </label>
            <input
              id="name"
              placeholder="Enter your name"
              className="flex h-10 w-full rounded-xl border border-cozy-border bg-white px-3 py-2 text-sm placeholder:text-cozy-muted focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <button
            className="w-full bg-warm-600 hover:bg-warm-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors duration-200"
            onClick={greet}
            disabled={!name.trim()}
          >
            Greet
          </button>
        </div>

        {greetMsg && (
          <p className="text-center text-cozy-muted">
            {greetMsg}
          </p>
        )}
      </div>
    </div>
  )
}

export default App
