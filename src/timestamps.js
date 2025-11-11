export function nowISO() {
  return new Date().toISOString();
}

export function createTimestamps() {
  return {
    createdAt: nowISO(),
    updatedAt: nowISO()
  };
}

export function updateTimestamp() {
  return { updatedAt: nowISO() };
}

export function parseISO(isoString) {
  if (!isoString) return null;
  try {
    return new Date(isoString);
  } catch {
    return null;
  }
}

export default { nowISO, createTimestamps, updateTimestamp, parseISO };
