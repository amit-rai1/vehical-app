import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/appStyles";

function toDateOnly(value) {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [y, m, d] = value.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/**
 * Plan window calendar. Marks completed / scheduled days.
 * Optional onSelectDate for booking (only dates in range, not past if disablePast).
 */
export function PlanCalendar({
  startDate,
  endDate,
  completedDates = [],
  scheduledDates = [],
  selectedDate,
  onSelectDate,
  disablePast = true
}) {
  const rangeStart = toDateOnly(startDate);
  const rangeEnd = toDateOnly(endDate);
  const [month, setMonth] = useState(() => startOfMonth(rangeStart || new Date()));

  const completedSet = useMemo(
    () => new Set((completedDates || []).map(d => String(d).slice(0, 10))),
    [completedDates]
  );
  const scheduledSet = useMemo(
    () => new Set((scheduledDates || []).map(d => String(d).slice(0, 10))),
    [scheduledDates]
  );

  const days = useMemo(() => {
    const first = startOfMonth(month);
    const startWeekday = first.getDay(); // 0 Sun
    const cells = [];
    for (let i = 0; i < startWeekday; i += 1) cells.push(null);
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push(new Date(first.getFullYear(), first.getMonth(), d));
    }
    return cells;
  }, [month]);

  const today = toDateOnly(new Date());
  const monthLabel = month.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  function inRange(date) {
    if (!rangeStart || !rangeEnd || !date) return false;
    return date >= rangeStart && date <= rangeEnd;
  }

  function isPast(date) {
    if (!disablePast || !today || !date) return false;
    return date < today;
  }

  return (
    <View>
      <View style={[styles.row, { alignItems: "center", marginBottom: 8 }]}>
        <TouchableOpacity onPress={() => setMonth(m => addMonths(m, -1))}>
          <Text style={styles.linkText}>‹ Prev</Text>
        </TouchableOpacity>
        <Text style={[styles.listTitle, styles.flex, { textAlign: "center" }]}>{monthLabel}</Text>
        <TouchableOpacity onPress={() => setMonth(m => addMonths(m, 1))}>
          <Text style={styles.linkText}>Next ›</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", marginBottom: 4 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <Text key={`${d}-${i}`} style={[styles.listSub, { flex: 1, textAlign: "center" }]}>
            {d}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {days.map((date, idx) => {
          if (!date) {
            return <View key={`e-${idx}`} style={{ width: "14.28%", height: 40 }} />;
          }
          const key = ymd(date);
          const selectable = inRange(date) && !isPast(date) && !!onSelectDate;
          const completed = completedSet.has(key);
          const scheduled = scheduledSet.has(key);
          const selected = selectedDate && ymd(toDateOnly(selectedDate)) === key;
          const muted = !inRange(date);

          return (
            <TouchableOpacity
              key={key}
              disabled={!selectable}
              onPress={() => onSelectDate?.(key)}
              style={{
                width: "14.28%",
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                backgroundColor: selected
                  ? "#4f46e5"
                  : completed
                    ? "#dcfce7"
                    : scheduled
                      ? "#e0e7ff"
                      : "transparent",
                opacity: muted ? 0.35 : 1
              }}
            >
              <Text
                style={{
                  fontWeight: selected || completed ? "700" : "500",
                  color: selected ? "#fff" : "#111827"
                }}
              >
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ marginTop: 10, gap: 4 }}>
        <Text style={styles.listSub}>Green = completed · Blue tint = scheduled</Text>
        {rangeStart && rangeEnd ? (
          <Text style={styles.listSub}>
            Bookable: {rangeStart.toLocaleDateString("en-IN")} –{" "}
            {rangeEnd.toLocaleDateString("en-IN")}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
