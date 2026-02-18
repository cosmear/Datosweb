document.addEventListener('DOMContentLoaded', () => {
    // Clock
    function updateTime() {
        const now = new Date();
        document.getElementById('current-time').textContent = now.toLocaleTimeString('es-ES');
    }
    setInterval(updateTime, 1000);
    updateTime();

    // Initialize Charts
    const lineChartDom = document.getElementById('lineChart');
    const pieChartDom = document.getElementById('pieChart');
    const barChartDom = document.getElementById('barChart');
    const radarChartDom = document.getElementById('radarChart');
    const hBarChartDom = document.getElementById('hBarChart');
    const gaugeChartDom = document.getElementById('gaugeChart');
    const funnelChartDom = document.getElementById('funnelChart');

    // Init ECharts instances if elements exist
    const lineChart = lineChartDom ? echarts.init(lineChartDom, 'dark') : null;
    const pieChart = pieChartDom ? echarts.init(pieChartDom, 'dark') : null;
    const barChart = barChartDom ? echarts.init(barChartDom, 'dark') : null;
    const radarChart = radarChartDom ? echarts.init(radarChartDom, 'dark') : null;
    const hBarChart = hBarChartDom ? echarts.init(hBarChartDom, 'dark') : null;
    const gaugeChart = gaugeChartDom ? echarts.init(gaugeChartDom, 'dark') : null;
    const funnelChart = funnelChartDom ? echarts.init(funnelChartDom, 'dark') : null;

    // Common Chart Options for "Professional" Look
    const commonOptions = {
        backgroundColor: 'transparent',
        textStyle: {
            fontFamily: 'Inter, sans-serif'
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            borderColor: '#334155',
            textStyle: {
                color: '#e2e8f0'
            }
        }
    };
    
    // Get accent color from settings
    let accentHex = '#3b82f6'; // Default
    if (typeof DashboardTheme !== 'undefined' && DashboardTheme.settings) {
        accentHex = DashboardTheme.settings.accentColor;
    }

    // Helper to convert hex to rgba
    function hexToRgba(hex, alpha) {
        let c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
        }
        return `rgba(59, 130, 246, ${alpha})`; 
    }

    // Helper to format currency based on settings
    function formatCurrency(value) {
        const s = (typeof DashboardTheme !== 'undefined' && DashboardTheme.settings) ? DashboardTheme.settings : { currency: 'USD', decimals: 2 };
        let num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
        if (isNaN(num)) return value;

        const currencySymbol = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£'
        }[s.currency] || '$';

        return currencySymbol + num.toLocaleString(undefined, {
            minimumFractionDigits: s.decimals,
            maximumFractionDigits: s.decimals
        });
    }

    // Fetch Data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // Update KPIs
            if(document.getElementById('kpi-revenue')) document.getElementById('kpi-revenue').textContent = formatCurrency(data.kpis.totalRevenue);
            
            // Format logic for other numbers might differ (e.g. users is not currency)
            // But user asked for "decimales y signo peso a dolar a euro", implying money.
            // Let's assume Users is just a number.
            if(document.getElementById('kpi-users')) document.getElementById('kpi-users').textContent = data.kpis.activeUsers; 
            if(document.getElementById('kpi-signups')) document.getElementById('kpi-signups').textContent = data.kpis.newSignups;
            if(document.getElementById('kpi-satisfaction')) document.getElementById('kpi-satisfaction').textContent = data.kpis.satisfaction;

            // Line Chart (Revenue Trend)
            if(lineChart) {
                lineChart.setOption({
                    ...commonOptions,
                    color: [accentHex], 
                    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                    tooltip: {
                        trigger: 'axis',
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        borderColor: '#334155',
                        textStyle: { color: '#e2e8f0' },
                        formatter: function (params) {
                             let result = params[0].name + '<br/>';
                             params.forEach(item => {
                                 result += item.marker + item.seriesName + ': ' + formatCurrency(item.value) + '<br/>';
                             });
                             return result;
                        }
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: data.revenueTrend.categories,
                        axisLine: { lineStyle: { color: '#64748b' } }
                    },
                    yAxis: {
                        type: 'value',
                        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
                        axisLine: { show: false },
                        axisLabel: {
                             formatter: (value) => formatCurrency(value)
                        }
                    },
                    series: [{
                        name: 'Revenue',
                        type: 'line',
                        smooth: true,
                        lineStyle: { width: 3, color: accentHex },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: hexToRgba(accentHex, 0.5) },
                                { offset: 1, color: hexToRgba(accentHex, 0.0) }
                            ])
                        },
                        data: data.revenueTrend.data,
                        animationDuration: 2000,
                        animationEasing: 'cubicOut'
                    }]
                });
            }

            // Pie Chart (Traffic Sources)
            if(pieChart) {
                pieChart.setOption({
                    ...commonOptions,
                    tooltip: { trigger: 'item' },
                    legend: { top: '5%', left: 'center', textStyle: { color: '#94a3b8' } },
                    series: [{
                        name: 'Traffic Source',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#1e293b',
                            borderWidth: 2
                        },
                        label: { show: false, position: 'center' },
                        emphasis: {
                            label: { show: true, fontSize: 20, fontWeight: 'bold', color: '#fff' }
                        },
                        labelLine: { show: false },
                        data: data.trafficSource,
                        animationType: 'scale',
                        animationEasing: 'elasticOut',
                        animationDelay: function (idx) { return Math.random() * 200; }
                    }]
                });
            }

            // Bar/Tower Chart (Server Load)
            if(barChart) {
                barChart.setOption({
                    ...commonOptions,
                    color: [
                        accentHex, 
                        '#3b82f6', 
                        '#8b5cf6' 
                    ],
                    legend: { textStyle: { color: '#94a3b8' } },
                    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                    xAxis: {
                        type: 'category',
                        data: data.serverLoad.categories,
                        axisLine: { lineStyle: { color: '#64748b' } }
                    },
                    yAxis: {
                        type: 'value',
                        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
                    },
                    series: data.serverLoad.series.map((series, index) => {
                        let seriesColor = undefined;
                        if (index === 0) seriesColor = accentHex;
                        if (index === 1) seriesColor = hexToRgba(accentHex, 0.6);
                        if (index === 2) seriesColor = '#475569'; 
                        return {
                            ...series,
                            type: 'bar',
                            stack: 'total',
                            emphasis: { focus: 'series' },
                            itemStyle: { 
                                borderRadius: [0, 0, 0, 0],
                                color: seriesColor
                            }
                        };
                    })
                });
            }

            // Radar Chart (Performance)
            if(radarChart && data.performanceRadar) {
                 radarChart.setOption({
                    ...commonOptions,
                    legend: { data: ['Current Year', 'Last Year'], textStyle: { color: '#94a3b8' } },
                    radar: {
                        indicator: data.performanceRadar.indicators,
                        splitArea: { areaStyle: { color: ['#1e293b', '#0f172a'] } },
                        axisName: { color: '#94a3b8' },
                        splitLine: { lineStyle: { color: '#334155' } },
                        axisLine: { lineStyle: { color: '#334155' } }
                    },
                    series: [{
                        name: 'Performance',
                        type: 'radar',
                        data: [
                            {
                                value: data.performanceRadar.data[0].value,
                                name: data.performanceRadar.data[0].name,
                                itemStyle: { color: accentHex },
                                areaStyle: { color: hexToRgba(accentHex, 0.4) }
                            },
                            {
                                value: data.performanceRadar.data[1].value,
                                name: data.performanceRadar.data[1].name,
                                itemStyle: { color: '#64748b' },
                                areaStyle: { color: 'rgba(100, 116, 139, 0.2)' }
                            }
                        ]
                    }]
                });
            }

            // Horizontal Bar Chart (Top Regions)
            if(hBarChart && data.topRegions) {
                hBarChart.setOption({
                    ...commonOptions,
                    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                    tooltip: {
                         trigger: 'axis',
                         backgroundColor: 'rgba(30, 41, 59, 0.9)',
                         borderColor: '#334155',
                         textStyle: { color: '#e2e8f0' },
                         formatter: function (params) {
                             let result = params[0].name + '<br/>';
                             params.forEach(item => {
                                 // Assuming Sales is currency
                                 result += item.marker + item.seriesName + ': ' + formatCurrency(item.value) + '<br/>';
                             });
                             return result;
                        }
                    },
                    xAxis: {
                        type: 'value',
                        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
                        axisLine: { show: false },
                        axisLabel: {
                             formatter: (value) => formatCurrency(value)
                        }
                    },
                    yAxis: {
                        type: 'category',
                        data: data.topRegions.categories,
                        axisLine: { lineStyle: { color: '#64748b' } }
                    },
                    series: [{
                        name: 'Sales',
                        type: 'bar',
                        data: data.topRegions.data,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                                { offset: 0, color: accentHex },
                                { offset: 1, color: hexToRgba(accentHex, 0.3) }
                            ]),
                            borderRadius: [0, 4, 4, 0]
                        },
                        emphasis: {
                            itemStyle: {
                                color: accentHex
                            }
                        }
                    }]
                });
            }

            // Gauge Chart (System Health)
            if(gaugeChart && data.systemHealth) {
                gaugeChart.setOption({
                    ...commonOptions,
                    series: [{
                        type: 'gauge',
                        startAngle: 90,
                        endAngle: -270,
                        pointer: { show: false },
                        progress: {
                            show: true,
                            overlap: false,
                            roundCap: true,
                            clip: false,
                            itemStyle: {
                                borderWidth: 1,
                                borderColor: '#1e293b',
                                color: accentHex
                            }
                        },
                        axisLine: { lineStyle: { width: 40, color: [[1, '#1e293b']] } },
                        splitLine: { show: false, distance: 0, length: 10 },
                        axisTick: { show: false },
                        axisLabel: { show: false, distance: 50 },
                        data: [{
                            value: data.systemHealth.value,
                            name: data.systemHealth.name,
                            title: { offsetCenter: ['0%', '-10%'] },
                            detail: {
                                valueAnimation: true,
                                offsetCenter: ['0%', '20%'],
                                formatter: '{value}%',
                                color: 'white',
                                fontSize: 30
                            }
                        }],
                        title: { fontSize: 14, color: '#94a3b8' },
                        detail: { fontSize: 30, color: '#fff', formatter: '{value}%' }
                    }]
                });
            }

            // Funnel Chart (Marketing)
            if(funnelChart && data.marketingFunnel) {
                funnelChart.setOption({
                    ...commonOptions,
                    tooltip: { trigger: 'item' },
                    legend: { top: '5%', left: 'center', textStyle: { color: '#94a3b8' } },
                    series: [{
                        name: 'Conversion',
                        type: 'funnel',
                        left: '10%',
                        top: 60,
                        bottom: 60,
                        width: '80%',
                        min: 0,
                        max: 100,
                        minSize: '0%',
                        maxSize: '100%',
                        sort: 'descending',
                        gap: 2,
                        label: { show: true, position: 'inside' },
                        labelLine: { length: 10, lineStyle: { width: 1, type: 'solid' } },
                        itemStyle: { borderColor: '#1e293b', borderWidth: 1 },
                        emphasis: { label: { fontSize: 20 } },
                        data: data.marketingFunnel.map((item, idx) => {
                             return {
                                value: item.value,
                                name: item.name,
                                itemStyle: {
                                    color: hexToRgba(accentHex, 1 - (idx * 0.15))
                                }
                            };
                        })
                    }]
                });
            }


        })
        .catch(error => console.error('Error fetching data:', error));

    // Handle Resize
    window.addEventListener('resize', () => {
        if(lineChart) lineChart.resize();
        if(pieChart) pieChart.resize();
        if(barChart) barChart.resize();
        if(radarChart) radarChart.resize();
        if(hBarChart) hBarChart.resize();
        if(gaugeChart) gaugeChart.resize();
        if(funnelChart) funnelChart.resize();
    });

    // Theme & Simulation Logic
    const settings = (typeof DashboardTheme !== 'undefined' && DashboardTheme.settings) ? DashboardTheme.settings : { simulateData: false, refreshRate: 0 };
    
    // Helper to randomize data slightly
    function fluctuatingData(originalData, variance = 0.1) {
        return originalData.map(val => {
            const change = 1 + (Math.random() * variance * 2 - variance);
            return Math.floor(val * change);
        });
    }

    if (settings.simulateData) {
        setInterval(() => {
            // Update KPIs randomly
            const kpiElem = document.getElementById('kpi-revenue');
            if(kpiElem) { 
                let val = parseInt(kpiElem.textContent.replace(/[^0-9]/g, '')) || 124500;
                val = Math.floor(val * (1 + (Math.random() * 0.02 - 0.01)));
                // Update with formatting
                kpiElem.textContent = formatCurrency(val);
            }

            // Update Chart Data (simulation)
             if(barChart) {
                 const currentOption = barChart.getOption();
                 if(currentOption && currentOption.series) {
                     const newSeries = currentOption.series.map(s => {
                         return { 
                             name: s.name, 
                             data: fluctuatingData(s.data, 0.2) 
                        };
                     });
                     barChart.setOption({ series: newSeries });
                 }
             }

        }, 2000); 
    }

    // Refresh Page Logic
    if (settings.refreshRate > 0) {
        setTimeout(() => {
            window.location.reload();
        }, settings.refreshRate * 1000);
    }
});

// Draggable & Resizable Logic
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('dashboard-grid');
    if (grid && typeof Sortable !== 'undefined') {
        new Sortable(grid, {
            animation: 150,
            handle: '.drag-handle', // Only drag via handle
            ghostClass: 'opacity-50', // Class name for the drop placeholder
            dragClass: 'opacity-100',
            onEnd: function (evt) {
                // Logic to save order if needed in future
            }
        });
    }
});

// Global Resize Function
window.resizeCard = function(btn, cols) {
    const card = btn.closest('.card');
    if (!card) return;

    // Remove existing col-span classes specific to large screens
    card.classList.remove('lg:col-span-1', 'lg:col-span-2', 'lg:col-span-3', 'lg:col-span-4');

    // Add new class based on selection
    // Default is col-span-1 if no class logic applies, but we use specific classes
    if (cols === 1) card.classList.add('lg:col-span-1');
    if (cols === 2) card.classList.add('lg:col-span-2');
    if (cols === 3) card.classList.add('lg:col-span-3');
    if (cols === 4) card.classList.add('lg:col-span-4');

    // Trigger chart resize after transition
    const chartDiv = card.querySelector('div[id$="Chart"]'); // Matches id ending in Chart
    if (chartDiv && typeof echarts !== 'undefined') {
        const chartInstance = echarts.getInstanceByDom(chartDiv);
        if (chartInstance) {
            // Use ResizeObserver or timeout to handle transition
            setTimeout(() => {
                chartInstance.resize();
            }, 300); // Match CSS transition duration
        }
    }
};
