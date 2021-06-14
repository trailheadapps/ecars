import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

const BASE_IMAGE_URL = 'https://sfdc-demo.s3-us-west-1.amazonaws.com/ecars';

export default class InventoryTile extends NavigationMixin(LightningElement) {
    @api vehicle;

    get badgeCSS() {
        return this.vehicle.Status__c.toLowerCase().replace(/\s/, '');
    }

    get imageURL() {
        const arrColor =
            this.vehicle.Exterior_Color__c.toLowerCase().split('_');
        return `${BASE_IMAGE_URL}/car_${arrColor[arrColor.length - 1]}.jpg`;
    }

    handleContentClick() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                actionName: 'view',
                recordId: this.vehicle.Id,
                objectApiName: 'Vehicle__c'
            }
        });
    }
}
