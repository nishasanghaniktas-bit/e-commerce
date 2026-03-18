export const toSearchString = (val) => {
  if (typeof val === "string" || typeof val === "number") {
    return String(val).toLowerCase();
  }
  return "";
};

export const categoryToString = (category) => {
  if (typeof category === "string") return category;
  if (category && typeof category.name === "string") return category.name;
  return "";
};

export const buildSearchHaystack = (product = {}) => {
  const parts = [];
  parts.push(toSearchString(product.name));
  parts.push(toSearchString(product.brand));
  parts.push(toSearchString(categoryToString(product.category)));
  parts.push(toSearchString(categoryToString(product.subcategory)));
  parts.push(toSearchString(categoryToString(product.peta_subcategory)));
  parts.push(toSearchString(product.description));
  if (Array.isArray(product.tags)) {
    parts.push(...product.tags.map(toSearchString));
  }
  return parts.filter(Boolean).join(" ");
};
