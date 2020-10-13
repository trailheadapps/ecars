export const chartConfig = {
    type: 'line',
    data: {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        datasets: [
            {
                label: 'mpge',
                backgroundColor: 'rgb(201, 203, 207)',
                borderWidth: 3,
                hidden: false,
                data: [3, 5, 6, 7, 2],
                fill: false
            },
            {
                label: 'battery',
                backgroundColor: 'rgb(75, 192, 192)',
                borderWidth: 2,
                hidden: false,
                data: [3, 5, 6, 7, 2],
                fill: false
            },
            {
                label: 'range',
                backgroundColor: 'rgb(54, 162, 235)',
                borderWidth: 2,
                hidden: false,
                data: [3, 5, 6, 7, 2],
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        title: {
            display: false,
            text: 'Pressure Points'
        },
        tooltips: {
            mode: 'index',
            intersect: false
        },
        legend: {
            display: true
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
                    min: -3,
                    scaleLabel: {
                        display: false
                    }
                }
            ],
            yAxes: [
                {
                    display: true,
                    ticks: {
                        suggestedMax: 140,
                        beginAtZero: true
                    }
                }
            ]
        },
        annotation: {
            drawTime: 'afterDatasetsDraw',
            annotations: [
                {
                    type: 'line',
                    mode: 'horizontal',
                    scaleID: 'y-axis-0',
                    value: 8,
                    borderColor: 'red',
                    borderWidth: 2,
                    label: {
                        backgroundColor: 'red',
                        content: 'Test Label',
                        enabled: false
                    }
                },
                {
                    type: 'line',
                    mode: 'horizontal',
                    scaleID: 'y-axis-0',
                    value: '6',
                    borderColor: 'orange',
                    borderWidth: 2,
                    label: {
                        backgroundColor: 'red',
                        content: 'Test Label',
                        enabled: false
                    }
                }
            ]
        }
    }
};
