import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import VueToast from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

createApp(App).mount("#app");

// Use the VueToast plugin
App.use(VueToast, {
  // Optional options
  position: "top-right",
});

App.mount("#app");
