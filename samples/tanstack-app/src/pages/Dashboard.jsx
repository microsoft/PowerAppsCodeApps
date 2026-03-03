import { useState } from "react";

export default function Dashboard() {
  const [count, setCount] = useState(0);

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="card">
        <button onClick={() => setCount((c) => c + 1)}>
          Count is {count}
        </button>
        <p>A simple interactive widget to demonstrate state on a routed page.</p>
      </div>
    </div>
  );
}
