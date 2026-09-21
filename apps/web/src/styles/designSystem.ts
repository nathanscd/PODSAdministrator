// ============================================================================
// LAYOUT UTILITIES
// ============================================================================

export const layoutClasses = {
  pageContainer: "min-h-screen bg-[var(--bg-app)] transition-colors duration-300",
  pagePadding: "px-6 sm:px-10 lg:px-16 py-10 lg:py-16",
  pageContent: "max-w-7xl mx-auto",
  section: "my-10 lg:my-16",
  sectionGap: "gap-8 lg:gap-12",
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexColumn: "flex flex-col",
} as const;

// ============================================================================
// CARD & CONTAINER UTILITIES
// ============================================================================

export const cardClasses = {
  base: "bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-xl p-6 shadow-sm transition-all duration-200",
  elevated: "shadow-md hover:shadow-lg hover:border-[var(--border-color)]",
  interactive: "hover:shadow-md hover:border-[var(--accent-color)]/30 cursor-pointer active:scale-[0.99]",
  compact: "p-4",
  spacious: "p-10",
  header: "border-b border-[var(--border-color)]/60 pb-5 mb-5",
  footer: "border-t border-[var(--border-color)]/60 pt-5 mt-5",
  divider: "border-t border-[var(--border-color)]/60 my-5",
} as const;

// ============================================================================
// TYPOGRAPHY UTILITIES
// ============================================================================

export const typographyClasses = {
  h1: "text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--text-primary)] leading-tight",
  h2: "text-2xl lg:text-3xl font-medium tracking-tight text-[var(--text-primary)] leading-snug",
  h3: "text-xl lg:text-2xl font-medium tracking-tight text-[var(--text-primary)]",
  h4: "text-lg font-medium tracking-tight text-[var(--text-primary)]",
  body: "text-base text-[var(--text-primary)] leading-relaxed font-normal",
  bodySecondary: "text-base text-[var(--text-secondary)] leading-relaxed font-normal",
  bodySm: "text-sm text-[var(--text-primary)] font-normal",
  bodySmSecondary: "text-sm text-[var(--text-secondary)] font-normal",
  label: "text-[11px] uppercase font-semibold tracking-widest text-[var(--text-secondary)]",
  hint: "text-xs text-[var(--text-secondary)]",
  error: "text-sm text-red-600 font-medium",
  success: "text-sm text-emerald-600 font-medium",
} as const;

// ============================================================================
// BUTTON UTILITIES
// ============================================================================

export const buttonClasses = {
  base: "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed",
  lg: "px-6 py-2.5 text-base",
  sm: "px-3 py-1.5 text-xs",
  primary: "bg-[var(--accent-color)] text-white shadow-sm hover:opacity-90 active:scale-[0.98]",
  secondary: "bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm hover:bg-black/5 hover:border-[var(--text-primary)]/20 active:scale-[0.98]",
  ghost: "text-[var(--text-primary)] hover:bg-black/5 active:scale-[0.98]",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98]",
  success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98]",
} as const;

// ============================================================================
// FORM UTILITIES
// ============================================================================

export const formClasses = {
  group: "flex flex-col gap-1.5",
  groupHorizontal: "flex items-center gap-4",
  inputBase: "w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)] text-sm transition-all duration-200 focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] disabled:opacity-50 disabled:bg-black/5 disabled:cursor-not-allowed shadow-sm",
  inputLg: "px-4 py-3 text-base",
  inputSm: "px-3 py-1.5 text-xs",
  inputPrimary: "hover:border-[var(--border-color)]/80",
  inputError: "border-red-500 focus:border-red-500 focus:ring-red-500/20",
  inputDisabled: "opacity-50 cursor-not-allowed bg-[var(--text-primary)]/5",
  label: "text-sm font-medium text-[var(--text-primary)]",
  textareaBase: "w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--app-bg)] text-[var(--text-primary)] text-sm min-h-[100px] resize-y transition-all duration-200 focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] shadow-sm",
} as const;

// ============================================================================
// TABLE UTILITIES
// ============================================================================

export const tableClasses = {
  container: "w-full overflow-x-auto rounded-xl border border-[var(--border-color)]/60 bg-[var(--card-bg)] shadow-sm",
  table: "w-full border-collapse text-left",
  thead: "bg-black/5 border-b border-[var(--border-color)]/60",
  th: "px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider",
  tbody: "divide-y divide-[var(--border-color)]/40",
  tr: "transition-colors duration-150 hover:bg-black/5",
  td: "px-6 py-4 text-sm text-[var(--text-primary)]",
  rowActive: "bg-[var(--accent-color)]/5",
  rowHover: "hover:bg-black/5",
} as const;

// ============================================================================
// BADGE & TAG UTILITIES
// ============================================================================

export const badgeClasses = {
  base: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide whitespace-nowrap",
  accent: "bg-[var(--accent-color)]/10 text-[var(--accent-color)]",
  success: "bg-emerald-500/10 text-emerald-700",
  warning: "bg-amber-500/10 text-amber-700",
  danger: "bg-red-500/10 text-red-700",
  info: "bg-blue-500/10 text-blue-700",
  neutral: "bg-black/5 text-[var(--text-secondary)]",
} as const;

// ============================================================================
// MODAL & OVERLAY UTILITIES
// ============================================================================

export const modalClasses = {
  overlay: "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity",
  modal: "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6",
  content: "bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",
  contentCompact: "max-w-md",
  header: "px-6 py-5 border-b border-[var(--border-color)]/60 flex items-center justify-between sticky top-0 bg-[var(--card-bg)]/95 backdrop-blur z-10",
  body: "px-6 py-5",
  footer: "px-6 py-4 border-t border-[var(--border-color)]/60 flex items-center justify-end gap-3 sticky bottom-0 bg-[var(--card-bg)]/95 backdrop-blur z-10",
} as const;

// ============================================================================
// EMPTY STATE UTILITIES
// ============================================================================

export const emptyStateClasses = {
  container: "flex flex-col items-center justify-center py-20 px-6 text-center bg-[var(--card-bg)] border border-dashed border-[var(--border-color)] rounded-xl",
  icon: "w-12 h-12 mb-5 text-[var(--text-secondary)] opacity-50",
  title: "text-lg font-medium text-[var(--text-primary)] mb-1",
  description: "text-sm text-[var(--text-secondary)] max-w-sm mb-6",
} as const;

// ============================================================================
// LOADING STATE UTILITIES
// ============================================================================

export const loadingClasses = {
  spinner: "inline-block w-5 h-5 border-2 border-[var(--border-color)] border-t-[var(--text-primary)] rounded-full animate-spin",
  spinnerLg: "w-8 h-8",
  spinnerSm: "w-3.5 h-3.5 border-[1.5px]",
  skeleton: "bg-black/5 rounded-md animate-pulse",
  skeletonText: "h-3.5 rounded-sm bg-black/5 animate-pulse",
  skeletonAvatar: "w-10 h-10 rounded-full bg-black/5 animate-pulse",
} as const;

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

export const responsiveClasses = {
  hideOnMobile: "hidden md:block",
  showOnMobile: "md:hidden",
  responsivePadding: "px-4 sm:px-8 md:px-10 lg:px-16 py-6 sm:py-10 md:py-12",
  gridAuto: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
  gridResponsive: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-8",
} as const;

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

export const animationClasses = {
  fadeIn: "animate-fadeIn",
  slideUp: "animate-slideUp",
  slideDown: "animate-slideDown",
  smooth: "transition-all duration-300 ease-in-out",
  smoothFast: "transition-all duration-150 ease-in-out",
  smoothSlow: "transition-all duration-500 ease-in-out",
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getButtonClasses(
  variant: keyof typeof buttonClasses = "secondary",
  size: "base" | "lg" | "sm" = "base"
): string {
  return cn(buttonClasses.base, buttonClasses[variant], buttonClasses[size]);
}

export function getInputClasses(
  state: "primary" | "error" = "primary",
  size: "base" | "lg" | "sm" = "base"
): string {
  const baseClass = size === "lg" ? formClasses.inputLg : size === "sm" ? formClasses.inputSm : "";
  const stateClass = state === "error" ? formClasses.inputError : formClasses.inputPrimary;
  return cn(formClasses.inputBase, baseClass, stateClass);
}

export function getBadgeClasses(type: keyof typeof badgeClasses = "neutral"): string {
  return cn(badgeClasses.base, badgeClasses[type]);
}