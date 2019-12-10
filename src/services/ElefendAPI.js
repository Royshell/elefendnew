
let uuid;
let savedPhoneNumber;
let savedDidNumber;
let my_client_id;
let callForwardingNumber;
let api_states = {
    logged_in :false,
    registered : false,
    verified: false,
    carrier_ok: false,
    last_call_status: 'unknown',
    last_forwading_result: 'unknown'
};

const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const checkLogin = () => {
  return api_states.logged_in;
};

const checkRegistered = () => {
  return api_states.registered;
};

const checkVerified = () => {
  return api_states.verified;
};

const checkForwarding = () => {
  return api_states.last_forwading_result;
};

const carrierOk = () => {
  if(api_states.carrier === '972') {
    return true;
  }

  if(api_states.carrier === 'AT&T Wireless') {
    return true;
  }

  if(api_states.carrier === 'T-Mobile USA, Inc.') {
    return true;
  }

  if(api_states.carrier === 'Verizon Wireless') {
    return true;
  }

  if(api_states.carrier === 'Sprint Spectrum, L.P.') {
    return true;
  }
  return false;
};

const getLastCallStatus = () => {
  return api_states.last_call_status;
};

const login = async() => {
  if(!my_client_id) {
    my_client_id = uuidv4()
  }

  const body = {
    app_secret: '49c5593e35e60467ef6316412e59aa420fa5da39',
    client_id: my_client_id
  };

  try {
    const response = await fetch(PROXY_URL + 'https://pbx.elefend.com:8000/api/applogin/', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
      'Content-type': 'application/json; charset=UTF-8'
      }
    });

    const results = await response.json();
    const { login_key } = results;

    uuid = login_key;
    api_states.logged_in = true;
    
  } catch(err) {
    console.error(err);
  }
};

const registerPhoneNumber = async(phoneNumber) => {
  savedPhoneNumber = phoneNumber || savedPhoneNumber;
  const body = {
    client_id: my_client_id, 
    login_key: uuid,
    phone: savedPhoneNumber 
  };

  try {
    const response = await fetch(PROXY_URL + 'https://pbx.elefend.com:8000/api/register/', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
      'Content-type': 'application/json; charset=UTF-8'
      }
    });

    const results = await response.json();

    if (response.status === 404) {
      api_states.registered = '404';
      return;
    }

    api_states.registered = 'registered';
    
  } catch(err) {
    console.error(err);

  }
};

const checkCarrier = async(phoneNumber) => {
  if(phoneNumber.startsWith('972')) {
    api_states.carrier = '972';
    return;
  }

  try {
    const response = await fetch(PROXY_URL + 'https://rest.textmagic.com/api/v2/lookups/' + phoneNumber + '?country=US', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'Accept': 'application/json',
        'X-TM-Username': 'og1',
        'X-TM-Key': 'zdCy92VN2Jez0JqAyFGzbpEz047PSh'
      }
    });

    const results = await response.json();
    const { carrier } = results;

    api_states.carrier = carrier;
  } catch(err) {
    api_states.carrier = 'Unknown';
    console.error(err);
  }
};

const getCarrierDisablingNumber = () => {
  let carrier = api_states.carrier;
  let disablingNumber;

  switch(carrier) {
    case 'AT&T Wireless':
      disablingNumber = '##67#';
      break;  
    case 'T-Mobile USA, Inc.':
      disablingNumber = '##62#';
      break;  
    case 'Verizon Wireless':
      disablingNumber = '*73';
      break; 
    case 'Sprint Spectrum, L.P.':
      disablingNumber = '*740';
      break; 
    default:
      disablingNumber = '#67#';
      
  }       
  return disablingNumber;  
};
 

const getTemplateForCarrier = (carrier) => { //this functionality should be move to backend. Try to use integeres instead of strings. A swtich case will better than if statements

  if(carrier === '972') {
    return '*67*XXXXXX#';
  }

  if(carrier === 'AT&T Wireless') {
    return '*67*1XXXXXX*11#';
  }

  if(carrier === 'T-Mobile USA, Inc.') {
    return '**62*1XXXXXX#';
  }

  if(carrier === 'Verizon Wireless') {
    return '*71XXXXXX';
  }

  if(carrier === 'Sprint Spectrum, L.P.') {
    return '*74XXXXXX';
  }
  return 'Unknown';
};

const getCallForwardingFormattdNumber = () => {
  const template = getTemplateForCarrier(api_states.carrier);
  return template.replace('XXXXXX', callForwardingNumber);
};

const getCallForwardingNumber = () => {
  const template = getTemplateForCarrier(api_states.carrier);
  return template.replace('XXXXXX', savedDidNumber);
};

const sendForwardingNumberAsSMS = async() => {
  const template = getTemplateForCarrier(api_states.carrier);

  const body = {
    client_id: my_client_id, 
    login_key: uuid,
    phone:savedPhoneNumber,
    template: template
  };

  try {
    const response = await fetch(PROXY_URL + 'https://pbx.elefend.com:8000/api/sendForwardingNumberAsSMS/', { //this request sends an SMS
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    });

    const results = await response.json();

    const { did_line } = results
    savedDidNumber = did_line; 
    callForwardingNumber = did_line;

    if(results !== -1) {
      api_states.sent_contact_number = true;
    }
  } catch(err) {
    console.error(err);
    api_states.sent_contact_number = false;
  }
};

const sendElefendNumberAsSMS = async(pincode) => {
  const body = {
    client_id: my_client_id, 
    login_key: uuid,
    phone:savedPhoneNumber
  };

  try {
    const response = await fetch(PROXY_URL + 'https://pbx.elefend.com:8000/api/sendElefendNumberAsSMS/', { //this request sends an SMS
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    });

    const results = await response.json();
    const { result } = results;

    if(result !== -1) {
      api_states.sent_contact_number = true;
    }
  } catch(err) {
    console.error(err);
    api_states.sent_contact_number = false;
  }
};

const verifyPhoneNumber = async(pincode) => { 
  const body = {
    client_id: my_client_id, 
    login_key: uuid,
    phone: savedPhoneNumber,
    pincode: pincode
  };

  try {
    const response = await fetch(PROXY_URL + 'https://pbx.elefend.com:8000/api/validateSMS/', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
      'Content-type': 'application/json; charset=UTF-8'
      }
    });

    const results = await response.json();
    const { result } = results;

    if(result !== -1) {
      api_states.verified = true;
    }
  } catch(err) {
    console.error(err);
    api_states.verified = false;
  }
};

const verifyBlockedNumber = async() => {
  const body = {
    client_id: my_client_id, 
    login_key: uuid,
    phone: savedPhoneNumber,
  };

  try {
    const response = await fetch(PROXY_URL + 'https://pbx.elefend.com:8000/api/verifyBlocking/', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
      'Content-type': 'application/json; charset=UTF-8'
      }
    });

  } catch(err) {
    console.error(err);
  }
};

const checkCallResult = async() => { 
  const body = {
    client_id:  my_client_id, 
    login_key: uuid,
    phone: savedPhoneNumber,
  };

  try {
    const response = await fetch(PROXY_URL + 'https://pbx.elefend.com:8000/api/checkCallResult/', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
      'Content-type': 'application/json; charset=UTF-8'
      }
    });

    const results = await response.json();
    const { status } = results;

    api_states.last_call_status = status;

  } catch(err) {
    api_states.last_call_status = 'Unknown'
    console.error(err);
  }
};


const checkForwardingResult = async() => {
  const body = {
    client_id:  my_client_id, 
    login_key: uuid,
    phone: savedPhoneNumber,
  };

  try {
    const response = await fetch(PROXY_URL + 'https://pbx.elefend.com:8000/api/checkForwardingResult/', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    });

    const results = await response.json();
    const { status } = results;

    api_states.last_forwading_result = status;

  } catch(err) {
    api_states.last_call_status = 'Unknown';
    console.error(err);
  }
};

const verifyElefendContact = async() => { 
  const body = {
    client_id: my_client_id, 
    login_key: uuid,
    phone: savedPhoneNumber,
  };

  try {
    const response = await fetch(PROXY_URL +'https://pbx.elefend.com:8000/api/verifyContact/', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
      'Content-type': 'application/json; charset=UTF-8'
      }
    });

  } catch(err) {
    console.error(err);
  }
};

const verifyCallForwarding = async() => { 
  const body = {
    client_id: my_client_id, 
    login_key: uuid,
    phone: savedPhoneNumber,
  };

  try {
    const response = await fetch(PROXY_URL + 'https://pbx.elefend.com:8000/api/verifyForwarding/', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
      'Content-type': 'application/json; charset=UTF-8'
      }
    });
  
  } catch(err) {
    console.error(err);
  }
};

const sendSuccessSMS = async(message) => { 
  const body = {
    client_id: my_client_id,
    login_key: uuid,
    phone: savedPhoneNumber,
    sms_data: message,
  };

  try {
    const response = await fetch(PROXY_URL  + 'https://pbx.elefend.com:8000/api/successSMS/', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
      'Content-type': 'application/json; charset=UTF-8'
      }
    });

  } catch(err) {
    console.error(err);
  }
};


String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
};

export  { carrierOk, checkCarrier, checkVerified, checkRegistered,checkLogin, login, registerPhoneNumber, getCarrierDisablingNumber,
  verifyPhoneNumber, verifyBlockedNumber, checkCallResult, verifyElefendContact, verifyCallForwarding , getLastCallStatus, sendElefendNumberAsSMS, sendForwardingNumberAsSMS, getCallForwardingNumber, checkForwardingResult, checkForwarding, sendSuccessSMS, getCallForwardingFormattdNumber} ;