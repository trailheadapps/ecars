public class ActionDispatcher_OrgInfo extends Slack.ActionDispatcher {
    public override Slack.ActionHandler invoke(Map<String, Object> parameters, Slack.RequestContext context) {
      // The Slack action handler is instantiated and returned
      return Slack.ActionHandler.pushModal(new Handler(parameters, context));
    }
  
    public class Handler implements Slack.ModalHandler {
      Map<String, Object> parameters;
      Slack.RequestContext context;
  
      public Handler(Map<String, Object> parameters, Slack.RequestContext context) {
        this.parameters = parameters;
        this.context = context;
      }
  
      // The class creates a modal view that is returned to the user
      public Slack.ModalView call() {
  
        // We then call a view reference
        Slack.ViewReference viewReference = Slack.View.org_info_modal.get();
  
        // Set paramaters on the view reference using Salesforce data and methods
        viewReference.setParameter('organizationId', UserInfo.getOrganizationId());
  
        // We build the modal view and return it to the UI
        Slack.ModalView modalView = new Slack.ModalView.builder().viewReference(viewReference).build();
        return modalView;
      }
    }
  }