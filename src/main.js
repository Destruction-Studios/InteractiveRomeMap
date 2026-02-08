import "./css/main.css";
import "./css/map.css";
import "./css/misc.css";
import "./css/sidebar.css";
import "./css/theme.css";
import "./css/works-cited.css";

import { mapReady } from "./js/map.js";
import { initSidebar } from "./js/sidebar.js";
import "./js/misc.js";

console.log("Awaiting map...");
await mapReady;
console.log("Map ready!");
await initSidebar();
console.log("Sidebar loaded");
