import axios from 'axios';

export default function SetAuthorizationToken(token) {
    if (token) {
      axios.defaults.headers.common['Token'] = `${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Token'];
      //localStorage.removeItem('token');
  }
}
