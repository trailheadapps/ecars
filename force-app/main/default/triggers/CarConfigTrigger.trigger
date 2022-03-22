trigger CarConfigTrigger on Car_Configuration__c(after insert) {
    new CarConfigTriggerHandler().run();
}
