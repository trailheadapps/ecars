import PdfPrinter from 'pdfmake';
import { createPdfDefinition } from './pdfDefinition.js';
import streamToBuffer from './streamToBuffer.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PATH_PREFIX = __dirname + '/fonts';
const fonts = {
    SalesforceSans: {
        bold: `${PATH_PREFIX}/SalesforceSans-Bold.ttf`,
        normal: `${PATH_PREFIX}/SalesforceSans-Regular.ttf`
    },
    SalesforceSansLight: {
        normal: `${PATH_PREFIX}/SalesforceSans-Light.ttf`
    }
};

export default async function (event, context, logger) {
    logger.info(
        `Invoking VehicleAllocationProcessor with payload ${JSON.stringify(
            event.data || {}
        )}`
    );

    try {
        // Assign the properties from the invocation payload
        const { vehicleId, leadId } = event.data;

        // Query data from Salesforce
        const vehicleResult = await context.org.dataApi.query(
            `SELECT Id, Vin__c, Year__c, Interior_Color__c, Exterior_Color__c, Range__c from Vehicle__c where Id='${vehicleId}'`
        );
        const leadResult = await context.org.dataApi.query(
            `SELECT Id, Name, Email from Lead where Id='${leadId}'`
        );

        // Create a PDF
        const printer = new PdfPrinter(fonts);
        const customerName = leadResult.records[0].fields['name'];
        const pdfDoc = printer.createPdfKitDocument(
            createPdfDefinition({
                exteriorColor:
                    vehicleResult.records[0].fields['exterior_color__c'],
                interiorColor:
                    vehicleResult.records[0].fields['interior_color__c'],
                range: vehicleResult.records[0].fields['range__c'],
                year: vehicleResult.records[0].fields['year__c'],
                vin: vehicleResult.records[0].fields['vin__c'],
                customerName,
                leadId
            })
        );
        pdfDoc.end();
        const pdf = await streamToBuffer(pdfDoc);

        // Save PDF as an attachment to the Vehicle and Lead objects
        const fileName = `${customerName}'s Car Allocation.pdf`;
        const createContentVersionResult = await context.org.dataApi.create({
            type: 'ContentVersion',
            fields: {
                VersionData: pdf.toString('base64'),
                Title: fileName,
                PathOnClient: fileName
            }
        });
        const contentVersionResult = await context.org.dataApi.query(
            `SELECT Id, ContentDocumentId from ContentVersion where Id='${createContentVersionResult.id}'`
        );
        const contentDocumentId =
            contentVersionResult.records[0].fields['contentdocumentid'];

        // Create a unit of work that inserts multiple objects.
        const uow = context.org.dataApi.newUnitOfWork();
        uow.registerCreate({
            type: 'ContentDocumentLink',
            fields: {
                ContentDocumentId: contentDocumentId,
                LinkedEntityId: vehicleId
            }
        });
        uow.registerCreate({
            type: 'ContentDocumentLink',
            fields: {
                ContentDocumentId: contentDocumentId,
                LinkedEntityId: leadId
            }
        });
        await context.org.dataApi.commitUnitOfWork(uow);

        return true;
    } catch (err) {
        logger.error(err.message);
        throw new Error(err.message);
    }
}
