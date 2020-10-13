import { LightningElement, api, wire } from 'lwc';
import getCarOptions from '@salesforce/apex/CarOptionsController.getCarOptions';

export default class CarOptions extends LightningElement {
    @api recordId;

    error;
    selectedRange;
    selectedExteriorColor = {};
    selectedInteriorColor = {};

    @wire(getCarOptions, { recordId: '$recordId' })
    carOptions({ error, data }) {
        if (data) {
            this.selectedRange = data.Range__c;
            this.selectedExteriorColor = {
                label: data.Exterior_Color__c,
                code: data.Exterior_Color__c.split(' ')[1].toLowerCase()
            };
            this.selectedInteriorColor = {
                label: data.Interior_Color__c,
                code: data.Interior_Color__c.split(' ')[1].toLowerCase()
            };
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }
}
