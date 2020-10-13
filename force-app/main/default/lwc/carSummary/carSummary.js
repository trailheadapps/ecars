import { LightningElement, api, wire } from 'lwc';
import getCarOptions from '@salesforce/apex/CarOptionsController.getCarOptions';

const BASE_IMAGE_URL = 'https://sfdc-demo.s3-us-west-1.amazonaws.com/ecars';

export default class CarSummary extends LightningElement {
    @api recordId;

    error;
    selectedExteriorColor;

    @wire(getCarOptions, { recordId: '$recordId' })
    carOptions({ error, data }) {
        if (data) {
            this.selectedExteriorColor = {
                label: data.Exterior_Color__c,
                code: data.Exterior_Color__c.split(' ')[1].toLowerCase()
            };
            this.error = undefined;
        } else if (error) {
            this.selectedExteriorColor = undefined;
            this.error = error;
        }
    }

    get imgUrl() {
        return `${BASE_IMAGE_URL}/car_${this.selectedExteriorColor.code}.jpg`;
    }
}
