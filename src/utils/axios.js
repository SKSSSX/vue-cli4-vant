import axios from "axios";
import vm from "../main";
import { baseApi } from "../config";
import { Dialog } from "vant";

/* 全局默认配置 */
var http = axios.create({
  baseURL: baseApi,
  timeout: 60000,
});
/* 请求拦截器 */
http.interceptors.request.use(
  config => {
    config.headers["Content-Type"] = "application/json;charset=UTF-8";
    config.headers.timestamp = Math.floor(new Date().getTime() / 1000);
    config.headers.token = sessionStorage.getItem("token") || "";
    // 接口没返回时显示loading
    if (config.loading === true) {
      vm.$loading.hide();
      vm.$loading.show();
    }
    return config;
  },
  error => {
    vm.$loading.hide();
    return Promise.reject(error);
  }
);
/* 响应拦截器 */
http.interceptors.response.use(
  res => {
    vm.$loading.hide();
    return res;
  },
  error => {
    vm.$loading.hide();
    // 统一请求错误处理

    let msg =
      error.response.data &&
      Object.prototype.toString.call(error.response.data) ===
        "[object Object]" &&
      error.response.data.msg
        ? error.response.data.msg
        : "";
    switch (Number(error.response.status)) {
      case 403:
        Dialog.alert({
          title: "错误",
          message: msg || "访问被禁止，请联系管理员",
        });
        break;

      case 404:
        Dialog.alert({
          title: "错误",
          message: msg || "资源不存在，请联系管理员",
        });
        break;

      case 500:
        Dialog.alert({
          title: "错误",
          message: msg || "网络异常，请稍后重试",
        });
        break;

      default:
        break;
    }
    return Promise.reject(error);
  }
);

function get(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url)
      .then(
        response => {
          resolve(response.data);
        },
        err => {
          reject(err);
        }
      )
      .catch(error => {
        reject(error);
      });
  });
}

function post(url, data, loading) {
  return new Promise((resolve, reject) => {
    http
      .post(url, data, { loading: loading })
      .then(
        response => {
          resolve(response.data);
        },
        err => {
          reject(err);
        }
      )
      .catch(error => {
        reject(error);
      });
  });
}

export { http, get, post };
