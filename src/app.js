// HealBot Demo App
// A simple health data parser — contains a deliberate bug for CI to catch

function parseHealthData(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid input: expected an object");
  }

  const result = {
    heartRate: data.heart_rate,
    bloodPressure: parseBP(data.blood_pressure),
    temperature: toFahrenheit(data.temperature_c),
    riskLevel: assessRisk(data),
  };

  return result;
}

function parseBP(bp) {
  if (!bp || !bp.includes("/")) return null;
  const [systolic, diastolic] = bp.split("/").map(Number);
  return { systolic, diastolic };
}

function toFahrenheit(celsius) {
  // BUG: wrong formula — should be (celsius * 9/5) + 32
  return celsius * 9 + 32;
}

function assessRisk(data) {
  const hr = data.heart_rate;
  if (hr > 100) return "high";
  if (hr > 80) return "medium";
  return "low";
}

module.exports = { parseHealthData, toFahrenheit, parseBP, assessRisk };
