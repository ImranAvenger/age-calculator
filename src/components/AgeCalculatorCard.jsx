import { DateTime } from "luxon"
import datepicker from "js-datepicker"
import "js-datepicker/dist/datepicker.min.css"
import { useEffect, useMemo, useRef, useState } from "react"

function AgeStat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4 text-center">
      <p className="text-3xl font-bold tracking-tight text-indigo-300">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
    </div>
  )
}

function AgeCalculatorCard() {
  const [birthDate, setBirthDate] = useState(null)
  const [today, setToday] = useState(() => DateTime.now().startOf("day"))
  const inputRef = useRef(null)

  useEffect(() => {
    const now = DateTime.now()
    const nextDay = now.plus({ days: 1 }).startOf("day")
    const timeout = window.setTimeout(() => {
      setToday(DateTime.now().startOf("day"))
    }, nextDay.diff(now).as("milliseconds"))

    return () => {
      window.clearTimeout(timeout)
    }
  }, [today])

  useEffect(() => {
    if (!inputRef.current) {
      return
    }

    const picker = datepicker(inputRef.current, {
      maxDate: today.toJSDate(),
      formatter: (input, date) => {
        input.value = DateTime.fromJSDate(date).toFormat("dd LLLL yyyy")
      },
      onSelect: (_, date) => {
        setBirthDate(DateTime.fromJSDate(date).startOf("day"))
      },
    })

    return () => {
      picker.remove()
    }
  }, [today])

  const age = useMemo(() => {
    if (!birthDate) {
      return null
    }

    return today.diff(birthDate, ["years", "months", "days"]).toObject()
  }, [birthDate, today])

  const years = Math.floor(age?.years ?? 0)
  const months = Math.floor(age?.months ?? 0)
  const days = Math.floor(age?.days ?? 0)

  return (
    <section className="w-full max-w-xl rounded-3xl border border-slate-700/60 bg-slate-800/60 p-6 shadow-2xl shadow-indigo-950/40 backdrop-blur-md sm:p-8">
      <span className="inline-flex rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
        Date of Birth
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Age Calculator
      </h1>
      <p className="mt-2 text-sm text-slate-300 sm:text-base">
        Pick your birth date to calculate your exact age in years, months, and
        days.
      </p>

      <label
        className="mt-6 block text-sm font-medium text-slate-200"
        htmlFor="birth-date"
      >
        Birth date
      </label>
      <input
        id="birth-date"
        ref={inputRef}
        placeholder="Select your birth date"
        readOnly
        className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none ring-indigo-400/70 placeholder:text-slate-500 transition focus:border-indigo-400 focus:ring-2"
      />

      {age ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-slate-300">
            Born on{" "}
            <span className="font-semibold text-slate-100">
              {birthDate.toFormat("dd LLLL yyyy")}
            </span>
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <AgeStat label="Years" value={years} />
            <AgeStat label="Months" value={months} />
            <AgeStat label="Days" value={days} />
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-slate-600 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
          Your age breakdown will appear here after you choose a date.
        </p>
      )}
    </section>
  )
}

export default AgeCalculatorCard
