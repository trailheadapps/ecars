@isTest
public with sharing class Test_WebPushService {
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
    static void testInvokeWebPushServiceSuccess() {
        Test.startTest();

        Lead lead = [SELECT Id FROM Lead LIMIT 1];

        WebPushService.ServiceInput input = new WebPushService.ServiceInput();
        input.message = 'Test Message';
        input.recordId = lead.Id;
        input.setSubscription = true;

        Test.setMock(HttpCalloutMock.class, new WebPushServiceHttpMock(200));

        Boolean response = WebPushService.invokeWebPushService(input);

        Test.stopTest();

        System.assertEquals(response, true);
    }

    @isTest
    static void testInvokeWebPushServiceFailure() {
        Test.startTest();

        Lead lead = [SELECT Id FROM Lead LIMIT 1];

        WebPushService.ServiceInput input = new WebPushService.ServiceInput();
        input.message = 'Test Message';
        input.recordId = lead.Id;
        input.setSubscription = true;

        Test.setMock(HttpCalloutMock.class, new WebPushServiceHttpMock(503));

        try {
            Boolean response = WebPushService.invokeWebPushService(input);
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
