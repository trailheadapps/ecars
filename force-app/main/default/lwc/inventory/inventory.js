import { LightningElement, wire } from 'lwc';
import getVehicles from '@salesforce/apex/InventoryController.getVehicles';

export default class Inventory extends LightningElement {
    @wire(getVehicles)
    vehicles;
}
