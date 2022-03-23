export default class getAvailableCarOptions {
    connected = false;
    modelName;

    constructor(dataCallback) {
        this.dataCallback = dataCallback;
    }

    connect() {
        this.connected = true;
        this.fetchList(this.modelName);
    }

    disconnect() {
        this.connected = false;
    }

    update(config) {
        if (this.modelName !== config.modelName) {
            this.modelName = config.modelName;
            this.fetchList(this.modelName);
        }
    }

    async fetchList(modelName){
        if (this.connected && this.modelName !== undefined){
            const response = await fetch('/api/getAvailableCarOptions?modelName='+modelName);
            const results = await response.json();
            this.dataCallback(Object.assign({}, results));
        } else {
            this.dataCallback(null);
        }
    } 
}