import PdfGenerator from './PdfGenerator';

export default async ({ data, workerThreadPort }) => {
    // TODO: figure out how to implement all of pino's
    //  log levels in this log object in a non-duplicative way
    const log = {
        info: (msg) => {
            workerThreadPort.postMessage({ level: 'info', text: msg });
        }
    };

    const pdfGenerator = new PdfGenerator(log);
    const response = await pdfGenerator.createPdf(data);

    return JSON.stringify(response);
};
