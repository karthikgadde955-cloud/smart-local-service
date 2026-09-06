/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Estimate Travel ETA in minutes based on distance and average city speed
 */
export function calculateEtaMinutes(distanceKm: number, responseTimeMinutes: number = 10): number {
  const avgCitySpeedKmH = 25; // Average speed in traffic in km/h
  const travelTimeMinutes = (distanceKm / avgCitySpeedKmH) * 60;
  const totalEta = Math.round(travelTimeMinutes + responseTimeMinutes);
  return Math.max(5, totalEta); // Minimum 5 mins
}
