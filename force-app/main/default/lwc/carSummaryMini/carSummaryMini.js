import { LightningElement, api, wire } from 'lwc';
import getCarOptions from '@salesforce/apex/CarOptionsController.getOrderCarOptions';

const BASE_IMAGE_URL = 'https://sfdc-demo.s3-us-west-1.amazonaws.com/ecars';

export default class CarSummary extends LightningElement {
    @api recordId;

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
            this.selectedExteriorColor = undefined;
        }
    }

    get imgUrl() {
        return `${BASE_IMAGE_URL}/car_${this.selectedExteriorColor.code}.jpg`;
    }
}
