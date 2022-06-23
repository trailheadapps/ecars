public with sharing class DeliveryRouteController {
    @AuraEnabled
    public static List<DeliveryWaypoint__c> getWaypoints(Id recordId) {
        try {
            functions.Function fn = functions.Function.get(
                'ecars.routeplanner'
            );
            functions.FunctionInvocation invocation = fn.invoke(
                '{ "deliveryVehicleId": "' +
                recordId +
                '" }'
            );

            // Check if there is any error during the invocation
            if (
                invocation.getStatus() ==
                functions.FunctionInvocationStatus.ERROR
            ) {
                String errorMessage = invocation.getError() != null
                    ? invocation.getError().getMessage()
                    : 'UNKNOWN';
                System.debug(errorMessage);
                throw new CalloutException(errorMessage);
            }

            String response = invocation.getResponse();
            Slack_SendDeliveryNotification.sendDeliveryNotification(recordId);
            return [
                SELECT
                    Name,
                    Vehicle_Order__r.Name,
                    Vehicle_Order__r.Service_Location__Latitude__s,
                    Vehicle_Order__r.Service_Location__Longitude__s,
                    Vehicle_Order__r.Customer__r.Name,
                    Vehicle_Order__r.Service_Address__c,
                    Number__c
                FROM DeliveryWaypoint__c
                ORDER BY CreatedDate DESC
                LIMIT 5
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}