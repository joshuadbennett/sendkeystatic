import moment from 'moment';

export default class Formatting {
    formatDecimal(number, places) {
        let multiplier = Math.pow(10, places || 0);
        return Math.round(number * multiplier) / multiplier;
    }

    formatDateLocal(utc, format) {
        utc = moment.utc(utc);
        format = format || "YYYY-MM-DD HH:mm:ss";
        return moment(utc).local().format(format);
    }
    /*
    formatMoney(number, places, decimalDelim, thousandsDelim) {
        var n = number,
            c = isNaN(places = Math.abs(places)) ? 2 : places,
            d = decimalDelim === undefined ? "." : decimalDelim,
            t = thousandsDelim === undefined ? "," : thousandsDelim,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };
    */
}