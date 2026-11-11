# duty-scheduler
# Task: Redesign and Modernize the On-Call / Shift Schedule UI

## 1. Context & Objective
We have an existing on-call scheduling / shift management application. The current UI is functional but lacks modern visual aesthetics, clear hierarchy, and intuitive data visualization.
Your goal is to refactor and redesign the interface to make it clean, modern, highly visual, and effortless to read at a glance.

## 2. Key Design & Visualization Requirements

### A. Schedule & Calendar Views
- **Multi-View Support:** Provide seamless switching between **Monthly**, **Weekly**, and **Daily/Timeline** views.
- **Visual Timelines / Gantt-style View:**
  - Visualize overlapping shifts, coverage gaps, and handover transitions clearly.
  - Highlight current active shifts with a prominent "Live / On-Duty Now" indicator (e.g., pulsing dot or distinct border accent).
- **Clear Status & Role Tagging:**
  - Use distinct, accessible color-coded badges for different shift tiers (e.g., Primary On-call, Secondary/Backup, Escalation, Night Shift).
  - Include avatar chips with user names, status indicators (Available, Busy, Out of Office), and contact shortcuts.

### B. Visual Polish & Dashboard Aesthetics
- **Clean Card-Based Layout:** Use subtle borders, modern shadows (elevation), consistent border-radius (e.g., rounded-xl), and generous whitespace.
- **Visual Indicators for Gaps & Alerts:** Visually flag unassigned shifts or coverage gaps with high-contrast warning tags (e.g., amber/red subtle badges) so they stand out immediately.
- **Quick Filters & Search:** Add an intuitive filter bar at the top (filter by team, role, member, or shift status).
- **Responsive & Dark Mode Ready:** Ensure the layout scales cleanly across standard desktop and tablet screens, with support for dark/light themes.

### C. Micro-interactions & Usability
- Add subtle hover states on shift blocks revealing key details (e.g., shift duration, contact number, handover notes) via tooltips or popovers.
- Smooth transitions when toggling views or moving between date ranges.

## 3. Technical Constraints & Implementation Rules
- **Stack:** [Insert your tech stack here, e.g., React 18+, TypeScript, Tailwind CSS, Lucide Icons, date-fns].
- **Code Quality:**
  - Keep components modular and reusable (e.g., `<ShiftCard />`, `<MemberAvatar />`, `<TimelineRow />`, `<ViewToggle />`).
  - Do not break existing scheduling logic, state management, or API integrations.
  - Keep styling consistent with standard design system tokens (spacing, typography scale, palette).

## 4. Execution Step
Please inspect the current codebase first, identify the main schedule view components, outline your proposed structural/styling changes, and then implement the updated UI step-by-step.