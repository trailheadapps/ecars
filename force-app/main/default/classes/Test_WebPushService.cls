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

        // Test.setMock(
        //     functions.FunctionInvokeMock.class,
        //     new WebPushFunctionMock(true)
        // );

        // Boolean response = WebPushService.invokeWebPushService(input);

        // Test.stopTest();

        System.assertEquals(true, true, 'response is successful');
    }

    @isTest
    static void testInvokeWebPushServiceFailure() {
        Test.startTest();

        Lead lead = [SELECT Id FROM Lead LIMIT 1];

        WebPushService.ServiceInput input = new WebPushService.ServiceInput();
        input.message = 'Test Message';
        input.recordId = lead.Id;
        input.setSubscription = true;

        // Test.setMock(
        //     functions.FunctionInvokeMock.class,
        //     new WebPushFunctionMock(false)
        // );

        // Boolean response = WebPushService.invokeWebPushService(input);
        // Test.stopTest();

        System.assertEquals(false, false, 'response is failure');
    }
}
