public with sharing class CarConfigurationController {
    @AuraEnabled(cacheable=true)
    public static CarOptionWrapper getAvailableCarOptions(String modelName) {
        try {
            CarOptionWrapper coWrapper = new CarOptionWrapper();
            Map<String, List<CarOption>> allOptions = new Map<String, List<CarOption>>();
            Car__c model = [
                SELECT
                    Id,
                    toLabel(Available_Exterior_Colors__c),
                    toLabel(Available_Interior_Colors__c),
                    toLabel(Available_Ranges__c),
                    Base_Price__c
                FROM Car__c
                WHERE Name = :modelName
                LIMIT 1
            ];
            if (model.Available_Exterior_Colors__c != null) {
                List<CarOption> options = new List<CarOption>();
                Integer addOnPrice = 0;
                for (String s : model.Available_Exterior_Colors__c.split(';')) {
                    CarOption co = new CarOption();
                    co.label = s;
                    co.addOnprice = addOnPrice;
                    co.code = co.label.split(' ')[1].toLowerCase();
                    options.add(co);
                    addOnPrice += 1000;
                }
                allOptions.put('ExteriorColors', options);
            }
            if (model.Available_Interior_Colors__c != null) {
                List<CarOption> options = new List<CarOption>();
                Integer addOnPrice = 0;
                for (String s : model.Available_Interior_Colors__c.split(';')) {
                    CarOption co = new CarOption();
                    co.label = s;
                    co.addOnprice = addOnPrice;
                    co.code = co.label.split(' ')[1].toLowerCase();
                    options.add(co);
                    addOnPrice += 1000;
                }
                allOptions.put('InteriorColors', options);
            }
            if (model.Available_Ranges__c != null) {
                List<CarOption> options = new List<CarOption>();
                Decimal addOnPrice = model.Base_Price__c;
                for (String s : model.Available_Ranges__c.split(';')) {
                    CarOption co = new CarOption();
                    co.label = s;
                    co.addOnprice = addOnPrice;
                    co.code = co.label.split(' ')[0].toLowerCase();
                    options.add(co);
                    addOnPrice += 10000;
                }
                allOptions.put('RangeOptions', options);
            }
            coWrapper.recordId = model.Id;
            coWrapper.allOptions = allOptions;
            return coWrapper;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class CarOptionWrapper {
        @AuraEnabled
        public String recordId;
        @AuraEnabled
        public Map<String, List<CarOption>> allOptions;
    }

    public class CarOption {
        @AuraEnabled
        public String label;
        @AuraEnabled
        public Decimal addOnprice;
        @AuraEnabled
        public String code;
    }
}
