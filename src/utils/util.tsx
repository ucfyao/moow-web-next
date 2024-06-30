import { format } from 'date-fns';

interface Util {
  title: (title?: string) => void;
  formatDate: (date: string | Date | number, fmt?: string) => string;
  formatNumber: (value: number, mantissa?: number, unit?: string) => string;
  readableNumber: (value: number) => string;
  formatCurrency: (value: number) => string;
  desensitization: (...args: string[]) => string[];
  isMobile: () => boolean;
}

const util: Util = {
  title(title: string = 'XiaoBao'): void {
    document.title = title;
  },

  formatDate(date: string | Date | number, fmt: string = "yyyy-MM-dd HH:mm:ss"): string {
    if (!date) return '';
    return format(new Date(date), fmt);
  },

  formatNumber(value: number, mantissa: number = 6, unit: string = ''): string {
    if (isNaN(value)) return '-';
    return Number(value).toFixed(mantissa) + unit;
  },

  readableNumber(value: number): string {
    if (isNaN(value)) return value.toString() || '-';

    const n = Number(value);
    if (n > 10000 * 10000 * 10) {
      return (n / (10000 * 10000)).toFixed(2) + '亿';
    }
    if (n > 10000 * 10) {
      return (n / 10000).toFixed(2) + '万';
    }

    return n.toFixed(2);
  },

  formatCurrency(value: number): string {
    if (isNaN(value)) return '-';
    return value.toString();
  },

  desensitization(...args: string[]): string[] {
    return args.map(data => {
      if (/(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(data) || 
          /^(13[0-9]|16[0-9]|19[0-9]|147|15[0-9]|17[6-8]|18[0-9])\d{8}|17[0-9]\d{8}$/.test(data) || 
          /(^(?:(?![IOZSV])[\dA-Z]){2}\d{6}(?:(?![IOZSV])[\dA-Z]){10}$)|(^\d{15}$)/.test(data)) {
        return data.substr(0, 3) + "****" + data.substr(-4);
      } else if (/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(data)) {
        return data.substr(0, 2) + "****" + data.substr(data.indexOf('@'));
      } else if (/^\d{16}|\d{19}$/.test(data)) {
        return "****" + data.substr(-4);
      } else if (data.indexOf('公司') > -1) {
        return data.substr(0, 2) + "****" + data.substr(-4);
      } else {
        return data;
      }
    });
  },

  isMobile(): boolean {
    const sUserAgent = navigator.userAgent.toLowerCase();
    return /ipad|iphone os|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(sUserAgent);
  }
};

export default util;
