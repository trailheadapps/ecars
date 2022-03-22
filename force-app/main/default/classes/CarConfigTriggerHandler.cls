public inherited sharing class CarConfigTriggerHandler extends TriggerHandler {
    @TestVisible
    private static String subject = 'Allocate a vehicle to the config {0}';

    private List<Car_Configuration__c> triggerNew;
    private Map<Id, Car_Configuration__c> triggerMapNew;

    public CarConfigTriggerHandler() {
        this.triggerNew = (List<Car_Configuration__c>) Trigger.new;
        this.triggerMapNew = (Map<Id, Car_Configuration__c>) Trigger.newMap;
    }

    public override void afterInsert() {
        List<Task> newTasks = new List<Task>();
        for (Car_Configuration__c config : triggerNew) {
            Task task = new Task();
            task.WhatId = config.Id;
            task.OwnerId = UserInfo.getUserId();
            task.Subject = String.format(
                subject,
                new List<Object>{ config.Name }
            );
            newTasks.add(task);
        }
        try {
            insert newTasks;
        } catch (exception ex) {
            for (Car_Configuration__c config : triggerNew) {
                config.addError(
                    'Task Creation Failed with error' + ex.getMessage()
                );
            }
        }
    }
}
