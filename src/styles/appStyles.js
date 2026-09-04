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
    paddingBottom: 130
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 12
  },
  headerTextBlock: {
    flex: 1,
    flexShrink: 1,
    paddingRight: 4
  },
  headerLogo: {
    width: 40,
    height: 34,
    resizeMode: "contain",
    backgroundColor: "#fff"
  },
  otpLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12
  },
  otpLinkLeft: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700"
  },
  otpLinkRight: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700"
  },
  otpLinkDisabled: {
    opacity: 0.45
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
    fontSize: 26,
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: -0.5,
    flexShrink: 1
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
    flexShrink: 1
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.primaryWash,
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
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    ...shadow
  },
  compactButton: {
    minHeight: 44,
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
    marginBottom: 14,
    alignItems: "stretch"
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
    minHeight: 44,
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
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22
  },
  quickAction: {
    width: "47%",
    flexGrow: 1,
    minHeight: 72,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    ...softShadow
  },
  quickActionDisabled: {
    opacity: 0.45
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    gap: 10,
    ...softShadow
  },
  locationBarIcon: {
    fontSize: 18
  },
  locationBarText: {
    flex: 1
  },
  locationBarTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  locationBarSub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  locationBarChevron: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800"
  },
  bannerWrap: {
    marginBottom: 16
  },
  bannerImage: {
    width: "100%",
    height: 140,
    borderRadius: 16,
    backgroundColor: "#e2e8f0"
  },
  bannerDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 8
  },
  bannerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#cbd5e1"
  },
  bannerDotActive: {
    backgroundColor: colors.primary,
    width: 16
  },
  unserviceableCard: {
    backgroundColor: "#fff7ed",
    borderColor: "#fdba74",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  unserviceableTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6
  },
  unserviceableSub: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "flex-end"
  },
  modalSheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 28
  },
  quickIcon: {
    fontSize: 24,
    marginBottom: 8
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
    backgroundColor: colors.primaryWash,
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
    backgroundColor: colors.primaryWash,
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
    minWidth: 52,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 2
  },
  tabButtonCompact: {
    minWidth: 0,
    flex: 1,
    paddingHorizontal: 0
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4
  },
  tabIconCompact: {
    fontSize: 16,
    marginBottom: 2
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700"
  },
  tabLabelCompact: {
    fontSize: 9
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
    backgroundColor: colors.primaryWash,
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
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12
  },
  actionBtn: {
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  actionEditText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800"
  },
  actionDeleteText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "800"
  },
  actionDefaultText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "800"
  },
  homeHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12
  },
  logoutBtn: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: 2
  },
  logoutText: {
    color: colors.danger,
    fontSize: 13,
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
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 44,
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
    minHeight: 44,
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
  },
  rolePicker: {
    justifyContent: "center",
    marginBottom: 8
  },
  segmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18
  },
  emptyCard: {
    backgroundColor: colors.paper,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: "dashed",
    padding: 22,
    marginBottom: 18,
    alignItems: "flex-start"
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 8
  },
  emptyCta: {
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyCtaText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14
  },
  planCard: {
    backgroundColor: colors.paper,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    marginBottom: 14,
    ...softShadow
  },
  planCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 10
  },
  planCardTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800"
  },
  typeBadge: {
    backgroundColor: colors.primaryWash,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  typeBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800"
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    overflow: "hidden"
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.primary
  },
  planBookLink: {
    marginTop: 12
  },
  stepLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
    marginBottom: 12,
    textTransform: "uppercase"
  },
  timePicker: {
    marginBottom: 8
  },
  timePickerReadout: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 4
  },
  timePickerHint: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18
  },
  timePickerLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 4
  },
  timePickerChipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 12,
    paddingRight: 8
  },
  timePickerChip: {
    minWidth: 48,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  timePickerChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  timePickerChipText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800"
  },
  timePickerChipTextActive: {
    color: "#fff"
  },
  timePickerChipDisabled: {
    opacity: 0.35
  },
  timePickerChipTextDisabled: {
    color: colors.muted
  },
  timePickerDateChip: {
    minWidth: 72,
    paddingHorizontal: 14
  },
  timePickerMeridiemRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8
  },
  timePickerMeridiem: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  vehicleStrip: {
    marginBottom: 12
  },
  vehicleChipCard: {
    width: 180,
    backgroundColor: colors.paper,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginRight: 12,
    ...softShadow
  },
  partnerJobThumb: {
    width: 96,
    height: 96,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: "#e2e8f0"
  },
  jobCardCta: {
    marginTop: 10
  },
  partnerInfoCard: {
    marginTop: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: colors.primaryBorder
  },
  primaryCta: {
    marginTop: 14,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  primaryCtaText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15
  },
  secondaryCta: {
    marginTop: 10,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  secondaryCtaText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 14
  },
  feedbackBox: {
    marginTop: 14,
    paddingTop: 8
  },
  starRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14
  },
  starButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  starGlyph: {
    fontSize: 28,
    color: "#cbd5e1"
  },
  starGlyphActive: {
    color: "#f59e0b"
  },
  tabButtonActive: {
    backgroundColor: colors.primaryWash,
    borderRadius: 14
  },
  buttonDisabled: {
    opacity: 0.55
  },
  mapPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8
  },
  mapPickerTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  mapPickerHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 18,
    marginBottom: 10
  },
  mapPickerActions: {
    paddingHorizontal: 18,
    marginBottom: 10
  },
  mapWebWrap: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#e2e8f0"
  },
  mapWebView: {
    flex: 1,
    backgroundColor: "transparent"
  },
  mapPickerFooter: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18
  },
  locationSummary: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 12
  },
  locationActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8
  },
  profileImageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14
  },
  profileImagePreview: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primaryWash,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  profileImage: {
    width: 84,
    height: 84,
    borderRadius: 42
  },
  profileImagePlaceholder: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 8
  }
});