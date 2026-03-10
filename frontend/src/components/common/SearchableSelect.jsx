import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select",
  required,
  className = ""
}) => {

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = options.find(o =>
    String(o.value) === String(value)
  )?.label;

  return (
    <div ref={ref} className={"relative " + className}>
      <button
        type="button"
        className="w-full px-3 py-2 rounded border text-left flex items-center justify-between bg-white"
        onClick={() => {
          setOpen(!open);
          setSearch("");
        }}
      >
        <span className={selectedLabel ? "text-gray-800" : "text-gray-400"}>
          {selectedLabel || placeholder}
        </span>

        <FaChevronDown
          className={
            "text-gray-400 text-[10px] transition-transform " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      {required && !value && (
        <input
          className="absolute opacity-0 w-0 h-0"
          tabIndex={-1}
          required
          value=""
          onChange={() => {}}
        />
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-52 flex flex-col">
          <div className="p-1.5 border-b">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50 border">
              <FaSearch className="text-gray-400 text-[10px]" />

              <input
                ref={searchRef}
                className="w-full text-sm outline-none bg-transparent"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 && (
              <div className="p-2 text-sm text-gray-400 text-center">
                No results
              </div>
            )}

            {filtered.map((o) => (
              <div
                key={o.value}
                className={
                  "px-3 py-2 text-sm cursor-pointer hover:bg-emerald-50 " +
                  (String(o.value) === String(value)
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-gray-700")
                }
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {o.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;