public with sharing class PdfCreateService {
    @AuraEnabled
    public static Boolean invokePdfCreateService(ServiceInput input) {
        /*HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Heroku_App/pdf');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json;charset=UTF-8');
        req.setTimeout(30000);
        req.setBody(JSON.serialize(input));

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() != 200) {
            String error =
                'The status code returned was not expected: ' +
                res.getStatusCode() +
                ' ' +
                res.getStatus();
            AuraHandledException e = new AuraHandledException(error);
            e.setMessage(error);
            throw e;
        }*/

        return true;
    }

    @testVisible
    class ServiceInput {
        @AuraEnabled
        public String exteriorColor { get; set; }
        @AuraEnabled
        public String interiorColor { get; set; }
        @AuraEnabled
        public String range { get; set; }
        @AuraEnabled
        public Decimal price { get; set; }
        @AuraEnabled
        public Id leadRecordId { get; set; }
    }
}
