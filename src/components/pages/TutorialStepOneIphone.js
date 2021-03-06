import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router';
import { checkCallResult, getLastCallStatus, verifyBlockedNumber } from "../../services/ElefendAPI";
import ValidatingWidget from '../page-components/ValidatingWidget';

class TutorialStepOneIphone extends Component {
  state = {
    currentStage: 1,
    isValditaionFailed: false,
    isValidating: false,
  };

  onNextStage = () => {
    this.state.currentStage < 4 ? this.setState({ currentStage: this.state.currentStage + 1 }) : this.onConfirmSilenceCallers();
  };

  onConfirmUnknownNumbersAreBlocked = () => {
    this.props.history.push('/tutorial-step-two-iphone');
  };

  getStageText = (currentStage) => {
    let text; 

    switch(currentStage) {
      case 1:
        text = '1. Click Settings on your phone';
        break;
      case 2:
        text = '2. Scroll down and tap Phone';
        break;
      case 3:
        text = '3. Scroll down to the section Called Silencing and Blocked Contacts';
        break;
      case 4:
        text = '4. Tap the Silence Unknown Callers to turn it on'; 
      break;       
      default:
        text = '';
      break;  
    }

    return text;
  };

  onConfirmSilenceCallers = async() => {
    this.setState({ isValidating: true });

    try {
      await verifyBlockedNumber();
      await this.checkCallStatus();
    } catch {
      this.setState({ isValidating: false });
    }
  };

  checkCallStatus = async() => {

    try {
      await checkCallResult();
      const lastCallStatus =  getLastCallStatus();

      if (lastCallStatus === 'HUNGUP') {
        this.props.history.push('/tutorial-step-two-iphone');
      } else if (lastCallStatus === 'ANSWERED' || lastCallStatus !== 'INIT') {
        this.setState({ isValidating: false }); 
        this.setState({ isValditaionFailed: true });
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
        <p className="widget__main-p">Step 1 of 3</p>
        <div className="widget__title widget__mobile-title">Silence unknown callers</div>
        { !this.state.isValditaionFailed &&  <div className="widget__medium-p">This is so Elefend knows which calls to analyze, and can then monitor and { <br className="not-on-mobile"/> } forward these calls back to you.</div> }
        { this.state.isValditaionFailed &&  <Fragment>
          <img className="widget__natural-img" src="assets/img/error.png" /> 
          <p className="widget__main-p noto-font">Unknown callers are not properly blocked on your phone</p>
          <p className="widget__small-p">If you’re sure that unknown callers are blocked on your phone, confirm below </p>
          <a className="widget--a" onClick={ this.onConfirmUnknownNumbersAreBlocked  }>I confirm that unknown numbers are blocked on my phone</a>
        </Fragment> }
        { !this.state.isValditaionFailed && <Fragment>
          { <hr/> }
          <p className="widget__main-p">{ this.getStageText(this.state.currentStage) }</p>
          <img className="widget__natural-img" src={ `assets/img/iphone${this.state.currentStage}.png` } /> 
        </Fragment> }
        <div className="widget__input-wrapper">
          <button onClick={ this.onNextStage }>{ this.state.isValditaionFailed ? 'Try again' : 'Next' }</button>
        </div>    
        { this.state.isValditaionFailed && <a className="widget--a" href="mailto:info@elefend.com">Contact our customer support team for help</a> }  
        { this.state.isValidating && <ValidatingWidget /> }     
      </div>
    );
  }
}

export default withRouter(TutorialStepOneIphone);
