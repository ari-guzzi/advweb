<script>
    import { onMount, onDestroy } from 'svelte';
    import { writable } from 'svelte/store';
    import { read, utils } from 'xlsx';
    import Chart from 'chart.js/auto';
    import { goto } from '$app/navigation';

    let fileUrl = writable('');
    let rawData = writable([]);
    let selectedColumns = writable(new Set());
    let chartType = writable('line');
    let chartData = writable({});
    let chart = null;
    let canvas;
    let loadError = writable(false);
    let xAxisColumn = writable('');
    let yAxisColumn = writable('');
    let borderColor = writable('#4bc0c0');
    let segmentColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FFCD56']; 

    function goBack() {
      goto(`/dashboard`); // Navigate to dashboard page
}

    onMount(async () => {
        const url = sessionStorage.getItem('selectedFileUrl');
        fileUrl.set(url);
        if (url) {
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const workbook = read(arrayBuffer, { type: 'buffer' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                rawData.set(utils.sheet_to_json(worksheet, { header: 1 }));
            } catch (error) {
                console.error("Error loading data:", error);
                rawData.set([]);
            }
        }
        initializeChart(); 
    });

    function initializeChart() { // Sets up a new chart or resets the existing one
        if(chart) chart.destroy();
        const ctx = canvas.getContext('2d');
        chart = new Chart(ctx, {
            type: $chartType,
            data: { labels: [], datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true }
                },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { enabled: true }
                }
            }
        });
    }

    $: if ($rawData && $rawData.length > 0 && $xAxisColumn && $yAxisColumn) { // Updates the chart data whenever anything changes
        const data = transformDataForChart($rawData, $xAxisColumn, $yAxisColumn);
        chart.data = data;
        chart.update();
    }

    function getSelectedData(data, selectedCols) { // Retrieves selected data based on column selections
        if (data.length === 0 || selectedCols.size === 0) return [];
        const colIndexes = Array.from(selectedCols).map(header => data[0].indexOf(header));
        return data.map(row => colIndexes.map(index => row[index]));
    }


function transformDataForChart(data, xAxis, yAxis) { // Transforms raw data from datasheet into chart data format
        if (!data || data.length === 0 || !data[0]) {
            console.error('Data is not loaded or empty');
            return { labels: [], datasets: [] };
        }
        
        const headers = data[0];
        const xIndex = headers.indexOf(xAxis);
        const yIndex = headers.indexOf(yAxis);

        if (xIndex === -1 || yIndex === -1) {
            console.error('Selected columns not found in data headers');
            return { labels: [], datasets: [] };
        }

        const labels = data.slice(1).map(row => row[xIndex] || '');
        const dataPoints = data.slice(1).map(row => row[yIndex] || 0);
        const backgroundColors = dataPoints.map((_, index) => segmentColors[index % segmentColors.length]);

        return {
            labels,
            datasets: [{
                label: `${xAxis} vs ${yAxis}`,
                font: {
                            size: 18, 
                            fontWeight: 'bold'
                        },
                data: dataPoints,
                backgroundColor: backgroundColors, // Makes different ones for pie and bar chart
                //backgroundColor: 'rgba(75, 192, 192, .2)', // Makes all one background color
                borderColor: $borderColor
            }],
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 18,
                            fontWeight: 'bold' 
                        }
                    }
                }
            }
        };
    }


    function toggleColumn(column) {
        selectedColumns.update(current => {
            const newSet = new Set(current);
            if (newSet.has(column)) newSet.delete(column);
            else newSet.add(column);
            return newSet;
        });
    }
    function updateChartColor() {
    const newColor = document.getElementById('borderColorPicker').value;
    borderColor.set(newColor);
    createChart(); // Re-create the chart with the new color
}

$: borderColor, () => { // Updates chart's border color
    if (chart && $borderColor) {
        chart.data.datasets.forEach(dataset => {
            dataset.borderColor = $borderColor;
        });
        chart.update();
    }
};

    function createChart() {  // Creates a new chart with the current data
    const ctx = canvas.getContext('2d');
    if (chart) {
        chart.destroy();
    }

    const transformedData = transformDataForChart(getSelectedData($rawData, $selectedColumns), $xAxisColumn, $yAxisColumn);

    chart = new Chart(ctx, {
        type: $chartType,
        data: transformedData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    ticks: {
                        color: 'rgba(0, 0, 0, .7)',
                    },
                    title: {
                        display: true,
                        text: $xAxisColumn,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    ticks: {
                        color: 'rgba(0, 0, 0, .7)',
                    },
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: $yAxisColumn,
                        font: {
                            size: 16,
                            weight: 'bold',
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    enabled: true
                },
                title: {
                    display: true,
                    text: `${$xAxisColumn} vs ${$yAxisColumn}`, // Chart title
                    font: {
                        size: 24,
                        weight: 'bold'
                    },
                    padding: 20,
                    align: 'top'
                }
            }
        }
    });

    chart.data.datasets.forEach(dataset => {  // Apply the border color
        dataset.borderColor = $borderColor;
    });

    chart.update(); 
}

onDestroy(() => {
        if (chart) chart.destroy();
    });

function downloadChart() { // Downloads the chart as an image
    if (chart) {
        const imageUrl = chart.toBase64Image(); 
        const downloadLink = document.createElement('a');
        downloadLink.href = imageUrl; 
        downloadLink.download =  "my_chart.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    } else {
        console.log("No chart available to download");
    }
}
</script> 

<div class="mainContainer">
    <div class="headerContainer">
        <h1>Visualize Data</h1>
    <button class = "button" on:click={goBack}>
        Back  
      </button>
   
</div>
    <div class="controls">
        <label for="chartType">Chart Type:</label>
        <select id="chartType" bind:value={$chartType}>
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
        </select>
    </div>

    <div class="controls">
        {#if $rawData.length > 0 && $rawData[0]}
            <label for="xAxisColumn">X-Axis:</label>
            <select bind:value={$xAxisColumn}>
                {#each $rawData[0] as column}
                    <option value="{column}">{column}</option>
                {/each}
            </select>
    
            <label for="yAxisColumn">Y-Axis:</label>
            <select bind:value={$yAxisColumn}>
                {#each $rawData[0] as column}
                    <option value="{column}">{column}</option>
                {/each}
            </select>
        {:else}
            <p>Loading columns or no data found...</p>
        {/if}
    </div>
    <label for="borderColorPicker">Choose Graph Color:</label>
    <input type="color" id="borderColorPicker"bind:value={$borderColor}>
    <button class="colorButton" onclick="updateChartColor()">Update Color</button>
    <p>Click <strong>Visualize Data</strong> after selecting your axes and color to see your chart! </p><br>
    <button class = "button" on:click={createChart}>Visualize Data</button><br>
    <button class = "button" on:click={downloadChart}>Download Chart</button>
    <canvas bind:this={canvas}></canvas>

    <!-- Display data -->
    {#if $rawData.length > 0}
        <table>
            {#each $rawData as row, index}
                <tr>
                    {#each row as cell}
                        <td>{cell}</td>
                    {/each}
                </tr>
            {/each}
        </table>
    {:else}
        <p>No data or failed to load data.</p>
    {/if}
</div>


<style>
    .headerContainer button {
        font-family:  "Arapey", serif;
        background: darkorchid;
        color: white;
        border: none;
        width: 4.5%;
        font-weight: 700;
        display: flex;
        text-align: center;
        cursor: pointer;
    }
    .headerContainer button:hover {
        opacity: 0.7;
    }
.headerContainer {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
table {
    background-color: gray;
    max-width: 100%;
    border-collapse: collapse;
}
.button {
    font-family:  "Arapey", serif;
        background: darkorchid;
        color: white;
        border: none;
        padding: 1em;
        width: 10%;
        border-radius: 1em;
        cursor: pointer;
        font-size: 1rem;
        display: grid;
        place-items: center;
    }

   .button:hover {
        background: plum;
    }
    .colorButton {
        font-family:  "Arapey", serif;
        background: darkorchid;
        color: white;
        border: none;
        padding: 1em;
        width: 6%;
        border-radius: 1em;
        cursor: pointer;
        font-size: .8rem;
        display: grid;
        place-items: center;
        margin: .3125em;
    }

   .colorButton:hover {
        background: plum;
    }
 td {
    border: .0625em solid #ccc;
    padding: 2em;
    text-align: left;
}
    canvas {
      width: 100%;
      height: 25em;
      background-color: white;
    }
.controls{
    font-family: "Arapey", serif;
}
  </style>
  