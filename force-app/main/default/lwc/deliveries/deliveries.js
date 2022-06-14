import { LightningElement, api } from 'lwc';
import getWaypoints from '@salesforce/apex/DeliveryRouteController.getWaypoints';

const DATATABLE_COLUMNS = [
    {
        label: 'Delivery Order',
        fieldName: 'order',
        type: 'number',
        cellAttributes: { alignment: 'left' }
    },
    { label: 'Name', fieldName: 'name' }
];

export default class Deliveries extends LightningElement {
    @api recordId;

    datatableColumns = DATATABLE_COLUMNS;
    datatableData = [];
    mapMarkers = [];
    btnDisabled = false;

    handleClick() {
        this.btnDisabled = true;
        getWaypoints({ recordId: this.recordId })
            .then((result) => {
                const tempDatatable = [];
                const tempMarkers = [];
                result.forEach((entry) => {
                    tempDatatable.push({
                        order: entry.Number__c ? entry.Number__c + 1 : 1,
                        name: entry.Vehicle_Order__r.Name
                    });
                    tempMarkers.push({
                        title: entry.Vehicle_Order__r.Name,
                        location: {
                            Latitude: entry.Vehicle_Order__r.Service_Location__Latitude__s,
                            Longitude: entry.Vehicle_Order__r.Service_Location__Longitude__s
                        }
                    });
                });
                this.datatableData = tempDatatable.sort(this.compare);
                this.mapMarkers = tempMarkers;
                this.btnDisabled = false;
            })
            .catch((error) => {
                this.error = error;
            });
    }

    compare(sa, sb) {
        const serviceA = sa.order;
        const serviceB = sb.order;

        let comparison = 0;
        if (serviceA > serviceB) {
            comparison = 1;
        } else if (serviceA < serviceB) {
            comparison = -1;
        }
        return comparison;
    }
}