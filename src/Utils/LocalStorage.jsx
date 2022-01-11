export default class LocalStorage {
    constructor(props) {
        this.props = props;
    }

    get = (name) => {
        let obj = localStorage.getItem(this.props.location.pathname + "." + name);
        if (obj == null) return obj;
        try { return JSON.parse(obj); } catch (e) { console.log(e); return obj; }
    }

    set = (name, value) => {
        if (value != null) {
            localStorage.setItem(this.props.location.pathname + "." + name, JSON.stringify(value));
        } else {
            localStorage.removeItem(this.props.location.pathname + "." + name);
        }
    }
}
