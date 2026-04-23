export function verifyEngineType(vibrationData: number[]) {
  // Simple FFT (Fast Fourier Transform) logic
  const averageVibration = vibrationData.reduce((a, b) => a + b) / vibrationData.length;
  
  if (averageVibration > 0.05) {
    return "ICE_DETECTED"; // Petrol/Diesel
  }
  return "ELECTRIC_OR_BIO_DETECTED"; // Electric or Human
}

export function calculateCarbonPoints(type: string, distance: number) {
  const rates = {
    'PERSONAL_EV': 0.15, // Points per km
    'ACTIVE_HUMAN': 0.50, // Highest points because 0 emission + health
    'BUS_TRANSIT': 0.30, 
    'PETROL': 0.00 // No points, just basic HABA mining
  };
  return distance * (rates[type] || 0);
}
