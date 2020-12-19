import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "./assets/css/reset.css";
import "./assets/css/common.css";
import "./components/icon/index";

import Dialog from "./components/dialog";
import Loading from "./components/loading";
import toast from "./components/toast";

import vantComponents from "@/utils/vant.config";
import VueBus from "@/utils/Bus";
import filters from "./filters/index";
import utils from "./utils/tools";
import { get, post } from "./utils/axios";

Vue.use(vantComponents).use(VueBus);
Vue.use(utils);

Vue.prototype.$dialog = Dialog;
Vue.prototype.$loading = Loading;
Vue.prototype.$toast = toast;
Vue.prototype.$http = { get, post };

// 注入全局过滤器
Object.keys(filters).forEach(item => {
  Vue.filter(item, filters[item]);
});

Vue.config.productionTip = false;

export default new Vue({
  el: "#app",
  store,
  router,
  render: h => h(App),
});
