public with sharing class WebPushService {
    @AuraEnabled
    public static Boolean invokeWebPushService(ServiceInput input) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Heroku_App/webpush');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json;charset=UTF-8');
        req.setBody(JSON.serialize(input));

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() != 200) {
            String error = String.format('he status code returned was not expected: {0} {1}', 
                new List<String>{res.getStatusCode(), res.getStatus()}
            ); 
            throw new AuraHandledException(error);
        }
        return true;
    }

    @InvocableMethod(label='Web Push Method')
    public static void flowInvokedWebPush(List<Id> ids) {
        System.enqueueJob(new QueuePush());
    }

    public class ServiceInput {
        @AuraEnabled
        public String recordId { get; set; }
        @AuraEnabled
        public String message { get; set; }
        public Boolean setSubscription { get; set; }
    }
}
