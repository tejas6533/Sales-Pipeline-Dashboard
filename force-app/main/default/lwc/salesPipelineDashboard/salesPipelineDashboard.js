import { LightningElement, wire } from 'lwc';

import getDashboardSummary from '@salesforce/apex/OpportunityDashboardController.getDashboardSummary';
import getOpportunities from '@salesforce/apex/OpportunityDashboardController.getOpportunities';
import getOpportunityCount from '@salesforce/apex/OpportunityDashboardController.getOpportunityCount';
import searchOpportunities from '@salesforce/apex/OpportunityDashboardController.searchOpportunities';
import filterByStage from '@salesforce/apex/OpportunityDashboardController.filterByStage';

const columns = [
    { label: 'Opportunity', fieldName: 'Name' },
    { label: 'Account', fieldName: 'accountName' },
    { label: 'Stage', fieldName: 'StageName' },
    { label: 'Amount', fieldName: 'Amount', type: 'currency' },
    { label: 'Close Date', fieldName: 'CloseDate', type: 'date' }
];

export default class SalesPipelineDashboard extends LightningElement {

    summary;
    opportunities = [];
    columns = columns;
    error;

    // Pagination
    pageNumber = 1;
    pageSize = 5;
    totalRecords = 0;
    totalPages = 0;

    stageOptions = [
        { label: 'All', value: 'All' },
        { label: 'Prospecting', value: 'Prospecting' },
        { label: 'Qualification', value: 'Qualification' },
        { label: 'Needs Analysis', value: 'Needs Analysis' },
        { label: 'Value Proposition', value: 'Value Proposition' },
        { label: 'Id. Decision Makers', value: 'Id. Decision Makers' },
        { label: 'Perception Analysis', value: 'Perception Analysis' },
        { label: 'Proposal/Price Quote', value: 'Proposal/Price Quote' },
        { label: 'Negotiation/Review', value: 'Negotiation/Review' },
        { label: 'Closed Won', value: 'Closed Won' },
        { label: 'Closed Lost', value: 'Closed Lost' }
    ];

    @wire(getDashboardSummary)
    wiredSummary({ data, error }) {
        if (data) {
            this.summary = data;
        } else if (error) {
            this.error = error;
        }
    }

    connectedCallback() {
        this.loadRecordCount();
    }

    loadRecordCount() {
        getOpportunityCount()
            .then(result => {
                this.totalRecords = result;
                this.totalPages = Math.ceil(result / this.pageSize);
                this.loadOpportunities();
            })
            .catch(error => {
                console.error(error);
            });
    }

    loadOpportunities() {
        getOpportunities({
            pageSize: this.pageSize,
            pageNumber: this.pageNumber
        })
            .then(result => {
                this.opportunities = result.map(row => {
                    return {
                        ...row,
                        accountName: row.Account ? row.Account.Name : ''
                    };
                });
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleSearch(event) {
        const searchKey = event.target.value;

        searchOpportunities({ searchKey })
            .then(result => {
                this.opportunities = result.map(row => {
                    return {
                        ...row,
                        accountName: row.Account ? row.Account.Name : ''
                    };
                });
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleStageChange(event) {
        const stage = event.detail.value;

        filterByStage({ stageName: stage })
            .then(result => {
                this.opportunities = result.map(row => {
                    return {
                        ...row,
                        accountName: row.Account ? row.Account.Name : ''
                    };
                });
            })
            .catch(error => {
                console.error(error);
            });
    }

    previousPage() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.loadOpportunities();
        }
    }

    nextPage() {
        if (this.pageNumber < this.totalPages) {
            this.pageNumber++;
            this.loadOpportunities();
        }
    }

    get disablePrevious() {
        return this.pageNumber === 1;
    }

    get disableNext() {
        return this.pageNumber === this.totalPages;
    }
}