public inherited sharing class VehicleTriggerHandler extends TriggerHandler {
    @TestVisible
    private static String subject = 'The vehicle {0} is sold. Call your Sales Director';

    private List<Vehicle__c> triggerNew;
    private List<Vehicle__c> triggerOld;
    private Map<Id, Vehicle__c> triggerMapNew;
    private Map<Id, Vehicle__c> triggerMapOld;

    public VehicleTriggerHandler() {
        this.triggerOld = (List<Vehicle__c>) Trigger.old;
        this.triggerNew = (List<Vehicle__c>) Trigger.new;
        this.triggerMapNew = (Map<Id, Vehicle__c>) Trigger.newMap;
        this.triggerMapOld = (Map<Id, Vehicle__c>) Trigger.oldMap;
    }

    public override void afterUpdate() {
        List<Task> newTasks = new List<Task>();
        for (Vehicle__c vehicle : triggerNew) {
            if (vehicle.Status__c != triggerMapOld.get(vehicle.Id).Status__c) {
                if (vehicle.Status__c == 'Sold') {
                    Task task = new Task();
                    task.WhatId = vehicle.Id;
                    task.OwnerId = UserInfo.getUserId();
                    task.Subject = String.format(
                        subject,
                        new List<Object>{ vehicle.Model__c }
                    );
                    newTasks.add(task);
                }
            }
        }
        try {
            insert newTasks;
        } catch (exception ex) {
            for (Vehicle__c vehicle : triggerNew) {
                vehicle.addError(
                    'Task Creation Failed with error' + ex.getMessage()
                );
            }
        }
    }
}
