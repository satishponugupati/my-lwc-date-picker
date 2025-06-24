import { createElement } from "@lwc/engine-dom";
import DatePickApp from "c/datePickApp";

describe("c-date-pick-app", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders month-year header based on @startDate", async () => {
    const el = createElement("c-date-pick-app", { is: DatePickApp });
    el.startDate = "2025-06-01";
    el.endDate = "2025-06-30";
    el.excludedDates = "";
    document.body.appendChild(el);

    await Promise.resolve();

    const header = el.shadowRoot.querySelector("h2");
    expect(header.textContent.trim()).toBe("June 2025");
  });

  it("disables prev button on first month and enables next", async () => {
    const el = createElement("c-date-pick-app", { is: DatePickApp });
    el.startDate = "2025-06-01";
    el.endDate = "2025-08-30";
    document.body.appendChild(el);
    await Promise.resolve();

    const prev = el.shadowRoot.querySelector('button[title="Previous Month"]');
    const next = el.shadowRoot.querySelector('button[title="Next Month"]');
    expect(prev.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    next.click();
    await Promise.resolve();
    expect(prev.disabled).toBe(false);
  });

  it("selects a valid date and highlights it", async () => {
    const el = createElement("c-date-pick-app", { is: DatePickApp });
    el.startDate = "2025-06-01";
    el.endDate = "2025-06-30";
    el.excludedDates = "";
    document.body.appendChild(el);
    await Promise.resolve();

    const td15 = Array.from(
      el.shadowRoot.querySelectorAll("td[data-date]")
    ).find((td) => td.dataset.date === "2025-06-15");
    td15.click();
    await Promise.resolve();

    expect(td15.classList).toContain("slds-is-selected");
    expect(td15.getAttribute("aria-selected")).toBe("true");
  });

  it("marks excluded dates as disabled and prevents selection", async () => {
    const el = createElement("c-date-pick-app", { is: DatePickApp });
    el.startDate = "2025-06-01";
    el.endDate = "2025-06-30";
    el.excludedDates = ["2025-06-10"];
    document.body.appendChild(el);
    await Promise.resolve();

    const td10 = el.shadowRoot.querySelector('td[data-date="2025-06-10"]');
    expect(td10).toBeTruthy();
    expect(td10.classList).toContain("slds-disabled-text");
    expect(td10.getAttribute("aria-disabled")).toBe("true");

    td10.click();
    await Promise.resolve();

    expect(td10.classList).not.toContain("slds-is-selected");
    expect(td10.getAttribute("aria-selected")).not.toBe("true");
  });

  it("prevents navigating past endDate month", async () => {
    const el = createElement("c-date-pick-app", { is: DatePickApp });
    el.startDate = "2025-06-01";
    el.endDate = "2025-06-30";
    document.body.appendChild(el);
    await Promise.resolve();

    const next = el.shadowRoot.querySelector('button[title="Next Month"]');
    expect(next.disabled).toBe(true);
  });
});
