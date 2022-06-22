import { LightningElement, api } from 'lwc';
import getWaypoints from '@salesforce/apex/DeliveryRouteController.getWaypoints';

const DATATABLE_COLUMNS = [
    {
        label: 'Delivery Order',
        fieldName: 'order',
        type: 'number',
        cellAttributes: { alignment: 'left' },
        fixedWidth: 100
    },
    { label: 'Order Number', fieldName: 'orderNumber', fixedWidth: 100 },
    { label: 'Customer Name', fieldName: 'customerNumber', fixedWidth: 300 },
    { label: 'Delivery Address', fieldName: 'deliveryAddress', fixedWidth: 400 }
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
                        orderNumber: entry.Vehicle_Order__r.Name,
                        customerNumber: entry.Vehicle_Order__r.Customer__r.Name,
                        deliveryAddress:
                            entry.Vehicle_Order__r.Service_Address__c
                    });
                    tempMarkers.push({
                        title:
                            entry.Vehicle_Order__r.Name +
                            '-' +
                            entry.Vehicle_Order__r.Customer__r.Name,
                        location: {
                            Latitude:
                                entry.Vehicle_Order__r
                                    .Service_Location__Latitude__s,
                            Longitude:
                                entry.Vehicle_Order__r
                                    .Service_Location__Longitude__s
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
