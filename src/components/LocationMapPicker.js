import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { Button } from "./Button";
import { styles } from "../styles/appStyles";

const DEFAULT_LAT = 18.5204;
const DEFAULT_LNG = 73.8567;

function buildMapHtml(lat, lng) {
  const safeLat = Number.isFinite(lat) ? lat : DEFAULT_LAT;
  const safeLng = Number.isFinite(lng) ? lng : DEFAULT_LNG;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-control-attribution { font-size: 10px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true }).setView([${safeLat}, ${safeLng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    var marker = L.marker([${safeLat}, ${safeLng}], { draggable: true }).addTo(map);

    function post(lat, lng) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
      }
    }

    marker.on('dragend', function () {
      var p = marker.getLatLng();
      post(p.lat, p.lng);
    });

    map.on('click', function (e) {
      marker.setLatLng(e.latlng);
      post(e.latlng.lat, e.latlng.lng);
    });

    post(${safeLat}, ${safeLng});

    document.addEventListener('message', function (event) {
      try {
        var data = JSON.parse(event.data);
        if (data && data.latitude != null && data.longitude != null) {
          var ll = L.latLng(data.latitude, data.longitude);
          marker.setLatLng(ll);
          map.setView(ll, Math.max(map.getZoom(), 15));
          post(ll.lat, ll.lng);
        }
      } catch (e) {}
    });
    window.addEventListener('message', function (event) {
      try {
        var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.latitude != null && data.longitude != null) {
          var ll = L.latLng(data.latitude, data.longitude);
          marker.setLatLng(ll);
          map.setView(ll, Math.max(map.getZoom(), 15));
          post(ll.lat, ll.lng);
        }
      } catch (e) {}
    });
  </script>
</body>
</html>`;
}

async function reverseGeocode(latitude, longitude) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}` +
      `&lon=${encodeURIComponent(longitude)}&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "VehicleServiceMobile/1.0 (location-picker)"
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    const address = data?.address || {};
    return {
      displayName: data?.display_name || "",
      city: address.city || address.town || address.village || address.suburb || "",
      state: address.state || "",
      country: address.country || "",
      pincode: address.postcode || "",
      addressLine:
        [address.road, address.neighbourhood, address.suburb].filter(Boolean).join(", ") ||
        data?.display_name ||
        ""
    };
  } catch {
    return null;
  }
}

export function LocationMapPicker({
  visible,
  initialLatitude,
  initialLongitude,
  onConfirm,
  onClose
}) {
  const webRef = useRef(null);
  const [latitude, setLatitude] = useState(Number(initialLatitude) || DEFAULT_LAT);
  const [longitude, setLongitude] = useState(Number(initialLongitude) || DEFAULT_LNG);
  const [locating, setLocating] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLatitude(Number(initialLatitude) || DEFAULT_LAT);
    setLongitude(Number(initialLongitude) || DEFAULT_LNG);
  }, [visible, initialLatitude, initialLongitude]);

  const html = useMemo(
    () => buildMapHtml(Number(initialLatitude) || DEFAULT_LAT, Number(initialLongitude) || DEFAULT_LNG),
    [visible, initialLatitude, initialLongitude]
  );

  const pushToMap = useCallback((lat, lng) => {
    const payload = JSON.stringify({ latitude: lat, longitude: lng });
    webRef.current?.postMessage(payload);
  }, []);

  async function useCurrentLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      if (coords) {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        pushToMap(coords.latitude, coords.longitude);
      }
    } finally {
      setLocating(false);
    }
  }

  function onWebMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.latitude != null && data?.longitude != null) {
        setLatitude(Number(data.latitude));
        setLongitude(Number(data.longitude));
      }
    } catch {
      // ignore
    }
  }

  async function handleConfirm() {
    setConfirming(true);
    try {
      const hint = await reverseGeocode(latitude, longitude);
      onConfirm?.({
        latitude,
        longitude,
        addressHint: hint
      });
    } finally {
      setConfirming(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.mapPickerHeader}>
          <Text style={styles.mapPickerTitle}>Pick location</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.linkText}>Close</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.mapPickerHint}>
          Tap the map or drag the pin. Use current location for where you are now.
        </Text>
        <View style={styles.mapPickerActions}>
          <TouchableOpacity
            style={[styles.geoDetectBtn, locating && styles.geoDetectBtnDisabled]}
            onPress={useCurrentLocation}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.geoDetectText}>Use current location</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.mapWebWrap}>
          <WebView
            ref={webRef}
            originWhitelist={["*"]}
            source={{ html }}
            onMessage={onWebMessage}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            style={styles.mapWebView}
          />
        </View>
        <View style={styles.mapPickerFooter}>
          <Text style={styles.listSub}>
            Selected: {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}
          </Text>
          <View style={styles.row}>
            <Button title="Cancel" variant="ghost" onPress={onClose} />
            <Button
              title={confirming ? "Saving..." : "Confirm location"}
              loading={confirming}
              onPress={handleConfirm}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export async function getCurrentCoordinates() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission is required.");
  }
  const { coords } = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High
  });
  return {
    latitude: coords.latitude,
    longitude: coords.longitude
  };
}

export { reverseGeocode };
