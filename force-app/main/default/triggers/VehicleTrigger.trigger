trigger VehicleTrigger on Vehicle__c(after update) {
    new VehicleTriggerHandler().run();
}
