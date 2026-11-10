const STORAGE_KEY = "safeplate.restaurants";

const form = document.getElementById("restaurant-form");
const listEl = document.getElementById("list");
const countEl = document.getElementById("count");
const searchEl = document.getElementById("search");
const filterEl = document.getElementById("filter");
const dedicatedOnlyEl = document.getElementById("dedicated-only");

let restaurants = load();

// ---------- storage ----------
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Could not read saved data:", err);
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
  } catch (err) {
    console.error("Could not save data:", err);
  }
}

// ---------- actions ----------
function addRestaurant(event) {
  event.preventDefault();
  const restaurant = {
    id: Date.now(),
    name: document.getElementById("name").value.trim(),
    city: document.getElementById("city").value.trim(),
    rating: Number(document.getElementById("rating").value),
    date: document.getElementById("date").value,
    dedicated: document.getElementById("dedicated").checked,
    notes: document.getElementById("notes").value.trim(),
  };
  if (!restaurant.name) return;
  restaurants.unshift(restaurant);
  save();
  form.reset();
  render();
}

function deleteRestaurant(id) {
  restaurants = restaurants.filter((r) => r.id !== id);
  save();
  render();
}

// ---------- filtering ----------
function getVisible() {
  const query = searchEl.value.trim().toLowerCase();
  const minRating = Number(filterEl.value);
  const dedicatedOnly = dedicatedOnlyEl.checked;

  return restaurants.filter((r) => {
    const matchesText =
      r.name.toLowerCase().includes(query) || r.city.toLowerCase().includes(query);
    return matchesText && r.rating >= minRating && (!dedicatedOnly || r.dedicated);
  });
}

// ---------- rendering ----------
function makeEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text; // textContent avoids HTML injection
  return el;
}

function renderCard(r) {
  const li = makeEl("li", "card");
  li.dataset.rating = r.rating;

  const top = makeEl("div", "card-top");
  top.append(makeEl("h3", "", r.name), makeEl("span", "score", r.rating + " / 5"));

  const details = [];
  if (r.city) details.push(r.city);
  if (r.date) details.push("Visited " + r.date);
  details.push(r.dedicated ? "Dedicated GF kitchen" : "Shared kitchen");

  li.append(top, makeEl("p", "meta", details.join(", ")));
  if (r.notes) li.append(makeEl("p", "notes", r.notes));

  const del = makeEl("button", "delete", "Delete");
  del.type = "button";
  del.addEventListener("click", () => deleteRestaurant(r.id));
  li.append(del);

  return li;
}

function render() {
  const visible = getVisible();
  listEl.replaceChildren();

  if (restaurants.length === 0) {
    listEl.append(makeEl("li", "empty", "No restaurants yet. Add your first one with the form."));
    countEl.textContent = "";
    return;
  }
  if (visible.length === 0) {
    listEl.append(makeEl("li", "empty", "No matches. Try clearing the search or filters."));
  }
  visible.forEach((r) => listEl.append(renderCard(r)));
  countEl.textContent = `Showing ${visible.length} of ${restaurants.length}`;
}

// ---------- wiring ----------
form.addEventListener("submit", addRestaurant);
searchEl.addEventListener("input", render);
filterEl.addEventListener("change", render);
dedicatedOnlyEl.addEventListener("change", render);

document.getElementById("date").valueAsDate = new Date();
render();