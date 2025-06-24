import { LightningElement, api, track } from "lwc";

export default class DatePicker extends LightningElement {
  @api startDate;
  @api endDate;
  @api excludedDates = [];

  @track currentDate = new Date();
  @track selectedDate;
  @track dateError = "";
  isModalOpen = false;

  minDate = new Date().toISOString().split("T")[0];

  normalizeToLocalDate(dateString) {
    const [y, m, d] = dateString.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  handleStartDateChange(event) {
    const input = event.target;
    const value = input.value;
    console.log("Selected start date:", value);
    let errorMessage = "";

    if (value) {
      const selectedDate = this.normalizeToLocalDate(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errorMessage = "Start date cannot be in the past.";
      } else if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) {
        errorMessage = "Start date cannot be a weekend (Sat/Sun).";
      }
      console.log("The selected start date is : ", selectedDate);
    }

    input.setCustomValidity(errorMessage);
    input.reportValidity();

    if (!errorMessage) {
      this.startDate = value;
      const endInput = this.template.querySelector(
        'lightning-input[name="endDate"]'
      );
      if (endInput) endInput.min = value;
    }
  }

  handleEndDateChange(event) {
    const input = event.target;
    const value = input.value;
    console.log("Selected end date:", value);
    let errorMessage = "";

    if (value) {
      const selectedDate = this.normalizeToLocalDate(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errorMessage = "End date cannot be in the past.";
      } else if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) {
        errorMessage = "End date cannot be a weekend.";
      }

      if (!errorMessage && this.startDate) {
        const start = this.normalizeToLocalDate(this.startDate);
        if (selectedDate < start) {
          errorMessage = "End date cannot be before the start date.";
        }
      }
      console.log("The selected end date is : ", value);
    }

    input.setCustomValidity(errorMessage);
    input.reportValidity();

    if (!errorMessage) {
      this.endDate = value;
    }
  }

  handleSubmit() {
    if (!this.selectedDate) {
      this.dateError = "Please select a date between Start & End Date range.";
      return;
    }

    this.dateError = "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    console.log("The selected start session date raw is : ", this.selectedDate);
    this.selectedDateStr = this.selectedDate.toLocaleDateString(
      undefined,
      options
    );
    this.isModalOpen = true;
  }

  handleModalOk() {
    this.isModalOpen = false;
    this.startDate = null;
    this.endDate = null;
    this.selectedDate = null;
    this.currentDate = new Date();
  }

  get currentMonthLabel() {
    return this.currentDate.toLocaleString("default", {
      month: "long",
      year: "numeric"
    });
  }

  get daysOfWeek() {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  }

  get calendarDays() {
    if (!this.startDate || !this.endDate) return [];

    const start = this.getStartOfCalendar(this.currentDate);
    const end = this.getEndOfCalendar(this.currentDate);
    const startDt = this.normalizeToLocalDate(this.startDate);
    const endDt = this.normalizeToLocalDate(this.endDate);
    const days = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const isoDate = this.formatDate(d);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isExcluded = this.excludedDates.includes(isoDate) || isWeekend;
      const isOutOfRange = d < startDt || d > endDt;

      const classList = [
        "slds-col",
        "day",
        "slds-size_1-of-7",
        "slds-p-around_x-small",
        "slds-text-align_center",
        "slds-box"
      ];

      if (d.getMonth() !== this.currentDate.getMonth()) {
        classList.push("dimmed");
      }

      if (this.selectedDate && isoDate === this.formatDate(this.selectedDate)) {
        classList.push("selected");
      }

      if (isExcluded || isOutOfRange) {
        classList.push("disabled");
      }

      days.push({
        date: isoDate,
        label: d.getDate(),
        class: classList.join(" ")
      });
    }

    return days;
  }

  get isPrevDisabled() {
    if (!this.startDate) return true;
    const prev = new Date(this.currentDate);
    prev.setMonth(prev.getMonth() - 1);
    const lastDayPrev = new Date(prev.getFullYear(), prev.getMonth() + 1, 0);
    return lastDayPrev < this.normalizeToLocalDate(this.startDate);
  }

  get isNextDisabled() {
    if (!this.endDate) return true;
    const next = new Date(this.currentDate);
    next.setMonth(next.getMonth() + 1);
    const firstDayNext = new Date(next.getFullYear(), next.getMonth(), 1);
    return firstDayNext > this.normalizeToLocalDate(this.endDate);
  }

  previousMonth() {
    if (!this.isPrevDisabled) {
      this.currentDate = new Date(
        this.currentDate.setMonth(this.currentDate.getMonth() - 1)
      );
    }
  }

  nextMonth() {
    if (!this.isNextDisabled) {
      this.currentDate = new Date(
        this.currentDate.setMonth(this.currentDate.getMonth() + 1)
      );
    }
  }

  selectDate(event) {
    const iso = event.currentTarget.dataset.date;
    console.log("User clicked date:", iso);
    if (this.excludedDates.includes(iso)) return;

    const dt = this.normalizeToLocalDate(iso);
    const startDt = this.normalizeToLocalDate(this.startDate);
    const endDt = this.normalizeToLocalDate(this.endDate);

    if (dt < startDt || dt > endDt) return;

    console.log("Selected date in selectDate():", dt);
    this.selectedDate = dt;
  }

  getStartOfCalendar(date) {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const day = first.getDay();
    return new Date(first.setDate(first.getDate() - day));
  }

  getEndOfCalendar(date) {
    const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const day = last.getDay();
    return new Date(last.setDate(last.getDate() + (6 - day)));
  }
}
