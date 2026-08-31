import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AppDialog } from "./AppDialog";
import { GlobalLoader } from "./GlobalLoader";

const FeedbackContext = createContext(null);

const DEFAULT_DIALOG = {
  visible: false,
  type: "info",
  title: "",
  message: "",
  confirmText: "OK",
  cancelText: "Cancel",
  danger: false,
  showCancel: false
};

export function FeedbackProvider({ children }) {
  const [loaderCount, setLoaderCount] = useState(0);
  const [loaderMessage, setLoaderMessage] = useState("Just a moment…");
  const [dialog, setDialog] = useState(DEFAULT_DIALOG);
  const resolverRef = useRef(null);

  const showLoading = useCallback((message) => {
    setLoaderMessage(message || "Just a moment…");
    setLoaderCount(count => count + 1);
  }, []);

  const hideLoading = useCallback(() => {
    setLoaderCount(count => Math.max(0, count - 1));
  }, []);

  const closeDialog = useCallback((result) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setDialog(DEFAULT_DIALOG);
    if (resolve) resolve(result);
  }, []);

  const openDialog = useCallback((options) => {
    return new Promise(resolve => {
      if (resolverRef.current) {
        resolverRef.current(false);
      }
      resolverRef.current = resolve;
      setDialog({
        visible: true,
        type: options.type || "info",
        title: options.title || "",
        message: options.message || "",
        confirmText: options.confirmText || "OK",
        cancelText: options.cancelText || "Cancel",
        danger: Boolean(options.danger),
        showCancel: Boolean(options.showCancel)
      });
    });
  }, []);

  const alert = useCallback(
    (titleOrOptions, message, type = "info") => {
      if (typeof titleOrOptions === "object" && titleOrOptions !== null) {
        return openDialog({
          type: titleOrOptions.type || "info",
          title: titleOrOptions.title || "",
          message: titleOrOptions.message || "",
          confirmText: titleOrOptions.confirmText || "OK",
          showCancel: false
        });
      }
      return openDialog({
        type,
        title: titleOrOptions || "",
        message: message || "",
        confirmText: "OK",
        showCancel: false
      });
    },
    [openDialog]
  );

  const success = useCallback(
    (title, message) => alert(title, message, "success"),
    [alert]
  );

  const error = useCallback(
    (title, message) => alert(title, message, "error"),
    [alert]
  );

  const info = useCallback(
    (title, message) => alert(title, message, "info"),
    [alert]
  );

  const confirm = useCallback(
    (options = {}) =>
      openDialog({
        type: options.type || "confirm",
        title: options.title || "Are you sure?",
        message: options.message || "",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        danger: Boolean(options.danger),
        showCancel: true
      }),
    [openDialog]
  );

  const value = useMemo(
    () => ({
      showLoading,
      hideLoading,
      alert,
      success,
      error,
      info,
      confirm
    }),
    [showLoading, hideLoading, alert, success, error, info, confirm]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <GlobalLoader visible={loaderCount > 0} message={loaderMessage} />
      <AppDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        danger={dialog.danger}
        showCancel={dialog.showCancel}
        onConfirm={() => closeDialog(true)}
        onCancel={() => closeDialog(false)}
      />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error("useFeedback must be used within FeedbackProvider");
  }
  return ctx;
}
