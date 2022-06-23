public with sharing class DataProvider_Org {
    public static Organization getOrgInfo(String recordId) {
      Organization org = [SELECT Name, OrganizationType, PrimaryContact FROM Organization WHERE Id = :recordId];
      return org;
    }
  }