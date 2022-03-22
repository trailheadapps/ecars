import { LightningElement, wire, track } from 'lwc';

import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CURRENCY from '@salesforce/i18n/currency';

import CAR_CONFIG_OBJECT from '@salesforce/schema/Car_Configuration__c';
import CAR_MODEL_FIELD from '@salesforce/schema/Car_Configuration__c.Car__c';
import SEL_EXTERIOR_FIELD from '@salesforce/schema/Car_Configuration__c.Selected_Exterior_Color__c';
import SEL_INTERIOR_FIELD from '@salesforce/schema/Car_Configuration__c.Selected_Interior_Color__c';
import SEL_RANGE_FIELD from '@salesforce/schema/Car_Configuration__c.Selected_Range__c';
import LEAD_FIELD from '@salesforce/schema/Car_Configuration__c.Lead__c';

import getAvailableCarOptions from '@salesforce/apex/CarConfigurationController.getAvailableCarOptions';

const BASE_IMAGE_URL = 'https://sfdc-demo.s3-us-west-1.amazonaws.com/ecars';

export default class CarConfigurator extends LightningElement {
    currentSection = 1;
    currency = CURRENCY;
    leadField = LEAD_FIELD;
    processing = false;
    leadRecordId = '';
    modelId;

    @track ranges = [];
    @track exteriorColors = [];
    @track interiorColors = [];

    @wire(getAvailableCarOptions, { modelName: 'Neutron LGM-1 Sedan' })
    processCarOptions({ data, error }) {
        if (data) {
            this.modelId = data.recordId;
            this.ranges = data.allOptions.RangeOptions.map((obj, index) => {
                return {
                    ...obj,
                    className: `range-option ${index === 0 ? 'selected' : ''}`
                };
            });
            this.exteriorColors = data.allOptions.ExteriorColors.map(
                (obj, index) => {
                    return {
                        ...obj,
                        className: `color-option ${obj.code} ${
                            index === 0 ? 'selected' : ''
                        }`
                    };
                }
            );
            this.interiorColors = data.allOptions.InteriorColors.map(
                (obj, index) => {
                    return {
                        ...obj,
                        className: `color-option ${obj.code} ${
                            index === 0 ? 'selected' : ''
                        }`
                    };
                }
            );

            this.selectedRange = this.ranges[0];
            this.selectedExteriorColor = this.exteriorColors[0];
            this.selectedInteriorColor = this.interiorColors[0];
        } else if (error) {
            this.error = error;
        }
    }

    get imgUrl() {
        if (this.currentSection === 3) {
            return `${BASE_IMAGE_URL}/car_interior_${this.selectedInteriorColor.code}.jpg`;
        } else if (this.currentSection === 2 || this.currentSection === 4) {
            return `${BASE_IMAGE_URL}/car_${this.selectedExteriorColor.code}.jpg`;
        }
        return `${BASE_IMAGE_URL}/car_white.jpg`;
    }

    get imgClass() {
        if (this.currentSection === 3) {
            return 'container-images';
        }
        return 'container-images padded';
    }

    handleRangeChange(event) {
        const rangeLabel = event.currentTarget.dataset.range;
        this.ranges.forEach((range) => {
            let className = range.className.replace('selected', '');
            if (range.label === rangeLabel) {
                this.selectedRange = range;
                range.className = className + ' selected';
            } else {
                range.className = className;
            }
        });
    }

    handleExteriorColorChange(event) {
        const colorCode = event.currentTarget.dataset.color;
        this.exteriorColors.forEach((color) => {
            let className = color.className.replace('selected', '');
            if (color.code === colorCode) {
                this.selectedExteriorColor = color;
                color.className = className + ' selected';
            } else {
                color.className = className;
            }
        });
    }

    handleInteriorColorChange(event) {
        const colorCode = event.currentTarget.dataset.color;
        this.interiorColors.forEach((color) => {
            let className = color.className.replace('selected', '');
            if (color.code === colorCode) {
                this.selectedInteriorColor = color;
                color.className = className + ' selected';
            } else {
                color.className = className;
            }
        });
    }

    handleLeadChange(event) {
        this.leadRecordId = event.target.value;
    }

    handleNext() {
        this.currentSection = this.currentSection + 1;
    }

    handlePrevious() {
        this.currentSection = this.currentSection - 1;
    }

    handleCreateRecord() {
        this.processing = true;
        const fields = {};
        fields[CAR_MODEL_FIELD.fieldApiName] = this.modelId;
        fields[LEAD_FIELD.fieldApiName] = this.leadRecordId;
        fields[SEL_EXTERIOR_FIELD.fieldApiName] =
            this.selectedExteriorColor.label.replace(' ', '_');
        fields[SEL_INTERIOR_FIELD.fieldApiName] =
            this.selectedInteriorColor.label.replace(' ', '_');
        fields[SEL_RANGE_FIELD.fieldApiName] = this.selectedRange.label.replace(
            ' ',
            '_'
        );

        const recordInput = {
            apiName: CAR_CONFIG_OBJECT.objectApiName,
            fields
        };
        createRecord(recordInput)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Configuration added successfully',
                        message:
                            'A new car configuration has been added to the {0}',
                        messageData: [
                            {
                                url: `/lightning/r/Lead/${this.leadRecordId}/view`,
                                label: 'lead record'
                            }
                        ],
                        variant: 'success',
                        mode: 'sticky'
                    })
                );
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            })
            .finally(() => {
                this.processing = false;
            });
    }

    get hasPreviousSection() {
        return this.currentSection > 1;
    }

    get isSection1() {
        return this.currentSection === 1;
    }
    get isSection2() {
        return this.currentSection === 2;
    }
    get isSection3() {
        return this.currentSection === 3;
    }
    get isSection4() {
        return this.currentSection === 4;
    }
}
