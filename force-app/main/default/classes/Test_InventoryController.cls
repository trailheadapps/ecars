@isTest
public class Test_InventoryController {
    @testSetup
    static void setup() {
        List<Vehicle__c> vehicles = new List<Vehicle__c>();

        for (Integer i = 0; i < 25; i++) {
            vehicles.add(
                new Vehicle__c(
                    Exterior_Color__c = 'Pulsar_Red',
                    Interior_Color__c = 'Vegan_Tan',
                    Model__c = 'Model One',
                    Status__c = 'Available',
                    Year__c = '2020',
                    Package__c = 'Standard',
                    VIN__C = 'ABCD'
                )
            );
        }

        insert vehicles;
    }

    @isTest
    static void testGetVehicles() {
        Test.startTest();

        List<Vehicle__c> vehicles = (List<Vehicle__c>) InventoryController.getVehicles();

        System.assertEquals(vehicles.size(), 20);

        Vehicle__c vehicle = vehicles.get(0);

        Test.stopTest();

        System.assertEquals(vehicle.Exterior_Color__c, 'Pulsar_Red');
        System.assertEquals(vehicle.Interior_Color__c, 'Vegan_Tan');
        System.assertEquals(vehicle.Model__c, 'Model One');
        System.assertEquals(vehicle.Status__c, 'Available');
        System.assertEquals(vehicle.Year__c, '2020');
        System.assertEquals(vehicle.Package__c, 'Standard');
        System.assertEquals(vehicle.VIN__c, 'ABCD');
    }
}
