import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD or ''
  onChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function parseYmd(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toYmd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDisplay(value: string) {
  const date = parseYmd(value);
  if (!date) return null;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const DatePicker = ({
  value,
  onChange,
  placeholder = 'Select date',
  allowClear = true,
}: DatePickerProps) => {
  const selected = parseYmd(value);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const base = selected ?? new Date();
    setCursor(new Date(base.getFullYear(), base.getMonth(), 1));
  }, [open, selected]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const today = useMemo(() => new Date(), []);

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = cursor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const display = formatDisplay(value);

  const pick = (day: number) => {
    onChange(toYmd(new Date(year, month, day)));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-left text-sm transition hover:bg-white focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:focus:border-zinc-300 dark:focus:ring-zinc-100/10"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span
          className={`min-w-0 flex-1 truncate ${
            display
              ? 'font-medium text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-400'
          }`}
        >
          {display ?? placeholder}
        </span>
        {allowClear && value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onChange('');
              }
            }}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Clear date"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute left-0 z-20 mt-2 w-[18.5rem] rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          role="dialog"
          aria-label="Choose date"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {monthLabel}
            </p>
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-zinc-400">
            {WEEKDAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (day === null) {
                return <div key={`e-${index}`} className="aspect-square" />;
              }

              const date = new Date(year, month, day);
              const isToday = sameDay(date, today);
              const isSelected = selected ? sameDay(date, selected) : false;

              return (
                <button
                  key={`${year}-${month}-${day}`}
                  type="button"
                  onClick={() => pick(day)}
                  className={`aspect-square rounded-lg text-sm transition ${
                    isSelected
                      ? 'bg-emerald-600 font-semibold text-white'
                      : isToday
                        ? 'bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                        : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                onChange(toYmd(new Date()));
                setOpen(false);
              }}
              className="flex-1 rounded-lg border border-zinc-200 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                t.setDate(t.getDate() + 1);
                onChange(toYmd(t));
                setOpen(false);
              }}
              className="flex-1 rounded-lg border border-zinc-200 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Tomorrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
