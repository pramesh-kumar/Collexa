import { useState, useEffect, useRef } from "react";

const YEARS = [1, 2, 3, 4, 5];

const YearDropdown = ({ value, onChange, placeholder = "Year", required = false, allOption = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 flex items-center justify-between text-gray-700"
      >
        <span className={value ? "text-gray-700" : "text-gray-400"}>{value || placeholder}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
          {allOption && (
            <button type="button" onClick={() => { onChange(""); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-rose-50">
              Year
            </button>
          )}
          {YEARS.map((y) => (
            <button key={y} type="button"
              onClick={() => { onChange(y); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-rose-50 hover:text-rose-500 ${
                Number(value) === y ? "text-rose-500 font-semibold bg-rose-50" : "text-gray-700"
              }`}>
              {y}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default YearDropdown;
