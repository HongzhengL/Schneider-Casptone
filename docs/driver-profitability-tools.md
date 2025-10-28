# Driver Profitability Tools

## Purpose

This tool shall provides **insights** (not decisions) to help drivers judge a load.
Unless **Total RPM >= Rolling CPM(RCPM)**, the driver is earning _something_ toward
fixed costs (truck note, insurance, permit, etc.).
We must **constantly remind** drivers of **Downtime Cost**
and of **period coverage** (week/month), since trips often span multiple days.

We will also provide **status bar** for the drivers to learn about their progress of earning
in this period, such that we can motivate the drivers to take on more loads for **Schneider**'s
benefit, and of course, for the drivers' benefit.

## Feature Goal

1. **Instant clarity at load pick time.** For every load card, show a simple green/amber/red verdict based on **RPM vs. RCPM** (not all-in CPM):

    - **Green (Contributes):** RPM > RCPM + margin
    - **Amber (At cost):** |RPM − RCPM| ≤ margin
    - **Red (Burns cash):** RPM < RCPM

2. **Low-effort setup.** Shall be finished in 2 to 3 minutes in simple mode.
3. **Two Modes.** Simple mode for quick set up; **Pro** (collapsed by default) for drivers who want granular control.
    - **Simple mode** only take `rolling CPM` into consideration.
    - **Pro Mode** will take `fixed cost` into consideration. Setting it up could enable features like `status bar`.
4. **Single cost lens.**

    - **RCPM (Rolling Cost per Mile)** = fuel + maintenance/wear + tires + per-mile fees (no fixed spread).
    - **Contribution per mile (Δ)** = max(0, RPM − RCPM). Δ first **covers fixed**; after coverage, Δ becomes **true earnings per mile**.

---

## Features

### Feature 1: Fixed-Coverage Insight on Search Result Screen

**What**

On the top of the search result screen,
show **how much of the current period’s fixed pot this trip covers** and **how much remains**.
That is, a period progress bar showing **Fixed (goal)**, **Covered**, **Remaining**.

**UI**

-   A **status bar** indicating the progress of fixed cost status of this week/month:
    `Fixed: $N • Covered: $X • Remaining: $Y`
-   If the drivers have covered all the fixed cost for this period, showing them how much they actually earn.
    -   Optional(might be an evil idea): `You earning surpasses X% of drivers in the same region`

---

### Feature 2: Downtime Cost Reminders

**What**

Keep the **cost of waiting** visible in period terms.

**UI**

-   Persistent **Fixed/day $D** in header
-   Drawer: “**Wait 1 day: −$D from this week**”, “**Wait 2 days: −$2D**”

---

### Feature 3 (Optional, Advanced Feature): Periodization & Multi-Day Trips

**What**
Fairly allocate a trip’s **contribution** to the periods where miles happen.

**Algorithm**

1. Estimate day-by-day miles from pickup→delivery (drive hours + dwell + appointments).
2. Allocate `Cᵢ_day = Δᵢ × miles_day` (minus day-specific unreimbursed extras if known).
3. Sum by **Week/Month**.
   **Fallbacks:**

-   Even split by days if timing uncertain;
-   As a last resort, allocate to delivery period with **“Est.”** badge.

---

### Feature 4: Metrics on Cards

**What**

Add `RCPM` to be able to be displayed in the cards, just like `Est Total RPM`.

**UX/UX**

Should be the same level as `Est Total RPM`, also be filterable.

---

### Feature 5: Verdicts

**What**

Change the color of `Est Total RPM` to indicate if the drivers are earning or losing money in this trip.
(Might be color blind unfriendly, need to think of an alternative)

**UI**

-   **Green (Contributes):** `RPM ≥ RCPM + margin`
-   **Amber (At cost):** `|RPM − RCPM| ≤ margin`
-   **Red (Burns cash):** `RPM < RCPM − margin`
    Default `margin = max($0.05/mi, 3% of RCPM)` (configurable).

---

### Feature 6: Setting

**What**

The page where the drivers set up this feature by setting their `fixed cost` and `rolling cost`.

I'm still sorting things out, but based on my understanding, basically, the idea is,
for costs that can be measured per mile, it would be `rolling cost`;
for costs that can be measured by time period, it would be `fixed cost`.

**Quick setup (2–3 min)**

-   **MPG** (prefilled), **Fuel price** (prefilled), **Maintenance fund (¢/mi)**
-   One **Monthly Fixed Bundle** number (truck/trailer, insurance, permits, ELD/phone, parking, software, etc.)
    (Split later in Pro)

**Units**

Accept **/mile, /trip, /week, /month, /year** for any line;
app normalizes to **per-mile** (for RCPM/Δ) and **per-period** (fixed pot).

---

### Feature 7: Period Break-Even Miles & Miles-to-Cover

**What**

Two motivators:

-   **Personal Break-Even Miles (PBW/PBM):** "Based on your history, you typically cover
    **this week/month** after ~N miles."
-   **Trip Miles-to-Cover:** "At this trip’s contribution rate, ~M miles to cover the **current period**."

**Math**

-   `PBW = Fixed/week / mean_trimmed(Δ_history)`
-   `PBM = Fixed/month / mean_trimmed(Δ_history)`
-   `Miles_to_cover_period = Remaining_period / max(Δᵢ, ε)`
-   Clear provenance: **Your history** → **Cohort fallback** when needed.

---

### Feature 8: Top-Up Suggestions (finish the pot quickly)

**What**

If close to coverage, suggest short, feasible runs that push the **current period** into Profit Mode.

**Ranking**

1. **Contribution per Hour (CpH)** = `Cᵢ / (drive_hours + expected_dwell)`
2. `Cᵢ_period` then `Δᵢ`
   Only show loads whose contribution **lands in the current period**.
