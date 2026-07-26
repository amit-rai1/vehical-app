import { StyleSheet } from "react-native";
import { colors, shadow, softShadow } from "../theme";

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.wash
  },
  flex: {
    flex: 1
  },
  appShell: {
    flex: 1
  },
  authContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
    ...shadow
  },
  logoIcon: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900"
  },
  authTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8
  },
  authCopy: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 28
  },
  content: {
    padding: 18,
    paddingBottom: 120
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  greeting: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  screenTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: -0.5
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 20
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 16
  },
  panel: {
    backgroundColor: colors.paper,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 20,
    marginBottom: 18,
    ...softShadow
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
    marginTop: 4,
    letterSpacing: -0.3
  },
  field: {
    flex: 1,
    marginBottom: 14
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8
  },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    color: colors.ink,
    backgroundColor: "#f8fafc",
    fontSize: 15
  },
  textArea: {
    minHeight: 90,
    paddingTop: 14,
    textAlignVertical: "top"
  },
  button: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    ...shadow
  },
  compactButton: {
    minHeight: 42,
    paddingHorizontal: 16
  },
  primaryButton: {
    backgroundColor: colors.primary
  },
  ghostButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2
  },
  secondaryButtonText: {
    color: colors.primary
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14
  },
  twoCol: {
    flexDirection: "row",
    gap: 12
  },
  chipScroller: {
    marginBottom: 14
  },
  chip: {
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#fff"
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...softShadow
  },
  chipText: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 14
  },
  activeChipText: {
    color: "#fff"
  },
  promo: {
    minHeight: 160,
    backgroundColor: colors.ink,
    borderRadius: 24,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 20,
    ...shadow
  },
  promoText: {
    flex: 1,
    zIndex: 2
  },
  promoKicker: {
    color: colors.yellow,
    fontWeight: "900",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  promoTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
    marginTop: 8,
    letterSpacing: -0.5
  },
  promoSub: {
    color: "#cbd5e1",
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20
  },
  carShape: {
    width: 126,
    height: 82,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  carTop: {
    width: 68,
    height: 32,
    backgroundColor: colors.coral,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginBottom: -4
  },
  carBody: {
    width: 118,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.coral
  },
  wheels: {
    width: 92,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -10
  },
  wheel: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#111"
  },
  quickGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22
  },
  quickAction: {
    flex: 1,
    minHeight: 100,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    ...softShadow
  },
  quickIcon: {
    fontSize: 26,
    marginBottom: 10
  },
  quickText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
    letterSpacing: -0.4
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800"
  },
  serviceList: {
    gap: 12
  },
  serviceCard: {
    minHeight: 80,
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    ...softShadow
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    overflow: "hidden"
  },
  serviceInfo: {
    flex: 1
  },
  serviceTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  serviceMeta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4
  },
  chevron: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: "300"
  },
  listItem: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    ...softShadow
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900"
  },
  listInfo: {
    flex: 1
  },
  listTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  listSub: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4
  },
  defaultPill: {
    color: colors.success,
    backgroundColor: "#d1fae5",
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: "900"
  },
  addressPreview: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#f8fafc",
    marginBottom: 14
  },
  timeline: {
    marginTop: 12
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 58
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.line,
    marginTop: 3,
    marginRight: 14
  },
  timelineActiveDot: {
    backgroundColor: colors.success
  },
  timelineTextWrap: {
    flex: 1,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  timelineTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  timelineSub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4
  },
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    ...shadow
  },
  tabButton: {
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center"
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700"
  },
  activeTab: {
    color: colors.primary
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  inlineLoader: {
    marginVertical: 10
  },
  vehicleTypeHint: {
    color: colors.teal,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 14,
    marginTop: 4
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 4
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.line,
    marginRight: 12,
    backgroundColor: "#f8fafc"
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  checkboxLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700"
  },
  searchRow: {
    marginBottom: 18,
    marginTop: 4
  },
  countPill: {
    color: colors.primary,
    backgroundColor: "#ede9fe",
    borderRadius: 14,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 5,
    fontSize: 13,
    fontWeight: "900"
  },
  bigLoader: {
    marginVertical: 40
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 28
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: -0.3
  },
  emptySub: {
    color: colors.muted,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22
  },
  actionRow: {
    flexDirection: "row",
    gap: 18,
    marginTop: 10
  },
  actionBtn: {
    paddingVertical: 6,
    paddingRight: 6
  },
  actionEditText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800"
  },
  actionDeleteText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "800"
  },
  actionDefaultText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "800"
  },
  homeHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12
  },
  logoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: "#fff",
    marginTop: 6
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "800"
  },
  inputDisabled: {
    backgroundColor: "#e2e8f0",
    opacity: 0.7
  },
  geoSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    marginTop: 4
  },
  geoDetectBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    ...softShadow
  },
  geoDetectBtnDisabled: {
    opacity: 0.6
  },
  geoDetectText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800"
  },
  geoHint: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 14,
    marginTop: 2,
    lineHeight: 17
  },
  geoToggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14
  },
  geoToggle: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff"
  },
  geoToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  geoToggleText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700"
  },
  geoToggleTextActive: {
    color: "#fff"
  },
  geoAutoRow: {
    alignItems: "center",
    marginBottom: 14
  },
  geoRefreshText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800"
  },
  addressSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  addAddressLink: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 10
  },
  addressChipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  selectedAddress: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: "#f5f3ff"
  },
  selectTrigger: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc"
  },
  selectTriggerError: {
    borderColor: colors.danger
  },
  selectTriggerText: {
    flex: 1,
    color: colors.ink,
    fontSize: 15
  },
  selectPlaceholder: {
    color: "#94a3b8"
  },
  selectCaret: {
    color: colors.primary,
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "800"
  },
  selectOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
    justifyContent: "flex-end"
  },
  selectSheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "78%",
    paddingBottom: 28
  },
  selectSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  selectSheetTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3
  },
  selectCloseText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800"
  },
  selectSearch: {
    margin: 16,
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    color: colors.ink,
    backgroundColor: "#f8fafc",
    fontSize: 15
  },
  selectList: {
    maxHeight: 380
  },
  selectEmpty: {
    color: colors.muted,
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 32
  },
  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  selectOptionActive: {
    backgroundColor: "#f5f3ff"
  },
  selectOptionTextWrap: {
    flex: 1
  },
  selectOptionLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700"
  },
  selectOptionLabelActive: {
    color: colors.primary
  },
  selectOptionSub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3
  },
  selectCheck: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
    marginLeft: 10
  }
});