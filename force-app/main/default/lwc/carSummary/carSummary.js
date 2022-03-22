import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import SEL_EXTERIOR_FIELD from '@salesforce/schema/Car_Configuration__c.Selected_Exterior_Color__c';

const BASE_IMAGE_URL = 'https://sfdc-demo.s3-us-west-1.amazonaws.com/ecars';

export default class CarSummary extends LightningElement {
    @api recordId;

    error;

    @wire(getRecord, {
        recordId: '$recordId',
        fields: [SEL_EXTERIOR_FIELD]
    })
    record;

    get imgUrl() {
        const exteriorFieldValue = this.record.data
            ? getFieldValue(this.record.data, SEL_EXTERIOR_FIELD)
            : '';
        if (exteriorFieldValue !== '') {
            const code = exteriorFieldValue.split('_')[1].toLowerCase();
            return `${BASE_IMAGE_URL}/car_${code}.jpg`;
        }
        return null;
    }
}
