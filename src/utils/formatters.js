export function formatScanTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const month = date.toLocaleString("en-US", { month: "short" });
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  hours %= 12;
  if (hours === 0) hours = 12;

  return `${month} ${day}, ${year} - ${String(hours).padStart(2, "0")}:${minutes} ${suffix}`;
}

export function truncateMiddle(value, maxLength = 34) {
  if (!value || value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}
