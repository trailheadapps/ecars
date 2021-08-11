global class WebPushFunctionMock {
    Boolean success = false;

    public WebPushFunctionMock(Boolean success) {
        this.success = success;
    }

    public String respond(String functionName, String payload) {
        String invocationId = '';
        String response =
            '{ "success": ' +
            (this.success ? 'true' : 'false') +
            ' }';
        // return functions.MockFunctionInvocationFactory.createSuccessResponse(
        //     invocationId,
        //     response
        // );
        return response;
    }
}
