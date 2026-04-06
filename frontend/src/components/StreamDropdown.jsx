import { useState, useEffect, useRef } from "react";

const STREAMS = ["CSE","IT","AI","DSE","ECE","EEE","EE","ME","CE","CHE","VLSI","PED","EP","AE","BME","BT","MET","PHYSICS","CHEMISTRY","BIO","MATH"];

const StreamDropdown = ({ value, onChange, placeholder = "Stream", required = false }) => {
  const [open, setOpen] = useState(false);
  const [isOther, setIsOther] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  // On mount, if value is not in STREAMS list, it's a custom value
  useEffect(() => {
    if (value && !STREAMS.includes(value)) {
      setIsOther(true);
      setCustomValue(value);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isOther) inputRef.current?.focus();
  }, [isOther]);

  const handleOther = () => {
    setIsOther(true);
    setOpen(false);
    onChange(customValue);
  };

  const handleCustomChange = (e) => {
    setCustomValue(e.target.value);
    onChange(e.target.value);
  };

  const displayValue = isOther ? (customValue || "Other") : (value || placeholder);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setIsOther(false); setOpen((s) => !s); }}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 flex items-center justify-between text-gray-700"
      >
        <span className={displayValue === placeholder ? "text-gray-400" : "text-gray-700"}>{displayValue}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
          {!required && (
            <button type="button" onClick={() => { onChange(""); setIsOther(false); setCustomValue(""); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-rose-50">
              {placeholder}
            </button>
          )}
          {STREAMS.map((s) => (
            <button key={s} type="button"
              onClick={() => { onChange(s); setIsOther(false); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-rose-50 hover:text-rose-500 ${
                value === s ? "text-rose-500 font-semibold bg-rose-50" : "text-gray-700"
              }`}>
              {s}
            </button>
          ))}
          <button type="button" onClick={handleOther}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-rose-50 hover:text-rose-500 border-t border-gray-100 ${
              isOther ? "text-rose-500 font-semibold bg-rose-50" : "text-gray-700"
            }`}>
            Other
          </button>
        </div>
      )}

      {isOther && (
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter your stream"
          value={customValue}
          onChange={handleCustomChange}
          onBlur={() => { if (customValue.trim()) setIsOther(false); }}
          required={required}
          className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder-gray-400"
        />
      )}
    </div>
  );
};

export { STREAMS };
export default StreamDropdown;
