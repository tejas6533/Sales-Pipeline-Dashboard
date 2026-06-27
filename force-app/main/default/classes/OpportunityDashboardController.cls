public with sharing class OpportunityDashboardController {

    // Dashboard Summary Wrapper
    public class DashboardSummary {
        @AuraEnabled public Integer totalOpportunities;
        @AuraEnabled public Decimal totalRevenue;
        @AuraEnabled public Integer closedWonCount;
        @AuraEnabled public Decimal closedWonRevenue;
    }

    @AuraEnabled(cacheable=true)
    public static DashboardSummary getDashboardSummary() {

        DashboardSummary summary = new DashboardSummary();

        summary.totalOpportunities = [
            SELECT COUNT()
            FROM Opportunity
        ];

        AggregateResult totalResult = [
            SELECT SUM(Amount) total
            FROM Opportunity
        ];

        summary.totalRevenue = (Decimal) totalResult.get('total');

        summary.closedWonCount = [
            SELECT COUNT()
            FROM Opportunity
            WHERE StageName = 'Closed Won'
        ];

        AggregateResult wonResult = [
            SELECT SUM(Amount) wonRevenue
            FROM Opportunity
            WHERE StageName = 'Closed Won'
        ];

        summary.closedWonRevenue = (Decimal) wonResult.get('wonRevenue');

        return summary;
    }

    @AuraEnabled(cacheable=true)
public static List<Opportunity> getOpportunities(Integer pageSize, Integer pageNumber){

    Integer offsetValue = (pageNumber - 1) * pageSize;

    return [
        SELECT Id,
               Name,
               Amount,
               StageName,
               CloseDate,
               Account.Name
        FROM Opportunity
        ORDER BY Amount DESC
        LIMIT :pageSize
        OFFSET :offsetValue
    ];
}

    @AuraEnabled(cacheable=true)
    public static List<Opportunity> searchOpportunities(String searchKey) {

        return [
            SELECT Id,
                   Name,
                   Amount,
                   StageName,
                   CloseDate,
                   Account.Name
            FROM Opportunity
            WHERE Name LIKE :('%' + searchKey + '%')
            ORDER BY Amount DESC
            LIMIT 10
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Opportunity> filterByStage(String stageName) {

        if(stageName == 'All') {

            return [
                SELECT Id,
                       Name,
                       Amount,
                       StageName,
                       CloseDate,
                       Account.Name
                FROM Opportunity
                ORDER BY Amount DESC
                LIMIT 10
            ];
        }

        return [
            SELECT Id,
                   Name,
                   Amount,
                   StageName,
                   CloseDate,
                   Account.Name
            FROM Opportunity
            WHERE StageName = :stageName
            ORDER BY Amount DESC
            LIMIT 10
        ];
    }

    // Revenue by Stage Wrapper
    public class StageRevenue {

        @AuraEnabled
        public String stageName;

        @AuraEnabled
        public Decimal totalRevenue;

        public StageRevenue(String stageName, Decimal totalRevenue) {
            this.stageName = stageName;
            this.totalRevenue = totalRevenue;
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<StageRevenue> getRevenueByStage() {

        List<StageRevenue> result = new List<StageRevenue>();

        for (AggregateResult ar : [
            SELECT StageName,
                   SUM(Amount) totalRevenue
            FROM Opportunity
            GROUP BY StageName
        ]) {

            result.add(
                new StageRevenue(
                    (String) ar.get('StageName'),
                    (Decimal) ar.get('totalRevenue')
                )
            );
        }

        return result;
    }
    @AuraEnabled(cacheable=true)
public static Integer getOpportunityCount(){

    return [SELECT COUNT() FROM Opportunity];

}
}