import * as React from 'react';
import './pay-with-card-stripe.css';
import update from 'immutability-helper';

import {injectStripe, CardNumberElement, CardElement,CardExpiryElement, CardCVCElement, StripeProvider, PostalCodeElement, Elements} from 'react-stripe-elements';


const handleBlur = () => {
    console.log('[blur]');
};
const handleChange = (change) => {
    console.log('[change]', change);
};
const handleClick = () => {
    console.log('[click]');
};
const handleFocus = () => {
    console.log('[focus]');
};
const handleReady = () => {
    console.log('[ready]');
};

const createOptions = (fontSize) => {
    return {
        style: {
            base: {
                fontSize: "16px",
                color: '#32325d',
                fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
                '::placeholder': {
                    color: "#868e96",
                },
            },
            invalid: {
                color: '#9e2146',
            },
        },
    };
};


class _SplitForm extends React.Component {

    constructor() {
        super();
    }


    handleSubmit = (ev) => {
        ev.preventDefault();
        const componentId = this.props.componentId;
        const flowKey = this.props.flowKey;
        if (this.props.stripe) {
            this.props.stripe
                .createToken()
                .then((payload) => {
                    console.log('[token]', payload);
                    const model = manywho.model.getComponent(componentId, flowKey);
                    const data = model.objectData;
                    const newDataCopy = update(data, {0: {"properties": {1: {"contentValue": {$set: payload.token.id}}}}});
                    manywho.state.setComponent(componentId, { objectData: newDataCopy }, flowKey, true,);
                    ev.stopPropagation();
                    var outcomes = manywho.model.getOutcomes(componentId, flowKey);
                    manywho.component.onOutcome(outcomes[0], null, flowKey);
                });
        } else {
            console.log("Stripe.js hasn't loaded yet.");
        }
    };
    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Card number
                    <CardNumberElement
                        onBlur={handleBlur}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onReady={handleReady}
                        {...createOptions(this.props.fontSize)}
                    />
                </label>
                <label>
                    Expiration date
                    <CardExpiryElement
                        onBlur={handleBlur}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onReady={handleReady}
                        {...createOptions(this.props.fontSize)}
                    />
                </label>
                <label>
                    CVC
                    <CardCVCElement
                        onBlur={handleBlur}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onReady={handleReady}
                        {...createOptions(this.props.fontSize)}
                    />
                </label>
                <label>
                    Postal code
                    <PostalCodeElement
                        onBlur={handleBlur}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onReady={handleReady}
                        {...createOptions(this.props.fontSize)}
                    />
                </label>
                <button>Pay</button>
            </form>
        );
    }
}
const SplitForm = injectStripe(_SplitForm);


class Checkout extends React.Component {
    constructor() {
        super();
        this.state = {
            elementFontSize: window.innerWidth < 450 ? '14px' : '18px',
        };
        window.addEventListener('resize', () => {
            if (window.innerWidth < 450 && this.state.elementFontSize !== '14px') {
                this.setState({elementFontSize: '14px'});
            } else if (
                window.innerWidth >= 450 &&
                this.state.elementFontSize !== '18px'
            ) {
                this.setState({elementFontSize: '18px'});
            }
        });
    }

    render() {
        const {elementFontSize} = this.state;
        return (
            <div className="Checkout">
                <Elements>
                    <SplitForm fontSize={elementFontSize} componentId={this.props.componentId} flowKey={this.props.flowKey} />
                </Elements>
            </div>
        );
    }
}

class PayWithCardStripe extends React.Component {
    render() {
        const model = manywho.model.getComponent(this.props.id, this.props.flowKey);
        const public_token= model.objectData[0].properties.filter(p => p.developerName === "Public Token")[0].contentValue;


        return (
            <div className="stripe-component">
                <StripeProvider apiKey={public_token} >
                    <Checkout componentId={this.props.id} flowKey={this.props.flowKey} />
                </StripeProvider>
            </div>
        );
    }
}

manywho.component.register('pay-with-card-stripe', PayWithCardStripe);
manywho.component.register("outcomes", null);

export default PayWithCardStripe;




