const { parseHealthData, toFahrenheit, parseBP, assessRisk } = require("./app");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}`);
    console.error(`    Expected: ${e.expected}`);
    console.error(`    Received: ${e.received}`);
    console.error(`    ${e.message}`);
    failed++;
  }
}

function expect(received) {
  return {
    toBe(expected) {
      if (received !== expected) {
        const err = new Error(`Value mismatch`);
        err.expected = expected;
        err.received = received;
        throw err;
      }
    },
    toEqual(expected) {
      const r = JSON.stringify(received);
      const e = JSON.stringify(expected);
      if (r !== e) {
        const err = new Error(`Object mismatch`);
        err.expected = e;
        err.received = r;
        throw err;
      }
    },
    toBeNull() {
      if (received !== null) {
        const err = new Error(`Expected null`);
        err.expected = null;
        err.received = received;
        throw err;
      }
    }
  };
}

console.log("\n🧪 Running HealBot Tests...\n");

// parseBP tests
test("parseBP returns systolic and diastolic", () => {
  expect(parseBP("120/80")).toEqual({ systolic: 120, diastolic: 80 });
});

test("parseBP returns null for invalid input", () => {
  expect(parseBP(null)).toBeNull();
  expect(parseBP("no-slash")).toBeNull();
});

// toFahrenheit tests
test("converts 0°C to 32°F", () => {
  expect(toFahrenheit(0)).toBe(32);
});

test("converts 100°C to 212°F", () => {
  expect(toFahrenheit(100)).toBe(212);
});

test("converts 37°C to 98.6°F (body temp)", () => {
  expect(toFahrenheit(37)).toBe(98.6);
});

// assessRisk tests
test("heart rate > 100 is high risk", () => {
  expect(assessRisk({ heart_rate: 110 })).toBe("high");
});

test("heart rate 85 is medium risk", () => {
  expect(assessRisk({ heart_rate: 85 })).toBe("medium");
});

test("heart rate 60 is low risk", () => {
  expect(assessRisk({ heart_rate: 60 })).toBe("low");
});

// Full parseHealthData test
test("parseHealthData processes full patient record", () => {
  const result = parseHealthData({
    heart_rate: 72,
    blood_pressure: "118/76",
    temperature_c: 37
  });
  expect(result.temperature).toBe(98.6);
  expect(result.riskLevel).toBe("low");
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.error(`❌ ${failed} test(s) failed — sending to HealBot AI for diagnosis...\n`);
  process.exit(1);
} else {
  console.log("✅ All tests passed!\n");
}
