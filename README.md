#Support Session Scheduler (LWC for Experience Cloud)

This Lightning Web Component (`datePicker`) allows users to select start and end dates from a range and pick a specific session date via a calendar. It is designed for Experience Cloud (LWR template) sites and supports mobile responsiveness, accessibility, and clear user feedback.

##Installation & Configuration

1. **Clone or download the component** into your Salesforce DX project:
   ```bash 
   force-app/main/default/lwc/datePicker
   ```

2. **Deploy to Org:**
   ```bash
   sfdx force:source:deploy -p force-app/main/default/lwc/datePicker
   ```

3. **Add the component** to your LWR Experience Cloud site like this “Support Session Scheduler” to page).

##Key Implementation Decisions

- **Validation Logic:** Dates outside the range, past dates, and weekends are disabled both in inputs and in the calendar view.
- **Local Time Handling:** Dates are normalized using `Date.UTC` to prevent off-by-one issues caused by time zones.
- **User Feedback:** Inline validation messages and toast notifications are used for better UX.
- **Accessibility:** ARIA roles/labels added; keyboard interactions supported.

##Assumptions & Limitations
- Assumes the Experience Site uses **LWR (Build Your Own)** template.
- Date exclusions are limited to weekends and a provided `excludedDates` array.
- Supports only **date selection**, not time slots.

##UX and Accessibility
- Built using **SLDS** and responsive **grid layout**.
- Confirmation modal with formatted date like `July 15, 2025` for clarity.
- **ARIA labels**, keyboard navigation, and visual cues for invalid input enhance accessibility.

##Example Usage
```html <c-date-picker></c-date-picker>
```
##Files Overview
- `datePicker.html` – HTML template with SLDS layout and modal.
- `datePicker.js` – Full validation, calendar logic, and modal interaction.
- `datePicker.css` *(optional)* – Responsive and accessible styling for mobile.

##Maintainer
Developed by Satish Ponugupati. 
