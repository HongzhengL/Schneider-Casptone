const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

const toDate = (value) => {
    if (value instanceof Date) {
        return isValidDate(value) ? new Date(value) : null;
    }
    const date = new Date(value);
    return isValidDate(date) ? date : null;
};

export function getIsoWeekBounds(referenceDate = new Date()) {
    const base = toDate(referenceDate) ?? new Date();
    const startOfWeek = new Date(base);
    const day = startOfWeek.getUTCDay(); // 0 (Sun) ... 6 (Sat)
    const distanceToMonday = day === 0 ? -6 : 1 - day;

    startOfWeek.setUTCDate(startOfWeek.getUTCDate() + distanceToMonday);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
}

export function resolveReferenceDate(runs, fallbackDate = new Date()) {
    return toDate(fallbackDate) ?? new Date();
}

export function calculateWeeklyCoverage(runs, options = {}) {
    const referenceDate = resolveReferenceDate(runs, options.referenceDate);
    const { startOfWeek, endOfWeek } = getIsoWeekBounds(referenceDate);

    const runsInWeek = Array.isArray(runs)
        ? runs.filter((run) => {
              const completionDate = toDate(run.completionDate);
              if (!completionDate) {
                  return false;
              }
              const completionTime = completionDate.getTime();
              return (
                  completionTime >= startOfWeek.getTime() && completionTime <= endOfWeek.getTime()
              );
          })
        : [];

    const coveredAmount = runsInWeek.reduce((sum, run) => {
        const priceNum = Number(run?.priceNum ?? 0);
        return Number.isFinite(priceNum) ? sum + priceNum : sum;
    }, 0);

    return {
        coveredAmount,
        startOfWeek: startOfWeek.toISOString(),
        endOfWeek: endOfWeek.toISOString(),
        runCount: runsInWeek.length,
        referenceDate: referenceDate.toISOString(),
    };
}
