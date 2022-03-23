@RestResource(urlMapping='/CarConfig/*')
global with sharing class CarConfigurationRest {
    @HttpGet
    global static String doGet() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        String modelName = EncodingUtil.urlDecode(req.requestURI.substring(req.requestURI.lastIndexOf('/')+1), 'UTF-8');
        if(modelName?.length() > 0){
            try{
                CarConfigurationController.CarOptionWrapper cw = CarConfigurationController.getAvailableCarOptions(modelName);
                return JSON.serialize(cw);
            }catch(Exception e){
                return '{}';
            }
        }
        return '{}';
    }
}
