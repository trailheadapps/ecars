@isTest
public with sharing class Test_PdfCreateService {
    @testSetup
    static void setup() {
        Lead carLead = new Lead(
            LastName = 'Lead 1',
            Company = 'Private',
            LeadSource = 'Web'
        );
        insert carLead;
    }

    @isTest
    static void testInvokePdfCreateServiceSuccess() {
        Test.startTest();

        Lead lead = [SELECT Id FROM Lead LIMIT 1];

        PdfCreateService.ServiceInput input = new PdfCreateService.ServiceInput();
        input.exteriorColor = 'VIP Black';
        input.interiorColor = 'Modern Tan';
        input.range = 'Long Range';
        input.price = 45001;
        input.leadRecordId = lead.Id;

        Test.setMock(HttpCalloutMock.class, new PdfCreateServiceHttpMock(200));

        Boolean response = PdfCreateService.invokePdfCreateService(input);

        Test.stopTest();

        System.assertEquals(response, true);
    }

    @isTest
    static void testInvokePdfCreateServiceFailure() {
        Test.startTest();

        Lead lead = [SELECT Id FROM Lead LIMIT 1];

        PdfCreateService.ServiceInput input = new PdfCreateService.ServiceInput();
        input.exteriorColor = 'VIP Black';
        input.interiorColor = 'Modern Tan';
        input.range = 'Long Range';
        input.price = 45000;
        input.leadRecordId = lead.Id;

        Test.setMock(HttpCalloutMock.class, new PdfCreateServiceHttpMock(503));

        try {
            Boolean response = PdfCreateService.invokePdfCreateService(input);
        } catch (Exception e) {
            System.assert(
                e.getMessage()
                    .startsWithIgnoreCase(
                        'The status code returned was not expected: 503'
                    )
            );
        }

        Test.stopTest();
    }
}