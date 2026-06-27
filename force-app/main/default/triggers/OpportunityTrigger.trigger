trigger OpportunityTrigger on Opportunity (
    before insert,
    before update
) {

    OpportunityTriggerHandler.validateOpportunities(Trigger.new);

}