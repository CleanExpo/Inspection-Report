import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="card">
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
      <p>
        Edit <code>src/components/Counter.jsx</code> and save to test HMR
      </p>
    </div>
  )
}

export default Counter