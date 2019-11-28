import React, { Component, Fragment } from 'react';
import ValidatingWidget from '../page-components/ValidatingWidget';
import {
    checkForwarding, 
    checkForwardingResult,
    getCallForwardingNumber,
    verifyCallForwarding,
    getCarrierDisablingNumber,
    getCallForwardingFormattdNumber,
    sendSuccessSMS
} from '../../services/ElefendAPI'

export default class TutorialStepThree extends Component {
  state = {
    isValidating: false,
    isConfirmed: false,
    isFailed: false ,
  };
  onCallConfirm = () => {
    this.setState({ isValidating: true });
    let disablingNumber = getCarrierDisablingNumber();
    
    
    verifyCallForwarding().then(()=> {
        this.setState({isValidating: true});
        const theClass = this; //once again, use arrow functions RS

        function checkCallStatusOnTimeout() {
            checkForwardingResult().then(() => {
                theClass.setState({isValidating: false});
                var lastFwdStatus = checkForwarding() //again - use const and add a ';'
               
                if ("SUCCESS" === lastFwdStatus) {
                    theClass.setState({isFailed: false});
                   
                    sendSuccessSMS(`Congratulations! Elefend Beta is successfully installed! To deactivate the service please press ${disablingNumber}`).then(()=>{return});
                    theClass.setState({isConfirmed:true})
                } else if ("FAILED" === lastFwdStatus || "INIT" !== lastFwdStatus) {
                    theClass.setState({isFailed: true});
                } else {
                    setTimeout(checkCallStatusOnTimeout, 10000);
                }
            })
        }
        setTimeout(checkCallStatusOnTimeout, 10000);
    })
  };
  sendSMS = async () => {  
    this.setState({ isValidating: true });
    await sendSuccessSMS(`To activate call forward of silenced calls please dial the following number:${ getCallForwardingNumber() }`);
    this.setState({ isValidating: false });
  };
  render() {
    return (
      <div className="widget flexable-widget">

        { !this.state.isConfirmed &&  <Fragment>
          <p className="widget__main-p">Step 3 of 3 </p>
          <div className="widget__title widget__mobile-title">Activate call forward of silenced calls</div> 
        </Fragment>      
      }
        { !this.state.isConfirmed && !this.state.isFailed && <Fragment>
          <p className="widget__medium-p">This allows Elefend to receive, monitor, and forward back to you any silenced calls from unknown numbers.</p>
          <p className="widget__medium-p">We just sent you text message with the following number</p>
          <img className="widget__natural-img" src="assets/img/dial.svg" />
          <div className="widget__asterisk-number">
            {  getCallForwardingFormattdNumber() }
          </div>
          <p className="widget__medium-p">Call this number on your phone</p>
          <div className="widget__input-wrapper">
            <button onClick={ this.onCallConfirm }>I called the above number</button>
          </div>
          </Fragment> }
        { this.state.isValidating && <ValidatingWidget/> }
        { this.state.isConfirmed && <Fragment>
            <div className={'widget ' + this.state.isConfirmed ? 'half-margin': ''}>
              <img className="widget__natural-img" src="assets/img/success.png" />
            </div>
            <div className="widget half-margin">
              <div className="widget__title"><strong>Thank you for joining Elefend!</strong></div>
              <div className="widget__input-wrapper">
              <button><a href="mailto:info@elefend.com">Contact us for feedback</a></button>
            </div>
          
            <p className="widget__medium-p">You can deactivate Elefend at any time</p>
            <a className="widget--a">Learn how </a>
          </div>
        </Fragment> }
        { this.state.isFailed && <Fragment>
          <img src='assets/img/error.png' /> 
          <p className="widget__medium-p">Call forwarding of silenced wasn't properly activated</p>
          <p className="widget__small-p">If you are sure that you have activated call forwarding when busy, confirm below</p>
          <a className="widget--a" onClick={ this.onCallConfirm }>I confirm call forwarding when busy is activated</a>
          <div className="widget__input-wrapper">
            <button onClick={ this.sendSMS }>Send text again</button>
          </div> 
          <a className="widget--a" href="mailto:info@elefend.com">Contact our customer support team for help</a>
        </Fragment> }
       </div>
    );
  }
}
