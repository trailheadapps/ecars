import PdfPrinter from 'pdfmake';
import Salesforce from './Salesforce';
import { createPdfDefinition } from './pdfDefinition';
import streamToBuffer from './streamToBuffer';
import { FastifyLoggerInstance } from 'fastify';

const PATH_PREFIX = __dirname + '/fonts';

export default class PdfGenerator {
    log: FastifyLoggerInstance;
    printer: PdfPrinter;
    fonts = {
        SalesforceSans: {
            bold: `${PATH_PREFIX}/SalesforceSans-Bold.ttf`,
            normal: `${PATH_PREFIX}/SalesforceSans-Regular.ttf`
        },
        SalesforceSansLight: {
            normal: `${PATH_PREFIX}/SalesforceSans-Light.ttf`
        }
    };

    constructor(logger) {
        this.log = logger;
        this.printer = new PdfPrinter(this.fonts);
        this.log.info(`${this.getName()}.init()`);
    }

    public getName(): string {
        return this.constructor.name;
    }

    public async createPdf(data): Promise<any> {
        this.log.info(`${this.getName()}.invoke()`);

        //
        // Connect to Salesforce
        //
        this.log.info('Creating connection to Salesforce');
        const sf = new Salesforce(this.log);
        await sf.createConnection();

        //
        // Query Lead record
        //
        this.log.info(`Getting Name from Lead ID ${data.leadRecordId}`);
        const name = await sf.getNameFromLeadId(data.leadRecordId);

        //
        // Generate PDF
        //
        this.log.info('Generating PDF definition');
        const pdfDoc = this.printer.createPdfKitDocument(
            createPdfDefinition({ ...data, name })
        );
        this.log.info('Generating PDF');
        pdfDoc.end();
        const pdf = await streamToBuffer(pdfDoc);

        //
        // Save PDF to Lead
        //
        this.log.info('Saving PDF to Lead');
        const results = await sf.savePdfToLead(pdf, data.leadRecordId);

        return results;
    }
}
