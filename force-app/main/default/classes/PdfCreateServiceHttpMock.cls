global class PdfCreateServiceHttpMock implements HttpCalloutMock {
    Integer statusCode;

    public PdfCreateServiceHttpMock(Integer statusCode) {
        this.statusCode = statusCode;
    }

    global HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setStatusCode(statusCode);
        return res;
    }
}
