export function minutesToHM(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${String(hrs).padStart(2, "0")} Hours and ${String(mins).padStart(
    2,
    "0"
  )} Minuts`;
}
