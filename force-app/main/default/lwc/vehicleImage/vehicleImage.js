import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import FIELD_EXTERIOR_COLOR from '@salesforce/schema/Vehicle__c.Exterior_Color__c';
import FIELD_STATUS from '@salesforce/schema/Vehicle__c.Status__c';

const BASE_IMAGE_URL = 'https://sfdc-demo.s3-us-west-1.amazonaws.com/ecars';
const CHANNEL_NAME = '/data/Vehicle__ChangeEvent';

export default class VehicleImage extends LightningElement {
    @api recordId;
    color;
    status = undefined;
    subscription = {};

    @wire(getRecord, {
        recordId: '$recordId',
        fields: [FIELD_EXTERIOR_COLOR, FIELD_STATUS]
    })
    vehicle({ error, data }) {
        if (data) {
            this.color = getFieldValue(data, FIELD_EXTERIOR_COLOR);
            this.status = getFieldValue(data, FIELD_STATUS);
            this.error = undefined;
        } else if (error) {
            this.status = this.color = undefined;
            this.error = error;
        }
    }

    connectedCallback() {
        this.registerErrorListener();
        this.subscribeToChangeEvent();
    }

    subscribeToChangeEvent() {
        const messageCallback = (response) => {
            if (
                response.data.payload.ChangeEventHeader.changedFields.indexOf(
                    'Status__c'
                ) > -1
            ) {
                this.status = response.data.payload.Status__c;
            }
        };
        // subscribe to message channel
        subscribe(CHANNEL_NAME, -1, messageCallback).then((response) => {
            this.subscription = response;
        });
    }

    registerErrorListener() {
        // Invoke onError empApi method
        onError((error) => {
            // logs error in the console. Refactor to use error component later
            console.error(
                'Received error from server: ',
                JSON.stringify(error)
            );
        });
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
    }

    get badgeCSS() {
        return this.status.toLowerCase().replace(/\s/, '');
    }

    get imageURL() {
        const arrColor = this.color.toLowerCase().split('_');
        return `${BASE_IMAGE_URL}/car_${arrColor[arrColor.length - 1]}.jpg`;
    }
}
