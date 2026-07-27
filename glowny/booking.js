// ==========================================================
// DELIKATNA POPRAWKA: PIERWSZA NOCNA
// Zaladowac bezposrednio po glownym pliku booking.js.
// Nie zmienia interwalow, blokad, kalendarza ani pozostalych regul.
// ==========================================================
(function () {
  if (typeof classifyFamilySlot !== "function" || typeof getNightContext !== "function") {
    console.error("Nie mozna zastosowac poprawki pierwszej nocki: brak wymaganych funkcji booking.js.");
    return;
  }

  const classifyFamilySlotBeforeFirstNightFix = classifyFamilySlot;

  classifyFamilySlot = function (dateStr, time, duration) {
    const originalResult = classifyFamilySlotBeforeFirstNightFix(dateStr, time, duration);
    const nightContext = getNightContext(dateStr);

    if (!nightContext.firstNight) {
      return originalResult;
    }

    // Zachowuje mocniejsze blokady, np. dziecko w domu albo koniec po 18:00.
    if (originalResult && originalResult.mode === "MANUAL_ONLY") {
      return originalResult;
    }

    const start = new Date(dateStr + "T" + time);
    const end = new Date(start.getTime() + Number(duration || 0) * 60000);
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const confirmationFrom = 17 * 60 + 30;
    const latestOnlineEnd = 18 * 60;

    if (endMinutes > latestOnlineEnd) {
      return {
        mode: "MANUAL_ONLY",
        reason: "Termin jest niedostepny online."
      };
    }

    if (endMinutes > confirmationFrom) {
      return {
        mode: "CONFIRM",
        reason: "Wybrany termin wymaga potwierdzenia."
      };
    }

    return {
      mode: "STANDARD",
      reason: ""
    };
  };
})();
