import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { vehicleApi } from "../api/client";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Header } from "../components/Header";
import { Select } from "../components/Select";
import { fallbackMakes, fallbackModels } from "../constants/catalog";
import { useFeedback } from "../feedback";
import { colors } from "../theme";
import { styles } from "../styles/appStyles";

const VEHICLE_TYPE_LABELS = {
  1: "Two Wheeler",
  2: "Four Wheeler"
};

function normalizeVehicleNumber(value) {
  return (value || "").replace(/\s/g, "").toUpperCase();
}

export function VehiclesScreen() {
  const { showLoading, hideLoading, success, error, info, confirm } = useFeedback();
  const [makes, setMakes] = useState(fallbackMakes);
  const [models, setModels] = useState([]);
  const [selectedMakeId, setSelectedMakeId] = useState(null);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [color, setColor] = useState("");
  const [year, setYear] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadMakes = useCallback(async () => {
    setLoadingMakes(true);
    try {
      const response = await vehicleApi.makes();
      const data = response?.data || response || [];
      if (Array.isArray(data) && data.length) {
        setMakes(data);
      }
    } catch (err) {
      console.warn("Failed to load makes:", err.message);
    } finally {
      setLoadingMakes(false);
    }
  }, []);

  const loadModels = useCallback(async (makeId) => {
    if (!makeId) {
      setModels([]);
      setSelectedModelId(null);
      return;
    }
    setLoadingModels(true);
    try {
      const response = await vehicleApi.models(makeId);
      const data = response?.data || response || [];
      if (Array.isArray(data)) {
        setModels(data);
      }
    } catch (err) {
      console.warn("Failed to load models:", err.message);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, []);

  const loadVehicles = useCallback(async () => {
    setLoadingVehicles(true);
    showLoading("Loading vehicles…");
    try {
      const response = await vehicleApi.list({
        pageNumber: 1,
        pageSize: 50,
        search: search || "",
        isActive: true,
        sortBy: "CreatedOn",
        isAscending: false
      });
      const data = response?.data?.records || response?.data?.items || response?.data || [];
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load vehicles:", err.message);
      setVehicles([]);
    } finally {
      hideLoading();
      setLoadingVehicles(false);
    }
  }, [search, showLoading, hideLoading]);

  useEffect(() => {
    loadMakes();
  }, [loadMakes]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Cascading: when the selected make changes, reload models and reset model selection.
  useEffect(() => {
    if (selectedMakeId) {
      loadModels(selectedMakeId);
    } else {
      setModels([]);
      setSelectedModelId(null);
    }
  }, [selectedMakeId, loadModels]);

  const showMakes = makes.length ? makes : fallbackMakes;
  const showModels = models.length ? models : fallbackModels;

  const makeOptions = showMakes.map(m => ({
    value: m.vehicleMakeId,
    label: m.name
  }));

  const modelOptions = showModels.map(m => ({
    value: m.vehicleModelId,
    label: m.name,
    sublabel: VEHICLE_TYPE_LABELS[m.vehicleType] ? `${VEHICLE_TYPE_LABELS[m.vehicleType]}` : undefined
  }));

  const selectedModel = showModels.find(m => m.vehicleModelId === selectedModelId);

  function resetForm() {
    setSelectedMakeId(null);
    setSelectedModelId(null);
    setVehicleNumber("");
    setColor("");
    setYear("");
    setImageBase64("");
    setIsDefault(false);
    setEditingVehicleId(null);
    setShowForm(false);
  }

  function startAdd() {
    resetForm();
    setIsDefault(vehicles.length === 0);
    setShowForm(true);
  }

  function startEdit(vehicle) {
    setEditingVehicleId(vehicle.vehicleId);
    setVehicleNumber(vehicle.vehicleNumber || "");
    setColor(vehicle.color || "");
    setYear(vehicle.manufacturingYear ? String(vehicle.manufacturingYear) : "");
    setImageBase64(vehicle.image || "");
    setIsDefault(vehicle.isDefault || false);
    setSelectedModelId(null);
    setShowForm(true);

    if (vehicle.vehicleMakeId) {
      setSelectedMakeId(vehicle.vehicleMakeId);
    }

    // After models load for this make, set the model selection.
    if (vehicle.vehicleMakeId && vehicle.vehicleModelId) {
      loadModels(vehicle.vehicleMakeId).then(() => {
        setSelectedModelId(vehicle.vehicleModelId);
      });
    }
  }

  async function saveVehicle() {
    if (!selectedMakeId) {
      await info("Missing field", "Please select a vehicle make.");
      return;
    }
    if (!selectedModelId) {
      await info("Missing field", "Please select a vehicle model.");
      return;
    }

    setSaving(true);
    showLoading(editingVehicleId ? "Updating vehicle…" : "Saving vehicle…");
    try {
      const payload = {
        vehicleMakeId: selectedMakeId,
        vehicleModelId: selectedModelId,
        vehicleNumber: normalizeVehicleNumber(vehicleNumber),
        color: color || undefined,
        image: imageBase64 || "",
        manufacturingYear: year ? Number(year) : null,
        isDefault: isDefault
      };

      if (editingVehicleId) {
        await vehicleApi.update(editingVehicleId, payload);
        await success("Vehicle updated", "Your vehicle was updated successfully.");
      } else {
        await vehicleApi.create(payload);
        await success("Vehicle saved", "Your vehicle was added successfully.");
      }
      resetForm();
      await loadVehicles();
    } catch (err) {
      await error(editingVehicleId ? "Update failed" : "Save failed", err.message);
    } finally {
      hideLoading();
      setSaving(false);
    }
  }

  async function confirmDelete(vehicle) {
    const ok = await confirm({
      title: "Delete Vehicle",
      message: `Remove ${vehicle.vehicleMakeName || ""} ${vehicle.vehicleModelName || ""}?`,
      confirmText: "Delete",
      danger: true
    });
    if (ok) await deleteVehicle(vehicle.vehicleId);
  }

  async function deleteVehicle(id) {
    setActionLoadingId(id);
    showLoading("Deleting vehicle…");
    try {
      await vehicleApi.remove(id);
      await loadVehicles();
    } catch (err) {
      await error("Delete failed", err.message);
    } finally {
      hideLoading();
      setActionLoadingId(null);
    }
  }

  async function setDefaultVehicle(id) {
    setActionLoadingId(id);
    showLoading("Updating default…");
    try {
      await vehicleApi.makeDefault(id);
      await loadVehicles();
    } catch (err) {
      await error("Failed to set default", err.message);
    } finally {
      hideLoading();
      setActionLoadingId(null);
    }
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Header
        title="My Vehicles"
        subtitle="Manage your saved vehicles with live data."
      />

      {!showForm ? (
        <Button title="+ Add Vehicle" onPress={startAdd} />
      ) : (
        <View style={styles.panel}>
          <View style={styles.formHeader}>
            <Text style={styles.panelTitle}>
              {editingVehicleId ? "Edit Vehicle" : "Add Vehicle"}
            </Text>
            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.linkText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <Select
            label="Vehicle Make"
            placeholder="Select make"
            options={makeOptions}
            value={selectedMakeId}
            onChange={(value) => {
              setSelectedMakeId(value);
              setSelectedModelId(null);
            }}
            loading={loadingMakes}
            error={!selectedMakeId && saving}
          />

          <Select
            label="Vehicle Model"
            placeholder={selectedMakeId ? "Select model" : "Select a make first"}
            options={modelOptions}
            value={selectedModelId}
            onChange={(value) => setSelectedModelId(value)}
            loading={loadingModels}
            disabled={!selectedMakeId}
            error={!selectedModelId && saving}
          />

          {selectedModel?.vehicleType ? (
            <Text style={styles.vehicleTypeHint}>
              Type: {VEHICLE_TYPE_LABELS[selectedModel.vehicleType] || "Unknown"}
            </Text>
          ) : null}

          <Field
            label="Vehicle Number (optional)"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            placeholder="UP32AB1234"
            autoCapitalize="characters"
          />
          <View style={styles.twoCol}>
            <Field label="Color" value={color} onChangeText={setColor} placeholder="White" />
            <Field
              label="Year"
              value={year}
              onChangeText={setYear}
              keyboardType="number-pad"
              placeholder="2024"
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIsDefault(!isDefault)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, isDefault && styles.checkboxActive]} />
            <Text style={styles.checkboxLabel}>Set as default vehicle</Text>
          </TouchableOpacity>

          <Button
            title={editingVehicleId ? "Update Vehicle" : "Save Vehicle"}
            loading={saving}
            onPress={saveVehicle}
          />
        </View>
      )}

      <View style={styles.searchRow}>
        <Field
          label="Search"
          value={search}
          onChangeText={setSearch}
          placeholder="Search by make, model, or number"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Saved Vehicles</Text>
        {vehicles.length > 0 ? (
          <Text style={styles.countPill}>{vehicles.length}</Text>
        ) : null}
      </View>

      {loadingVehicles ? null : vehicles.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={styles.emptyTitle}>No vehicles yet</Text>
          <Text style={styles.emptySub}>
            {search ? "No vehicles match your search." : "Add your first vehicle to get started."}
          </Text>
        </View>
      ) : (
        vehicles.map(vehicle => {
          const isActioning = actionLoadingId === vehicle.vehicleId;
          return (
            <View key={vehicle.vehicleId} style={styles.listItem}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {vehicle.vehicleType === 1 ? "2W" : "4W"}
                </Text>
              </View>
              <View style={styles.listInfo}>
                <Text style={styles.listTitle}>
                  {vehicle.vehicleMakeName} {vehicle.vehicleModelName}
                </Text>
                <Text style={styles.listSub}>
                  {vehicle.vehicleNumber || "Number not added"}
                  {vehicle.color ? ` • ${vehicle.color}` : ""}
                  {vehicle.manufacturingYear ? ` • ${vehicle.manufacturingYear}` : ""}
                </Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => startEdit(vehicle)}
                    disabled={isActioning}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionEditText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmDelete(vehicle)}
                    disabled={isActioning}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionDeleteText}>Delete</Text>
                  </TouchableOpacity>
                  {!vehicle.isDefault ? (
                    <TouchableOpacity
                      onPress={() => setDefaultVehicle(vehicle.vehicleId)}
                      disabled={isActioning}
                      style={styles.actionBtn}
                    >
                      <Text style={styles.actionDefaultText}>Set Default</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
              {isActioning ? (
                <ActivityIndicator color={colors.primary} />
              ) : vehicle.isDefault ? (
                <Text style={styles.defaultPill}>Default</Text>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
