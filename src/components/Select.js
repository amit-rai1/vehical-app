import React, { useState } from "react";
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

/**
 * A user-friendly dropdown/select component.
 * Opens a bottom-sheet style modal with a searchable list of options.
 *
 * Props:
 *  - label: field label
 *  - placeholder: placeholder text when no value selected
 *  - options: [{ value, label, sublabel? }]
 *  - value: selected value
 *  - onChange: (value, option) => void
 *  - loading: show spinner inside the trigger
 *  - disabled: disable interaction
 *  - searchable: enable search filter (default true)
 *  - error: show error border
 */
export function Select({
  label,
  placeholder = "Select",
  options = [],
  value,
  onChange,
  loading = false,
  disabled = false,
  searchable = true,
  error = false
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find(o => o.value === value);
  const displayText = selected ? selected.label : placeholder;

  const filtered = searchable && query
    ? options.filter(o =>
        (o.label || "").toLowerCase().includes(query.toLowerCase()) ||
        (o.sublabel || "").toLowerCase().includes(query.toLowerCase())
      )
    : options;

  function handlePick(option) {
    onChange?.(option.value, option);
    setQuery("");
    setOpen(false);
  }

  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.selectTrigger, error && styles.selectTriggerError, disabled && styles.inputDisabled]}
        onPress={() => !disabled && !loading && setOpen(true)}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.selectTriggerText, !selected && styles.selectPlaceholder]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Text style={styles.selectCaret}>▾</Text>
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.selectOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity style={styles.selectSheet} activeOpacity={1}>
            <View style={styles.selectSheetHeader}>
              <Text style={styles.selectSheetTitle}>{label || "Select"}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.selectCloseText}>Close</Text>
              </TouchableOpacity>
            </View>

            {searchable ? (
              <TextInput
                style={styles.selectSearch}
                value={query}
                onChangeText={setQuery}
                placeholder="Search..."
                placeholderTextColor="#9a9dad"
              />
            ) : null}

            <ScrollView style={styles.selectList} keyboardShouldPersistTaps="handled">
              {filtered.length === 0 ? (
                <Text style={styles.selectEmpty}>No options available</Text>
              ) : (
                filtered.map(option => {
                  const active = option.value === value;
                  return (
                    <TouchableOpacity
                      key={String(option.value)}
                      style={[styles.selectOption, active && styles.selectOptionActive]}
                      onPress={() => handlePick(option)}
                    >
                      <View style={styles.selectOptionTextWrap}>
                        <Text style={[styles.selectOptionLabel, active && styles.selectOptionLabelActive]}>
                          {option.label}
                        </Text>
                        {option.sublabel ? (
                          <Text style={styles.selectOptionSub}>{option.sublabel}</Text>
                        ) : null}
                      </View>
                      {active ? <Text style={styles.selectCheck}>✓</Text> : null}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}