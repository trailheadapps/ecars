import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import invokeWebPushService from '@salesforce/apex/WebPushService.invokeWebPushService';

export default class WebPushNotification extends LightningElement {
    @api recordId;
    message = 'Hey - this is a web push message';

    handleButtonClick() {
        this.callApex();
    }

    callApex() {
        invokeWebPushService({
            input: {
                recordId: this.recordId,
                message: this.message
            }
        })
            .then((result) => {
                let message = result
                    ? 'Service successfully executed.'
                    : 'Something happened while executing the service.';
                let variant = result ? 'success' : 'error';

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Service Result',
                        message,
                        variant
                    })
                );
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Service Error',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }

    handleTextareaChange(event) {
        this.message = event.target.value;
    }
}
