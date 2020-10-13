global class WebPushServiceHttpMock implements HttpCalloutMock {
    Integer statusCode;

    public WebPushServiceHttpMock(Integer statusCode) {
        this.statusCode = statusCode;
    }

    global HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setStatusCode(statusCode);
        return res;
    }
}
