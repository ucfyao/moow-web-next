import axios from "axios";
import JsonBigint from "json-bigint";

const JSONBIG = JsonBigint({
  storeAsString: true,
});

const languageMap = {
  "en-US": "en-US",
  "zh-CN": "zh-Hans",
  "ko-KR": "ko-KR",
};

const language = "en-US";

const baseURL = process.env.NEXT_PUBLIC_BASE_API_URL ?? "/api";

let config = {
	// baseURL: process.env.baseURL || process.env.apiUrl || ""
	baseURL: baseURL,
	// `xsrfCookieName` is the name of the cookie to use as a value for xsrf token
	xsrfCookieName: 'csrfToken',
	// `xsrfHeaderName` is the name of the http header that carries the xsrf token value
	xsrfHeaderName: 'x-csrf-token',
	timeout: 60 * 1000, // Timeout
	// withCredentials: true, // Check cross-site Access-Control
};
// Initialize axios instance
const service = axios.create({
  ...config,
  transformResponse: [
    function transform(data: any) {
      // Replacing the default transformResponse in axios because this uses JSON.parse and causes problems
      // with precision of big numbers.
      // https://github.com/axios/axios/blob/6642ca9aa1efae47b1a9d3ce3adc98416318661c/lib/defaults.js#L57
      /* eslint no-param-reassign:0 */
      if (typeof data === "string") {
        try {
          data = JSONBIG.parse(data);
        } catch (e) {
          /* Ignore */
        }
      }
      return data;
    },
  ],
});

service.interceptors.request.use(
  (config: any) => {
    const uri = config.url || "";

    if (config.headers && config.method) {
      const token =
        typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      const headerConfig: any = {};
      if (token) {
        headerConfig.Authorization = token;
      }
      Object.assign(config.headers, headerConfig);
    }

    if (config.timeout === undefined || config.timeout === 0) {
      return config;
    }

    // Request timeout handling
    const source = axios.CancelToken.source();
    setTimeout(() => {
      source.cancel(
        `Cancelled request. Took longer than ${config.timeout}ms to get complete response.`,
      );
    }, config.timeout);
    // If caller configures cancelToken, preserve cancelToken behaviour.
    if (config.cancelToken) {
      config.cancelToken.promise.then((cancel: { message: any }) => {
        source.cancel(cancel.message);
      });
    }

    return { ...config, cancelToken: source.token };
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response: any) => {
    const res = response.data
		if (res.status === 0) {
			return res
		}

		// Non-zero status — handle error codes
		if (res.status === 40001 || res.status === 40002 || res.status === 40003) {
			// 40001: invalid token; 40002: token expired; 40003: logged in from another client

      // TODO: implement token expiry handling — logout and redirect to /login

		} else if (res.status === 40005) {
			// Account not activated — redirect to activation page
			location.href = '/activate'
		} else if (res.status === 40008) {
			// Account not VIP — redirect to purchase page
			location.href = '/purchase'
		}
		return Promise.reject(res)
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

export default service;
