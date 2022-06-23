public with sharing class Slack_SendDeliveryNotification {
  public static void sendDeliveryNotification(Id recordId) {
    DeliveryVehicle__c vehicle = [SELECT Id, RelatedSlackChannel__c from DeliveryVehicle__c LIMIT 1];
    Slack.App app = Slack.App.PulsarMotors.get();
    Slack.BotClient botClient = app.getBotClientForTeam('T037YL440ET');
    Slack.ViewReference viewReference = Slack.View.formatted_message.get();
    viewReference.setParameter('heading', 'New Delivery Route!');
    viewReference.setParameter('body', ':white_check_mark: your new route has been optomized! You can get started by checking it out in Salesforce!');
    Slack.ChatPostMessageRequest req = new Slack.ChatPostMessageRequest.builder()
      .channel(vehicle.RelatedSlackChannel__c)
      .viewReference(viewReference)
      .build();
    Slack.ChatPostMessageResponse response = botClient.ChatPostMessage(req);
  }
}