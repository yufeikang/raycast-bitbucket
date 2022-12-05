// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require("moment");

export function formatDate(date, format) {
  if (!date) {
    return "";
  }
  if (!format) {
    format = "YYYY-MM-DD HH:mm:ss";
  }
  return moment(date).format(format);
}
