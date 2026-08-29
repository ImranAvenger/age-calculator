import { act, cleanup, render, screen } from "@testing-library/react"
import { DateTime } from "luxon"
import { afterEach, describe, expect, it, vi } from "vitest"
import AgeCalculatorCard from "./AgeCalculatorCard"

const { datepicker, pickerRemove } = vi.hoisted(() => {
  const remove = vi.fn()

  return {
    datepicker: vi.fn(() => ({ remove })),
    pickerRemove: remove,
  }
})

vi.mock("js-datepicker", () => ({ default: datepicker }))

describe("AgeCalculatorCard", () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it("shows guidance before a birth date has been selected", () => {
    render(<AgeCalculatorCard />)

    expect(screen.getByText(/your age breakdown will appear here/i)).toBeInTheDocument()
    expect(datepicker).toHaveBeenCalledOnce()
  })

  it("calculates and displays the age selected in the date picker", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-29T12:00:00"))
    render(<AgeCalculatorCard />)

    const options = datepicker.mock.calls[0][1]
    act(() => {
      options.onSelect(null, new Date("2000-08-20T12:00:00"))
    })

    expect(screen.getByText("20 August 2000")).toBeInTheDocument()
    expect(screen.getByText("26")).toBeInTheDocument()
    expect(screen.getByText("0")).toBeInTheDocument()
    expect(screen.getByText("9")).toBeInTheDocument()
  })

  it("calculates age correctly for a leap-day birthday", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-03-01T12:00:00"))
    render(<AgeCalculatorCard />)

    const options = datepicker.mock.calls[0][1]
    act(() => {
      options.onSelect(null, new Date("2000-02-29T12:00:00"))
    })

    expect(screen.getByText("29 February 2000")).toBeInTheDocument()
    expect(screen.getByText("24")).toBeInTheDocument()
    expect(screen.getByText("0")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  it("updates the age and picker maximum date after midnight", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-29T23:59:59"))
    render(<AgeCalculatorCard />)

    const initialOptions = datepicker.mock.calls[0][1]
    act(() => {
      initialOptions.onSelect(null, new Date("2000-08-20T12:00:00"))
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText("10")).toBeInTheDocument()
    expect(datepicker).toHaveBeenCalledTimes(2)
    expect(datepicker.mock.calls[1][1].maxDate).toEqual(new Date("2026-08-30T00:00:00"))
  })

  it("cleans up the date picker when unmounted", () => {
    const { unmount } = render(<AgeCalculatorCard />)

    unmount()

    expect(pickerRemove).toHaveBeenCalledOnce()
  })

  it("formats selected dates for the input field", () => {
    render(<AgeCalculatorCard />)
    const options = datepicker.mock.calls[0][1]
    const input = screen.getByLabelText(/birth date/i)

    options.formatter(input, DateTime.fromISO("2000-08-20").toJSDate())

    expect(input).toHaveValue("20 August 2000")
  })
})
