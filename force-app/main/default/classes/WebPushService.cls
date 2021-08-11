public with sharing class WebPushService {
    @AuraEnabled
    public static Boolean invokeWebPushService(ServiceInput input) {
        functions.Function webPushFn = functions.Function.get('ecars.webpush');
        functions.FunctionInvocation invocation = webPushFn.invoke(
            JSON.serialize(input)
        );

        // Check if there is any error during the invocation
        if (
            invocation.getStatus() == functions.FunctionInvocationStatus.ERROR
        ) {
            throw new AuraHandledException(
                (invocation.getError() != null
                    ? invocation.getError().getMessage()
                    : 'UNKNOWN')
            );
        }

        String response = invocation.getResponse();
        ServiceOutput output = (ServiceOutput) JSON.deserialize(
            response,
            ServiceOutput.class
        );

        return output.success;
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

    public class ServiceOutput {
        public Boolean success { get; set; }
        public String message { get; set; }
    }
}
