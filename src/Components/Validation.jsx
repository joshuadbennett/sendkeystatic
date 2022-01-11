export default class Validation {

    // until we land on a library or component set that is suitable for our purposes, we can use this as a barebones start
    // it's not ideal, but it's workable

    // use:
    // 1) get a list of errors by testing validators and returning appropriate messages
    // 2) set control css classes with css functions
    // 3) present error messages under or near control

    // validators
    lengthValid(value) {
        return (
            value != null &&
            value.length != null
        );
    }

    stringLengthMinValid(value, min) {
        return (
            this.lengthValid(value) &&
            value.length >= min
        );
    }

    stringLengthMaxValid(value, max) {
        return (
            this.lengthValid(value) &&
            value.length <= max
        );
    }

    arrayLengthMinValid(value, min) {
        return (
            this.lengthValid(value) &&
            value.length >= min
        );
    }

    arrayLengthMaxValid(value, max) {
        return (
            this.lengthValid(value) &&
            value.length <= max
        );
    }

    numberMinValid(value, min) {
        return (
            !isNaN(value) &&
            value >= min
        );
    }

    numberMaxValid(value, max) {
        return (
            !isNaN(value) &&
            value <= max
        );
    }

    stringEqualToValid(value, equalToString) {
        return (
            this.lengthValid(value) &&
            equalToString != null &&
            value === equalToString
        );
    }

    uriValid(value) {
        // see https://www.npmjs.com/package/valid-url
        let validUrl = require('valid-url');
        if (validUrl.isWebUri(value)) {
            return true;
        }
        return false;
    }

    patternValid(value, pattern, flags) {
        return (
            this.lengthValid(value) &&
            pattern != null &&
            flags != null &&
            new RegExp(pattern, flags).test(value)
        );
    }

    decimalValid = (value, precision, scale) => {
        return this.patternValid(value, this.getDecimalRegex(precision, scale), "");
    }

    uniqueValid(value, arr, prop) {
        if (value == null || arr == null || prop == null) return false;
        let unique = true;
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (item[prop] === value) {
                unique = false;
                break;
            }
        }
        return unique;
    }

    mutuallyExclusiveBooleansValid(...args) {
        let sumOfExclusives = 0;
        args.forEach(bool => sumOfExclusives = sumOfExclusives + bool);
        return sumOfExclusives < 2;
    }

    // NPI validation algorithm from https://github.com/Alfredo-Delgado/npi/blob/master/js/npi.js
    getNpiCheckDigit(id_portion) {
        var checksum80840 = 24; // 80 indicates health applications and 840 indicates the United States
        var checksum = checksum80840;
        var digits = id_portion.toString().split("");
        var digit_position;
        var digit;
        var checksum_roundup;

        if (digits.length !== 9)
            // eslint-disable-next-line
            throw "expected 9 digits in id_portion, got " + digits.length;

        for (digit_position in digits) {
            digit = parseInt(digits[digit_position], 10);

            if (digit_position % 2 === 0)
                (digit * 2).toString().split("").forEach(
                    // eslint-disable-next-line
                    function (element, index, array) {
                        checksum += parseInt(element, 10);
                    }
                );
            else
                checksum += digit;
        }

        checksum_roundup = parseInt(checksum / 10, 10);
        if (checksum % 10 > 0) checksum_roundup += 1;
        checksum_roundup *= 10;

        return checksum_roundup - checksum;
    }
    
    npiValid(npi) {
        var npiString = npi.toString();
        if (npiString.length === 10) {
            return this.getNpiCheckDigit(parseInt(npi / 10, 10)) === (npi % 10);
        } else if (npiString.length === 15 && npiString.substring(0, 5) === "80840") {
            var shortNpi = parseInt(npiString.substring(5), 10);
            return this.getNpiCheckDigit(parseInt(shortNpi / 10, 10)) === (shortNpi % 10);
        }
        return false;
    }

    // tools
    getDecimalRegex = (precision, scale) => {
        let sb = "";
        for (var i = 0; i < scale; ++i) {
            sb += "^([0-9]{";
            if (i === 0) sb += "0,";
            sb += "" + precision - scale + i + "";
            if (scale - i === 1) {
                sb += "}([.][0-9]{1";
            } else {
                sb += "}([.][0-9]{1,";
                sb += "" + scale - i + "";
            }
            sb += "})?)$|";
        }
        sb += "^[0-9]{";
        sb += "" + precision + "";
        sb += "}$";
        return sb;
    }

    // messages
    stringLengthMinInvalidMessage(minLength) {
        if (minLength == null) return "invalid minLength";
        return "Must be at least " + minLength.toString() + " character" + (minLength === 1 ? "" : "s") + ".";
    }

    stringLengthMaxInvalidMessage(maxLength) {
        if (maxLength == null) return "invalid maxLength";
        return "Must be no more than " + maxLength.toString() + " character" + (maxLength === 1 ? "" : "s") + ".";
    }

    arrayLengthMinInvalidMessage(minLength) {
        if (minLength == null) return "invalid minLength";
        return "Must be at least " + minLength.toString() + " item" + (minLength === 1 ? "" : "s") + ".";
    }

    arrayLengthMaxInvalidMessage(maxLength) {
        if (maxLength == null) return "invalid maxLength";
        return "Must be no more than " + maxLength.toString() + " item" + (maxLength === 1 ? "" : "s") + ".";
    }

    numberMinInvalidMessage(minLength) {
        if (minLength == null) return "invalid minLength";
        return "Must be at least " + minLength.toString() + ".";
    }

    numberMaxInvalidMessage(maxLength) {
        if (maxLength == null) return "invalid maxLength";
        return "Must be no more than " + maxLength.toString() + ".";
    }

    uriInvalidMessage(value) {
        return "Must be a well-formed uri.";
    }

    decimalInvalidMessage(precision, scale) {
        return "Must be a decimal(" + precision + ", " + scale + ").";
    }

    uniqueInvalidMessage(value) {
        if (value == null) return "invalid unique value";
        return "Must be unique and '" + value.toString() + "' is already used.";
    }

    npiInvalidMessage(value) {
        return "Please enter a valid NPI #.";
    }

    mutuallyExclusiveBooleansInvalidMessage(value) {
        if (value == null) return "invalid exclusive value";
        return value + " are mutually exclusive. A user cannot have more than one.";
    }

    // css
    getClass(errors) {
        if (errors == null || errors.length == null) return ""; // hasn't been validated yet
        return (errors.length < 1 ? " valid" : " invalid"); // has been validated and this is the result
    }
}