export default function unloadScript(url) {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
        //console.log(scripts[i]);
        if (scripts[i].getAttribute('src') === url) {
            console.log("removing ", scripts[i]);
            document.body.removeChild(scripts[i]);
        }
    }
}