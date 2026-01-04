const KEY = "devolo_theme";

export function getTheme(): "dark" | "light" {
  const v = localStorage.getItem(KEY);
  return (v === "light" || v === "dark") ? v : "dark";
}

export function setTheme(t: "dark" | "light") {
  localStorage.setItem(KEY, t);
  document.documentElement.classList.toggle("dark", t === "dark");
}

export function initTheme() {
  setTheme(getTheme());
}
