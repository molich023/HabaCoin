interface GeoPosition {
  lat: number;
  lng: number;
  timestamp: number;
}

export class KineticMiner {
  private lastPosition: GeoPosition | null = null;

  // High-precision distance calculation (Haversine Formula)
  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const EARTH_RADIUS_METERS = 6371e3; 
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_METERS * c; 
  }

  /**
   * Evaluates coordinate updates against physical constraints
   * @returns verified distance in meters, or 0 if anomalous movement is caught.
   */
  public registerMovement(currentPos: GeoPosition): number {
    if (!this.lastPosition) {
      this.lastPosition = currentPos;
      return 0;
    }

    const durationSeconds = (currentPos.timestamp - this.lastPosition.timestamp) / 1000;
    if (durationSeconds <= 0) return 0; // Blocks divide-by-zero or timestamp manipulation

    const deltaDistanceMeters = this.calculateDistance(
      this.lastPosition.lat, this.lastPosition.lng,
      currentPos.lat, currentPos.lng
    );

    const calculatedVelocityKmh = (deltaDistanceMeters / durationSeconds) * 3.6;

    // HARDENING BOUNDARY CHECK: Flag impossible speed spikes (e.g., matching aircraft speeds or instant teleportation)
    const MAXIMUM_HUMAN_TRANSIT_VELOCITY_KMH = 130.0; // Captures driving/train travel, flags impossible anomalies
    if (calculatedVelocityKmh > MAXIMUM_HUMAN_TRANSIT_VELOCITY_KMH) {
      console.error(`[!] Telemetry Teleportation Caught: ${calculatedVelocityKmh.toFixed(2)} km/h is physically impossible.`);
      return 0; 
    }

    this.lastPosition = currentPos;
    return deltaDistanceMeters;
  }
}
