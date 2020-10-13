import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { subscribe, unsubscribe } from 'lightning/empApi';
import FIELD_EXTERIOR_COLOR from '@salesforce/schema/Vehicle__c.Exterior_Color__c';
import FIELD_STATUS from '@salesforce/schema/Vehicle__c.Status__c';

const BASE_IMAGE_URL = 'https://sfdc-demo.s3-us-west-1.amazonaws.com/ecars';
const CHANNEL_NAME = '/data/Vehicle__ChangeEvent';

export default class VehicleImage extends LightningElement {
    @api recordId;
    color;
    status = undefined;

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
        // Handles subscribe button click
        const that = this;
        const messageCallback = function (response) {
            if (
                response.data.payload.ChangeEventHeader.changedFields.indexOf(
                    'Status__c'
                ) > -1
            ) {
                that.status = response.data.payload.Status__c;
            }
        };

        subscribe(CHANNEL_NAME, -1, messageCallback).then((response) => {
            this.subscription = response;
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
