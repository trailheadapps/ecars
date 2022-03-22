public with sharing class AllocationProcessor {
    // Annotate the method InvocableMethod and give it a label
    @InvocableMethod(label='Generate PDF for allocated vehicle')
    public static List<Boolean> execute(List<Request> requests) {
        // Create a list to hold the response object
        List<Boolean> results = new List<Boolean>();

        // Iterate over the request object that is passed into the method
        for (Request req : requests) {
            // Serialize the request into a payload for the function
            String payload = JSON.serialize(req);

            // Instantiate the function
            functions.Function leaseCalculator = functions.Function.get(
                'ecars.vehicleallocationprocessor'
            );

            // Invoke the function
            functions.FunctionInvocation result = leaseCalculator.invoke(
                payload
            );

            // Process the response
            String response = result.getResponse();
            if (response == 'true') {
                results.add(true);
            } else {
                results.add(false);
            }
        }

        // Return the response to the flow
        return results;
    }

    // The request object that takes input from the flow
    public class Request {
        @InvocableVariable(label='Allocated Vehicle ID' required=true)
        public String vehicleId;
        @InvocableVariable(label='Lead ID' required=true)
        public String leadId;
    }
}
