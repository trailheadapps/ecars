@isTest
private class Test_VehicleTriggerHandler {
    static List<Vehicle__c> createVehicles(Integer numberofVehicles) {
        List<Vehicle__c> vehicles = new List<Vehicle__c>();
        for (Integer i = 0; i < numberofVehicles; i++) {
            vehicles.add(
                new Vehicle__c(
                    Exterior_Color__c = 'Pulsar_Red',
                    Interior_Color__c = 'Vegan_Tan',
                    Model__c = 'Model One',
                    Status__c = 'Available',
                    Year__c = '2020',
                    Package__c = 'Standard',
                    VIN__C = 'ABCD' + i
                )
            );
        }
        insert vehicles;
        return vehicles;
    }

    @isTest
    static void testTaskCreationPositive() {
        List<Vehicle__c> lstVehicle = createVehicles(1);
        Test.startTest();
        lstVehicle[0].Status__c = 'Sold';
        update lstVehicle;
        Test.stopTest();
        List<Task> lstTasks = [SELECT Id, WhatId, OwnerId, Subject FROM Task];
        String taskSubject = String.format(
            VehicleTriggerHandler.subject,
            new List<Object>{ lstVehicle[0].Model__c }
        );
        System.assertEquals(
            1,
            lstTasks.size(),
            'Expected task record count as 1 but received ' + lstTasks.size()
        );
        System.assertEquals(
            lstVehicle[0].Id,
            lstTasks[0].WhatId,
            'Expected ' +
            lstVehicle[0].Id +
            ' but received ' +
            lstTasks[0].WhatId
        );
        System.assertEquals(
            UserInfo.getUserId(),
            lstTasks[0].OwnerId,
            'Expected ' +
            UserInfo.getUserId() +
            ' but received ' +
            lstTasks[0].OwnerId
        );
        System.assertEquals(
            taskSubject,
            lstTasks[0].Subject,
            'Expected ' +
            taskSubject +
            ' but received ' +
            lstTasks[0].Subject
        );
    }
    @isTest
    static void testTaskCreationNegative() {
        List<Vehicle__c> lstVehicle = createVehicles(1);
        Test.startTest();
        lstVehicle[0].Status__c = 'On Hold';
        update lstVehicle;
        Test.stopTest();
        List<Task> lstTasks = [SELECT Id, WhatId, OwnerId, Subject FROM Task];
        System.assertEquals(
            0,
            lstTasks.size(),
            'Expected task record count as 1 but received ' + lstTasks.size()
        );
    }

    @isTest
    static void testBulkTaskCreation() {
        Map<Id, Vehicle__c> vehicleMap = new Map<Id, Vehicle__c>();
        List<Vehicle__c> lstVehicle = createVehicles(200);
        Test.startTest();
        for (Vehicle__c vehicle : lstVehicle) {
            vehicleMap.put(vehicle.Id, vehicle);
            vehicle.Status__c = 'Sold';
        }
        update lstVehicle;
        Test.stopTest();
        List<Task> lstTasks = [SELECT Id, WhatId, OwnerId, Subject FROM Task];
        System.assertEquals(
            lstVehicle.size(),
            lstTasks.size(),
            'Expected task record count as ' +
            lstVehicle.size() +
            'but received ' +
            lstTasks.size()
        );
        for (Task task : lstTasks) {
            String taskSubject = String.format(
                VehicleTriggerHandler.subject,
                new List<Object>{ vehicleMap.get(task.WhatId).Model__c }
            );
            System.assertEquals(
                vehicleMap.get(task.WhatId).Id,
                task.WhatId,
                'Expected ' +
                vehicleMap.get(task.WhatId).Id +
                ' but received ' +
                task.WhatId
            );
            System.assertEquals(
                UserInfo.getUserId(),
                task.OwnerId,
                'Expected ' +
                UserInfo.getUserId() +
                ' but received ' +
                task.OwnerId
            );
            System.assertEquals(
                taskSubject,
                task.Subject,
                'Expected ' +
                taskSubject +
                ' but received ' +
                task.Subject
            );
        }
    }
}
