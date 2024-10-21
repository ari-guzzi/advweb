<script>
    import { onMount, onDestroy } from 'svelte';
    import { writable } from 'svelte/store';
    import { read, utils } from 'xlsx';
    import Chart from 'chart.js/auto';

    let fileUrl = writable('');
    let rawData = writable([]);
    let selectedColumns = writable(new Set());
    let chartType = writable('line');
    let chartData = writable({});
    let chart = null;
    let canvas;
    let loadError = writable(false);

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

        const ctx = canvas.getContext('2d');
        chart = new Chart(ctx, {
            type: $chartType,
            data: { labels: [], datasets: [] },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });
        // updates the chart whenever the raw data or selected columns change
    $: {
        const data = transformDataForChart($rawData, $selectedColumns);
        if (chart) {
            chart.data = data;
            chart.update();
        }
    }

    $: selectedColumnsData = getSelectedData($rawData, $selectedColumns);
    $: chartData.set(transformDataForChart(selectedColumnsData, $chartType));

    function getSelectedData(data, columns) {
    console.log("Data:", data);
    console.log("Columns Set:", columns);
    if (data.length === 0 || columns.size === 0) return [];

    // Convert Set to Array
    const columnsArray = Array.from(columns);
    console.log("Columns Array:", columnsArray);

    return data.map(row => columnsArray.map(column => row[column]));
}


function transformDataForChart(data, columns) {
        if (data.length === 0 || columns.size === 0) return { labels: [], datasets: [] };

        const columnsArray = Array.from(columns);
        const labels = data.map(row => row[columnsArray[0]] || '');
        const dataPoints = data.map(row => row[columnsArray[1]] || 0);

        return {
            labels,
            datasets: [{
                label: 'Data Overview',
                data: dataPoints,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)'
            }]
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
    function createChart() {
    const ctx = canvas.getContext('2d');
    // Destroy the existing chart if it exists to avoid memory leaks
    if (chart) {
        chart.destroy();
    }
    
    const transformedData = transformDataForChart(getSelectedData($rawData, $selectedColumns), $chartType);
    
    // Create a new chart instance with the updated data
    chart = new Chart(ctx, {
    type: $chartType,
    data: transformedData,
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                enabled: true
            },
            backgroundColor: 'rgba(93, 93, 93)', // Sets the background color for the entire chart area
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
}
onDestroy(() => {
        if (chart) chart.destroy();
    });

    function handleCheckboxChange(header, event) {
    selectedColumns.update(current => {
        const newSelection = new Set(current);
        if (event.target.checked) {
            newSelection.add(header);
        } else {
            newSelection.delete(header);
        }
        console.log("Updated Columns:", Array.from(newSelection));
        return newSelection;
    });
}
</script> 

<div class="mainContainer">
    <h1>Visualize</h1>
    {#if $fileUrl}
        <p>Visualizing data from: {$fileUrl}</p>
    {/if}

    <div class="controls">
        <label for="chartType">Chart Type:</label>
        <select id="chartType" bind:value={$chartType}>
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
        </select>

        <div class="column-selector">
            <h2>Select Data Columns:</h2>
            {#if $rawData.length > 0}
                {#each $rawData[0] as header, index}
                    <label>
                        <input type="checkbox" 
                               checked={$selectedColumns.has(header)}
                               on:change={(event) => handleCheckboxChange(header, event)}>
                        {header}
                    </label>
                {/each}
            {:else}
                <p>No headers found.</p>
            {/if}
        </div>
    </div>
    <button class = "button" on:click={createChart}>Visualize Data</button>

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
table {
    background-color: gray;
    width: 100%;
    border-collapse: collapse;
}
.button {
        background: darkorchid;
        color: white;
        border: none;
        padding: 9px 0;
        width: 10%;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        display: grid;
        place-items: center;
    }

   .button:hover {
        background: plum;
    }
 td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
}
    canvas {
      width: 100%;
      height: 400px;

    }

  </style>
  