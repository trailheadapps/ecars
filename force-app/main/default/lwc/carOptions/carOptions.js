import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldDisplayValue } from 'lightning/uiRecordApi';

import SEL_EXTERIOR_FIELD from '@salesforce/schema/Car_Configuration__c.Selected_Exterior_Color__c';
import SEL_INTERIOR_FIELD from '@salesforce/schema/Car_Configuration__c.Selected_Interior_Color__c';
import SEL_RANGE_FIELD from '@salesforce/schema/Car_Configuration__c.Selected_Range__c';

export default class CarOptions extends LightningElement {
    @api recordId;

    error;

    @wire(getRecord, {
        recordId: '$recordId',
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
}
