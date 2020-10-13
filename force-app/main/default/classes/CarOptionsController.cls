public with sharing class CarOptionsController {
    @AuraEnabled(cacheable=true)
    public static Car_Options__c getCarOptions(Id recordId) {
        return [
            SELECT
                toLabel(Range__c),
                toLabel(Exterior_Color__c),
                toLabel(Interior_Color__c)
            FROM Car_Options__c
            WHERE Car_Configuration__c = :recordId
            WITH SECURITY_ENFORCED
            LIMIT 1
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Car_Options__c getOrderCarOptions(Id recordId) {
        Vehicle_Order__c order = [
            SELECT Id, Configuration__c
            FROM Vehicle_Order__c
            WHERE Id = :recordId
            WITH SECURITY_ENFORCED
        ];
        Id configurationId = order.Configuration__c;

        return [
            SELECT
                toLabel(Range__c),
                toLabel(Exterior_Color__c),
                toLabel(Interior_Color__c)
            FROM Car_Options__c
            WHERE Car_Configuration__c = :configurationId
            WITH SECURITY_ENFORCED
            LIMIT 1
        ];
    }
}
