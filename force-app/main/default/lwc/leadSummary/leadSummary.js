import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import LEAD_FIELD from '@salesforce/schema/Car_Configuration__c.Lead__c';
import NAME_FIELD from '@salesforce/schema/Lead.Name';
import EMAIL_FIELD from '@salesforce/schema/Lead.Email';
import MOBILE_FIELD from '@salesforce/schema/Lead.MobilePhone';
import PHONE_FIELD from '@salesforce/schema/Lead.Phone';
const fields = [LEAD_FIELD];

export default class LeadSummary extends NavigationMixin(LightningElement) {
    @api recordId;

    leadFields = [NAME_FIELD, EMAIL_FIELD, PHONE_FIELD, MOBILE_FIELD];

    @wire(getRecord, { recordId: '$recordId', fields })
    configuration;

    get lead() {
        return getFieldValue(this.configuration.data, LEAD_FIELD);
    }

    gotoDetail() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                actionName: 'view',
                recordId: this.lead,
                objectApiName: 'Lead'
            }
        });
    }
}
