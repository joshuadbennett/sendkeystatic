export default function loadScript(url, cb) {
    var script = document.createElement("script");
    script.src = process.env.PUBLIC_URL + url;
    script.async = true;
    document.body.appendChild(script);
}
