import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import { chartConfig } from './chartConfig';
import chartjs from '@salesforce/resourceUrl/chart';

export default class LiveData extends LightningElement {
    @track chartJsConfig = chartConfig;
    @track wsData = [];
    buttonLabel = 'Pause';
    chart;
    error;
    firstCar;

    _isInitialized = false;
    _updateChart = true;

    renderedCallback() {
        if (this._isInitialized) {
            return;
        }
        this._isInitialized = true;

        loadScript(this, chartjs)
            .then(() => {
                const canvas = document.createElement('canvas');
                this.template.querySelector('div.chart').appendChild(canvas);
                const ctx = canvas.getContext('2d');
                this.chart = new window.Chart(ctx, this.chartJsConfig);
                const ws = new window.WebSocket('wss://example.herokuapp.com');
                // For the simplicity of this demo we are just listening to the
                // first car that sends its telemetry data.
                //
                // In an upcoming iteration of eCars this will be enhanced by
                // specifying a car from Postgres
                ws.onmessage = (event) => {
                    if (!this._updateChart) return;
                    // A double JSON.parse is needed due to how the WebSocket message is sent
                    const wsElement = JSON.parse(JSON.parse(event.data));
                    if (!this.firstCar) {
                        this.firstCar = wsElement.name;
                    }

                    if (wsElement.name === this.firstCar) {
                        this.wsData.push(wsElement);
                        this.chart.data.datasets[0].data.push(wsElement.mpge);
                        this.chart.data.datasets[1].data.push(
                            wsElement.battery
                        );
                        this.chart.data.datasets[2].data.push(wsElement.range);
                        if (this.chart.data.datasets[0].data.length > 10) {
                            this.chart.data.datasets[0].data.splice(0, 1);
                            this.chart.data.datasets[1].data.splice(0, 1);
                            this.chart.data.datasets[2].data.splice(0, 1);
                        }
                        this.chart.update();
                    }
                };
            })
            .catch((error) => {
                this.error = error;
            });
    }

    handleButtonClick() {
        this.buttonLabel = this._updateChart ? 'Resume' : 'Pause';
        this._updateChart = !this._updateChart;
    }
}
