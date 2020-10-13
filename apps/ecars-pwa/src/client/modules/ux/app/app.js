import { LightningElement } from 'lwc';

export default class App extends LightningElement {
    showToast = false;
    toastVariant = 'success';
    toastMessage = 'default message';

    connectedCallback() {
        this.addEventListener('showtoast', this.handleShowToast.bind(this));
    }

    handleShowToast(event) {
        this.toastVariant = event.detail.variant;
        this.toastMessage = event.detail.message;
        let el = this.template.querySelector('.toast.hide');
        if (!el) {
            el = this.template.querySelector('.toast');
        }
        el.classList.remove('hide');
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            el.classList.add('hide');
        }, 3400);
    }
}
