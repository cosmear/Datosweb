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

    // Init ECharts instances if elements exist
    const lineChart = lineChartDom ? echarts.init(lineChartDom, 'dark') : null;
    const pieChart = pieChartDom ? echarts.init(pieChartDom, 'dark') : null;
    const barChart = barChartDom ? echarts.init(barChartDom, 'dark') : null;
    const radarChart = radarChartDom ? echarts.init(radarChartDom, 'dark') : null;
    const hBarChart = hBarChartDom ? echarts.init(hBarChartDom, 'dark') : null;

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
    const currentSettings = DashboardTheme.settings;
    const accentHex = currentSettings.accentColor;

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
        // Fallback or if hex is somehow invalid, return a default blue
        return `rgba(59, 130, 246, ${alpha})`; 
    }

    // Fetch Data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // Update KPIs
            if(document.getElementById('kpi-revenue')) document.getElementById('kpi-revenue').textContent = data.kpis.totalRevenue;
            if(document.getElementById('kpi-users')) document.getElementById('kpi-users').textContent = data.kpis.activeUsers;
            if(document.getElementById('kpi-signups')) document.getElementById('kpi-signups').textContent = data.kpis.newSignups;
            if(document.getElementById('kpi-satisfaction')) document.getElementById('kpi-satisfaction').textContent = data.kpis.satisfaction;

            // Line Chart (Revenue Trend)
            if(lineChart) {
                lineChart.setOption({
                    ...commonOptions,
                    color: [accentHex], // Set default color
                    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: data.revenueTrend.categories,
                        axisLine: { lineStyle: { color: '#64748b' } }
                    },
                    yAxis: {
                        type: 'value',
                        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
                        axisLine: { show: false }
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
                    xAxis: {
                        type: 'value',
                        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
                        axisLine: { show: false }
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

        })
        .catch(error => console.error('Error fetching data:', error));

    // Handle Resize
    window.addEventListener('resize', () => {
        if(lineChart) lineChart.resize();
        if(pieChart) pieChart.resize();
        if(barChart) barChart.resize();
        if(radarChart) radarChart.resize();
        if(hBarChart) hBarChart.resize();
    });

    // Theme & Simulation Logic
    const settings = DashboardTheme.settings;
    
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
            if(kpiElem) { // Check if we are on dashboard
                // Quick hack parsing just to show animation
                let val = parseInt(kpiElem.textContent.replace(/[^0-9]/g, '')) || 124500;
                val = Math.floor(val * (1 + (Math.random() * 0.02 - 0.01)));
                kpiElem.textContent = "$" + val.toLocaleString();
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

        }, 2000); // Update every 2s
    }

    // Refresh Page Logic
    if (settings.refreshRate > 0) {
        setTimeout(() => {
            window.location.reload();
        }, settings.refreshRate * 1000);
    }
});
