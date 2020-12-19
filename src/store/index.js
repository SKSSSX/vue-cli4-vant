import Vue from "vue";
import Vuex from "vuex";
import getters from "./getters";
import base from "./modules/base";
import VuexPersistence from "vuex-persist";

Vue.use(Vuex);

// 持久化配置
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
});

const store = new Vuex.Store({
  modules: {
    base,
  },
  getters,
  plugins: [vuexLocal.plugin],
});

export default store;
