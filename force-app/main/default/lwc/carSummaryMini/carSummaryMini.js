import { LightningElement, api, wire } from 'lwc';
import {
    getRecord,
    getFieldDisplayValue,
    getFieldValue
} from 'lightning/uiRecordApi';

import CAR_CONFIG_ID from '@salesforce/schema/Vehicle_Order__c.Configuration__c';
import SEL_EXTERIOR_FIELD from '@salesforce/schema/Car_Configuration__c.Selected_Exterior_Color__c';
import SEL_INTERIOR_FIELD from '@salesforce/schema/Car_Configuration__c.Selected_Interior_Color__c';
import SEL_RANGE_FIELD from '@salesforce/schema/Car_Configuration__c.Selected_Range__c';

const BASE_IMAGE_URL = 'https://sfdc-demo.s3-us-west-1.amazonaws.com/ecars';

export default class CarSummary extends LightningElement {
    @api recordId;

    error;

    @wire(getRecord, {
        recordId: '$recordId',
        fields: [CAR_CONFIG_ID]
    })
    orderRecord;

    @wire(getRecord, {
        recordId: '$carConfigId',
        fields: [SEL_EXTERIOR_FIELD, SEL_INTERIOR_FIELD, SEL_RANGE_FIELD]
    })
    record;

    get selectedExteriorColor() {
        let exteriorFieldValue = this.record.data
            ? getFieldDisplayValue(this.record.data, SEL_EXTERIOR_FIELD)
            : '';
        if (exteriorFieldValue !== '') {
            return {
                label: exteriorFieldValue,
                code: exteriorFieldValue.split(' ')[1].toLowerCase()
            };
        }
        return null;
    }

    get selectedInteriorColor() {
        let interiorFieldValue = this.record.data
            ? getFieldDisplayValue(this.record.data, SEL_INTERIOR_FIELD)
            : '';
        if (interiorFieldValue !== '') {
            return {
                label: interiorFieldValue,
                code: interiorFieldValue.split(' ')[1].toLowerCase()
            };
        }
        return null;
    }

    get selectedRange() {
        return this.record.data
            ? getFieldDisplayValue(this.record.data, SEL_RANGE_FIELD)
            : '';
    }

    get imgUrl() {
        const exteriorFieldValue = this.record.data
            ? getFieldDisplayValue(this.record.data, SEL_EXTERIOR_FIELD)
            : '';
        if (exteriorFieldValue !== '') {
            const code = exteriorFieldValue.split(' ')[1].toLowerCase();
            return `${BASE_IMAGE_URL}/car_${code}.jpg`;
        }
        return null;
    }

    get carConfigId() {
        return this.orderRecord.data
            ? getFieldValue(this.orderRecord.data, CAR_CONFIG_ID)
            : '';
    }
}
