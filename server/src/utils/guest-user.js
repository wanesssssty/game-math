function guestEmailFromDisplayName(displayName) {
  const base = String(displayName || "player")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const slug = base.length > 0 ? base : "player";
  return `guest.${slug}@mathpaws.local`;
}

module.exports = { guestEmailFromDisplayName };
