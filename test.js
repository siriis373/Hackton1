// Function to calculate average
function calculateAverage(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  // BUG: Dividing by a fixed number instead of the array length
  return sum / 10; 
}

const data = [10, 20, 30, 40, 50];
console.log(calculateAverage(data)); // Expected 30, Outputs 15
