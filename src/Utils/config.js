export default function Configuration() {
    const configUrl = `${process.env.PUBLIC_URL}/ui.config.json`;
    var configuration = readConfigFile(configUrl);
    return configuration;
}

function readConfigFile(file) {
    var parsedFile;
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status === 0) {
                parsedFile = JSON.parse(rawFile.responseText);
            }
        }
    }
    rawFile.send(null);
    return parsedFile;
}
