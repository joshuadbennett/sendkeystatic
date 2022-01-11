import React, { Component } from 'react';
import Header from '../Header/Header.jsx';
import NavBar from '../NavBar/NavBar.jsx';
import Footer from '../Footer/Footer.jsx';

export default class Layout extends Component {
    render() {
        return (
            <section>
                <Header />
                <NavBar />              
                <Footer />
             </section>
        );
    }
}

