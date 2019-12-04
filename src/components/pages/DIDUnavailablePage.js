import React, { Component, Fragment } from 'react';
import Cleave from 'cleave.js/react';
import { withRouter } from 'react-router';

class DIDUnavailablePage extends Component {
  state = {
    emailAddress: '',
    ismailSent: false
  };
  onEmailAddressChange = (e) => {
    const emailAddress = e.target.value;
    this.setState({ emailAddress });
  };
  getEmailAddress = () => {
    //API TO EMAIL ADDRESS GOES HERE - seems like there is no API function for that

    //If email sent
    this.setState({ ismailSent: true });
  };
  referToPhoneFormPage = () => {
    this.props.history.push('/phone-form');
  };
  render() {
    return (
      <Fragment>
        <div className="widget flexable-widget">
          <div className="widget--logo--wrapper">
            <img src="assets/img/nosupported.png"></img>        
          </div>
          <div className="widget__title widget__mobile-title  ">Unfortunately there are no available  { <br className="not-on-mobile"/> } slots to try our Beta</div>
        </div>
      <footer className="footer">
        <div className="widget flexable-widget">
          <p className="widget__main-p">Be the first to know!</p>
          <p className="widget__medium-p felixable-p">Please leave us your email address and we will reach out to you as we are ready to onboard new users.</p>
           { !this.state.ismailSent && <div className="widget__input-container">
            <Cleave
             placeholder="example@mail.com" 
             onChange={ this.onEmailAddressChange }
            />
            <button className="footer__send-button" onClick={ this.getEmailAddress }><img src="assets/img/send.png" /></button>
          </div> }
          { this.state.ismailSent && <div className="widget__sent-confirmation">
            Thanks! We'll be in touch soon.
          </div> }
        </div>
      </footer>
     </Fragment>
    );
  }
}

export default withRouter(DIDUnavailablePage);
