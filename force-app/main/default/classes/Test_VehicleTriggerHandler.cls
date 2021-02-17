@isTest
private class Test_VehicleTriggerHandler {
    @testSetup
    static void setup() {
        List<Vehicle__c> vehicles = new List<Vehicle__c>();
        for (Integer i = 0; i < 200; i++) {
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
    }

    @isTest
    static void testTaskCreationPositive() {
        List<Vehicle__c> lstVehicle = [
            SELECT Id, Status__c, Model__c
            FROM Vehicle__c
            LIMIT 1
        ];
        Test.startTest();
        lstVehicle[0].Status__c = 'Sold';
        update lstVehicle;
        Test.stopTest();
        List<Task> lstTasks = [SELECT Id, WhatId, OwnerId, Subject FROM Task];
        String taskSubject =
            'The vehicle ' +
            lstVehicle[0].Model__c +
            ' is sold. Call your Sales Director';
        System.assertEquals(
            1,
            lstTasks.size(),
            'Expected task record count as 1 but recieved ' + lstTasks.size()
        );
        System.assertEquals(
            lstVehicle[0].Id,
            lstTasks[0].WhatId,
            'Expected ' +
            lstVehicle[0].Id +
            ' but recieved ' +
            lstTasks[0].WhatId
        );
        System.assertEquals(
            UserInfo.getUserId(),
            lstTasks[0].OwnerId,
            'Expected ' +
            UserInfo.getUserId() +
            ' but recieved ' +
            lstTasks[0].OwnerId
        );
        System.assertEquals(
            taskSubject,
            lstTasks[0].Subject,
            'Expected ' +
            taskSubject +
            ' but recieved ' +
            lstTasks[0].Subject
        );
    }
    @isTest
    static void testTaskCreationNegative() {
        List<Vehicle__c> lstVehicle = [
            SELECT Id, Status__c, Model__c
            FROM Vehicle__c
            LIMIT 1
        ];
        Test.startTest();
        lstVehicle[0].Status__c = 'On Hold';
        update lstVehicle;
        Test.stopTest();
        List<Task> lstTasks = [SELECT Id, WhatId, OwnerId, Subject FROM Task];
        String taskSubject =
            'The vehicle ' +
            lstVehicle[0].Model__c +
            ' is sold. Call your Sales Director';
        System.assertEquals(
            0,
            lstTasks.size(),
            'Expected task record count as 1 but recieved ' + lstTasks.size()
        );
    }

    @isTest
    static void testBulkTaskCreation() {
        Map<Id, Vehicle__c> vehicleMap = new Map<Id, Vehicle__c>();
        List<Vehicle__c> lstVehicle = [
            SELECT Id, Status__c, Model__c
            FROM Vehicle__c
        ];
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
            'but recieved ' +
            lstTasks.size()
        );
        for (Task task : lstTasks) {
            String taskSubject =
                'The vehicle ' +
                vehicleMap.get(task.WhatId).Model__c +
                ' is sold. Call your Sales Director';
            System.assertEquals(
                vehicleMap.get(task.WhatId).Id,
                task.WhatId,
                'Expected ' +
                vehicleMap.get(task.WhatId).Id +
                ' but recieved ' +
                task.WhatId
            );
            System.assertEquals(
                UserInfo.getUserId(),
                task.OwnerId,
                'Expected ' +
                UserInfo.getUserId() +
                ' but recieved ' +
                task.OwnerId
            );
            System.assertEquals(
                taskSubject,
                task.Subject,
                'Expected ' +
                taskSubject +
                ' but recieved ' +
                task.Subject
            );
        }
    }
}
