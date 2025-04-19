import { useRef, useState, useEffect } from 'react';

function Try() {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const r = useRef({ value: "rohan" });
    console.log(r);
    console.log("current r ", r.current.value);
  useEffect(() => {
    console.log('Are you sure?');
    ref.current.focus();
  }, []);

  const handleClick = () => {
    setCount(count + 1);
    r.current.value = "roh";
    console.log(r.current.value);
  };

return (
    <div>
        <p>You clicked {count} times</p>
        <p>r: {JSON.stringify(r.current)}</p>
        <input ref={ref} type="text" />
        <button onClick={handleClick}>Click me</button>
    </div>
);
}

export default Try;
