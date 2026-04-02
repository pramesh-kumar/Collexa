import { useState, useEffect, useRef } from "react";

const STREAMS = ["CSE","IT","AI","DSE","ECE","EEE","EE","ME","CE","CHE","VLSI","PED","EP","AE","BME","BT","MET","PHYSICS","CHEMISTRY","BIO","MATH"];

const StreamDropdown = ({ value, onChange, placeholder = "Stream", required = false }) => {
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
        className="w-full border rounded-xl px-4 py-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 flex items-center justify-between text-gray-700"
      >
        <span className={value ? "text-gray-700" : "text-gray-400"}>{value || placeholder}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
          {required ? null : (
            <button type="button" onClick={() => { onChange(""); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-rose-50">
              {placeholder}
            </button>
          )}
          {STREAMS.map((s) => (
            <button key={s} type="button"
              onClick={() => { onChange(s); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-rose-50 hover:text-rose-500 ${
                value === s ? "text-rose-500 font-semibold bg-rose-50" : "text-gray-700"
              }`}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { STREAMS };
export default StreamDropdown;
