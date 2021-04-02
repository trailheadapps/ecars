@isTest
public class Test_CarOptionsController {
    @testSetup
    static void setup() {
        Car__c car = new Car__c();
        insert car;

        Car_Configuration__c configuration = new Car_Configuration__c(
            Car__c = car.Id
        );
        insert configuration;

        Car_Options__c options = new Car_Options__c(
            Car_Configuration__c = configuration.Id,
            Range__c = 'Long_Range',
            Exterior_Color__c = 'VIP_Black',
            Interior_Color__c = 'Vegan_Tan'
        );

        insert options;

        Vehicle_Order__c order = new Vehicle_Order__c(
            Configuration__c = configuration.Id
        );
        insert order;
    }

    @isTest
    static void testGetCarOptions() {
        Test.startTest();

        Car_Configuration__c testCarConfiguration = [
            SELECT Id
            FROM Car_Configuration__c
        ];
        Car_Options__c options = CarOptionsController.getCarOptions(
            testCarConfiguration.Id
        );

        Test.stopTest();

        System.assertEquals(options.Range__c, 'Long Range');
        System.assertEquals(options.Exterior_Color__c, 'VIP Black');
        System.assertEquals(options.Interior_Color__c, 'Vegan Tan');
    }

    @isTest
    static void testGetOrderCarOptions() {
        Test.startTest();

        Vehicle_Order__c order = [SELECT Id FROM Vehicle_Order__c];

        Car_Options__c options = CarOptionsController.getOrderCarOptions(
            order.Id
        );

        Test.stopTest();

        System.assertEquals(options.Range__c, 'Long Range');
        System.assertEquals(options.Exterior_Color__c, 'VIP Black');
        System.assertEquals(options.Interior_Color__c, 'Vegan Tan');
    }
}