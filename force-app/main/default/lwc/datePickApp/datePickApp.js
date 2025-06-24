import { LightningElement, api } from "lwc";

export default class DatePickApp extends LightningElement {
  @api startDate;
  @api endDate;
  @api excludedDates;

  currentMonthFirst;
  weeks = [];
  monthLabel = "";
  prevDisabled = false;
  nextDisabled = false;
  selectedDate = "";
  _disabledDatesSet = new Set();

  connectedCallback() {
    const today = new Date();

    let effectiveStartDate = this.startDate;
    let effectiveEndDate = this.endDate;

    if (!effectiveStartDate) {
      effectiveStartDate = today.toISOString().slice(0, 10);
    }
    if (!effectiveEndDate) {
      const end = new Date(today);
      end.setDate(end.getDate() + 30);
      effectiveEndDate = end.toISOString().slice(0, 10);
    }

    const [startYr, startMo, startDay] = effectiveStartDate
      .split("-")
      .map(Number);
    const [endYr, endMo, endDay] = effectiveEndDate.split("-").map(Number);
    this._start = new Date(startYr, startMo - 1, startDay);
    this._end = new Date(endYr, endMo - 1, endDay);

    this.currentMonthFirst = new Date(
      this._start.getFullYear(),
      this._start.getMonth(),
      1
    );

    if (this.excludedDates && this.excludedDates.trim() !== "") {
      this.excludedDates.split(",").forEach((dateStr) => {
        const ds = dateStr.trim();
        if (ds) {
          this._disabledDatesSet.add(ds);
        }
      });
    } else {
      this.generateRandomDisabledDates();
    }

    this.generateCalendar();
  }

  generateRandomDisabledDates() {
    let year = this._start.getFullYear();
    let month = this._start.getMonth();
    const endYear = this._end.getFullYear();
    const endMonth = this._end.getMonth();
    while (year < endYear || (year === endYear && month <= endMonth)) {
      const lastOfMonth = new Date(year, month + 1, 0);
      let minDay = 1;
      let maxDay = lastOfMonth.getDate();
      if (
        year === this._start.getFullYear() &&
        month === this._start.getMonth()
      ) {
        minDay = this._start.getDate();
      }
      if (year === this._end.getFullYear() && month === this._end.getMonth()) {
        maxDay = this._end.getDate();
      }

      const weekdays = [];
      for (let d = minDay; d <= maxDay; d++) {
        const date = new Date(year, month, d);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          weekdays.push(d);
        }
      }

      if (weekdays.length > 0) {
        let picks = [];
        if (weekdays.length <= 5) {
          picks = weekdays;
        } else {
          while (picks.length < 5) {
            const randIndex = Math.floor(Math.random() * weekdays.length);
            const dayNum = weekdays[randIndex];
            if (!picks.includes(dayNum)) {
              picks.push(dayNum);
            }
          }
        }

        const thisMonth = month;
        const thisYear = year;

        picks.forEach((dayNum) => {
          const mm = String(thisMonth + 1).padStart(2, "0");
          const dd = String(dayNum).padStart(2, "0");
          const dateStr = `${thisYear}-${mm}-${dd}`;
          this._disabledDatesSet.add(dateStr);
        });
      }

      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }
  }

  generateCalendar() {
    const year = this.currentMonthFirst.getFullYear();
    const monthIndex = this.currentMonthFirst.getMonth();

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    this.monthLabel = `${monthNames[monthIndex]} ${year}`;

    this.prevDisabled =
      year === this._start.getFullYear() &&
      monthIndex === this._start.getMonth();
    this.nextDisabled =
      year === this._end.getFullYear() && monthIndex === this._end.getMonth();

    const days = [];
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
    const firstWeekday = firstDayOfMonth.getDay();
    const lastWeekday = lastDayOfMonth.getDay();

    if (firstWeekday > 0) {
      const prevMonthLast = new Date(year, monthIndex, 0);
      const prevYear = prevMonthLast.getFullYear();
      const prevMonth = prevMonthLast.getMonth();
      const prevLastDate = prevMonthLast.getDate();

      const startDay = prevLastDate - firstWeekday + 1;
      for (let d = startDay; d <= prevMonthLast.getDate(); d++) {
        const date = new Date(prevYear, prevMonth, d);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        days.push({
          key: dateStr + "_prev",
          dateStr: dateStr,
          label: d,
          disabled: true,
          selected: false,
          tdClass: "slds-disabled-text"
        });
      }
    }

    const thisYear = year;
    const thisMonth = monthIndex;
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const date = new Date(thisYear, thisMonth, d);
      const yyyy = date.getFullYear();
      const mm = String(thisMonth + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      let isDisabled = false;

      if (date < this._start || date > this._end) {
        isDisabled = true;
      }

      const dow = date.getDay();
      if (dow === 0 || dow === 6) {
        isDisabled = true;
      }

      if (this._disabledDatesSet.has(dateStr)) {
        isDisabled = true;
      }

      let tdClass = "";
      if (isDisabled) {
        tdClass = "slds-disabled-text";
      }

      const today = new Date();
      if (
        today.getFullYear() === yyyy &&
        today.getMonth() === thisMonth &&
        today.getDate() === d
      ) {
        tdClass += (tdClass ? " " : "") + "slds-is-today";
      }

      const isSelected = dateStr === this.selectedDate;
      if (isSelected) {
        tdClass += (tdClass ? " " : "") + "slds-is-selected";
      }
      days.push({
        key: dateStr,
        dateStr: dateStr,
        label: d,
        disabled: isDisabled,
        selected: isSelected,
        tdClass: tdClass
      });
    }

    if (lastWeekday < 6) {
      const nextMonth = (monthIndex + 1) % 12;
      const nextYear = monthIndex === 11 ? year + 1 : year;

      const daysNeeded = 6 - lastWeekday;
      for (let d = 1; d <= daysNeeded; d++) {
        const date = new Date(nextYear, nextMonth, d);
        const dateStr = `${date.getFullYear()}-${String(nextMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        days.push({
          key: dateStr + "_next",
          dateStr: dateStr,
          label: d,
          disabled: true,
          selected: false,
          tdClass: "slds-disabled-text"
        });
      }
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      const weekDays = days.slice(i, i + 7);

      const weekId = `week-${year}-${monthIndex}-${weekDays[0].dateStr}`;
      weeks.push({ id: weekId, days: weekDays });
    }
    this.weeks = weeks;
  }

  handleDateClick(event) {
    const cell = event.currentTarget;
    const dateValue = cell.dataset.value;
    const disabledFlag = cell.dataset.disabled;
    if (disabledFlag === "true") {
      return;
    }

    this.selectedDate = dateValue;
    this.generateCalendar();
  }

  goToPreviousMonth() {
    if (this.prevDisabled) return;
    const prevMonthDate = new Date(
      this.currentMonthFirst.getFullYear(),
      this.currentMonthFirst.getMonth() - 1,
      1
    );
    this.currentMonthFirst = prevMonthDate;
    this.generateCalendar();
  }

  goToNextMonth() {
    if (this.nextDisabled) return;
    const nextMonthDate = new Date(
      this.currentMonthFirst.getFullYear(),
      this.currentMonthFirst.getMonth() + 1,
      1
    );
    this.currentMonthFirst = nextMonthDate;
    this.generateCalendar();
  }
}
