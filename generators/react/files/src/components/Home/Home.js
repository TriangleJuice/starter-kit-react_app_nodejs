import React from 'react';
import './Home.scss';

const home = prop => (
    <div>
		  <h2 className="h4 u-margin-top">Handy resources</h2>
      <ul className="a-list">
        <li>ACPaaS UI homepage: <a href="https://acpaas-ui.digipolis.be/home" target="_blank" rel="noopener noreferrer" className="has-icon-right">https://acpaas-ui.digipolis.be<i className="fa fa-external-link"></i></a></li>
        <li>ACPaaS UI components: <a href="https://digipolisantwerp.github.io/acpaas-ui_react/" target="_blank" rel="noopener noreferrer" className="has-icon-right">https://digipolisantwerp.github.io/acpaas-ui_react/<i className="fa fa-external-link"></i></a></li>
        <li>Core Branding: <a href="https://a-ui.github.io/core_branding_scss/" target="_blank" rel="noopener noreferrer" className="has-icon-right">https://a-ui.github.io/core_branding_scss/<i className="fa fa-external-link"></i></a></li>
      </ul>
    </div>
);

export default home;
