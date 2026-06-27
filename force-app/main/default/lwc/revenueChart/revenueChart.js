import { LightningElement, wire } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';

import ChartJS from '@salesforce/resourceUrl/ChartJS';

import getRevenueByStage from '@salesforce/apex/OpportunityDashboardController.getRevenueByStage';

export default class RevenueChart extends LightningElement {

    chart;
    chartJsInitialized = false;

    @wire(getRevenueByStage)
    wiredRevenue({ data, error }) {

        if (data) {
            this.initializeChart(data);
        } else if (error) {
            console.error(error);
        }
    }

    initializeChart(data) {

        if (this.chartJsInitialized) {
            return;
        }

        this.chartJsInitialized = true;

        loadScript(this, ChartJS)
            .then(() => {

                const labels = data.map(item => item.stageName);
                const values = data.map(item => item.totalRevenue);

                const ctx = this.template.querySelector('canvas').getContext('2d');

                this.chart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Revenue',
                            data: values
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });

            })
            .catch(error => {
                console.error(error);
            });

    }
}