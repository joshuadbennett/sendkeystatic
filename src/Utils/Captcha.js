export default function generateCaptcha(x) {
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var special = "-=";
    var numbers = "0123456789";
    var text = "";
    //Generate random characters
    for (var i = 0; i < x - 3; i++) {
        text += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    //next letter should be special character
    text += special.charAt(Math.floor(Math.random() * special.length));

    //next letter should be number
    text += numbers.charAt(Math.floor(Math.random() * numbers.length));

    //end letter should be alphabet
    text += letters.charAt(Math.floor(Math.random() * letters.length));

    return text;
}
