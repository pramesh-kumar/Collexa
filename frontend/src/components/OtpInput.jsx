import { useRef } from "react";

const OtpInput = ({ value, onChange }) => {
  const refs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const arr = [...digits];
      arr[i] = "";
      onChange(arr.join(""));
      if (i > 0) refs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = [...digits];
    arr[i] = val;
    onChange(arr.join(""));
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={`w-11 text-center text-xl font-bold rounded-xl border-2 transition focus:outline-none
            ${d ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 bg-white text-gray-800"}
            focus:border-rose-400 focus:ring-2 focus:ring-rose-100`}
          style={{ height: "3.25rem" }}
        />
      ))}
    </div>
  );
};

export default OtpInput;
