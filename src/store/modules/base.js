/**
 * 基本信息
 */
const state = {
  baseInfo: {},
};

const mutations = {
  asyncBaseInfo: (state, payload) => {
    state.baseInfo = { ...state.baseInfo, ...payload };
  },
};

const actions = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
