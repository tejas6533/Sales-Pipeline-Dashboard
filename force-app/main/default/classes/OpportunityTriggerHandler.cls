public class OpportunityTriggerHandler {

    public static void validateOpportunities(List<Opportunity> oppList){

        for(Opportunity opp : oppList){

            // Amount cannot be negative
            if(opp.Amount != null && opp.Amount < 0){
                opp.Amount.addError('Amount cannot be negative.');
            }

            // Close Date cannot be in the past
            if(opp.CloseDate != null && opp.CloseDate < Date.today()){
                opp.CloseDate.addError('Close Date cannot be in the past.');
            }

            // Closed Won must have Amount > 0
            if(opp.StageName == 'Closed Won'
                && (opp.Amount == null || opp.Amount <= 0)){

                opp.Amount.addError(
                    'Closed Won Opportunity must have Amount greater than zero.'
                );
            }

        }

    }

}