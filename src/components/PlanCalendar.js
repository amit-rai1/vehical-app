import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";

function toYmdKey(value) {
  if (value == null) return null;
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    const dt = new Date(value);
    if (!Number.isNaN(dt.getTime())) {
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    }
    return null;
  }
  if (typeof value === "object") {
    const y = value.year ?? value.Year;
    const m = value.month ?? value.Month;
    const d = value.day ?? value.Day;
    if (y != null && m != null && d != null) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function toDateOnly(value) {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [y, m, d] = value.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  if (typeof value === "object" && (value.year != null || value.Year != null)) {
    const y = value.year ?? value.Year;
    const m = value.month ?? value.Month;
    const d = value.day ?? value.Day;
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

function buildCountMap(dates) {
  const map = {};
  for (const value of dates || []) {
    const key = toYmdKey(value);
    if (!key) continue;
    map[key] = (map[key] || 0) + 1;
  }
  return map;
}

/**
 * Plan window calendar. Marks completed / scheduled days.
 * Multiple services on one day show a count badge.
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

  const completedCounts = useMemo(() => buildCountMap(completedDates), [completedDates]);
  const scheduledCounts = useMemo(() => buildCountMap(scheduledDates), [scheduledDates]);

  const days = useMemo(() => {
    const first = startOfMonth(month);
    const startWeekday = first.getDay();
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
            return <View key={`e-${idx}`} style={{ width: "14.28%", height: 44 }} />;
          }
          const key = ymd(date);
          const selectable = inRange(date) && !isPast(date) && !!onSelectDate;
          const completedCount = completedCounts[key] || 0;
          const scheduledCount = scheduledCounts[key] || 0;
          const completed = completedCount > 0;
          const scheduled = !completed && scheduledCount > 0;
          const badge = completedCount > 1 ? completedCount : scheduledCount > 1 ? scheduledCount : 0;
          const selected = selectedDate && ymd(toDateOnly(selectedDate)) === key;
          const muted = !inRange(date);

          return (
            <TouchableOpacity
              key={key}
              disabled={!selectable}
              onPress={() => onSelectDate?.(key)}
              style={{
                width: "14.28%",
                height: 44,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                backgroundColor: selected
                  ? colors.primary
                  : completed
                    ? "#dcfce7"
                    : scheduled
                      ? colors.primaryWash
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
              {badge > 0 ? (
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "800",
                    color: selected ? colors.primaryWash : completed ? "#166534" : colors.primaryDark,
                    marginTop: -1
                  }}
                >
                  ×{badge}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ marginTop: 10, gap: 4 }}>
        <Text style={styles.listSub}>
          Green = completed · Blue = scheduled · ×N = services that day
        </Text>
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
