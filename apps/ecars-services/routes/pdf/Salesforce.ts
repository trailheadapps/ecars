import * as jsforce from 'jsforce';
import { FastifyBaseLogger } from 'fastify';

export default class Salesforce {
    log: FastifyBaseLogger;
    conn;

    constructor(log) {
        this.log = log;
    }

    public async createConnection() {
        const conn = new jsforce.Connection({
            loginUrl: process.env.SF_LOGIN_URL
        });

        await conn.login(
            process.env.SF_USERNAME,
            process.env.SF_PASSWORD + process.env.SF_TOKEN
        );
        this.conn = conn;
    }

    public async getNameFromLeadId(id) {
        return new Promise((resolve, reject) => {
            return this.conn
                .sobject('Lead')
                .select('Id, Name')
                .where(`ID = '${id}'`)
                .execute((err, records) => {
                    if (err) return reject(err);

                    const name = records[0].Name;
                    this.log.info(`Got name '${name}' from Lead`);

                    return resolve(name);
                });
        });
    }

    public async savePdfToLead(file: Buffer, leadId) {
        //
        // Save PDF as ContentVersion
        //
        this.log.info('Saving PDF as ContentVersion');
        const cvResults: any = await this.saveAsContentVersion(file);
        this.log.info(
            `ContentVersion insert results ${JSON.stringify(cvResults)}`
        );

        //
        // Get ContentDocument ID
        //
        this.log.info(
            `Getting ContentDocument ID for ContentVersion ID ${cvResults.id}`
        );
        const contentDocumentId = await this.getContentDocumentId(cvResults.id);
        this.log.info(
            `ContentDocument query results ${JSON.stringify(contentDocumentId)}`
        );

        //
        // Link PDF ContentDocument to Lead
        //
        this.log.info('Creating ContentDocumentLink record');
        const cdlResults = await this.createContentDocumentLink(
            contentDocumentId,
            leadId
        );
        this.log.info(
            `ContentDocumentLink insert results ${JSON.stringify(cdlResults)}`
        );

        return { contentDocumentId };
    }

    private async saveAsContentVersion(file: Buffer) {
        // Save pdf to account
        // Example for creating ContentVersion record to store the attachment (for now we only store the generated PDF)
        // https://gist.github.com/elliotttn/3b43f35c7d9316bfb9dd1f70328f2eb5#file-apexfileupload-cls-L40
        const filename = 'Your Car Order.pdf';
        return new Promise((resolve, reject) => {
            return this.conn.sobject('ContentVersion').create(
                {
                    VersionData: file.toString('base64'),
                    Title: filename,
                    PathOnClient: filename
                },
                (err, ret) => {
                    if (err || !ret.success) return reject({ err, ret });

                    return resolve(ret);
                }
            );
        });
    }

    private async getContentDocumentId(contentVersionId) {
        return new Promise((resolve, reject) => {
            return this.conn
                .sobject('ContentVersion')
                .select('Id, ContentDocumentId')
                .where(`Id = '${contentVersionId}'`)
                .execute((err, records) => {
                    if (err) return reject(err);

                    const id = records[0].ContentDocumentId;
                    this.log.info(`Got ContentDocumentId ${id}`);

                    return resolve(id);
                });
        });
    }

    private async createContentDocumentLink(contentDocumentId, leadRecordId) {
        return new Promise((resolve, reject) => {
            return this.conn.sobject('ContentDocumentLink').create(
                {
                    ContentDocumentId: contentDocumentId,
                    LinkedEntityId: leadRecordId
                },
                (err, ret) => {
                    if (err || !ret.success) return reject({ err, ret });

                    return resolve(ret);
                }
            );
        });
    }
}
