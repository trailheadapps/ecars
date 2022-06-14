import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import { chartConfig } from './chartConfig';
import chartjs from '@salesforce/resourceUrl/chart';

export default class ServiceDataAnalyzer extends LightningElement {
    @track chartJsConfig = chartConfig;
    @track loading = false;
    chart;

    options = [
        { value: 'last10', label: 'Last 10 miles' },
        { value: 'last50', label: 'Last 50 miles' },
        { value: 'last100', label: 'Last 100 miles' },
        { value: 'last200', label: 'Last 200 miles' },
        { value: 'last500', label: 'Last 500 miles' }
    ];

    _isInitialized = false;
    _updateChart = true;

    renderedCallback() {
        if (this._isInitialized) {
            return;
        }
        this._isInitialized = true;

        loadScript(this, chartjs)
            .then(() => {})
            .catch((error) => {
                this.error = error;
            });
    }

    handleChange() {
        if (this.canvas) {
            this.canvas.remove();
        }
        this.loading = true;
        // eslint-disable-next-line
        setTimeout(() => {
            this.loading = false;
            this.canvas = document.createElement('canvas');
            this.template.querySelector('div.chart').appendChild(this.canvas);
            const ctx = this.canvas.getContext('2d');
            this.chart = new window.Chart(ctx, this.chartJsConfig);
        }, 1000);
    }
}