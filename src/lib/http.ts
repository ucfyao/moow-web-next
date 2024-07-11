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
// 初始化axios
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
     
      // const token = user?.player?.token ?? "";
      const headerConfig: any = {
        // Authorization: `${token}`,
        // LANG: languageMap[language] ?? "en-US",
        // TZ: momenttz.tz.guess(),
      };

      Object.assign(config.headers, headerConfig);
    }

    if (config.timeout === undefined || config.timeout === 0) {
      return config;
    }

    // 响应超时处理
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
    console.log(error); // for debug
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response: any) => {
    const res = response.data
		if (res.status === 0) {
			return res
		}

		// res.status !== 0, 返回错误码的相关拦截处理
		if (res.status === 40001 || res.status === 40002 || res.status === 40003) {
			// 40001:非法的token; 40002:Token 过期了; 40003:其他客户端登录了;

      // auth.logout()
			// store.dispatch('SET_ISAUTHENTICATED', false)
			// store.dispatch('SET_USER', null).then(() => {
			// 	let lc = parent.location || location
			// 	lc.href = '/login'
			// })
      // add flash message

		} else if (res.status === 40005) {
			// 账号尚未激活, 强制到激活邮件发送页面
			location.href = '/activate'
			// router.push({name: 'activate'})
		} else if (res.status === 40008) {
			// 账号不是VIP, 强制到续费页面
			location.href = '/purchase'
			// router.push({name: 'purchase'})
		}
		return Promise.reject(res)
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

export default service;
