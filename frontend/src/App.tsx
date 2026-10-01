import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState('checking...')

  useEffect(() => {
    fetch('http://localhost:4000/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('backend not reachable'))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">TryFirst</h1>
      <p>Backend status: {status}</p>
    </div>
  )
}

export default App
