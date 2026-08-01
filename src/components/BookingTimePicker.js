import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/appStyles";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toYmd(date) {
  const d = startOfLocalDay(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmd(ymd) {
  const [y, m, d] = String(ymd).split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function buildDateOptions(days = 14) {
  const today = startOfLocalDay(new Date());
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today.getTime() + i * DAY_MS);
    const ymd = toYmd(date);
    const label =
      i === 0
        ? "Today"
        : i === 1
          ? "Tomorrow"
          : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    return { ymd, label, date };
  });
}

export function formatBookingTime({ hour12, minute, meridiem }) {
  const h = String(hour12).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${h}:${m} ${meridiem}`;
}

export function toScheduledDate({ dateYmd, hour12, minute, meridiem }) {
  let hours = Number(hour12);
  const mins = Number(minute);
  const period = String(meridiem || "AM").toUpperCase();
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const scheduled = dateYmd ? parseYmd(dateYmd) : startOfLocalDay(new Date());
  scheduled.setHours(hours, mins, 0, 0);
  return scheduled;
}

export function isPastScheduled(value) {
  return toScheduledDate(value).getTime() < Date.now();
}

function defaultTimeValue() {
  const now = new Date();
  // Prefer next 5-minute slot at least 5 minutes from now
  const soon = new Date(now.getTime() + 5 * 60 * 1000);
  soon.setSeconds(0, 0);
  const roundedMin = Math.ceil(soon.getMinutes() / 5) * 5;
  if (roundedMin >= 60) {
    soon.setHours(soon.getHours() + 1, 0, 0, 0);
  } else {
    soon.setMinutes(roundedMin, 0, 0);
  }
  let hour24 = soon.getHours();
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return {
    dateYmd: toYmd(soon),
    hour12,
    minute: soon.getMinutes(),
    meridiem
  };
}

export function getDefaultBookingSchedule() {
  const value = defaultTimeValue();
  if (!isPastScheduled(value)) return value;
  const tomorrow = buildDateOptions(2)[1];
  return {
    dateYmd: tomorrow.ymd,
    hour12: 9,
    minute: 0,
    meridiem: "AM"
  };
}

export function BookingTimePicker({ value, onChange }) {
  const dateOptions = useMemo(() => buildDateOptions(14), []);
  const dateYmd = value?.dateYmd || dateOptions[0]?.ymd;
  const hour12 = value?.hour12 ?? 9;
  const minute = value?.minute ?? 0;
  const meridiem = value?.meridiem ?? "AM";

  const scheduled = useMemo(
    () => toScheduledDate({ dateYmd, hour12, minute, meridiem }),
    [dateYmd, hour12, minute, meridiem]
  );

  const timeLabel = useMemo(
    () => formatBookingTime({ hour12, minute, meridiem }),
    [hour12, minute, meridiem]
  );

  const hint = useMemo(() => {
    const dateLabel = scheduled.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    return `Service scheduled for ${dateLabel} at ${timeLabel}`;
  }, [scheduled, timeLabel]);

  function update(patch) {
    onChange?.({ dateYmd, hour12, minute, meridiem, ...patch });
  }

  function isDateDisabled(ymd) {
    const day = parseYmd(ymd);
    const today = startOfLocalDay(new Date());
    return day.getTime() < today.getTime();
  }

  function isOptionPast(patch) {
    return isPastScheduled({ dateYmd, hour12, minute, meridiem, ...patch });
  }

  return (
    <View style={styles.timePicker}>
      <Text style={styles.timePickerReadout}>{timeLabel}</Text>
      <Text style={styles.timePickerHint}>{hint}</Text>

      <Text style={styles.timePickerLabel}>Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timePickerChipRow}
      >
        {dateOptions.map(opt => {
          const active = dateYmd === opt.ymd;
          const disabled = isDateDisabled(opt.ymd);
          return (
            <TouchableOpacity
              key={opt.ymd}
              disabled={disabled}
              onPress={() => update({ dateYmd: opt.ymd })}
              style={[
                styles.timePickerChip,
                styles.timePickerDateChip,
                active && styles.timePickerChipActive,
                disabled && styles.timePickerChipDisabled
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.timePickerChipText,
                  active && styles.timePickerChipTextActive,
                  disabled && styles.timePickerChipTextDisabled
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.timePickerLabel}>Hour</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timePickerChipRow}
      >
        {HOURS.map(h => {
          const active = hour12 === h;
          const disabled = isOptionPast({ hour12: h });
          return (
            <TouchableOpacity
              key={`h-${h}`}
              disabled={disabled}
              onPress={() => update({ hour12: h })}
              style={[
                styles.timePickerChip,
                active && styles.timePickerChipActive,
                disabled && styles.timePickerChipDisabled
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.timePickerChipText,
                  active && styles.timePickerChipTextActive,
                  disabled && styles.timePickerChipTextDisabled
                ]}
              >
                {String(h).padStart(2, "0")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.timePickerLabel}>Minute</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timePickerChipRow}
      >
        {MINUTES.map(m => {
          const active = minute === m;
          const disabled = isOptionPast({ minute: m });
          return (
            <TouchableOpacity
              key={`m-${m}`}
              disabled={disabled}
              onPress={() => update({ minute: m })}
              style={[
                styles.timePickerChip,
                active && styles.timePickerChipActive,
                disabled && styles.timePickerChipDisabled
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.timePickerChipText,
                  active && styles.timePickerChipTextActive,
                  disabled && styles.timePickerChipTextDisabled
                ]}
              >
                {String(m).padStart(2, "0")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.timePickerLabel}>AM / PM</Text>
      <View style={styles.timePickerMeridiemRow}>
        {["AM", "PM"].map(period => {
          const active = meridiem === period;
          const disabled = isOptionPast({ meridiem: period });
          return (
            <TouchableOpacity
              key={period}
              disabled={disabled}
              onPress={() => update({ meridiem: period })}
              style={[
                styles.timePickerMeridiem,
                active && styles.timePickerChipActive,
                disabled && styles.timePickerChipDisabled
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.timePickerChipText,
                  active && styles.timePickerChipTextActive,
                  disabled && styles.timePickerChipTextDisabled
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
