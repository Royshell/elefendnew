import React, { Component, Fragment } from 'react';
import ValidatingWidget from '../page-components/ValidatingWidget';
import { withRouter } from 'react-router';
import {
  checkCallResult,
  getLastCallStatus,
  sendElefendNumberAsSMS,
  sendForwardingNumberAsSMS,
  verifyElefendContact
} from "../../services/ElefendAPI";

class TutorialStepTwoIphone extends Component {
  state = {
    currentStage: 1,
    isValidating: false,
    isValditaionFailed: false,
  };

  onConfirmElefendAdded = () => {
    this.props.history.push('/tutorial-step-three');  
  };

  onSendTextAgain = () => {
    this.sendSMS();
  };

  getStageText = (currentStage, element) => {
    let text; 

    if (element !== 'button') {
      switch(currentStage) {
        case 1:
          text = 'We\'ll send a text message to your phone with Elefend\'s contact details.';
          break;
        case 2:
          text = 'We\'ve just sent you a text message with Elefend\'s contact details. Now add Elefend as a contact on your phone and continue.';
          break;
        case 3:
          text = 'You will now receive a phone call from Elefend Security. Answer the call to receive the confirmation.';
          break;     
        default:
          text = '';
        break;  
      }
  } else {
    switch(currentStage) {
      case 1:
        text = 'Send text message';
        break;
      case 2:
        text = 'I added Elefend as a contact';
        break;
      case 3:
        text = 'I answered the call';
        break;     
      default:
        text = '';
      break;  
    }
  }

    return text;
  };

  onNextStage = async() => {

    if (this.state.currentStage < 3) {
      if (this.state.currentStage === 1) {
        try {
         this.sendSMS();
        } catch(error) {
          console.error(error);
        }     
      } else if (this.state.currentStage === 2) {
        this.addedContact(); 
      }
      this.setState({ currentStage: this.state.currentStage + 1 })
    } else {
      this.props.history.push('/tutorial-step-three');
    }
  };

  sendSMS = async() => {  
    await sendElefendNumberAsSMS();
  };

  addedContact = async() => {
  
    try {
      this.setState({ isValidating: true });
      await verifyElefendContact();
      await this.checkCallStatus();
    } catch {
      this.setState({ isValidating: false });
    }
  };

  checkCallStatus = async() => {

    try {
      await checkCallResult();
      const lastCallStatus =  getLastCallStatus();

      if (lastCallStatus === 'ANSWERED') {
        await sendForwardingNumberAsSMS();
        this.props.history.push('/tutorial-step-three');
      } else if (lastCallStatus === 'HUNGUP' || lastCallStatus !== 'INIT') {
        this.setState({ isValidating: false }); 
        this.setState({ contactAddError: true });

      } else {
        setTimeout(this.checkCallStatus, 10000);
      }
    } catch {
      this.setState({ isValidating: false }); 
    }
  };

  render() {
    return (
      <div className="widget">
        <p className="widget__main-p">Step 2 of 3</p>
        <div className="widget__title widget__mobile-title">Add Elefend contact to your phone</div>
        { !this.state.isValditaionFailed && <p className="widget__medium-p">{ this.getStageText(this.state.currentStage) }</p> }
        { this.state.isValditaionFailed &&  <Fragment>
          <img className="widget__natural-img" src="assets/img/error.png" /> 
          <p className="widget__main-p noto-font">Elefend has not been added as a contact to your phone.</p>
          <p className="widget__medium-p">If you are sure that you added Elefend as a contact, confirm below</p>
          <a className="widget--a" onClick={ this.onConfirmElefendAdded }>I confirm I added Elefend as a contact</a>
        </Fragment> }
        { !this.state.isValditaionFailed && <Fragment>
          <img className="widget__natural-img" src={ `assets/img/iphone-2-${this.state.currentStage}.png` } /> 
          <div className="widget__input-wrapper">
            <button onClick={ this.onNextStage }>{ this.getStageText(this.state.currentStage, 'button') }</button>
          </div>  
          { this.state.currentStage === 3 && <a className="widget--a" onClick={ this.addedContact }>I did not receive a call</a> } 
        </Fragment> }
        { this.state.isValditaionFailed && <Fragment>
          <div className="widget__input-wrapper">
            <button onClick={ this.onSendTextAgain }>Send text again</button>
          </div>  
        </Fragment> }
        { this.state.isValditaionFailed && <a className="widget--a" href="mailto:info@elefend.com">Contact our customer support team for help</a> }  
        { this.state.isValidating && <ValidatingWidget /> }     
      </div>
    );
  }
}

export default withRouter(TutorialStepTwoIphone);
