export const chartConfig = {
    type: 'line',
    data: {
        labels: [
            '0mi',
            '10mi',
            '20mi',
            '30mi',
            '40mi',
            '50mi',
            '60mi',
            '70mi',
            '80mi',
            '90mi',
            '100mi'
        ],
        datasets: [
            {
                label: 'Estimated',
                backgroundColor: 'rgb(201, 203, 207)',
                borderWidth: 2,
                hidden: false,
                data: [82, 80, 78, 76, 74, 72, 70, 68, 66, 64, 62],
                fill: false
            },
            {
                label: 'Actual',
                backgroundColor: '#FF0000',
                borderColor: '#FF0000',
                borderWidth: 2,
                hidden: false,
                data: [82, 79, 75, 73, 70, 64, 58, 52, 46, 40, 32],
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        title: {
            display: false,
            text: 'Battery'
        },
        tooltips: {
            mode: 'index',
            intersect: false
        },
        legend: {
            display: true,
            position: 'bottom',
            align: 'left'
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [
                {
                    display: true,
                    max: 3,
                    min: -3
                }
            ],
            yAxes: [
                {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Remaining Battery %'
                    },
                    ticks: {
                        suggestedMax: 100,
                        beginAtZero: true
                    }
                }
            ]
        }
    }
};
