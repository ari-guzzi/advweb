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
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const arrayBuffer = await response.arrayBuffer();
                const workbook = read(arrayBuffer, { type: 'buffer' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                rawData.set(utils.sheet_to_json(worksheet, { header: 1 }));
            } catch (error) {
                console.error("Error loading data:", error);
                rawData.set([]); // Set rawData to an empty array on error
            }
        }
    });

    $: selectedColumnsData = getSelectedData($rawData, $selectedColumns);
    $: chartData.set(transformDataForChart(selectedColumnsData, $chartType));

    function getSelectedData(data, columns) {
        if (data.length === 0 || columns.size === 0) return [];
        return data.map(row => columns.map(column => row[column]));
    }

    function transformDataForChart(data, type) {
        if (data.length === 0) return { labels: [], datasets: [] };
        const labels = data.map(item => item[0]); // Assuming first column is labels
        const dataPoints = data.map(item => item[1]); // Assuming second column is data
        return {
            labels,
            datasets: [{ label: 'Data Overview', data: dataPoints, backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)' }]
        };
    }

    function toggleColumn(column) {
        selectedColumns.update(current => {
            const newSelection = new Set(current);
            if (newSelection.has(column)) newSelection.delete(column);
            else newSelection.add(column);
            return newSelection;
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
    width: 100%;
    border-collapse: collapse;
}
th, td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
}
th {
    background-color: #f4f4f4;
}
    canvas {
      width: 100%;
      height: 400px;
    }
  </style>
  