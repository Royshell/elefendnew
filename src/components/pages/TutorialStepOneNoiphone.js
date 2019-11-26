import React, { Component, Fragment } from 'react';
import ValidatingWidget from '../page-components/ValidatingWidget';
import { withRouter } from 'react-router';
import {checkCallResult, getLastCallStatus, verifyBlockedNumber, sendSuccessSMS} from "../../services/ElefendAPI";

class TutorialStepOneNoiphone extends Component {
  state = {
    isValditaionFailed: false,
    isValidating: false,
  };
  onConfirmUnknownNumbersAreBlocked = () => {
    this.props.history.push('/tutorial-step-two-noiphone');
  };
  onConfirmDownload = () => {
    /*API Call goes here */
    this.setState({ isValidating: true });
    verifyBlockedNumber().then(()=>{
      this.setState({ isValidating: true});
      const theClass = this; // no need when using arrow functions RS
      function checkCallStatusOnTimeout() { //old syntax. please use arrow functions RS
        checkCallResult().then(()=>{
          var lastCallStatus =  getLastCallStatus() // please use 'const' instead of var and add ; RS
          if ("HUNGUP" === lastCallStatus) {
            theClass.props.history.push('/tutorial-step-two-noiphone');
          } else if ("ANSWERED" === lastCallStatus || "INIT" !== lastCallStatus)
          {
            theClass.setState({isValditaionFailed: true});
            theClass.setState({isValidating: false}); 
          } else {
            setTimeout(checkCallStatusOnTimeout,10000);
          }
        })
      }

      setTimeout(checkCallStatusOnTimeout,10000);
    });
  };
  componentDidMount = () => {
    sendSuccessSMS('Link the "Google Play" button to the link --> https://play.google.com/store/apps/details?id=com.elefend.callblocker');
  };
  render() {
    return (
      <div className="widget">
        <p className="widget__main-p">Step 1 of 3</p>
        <div className="widget__title widget__mobile-title"> { !this.state.isValditaionFailed ? 'Download the Elefend app' : 'Silence unknown callers' }</div>
        { !this.state.isValditaionFailed && <Fragment>
          <p className="widget__medium-p">This app will automatically silence unknown calls.</p>
          <img className="widget__natural-img" src="assets/img/android-app.png"/> 
          <p className="widget__medium-p">Go to the Google Play Store on your phone, search for the Elefend { <br className="not-on-mobile"/> }  Unknown Calls Blocker app, and install it!</p>
          <div className="widget__input-wrapper">
            <button onClick={ this.onConfirmDownload }>I downloaded and activated the app</button>
          </div>
        </Fragment>}
        { this.state.isValditaionFailed &&  <Fragment>
          <img src={'assets/img/error.png'} /> 
          <p className="widget__main-p noto-font">Unknown callers are not properly blocked on your phone</p>
          <p className="widget__small-p">If you’re sure that unknown callers are blocked on your phone, confirm below</p>
          <a className="widget--a" onClick={ this.onConfirmUnknownNumbersAreBlocked }>I confirm that unknown numbers are blocked on my phone</a>
          <div className="widget__input-wrapper">
            <button onClick={ this.onConfirmDownload }>Try again</button>
          </div> 
          <a className="widget--a" href="mailto:info@elefend.com">Contact our customer support team for help</a>
        </Fragment> }
        { this.state.isValidating && <ValidatingWidget /> }
      </div>
    );
  }
}

export default withRouter(TutorialStepOneNoiphone);
