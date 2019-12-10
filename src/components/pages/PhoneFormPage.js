import React, { Component } from 'react';
import Cleave from 'cleave.js/react';
import ValidatingWidget from '../page-components/ValidatingWidget';

import {
    carrierOk,
    checkCarrier,
    checkLogin,
    checkRegistered,
    login,
    registerPhoneNumber
} from '../../services/ElefendAPI'
import { withRouter } from 'react-router';

class PhoneFormPage extends Component {
  state = {
    phoneNumber: '',
    login_status: 'Trying',
    isValditaing: false
  };

  onLoad = async() => {
    await login();
    checkLogin() ? this.setState({ login_status: 'OK' }) : this.setState({ login_status:'Failed' });
  };

  onPhoneNumberInputChange = (e) => {
    const phoneNumber = e.target.value;
    this.setState(() => ({ phoneNumber }));
  };

  getPhoneNumber = async() => {
    this.setState({ isValditaing: true });

    try {
      const phoneNumber = this.state.phoneNumber;
      
      await checkCarrier(phoneNumber); 
      this.setState({ isValditaing: false });

      if(carrierOk()) {
        await registerPhoneNumber(phoneNumber);

        if(checkRegistered() === 'registered') {
          localStorage.setItem('phonenumber', phoneNumber);
          this.props.history.push('/pin');
        } else {
          this.props.history.push('/did-unavailable');
        }
      } else {
        this.props.history.push('/unavailable');
      }
    } catch (err) {
      this.setState({ isValditaing: false });
      console.error(err);
    }  
  };

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.getPhoneNumber();
    }
  };

  componentDidMount = async() => {
    this.onLoad();
    const phoneInput = document.querySelector('input');

    if(phoneInput) {
      phoneInput.focus();
    }
  };
  
  render() {
      if(this.state.login_status === 'OK') { 
        return (
          <div className="widget">
            <p className="widget__main-p"> Before we get started </p>
            <div className="widget__title widget__mobile-title">Verify your phone number</div>
            <p className="widget__medium-p">We need to verify that Elefend works with your carrier</p>
            <div className="widget__input-wrapper widget__mobile-margin">
              <div className="widget__input-container">
                <div className="widget__flag">
                  <img src="assets/img/usa.png" />
                  <span>+1</span>
                </div>
                <Cleave
                  tabIndex="0"
                  placeholder="631-204-1535"
                  onChange={ this.onPhoneNumberInputChange }
                  onKeyDown={ this.handleKeyDown }
                />
              </div>
            </div>   
            <div className="widget__input-wrapper widget__mobile-margin">
              <button onClick={ this.getPhoneNumber } >Verify</button>
            </div> 
            <p className="widget__small-p">By clicking VERIFY, I understand and agree to Elefend's <a className="widget--a" href="/assets/html/tsandcs.html" target="_blank"> terms and conditions </a> and <a className="widget--a" href="/assets/html/tos.html" target="_blank"> privacy policy </a></p>
            { this.state.isValditaing && <ValidatingWidget />}
          </div>
          
        );
      }

      if (this.state.login_status === 'Trying') {
        return (
          <ValidatingWidget message={ 'Loading...' }/>
        );
      } else { 
          return ( 
          <div className="widget">
            <div className="widget__title">Connection to Server Failed</div>
            <div className="widget--logo--wrapper">
              <img className="widget__natural-img" src="assets/img/error.png"></img>        
            </div>
            <div className="widget__input-wrapper">
              <button onClick={ this.onLoad }>Try again</button>
            </div>
          </div>
        );
      }
  }
}

export default withRouter(PhoneFormPage);
