const chartRegistry = {};

function formatNumber(value) {
  return new Intl.NumberFormat("es-AR").format(Number(value) || 0);
}

function formatPercent(value, digits = 2) {
  return new Intl.NumberFormat("es-AR", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value) || 0);
}

function calculateWeightedRates(campaigns) {
  const totals = campaigns.reduce(
    (accumulator, campaign) => {
      accumulator.sent += campaign.sent;
      accumulator.delivered += campaign.delivered;
      accumulator.opensUnique += campaign.opensUnique;
      accumulator.clickUnique += campaign.clickUnique;
      accumulator.unsubscribers += campaign.unsubscribers;
      return accumulator;
    },
    { sent: 0, delivered: 0, opensUnique: 0, clickUnique: 0, unsubscribers: 0 },
  );

  return {
    ...totals,
    weightedOpenRate: totals.delivered ? totals.opensUnique / totals.delivered : 0,
    globalCtor: totals.opensUnique ? totals.clickUnique / totals.opensUnique : 0,
  };
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function updateTime() {
  const time = new Date().toLocaleString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  setText("current-time", time);
}

function baseChartOptions() {
  return {
    backgroundColor: "transparent",
    animationDuration: 700,
    textStyle: {
      fontFamily: "Inter, sans-serif",
      color: "#0f172a",
    },
    grid: {
      top: 48,
      left: 20,
      right: 24,
      bottom: 50,
      containLabel: true,
    },
    legend: {
      top: 0,
      icon: "roundRect",
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        color: "#475569",
        fontSize: 12,
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255,255,255,0.96)",
      borderColor: "rgba(56, 189, 248, 0.25)",
      borderWidth: 1,
      textStyle: {
        color: "#0f172a",
      },
      extraCssText: "box-shadow: 0 18px 40px rgba(14, 165, 233, 0.16); border-radius: 16px;",
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      axisTick: { show: false },
      axisLine: {
        lineStyle: {
          color: "rgba(148, 163, 184, 0.45)",
        },
      },
      axisLabel: {
        color: "#64748b",
        fontSize: 11,
      },
    },
    yAxis: {
      type: "value",
      splitNumber: 5,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#64748b",
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: "rgba(148, 163, 184, 0.18)",
          type: "dashed",
        },
      },
    },
  };
}

function seriesStyle(color) {
  return {
    type: "line",
    smooth: true,
    symbol: "circle",
    symbolSize: 8,
    lineStyle: {
      width: 3,
      color,
    },
    itemStyle: {
      color,
      borderColor: "#ffffff",
      borderWidth: 2,
    },
  };
}

function renderKpis(data) {
  const calculated = calculateWeightedRates(data.campaigns);
  const kpis = data.mailingKpis;

  setText("kpi-campaigns", formatNumber(kpis.campaignsAnalyzed));
  setText("kpi-sent", formatNumber(calculated.sent));
  setText("kpi-delivered", formatNumber(calculated.delivered));
  setText("kpi-open-rate", formatPercent(calculated.weightedOpenRate));
  setText("kpi-ctor", formatPercent(calculated.globalCtor));
  setText("kpi-unsubs", formatNumber(calculated.unsubscribers));

  setText("dashboard-intro", data.reportTexts.dashboardIntro);
  setText("volume-analysis", data.reportTexts.volumeDeliverability);
  setText("engagement-analysis", data.reportTexts.engagementByCampaign);
  setText("quality-analysis", data.reportTexts.qualityFriction);
  setText("segmentation-analysis", data.reportTexts.segmentation);
  setText("subscription-disclaimer", data.reportTexts.subscriptionDisclaimer);
  setText("operational-conclusion", data.reportTexts.operationalConclusion);
  setText("engagement-conclusion", data.reportTexts.engagementConclusion);
  setText("final-conclusion", data.reportTexts.finalConclusion);
}

function renderCharts(data) {
  const monthlyMetrics = data.monthlyMetrics;
  const campaigns = data.campaigns;
  const segmentationCampaigns = campaigns.filter((campaign) => campaign.campaign.startsWith("MAY_01_CAVA_REGALO"));

  const colors = {
    navy: "#0F172A",
    sky: "#38BDF8",
    cyan: "#06B6D4",
    indigo: "#6366F1",
    emerald: "#10B981",
    amber: "#F59E0B",
    rose: "#F43F5E",
    violet: "#8B5CF6",
    teal: "#14B8A6",
  };

  const volumeChart = echarts.init(document.getElementById("volumeDeliverabilityChart"));
  volumeChart.setOption({
    ...baseChartOptions(),
    legend: {
      ...baseChartOptions().legend,
      data: ["Enviados", "Entregados", "Not Sent"],
    },
    xAxis: {
      ...baseChartOptions().xAxis,
      data: monthlyMetrics.map((item) => item.month),
    },
    yAxis: {
      ...baseChartOptions().yAxis,
      axisLabel: {
        color: "#64748b",
        formatter: (value) => formatNumber(value),
      },
    },
    series: [
      {
        ...seriesStyle(colors.navy),
        name: "Enviados",
        areaStyle: {
          color: "rgba(15, 23, 42, 0.06)",
        },
        data: monthlyMetrics.map((item) => item.sent),
      },
      {
        ...seriesStyle(colors.sky),
        name: "Entregados",
        areaStyle: {
          color: "rgba(56, 189, 248, 0.12)",
        },
        data: monthlyMetrics.map((item) => item.delivered),
      },
      {
        ...seriesStyle(colors.amber),
        name: "Not Sent",
        data: monthlyMetrics.map((item) => item.notSent),
      },
    ],
  });

  const engagementChart = echarts.init(document.getElementById("engagementChart"));
  engagementChart.setOption({
    ...baseChartOptions(),
    legend: {
      ...baseChartOptions().legend,
      data: ["Open Rate único", "CTOR", "CTR sobre entregados"],
    },
    xAxis: {
      ...baseChartOptions().xAxis,
      data: campaigns.map((campaign) => campaign.shortLabel),
      axisLabel: {
        color: "#64748b",
        interval: 0,
        rotate: 28,
        fontSize: 10,
      },
    },
    yAxis: {
      ...baseChartOptions().yAxis,
      axisLabel: {
        color: "#64748b",
        formatter: (value) => `${value.toFixed(0)}%`,
      },
    },
    tooltip: {
      ...baseChartOptions().tooltip,
      valueFormatter: (value) => `${Number(value).toFixed(2)}%`,
    },
    series: [
      {
        ...seriesStyle(colors.sky),
        name: "Open Rate único",
        data: campaigns.map((campaign) => Number((campaign.openRate * 100).toFixed(2))),
      },
      {
        ...seriesStyle(colors.violet),
        name: "CTOR",
        data: campaigns.map((campaign) => Number((campaign.ctor * 100).toFixed(2))),
      },
      {
        ...seriesStyle(colors.emerald),
        name: "CTR sobre entregados",
        data: campaigns.map((campaign) => Number((campaign.ctrDelivered * 100).toFixed(2))),
      },
    ],
  });

  const qualityChart = echarts.init(document.getElementById("qualityChart"));
  qualityChart.setOption({
    ...baseChartOptions(),
    legend: {
      ...baseChartOptions().legend,
      data: ["Not Sent Rate", "Bounce Rate", "Unsubscribe Rate"],
    },
    xAxis: {
      ...baseChartOptions().xAxis,
      data: campaigns.map((campaign) => campaign.shortLabel),
      axisLabel: {
        color: "#64748b",
        interval: 0,
        rotate: 28,
        fontSize: 10,
      },
    },
    yAxis: {
      ...baseChartOptions().yAxis,
      axisLabel: {
        color: "#64748b",
        formatter: (value) => `${value.toFixed(0)}%`,
      },
    },
    tooltip: {
      ...baseChartOptions().tooltip,
      valueFormatter: (value) => `${Number(value).toFixed(2)}%`,
    },
    series: [
      {
        ...seriesStyle(colors.rose),
        name: "Not Sent Rate",
        data: campaigns.map((campaign) => Number((campaign.notSentRate * 100).toFixed(2))),
      },
      {
        ...seriesStyle(colors.amber),
        name: "Bounce Rate",
        data: campaigns.map((campaign) => Number((campaign.bounceRate * 100).toFixed(2))),
      },
      {
        ...seriesStyle(colors.teal),
        name: "Unsubscribe Rate",
        data: campaigns.map((campaign) => Number((campaign.unsubscribeRate * 100).toFixed(2))),
      },
    ],
  });

  const segmentationChart = echarts.init(document.getElementById("segmentationChart"));
  segmentationChart.setOption({
    ...baseChartOptions(),
    legend: {
      ...baseChartOptions().legend,
      data: ["Open Rate", "CTOR", "CTR sobre entregados"],
    },
    xAxis: {
      ...baseChartOptions().xAxis,
      data: ["Verde", "Rojo"],
    },
    yAxis: {
      ...baseChartOptions().yAxis,
      axisLabel: {
        color: "#64748b",
        formatter: (value) => `${value.toFixed(0)}%`,
      },
    },
    tooltip: {
      ...baseChartOptions().tooltip,
      valueFormatter: (value) => `${Number(value).toFixed(2)}%`,
    },
    series: [
      {
        ...seriesStyle(colors.sky),
        name: "Open Rate",
        data: segmentationCampaigns.map((campaign) => Number((campaign.openRate * 100).toFixed(2))),
      },
      {
        ...seriesStyle(colors.indigo),
        name: "CTOR",
        data: segmentationCampaigns.map((campaign) => Number((campaign.ctor * 100).toFixed(2))),
      },
      {
        ...seriesStyle(colors.emerald),
        name: "CTR sobre entregados",
        data: segmentationCampaigns.map((campaign) => Number((campaign.ctrDelivered * 100).toFixed(2))),
      },
    ],
  });

  chartRegistry.volumeDeliverabilityChart = volumeChart;
  chartRegistry.engagementChart = engagementChart;
  chartRegistry.qualityChart = qualityChart;
  chartRegistry.segmentationChart = segmentationChart;
}

function renderSubscriptionTable(subscriptionTable) {
  const body = document.getElementById("subscription-table-body");
  if (!body) return;

  body.innerHTML = subscriptionTable
    .map(
      (row) => `
        <tr>
          <td class="px-5 py-4 font-semibold text-slate-800">${row.month}</td>
          <td class="px-5 py-4">${row.subscriptions}</td>
          <td class="px-5 py-4">${formatNumber(row.unsubscribers)}</td>
          <td class="px-5 py-4">${formatPercent(row.unsubscribeRate)}</td>
          <td class="px-5 py-4 text-slate-500">${row.observation}</td>
        </tr>
      `,
    )
    .join("");
}

function renderCampaignTable(campaigns) {
  const body = document.getElementById("campaign-table-body");
  if (!body) return;

  body.innerHTML = campaigns
    .map(
      (campaign) => `
        <tr>
          <td class="px-4 py-4 font-medium text-slate-800">${campaign.month}</td>
          <td class="px-4 py-4 text-slate-600">${campaign.campaign}</td>
          <td class="px-4 py-4">${formatNumber(campaign.sent)}</td>
          <td class="px-4 py-4">${formatNumber(campaign.delivered)}</td>
          <td class="px-4 py-4">${formatPercent(campaign.openRate)}</td>
          <td class="px-4 py-4">${formatPercent(campaign.ctor)}</td>
          <td class="px-4 py-4">${formatPercent(campaign.ctrDelivered)}</td>
          <td class="px-4 py-4">${formatNumber(campaign.notSent)}</td>
        </tr>
      `,
    )
    .join("");
}

function worksheetHeader(worksheet, rowNumber = 1) {
  const row = worksheet.getRow(rowNumber);
  row.font = { bold: true, color: { argb: "FF0F172A" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEAF6FF" },
  };
  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "FFD7EEF9" } },
      bottom: { style: "thin", color: { argb: "FFD7EEF9" } },
    };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
}

function downloadBlob(content, fileName, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function exportMonthlyCsv(data) {
  const headers = [
    "Mes",
    "Enviados",
    "Entregados",
    "Not Sent",
    "Open Rate",
    "CTOR",
    "CTR sobre entregados",
    "Desuscripciones",
  ];
  const rows = data.monthlyMetrics.map((item) => [
    item.month,
    item.sent,
    item.delivered,
    item.notSent,
    formatPercent(item.openRate),
    formatPercent(item.ctor),
    formatPercent(item.ctrDelivered),
    item.unsubscribers,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  downloadBlob(csv, "mailing-metricas.csv", "text/csv;charset=utf-8;");
}

async function downloadExcelReport(data) {
  try {
    if (!window.ExcelJS) {
      throw new Error("ExcelJS no disponible");
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Codex";
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet("Resumen", {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    summarySheet.columns = [
      { header: "Indicador", key: "label", width: 34 },
      { header: "Valor", key: "value", width: 24 },
    ];
    worksheetHeader(summarySheet);

    const weightedRates = calculateWeightedRates(data.campaigns);
    [
      ["Campañas analizadas", formatNumber(data.mailingKpis.campaignsAnalyzed)],
      ["Enviados totales", formatNumber(weightedRates.sent)],
      ["Entregados totales", formatNumber(weightedRates.delivered)],
      ["Open Rate único ponderado", formatPercent(weightedRates.weightedOpenRate)],
      ["CTOR global", formatPercent(weightedRates.globalCtor)],
      ["Desuscripciones totales", formatNumber(weightedRates.unsubscribers)],
    ].forEach(([label, value]) => summarySheet.addRow({ label, value }));

    summarySheet.addRow([]);
    summarySheet.addRow({ label: "Resumen ejecutivo", value: data.reportTexts.executiveSummary });
    summarySheet.addRow({ label: "Conclusión operativa", value: data.reportTexts.operationalConclusion });
    summarySheet.addRow({ label: "Conclusión de engagement", value: data.reportTexts.engagementConclusion });
    summarySheet.addRow({ label: "Conclusión final", value: data.reportTexts.finalConclusion });
    summarySheet.getColumn("value").alignment = { wrapText: true, vertical: "top" };

    const monthlySheet = workbook.addWorksheet("Métricas mensuales", {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    monthlySheet.columns = [
      { header: "Mes", key: "month", width: 14 },
      { header: "Enviados", key: "sent", width: 14 },
      { header: "Entregados", key: "delivered", width: 14 },
      { header: "Not Sent", key: "notSent", width: 14 },
      { header: "Open Rate", key: "openRate", width: 14 },
      { header: "CTOR", key: "ctor", width: 14 },
      { header: "CTR sobre entregados", key: "ctrDelivered", width: 20 },
      { header: "Desuscripciones", key: "unsubscribers", width: 18 },
    ];
    worksheetHeader(monthlySheet);
    data.monthlyMetrics.forEach((item) =>
      monthlySheet.addRow({
        month: item.month,
        sent: item.sent,
        delivered: item.delivered,
        notSent: item.notSent,
        openRate: formatPercent(item.openRate),
        ctor: formatPercent(item.ctor),
        ctrDelivered: formatPercent(item.ctrDelivered),
        unsubscribers: item.unsubscribers,
      }),
    );

    const campaignsSheet = workbook.addWorksheet("Campañas", {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    campaignsSheet.columns = [
      { header: "Mes", key: "month", width: 12 },
      { header: "Campaña", key: "campaign", width: 36 },
      { header: "Desde", key: "from", width: 10 },
      { header: "Hasta", key: "to", width: 10 },
      { header: "Enviados", key: "sent", width: 12 },
      { header: "Entregados", key: "delivered", width: 12 },
      { header: "Bounces", key: "bounces", width: 12 },
      { header: "Unsuscribers", key: "unsubscribers", width: 14 },
      { header: "Not Sent", key: "notSent", width: 12 },
      { header: "Not Sent Rate", key: "notSentRate", width: 14 },
      { header: "Opens Total", key: "opensTotal", width: 14 },
      { header: "Opens Unique", key: "opensUnique", width: 14 },
      { header: "Open Rate", key: "openRate", width: 14 },
      { header: "Click Total", key: "clickTotal", width: 12 },
      { header: "Click Unique", key: "clickUnique", width: 12 },
      { header: "CTOR", key: "ctor", width: 12 },
      { header: "CTR sobre entregados", key: "ctrDelivered", width: 18 },
      { header: "Comentarios", key: "comments", width: 46 },
    ];
    worksheetHeader(campaignsSheet);
    data.campaigns.forEach((campaign) =>
      campaignsSheet.addRow({
        ...campaign,
        notSentRate: formatPercent(campaign.notSentRate),
        openRate: formatPercent(campaign.openRate),
        ctor: formatPercent(campaign.ctor),
        ctrDelivered: formatPercent(campaign.ctrDelivered),
      }),
    );
    campaignsSheet.getColumn("comments").alignment = { wrapText: true, vertical: "top" };

    const subscriptionsSheet = workbook.addWorksheet("Suscripciones", {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    subscriptionsSheet.columns = [
      { header: "Mes", key: "month", width: 14 },
      { header: "Suscripciones", key: "subscriptions", width: 18 },
      { header: "Desuscripciones", key: "unsubscribers", width: 18 },
      { header: "Tasa de desuscripción sobre entregados", key: "unsubscribeRate", width: 34 },
      { header: "Observación", key: "observation", width: 44 },
    ];
    worksheetHeader(subscriptionsSheet);
    data.subscriptionTable.forEach((row) =>
      subscriptionsSheet.addRow({
        ...row,
        unsubscribeRate: formatPercent(row.unsubscribeRate),
      }),
    );
    subscriptionsSheet.addRow({});
    subscriptionsSheet.addRow({
      month: "Nota",
      observation: data.reportTexts.subscriptionDisclaimer,
    });
    subscriptionsSheet.getColumn("observation").alignment = { wrapText: true, vertical: "top" };

    const chartsSheet = workbook.addWorksheet("Gráficos");
    chartsSheet.columns = [{ width: 28 }, { width: 28 }, { width: 28 }, { width: 28 }];
    const chartTitles = {
      volumeDeliverabilityChart: "Volumen y entregabilidad mensual",
      engagementChart: "Engagement por campaña",
      qualityChart: "Calidad de base y fricción de envío",
      segmentationChart: "Comparación de segmentación: Cava Regalo",
    };

    let rowOffset = 1;
    Object.entries(chartRegistry).forEach(([key, chart]) => {
      chartsSheet.getCell(`A${rowOffset}`).value = chartTitles[key];
      chartsSheet.getCell(`A${rowOffset}`).font = { bold: true, size: 12 };
      const imageId = workbook.addImage({
        base64: chart.getDataURL({
          type: "png",
          pixelRatio: 2,
          backgroundColor: "#FFFFFF",
        }),
        extension: "png",
      });
      chartsSheet.addImage(imageId, {
        tl: { col: 0, row: rowOffset },
        br: { col: 12, row: rowOffset + 15 },
      });
      rowOffset += 18;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      buffer,
      "mailing-performance-report.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  } catch (error) {
    console.error("Fallo la exportación Excel, se usa fallback CSV.", error);
    exportMonthlyCsv(data);
  }
}

function handleResize() {
  Object.values(chartRegistry).forEach((chart) => chart.resize());
}

document.addEventListener("DOMContentLoaded", async () => {
  updateTime();
  window.setInterval(updateTime, 1000);

  try {
    const response = await fetch("data.json");
    const data = await response.json();

    renderKpis(data);
    renderCharts(data);
    renderSubscriptionTable(data.subscriptionTable);
    renderCampaignTable(data.campaigns);

    const downloadButton = document.getElementById("downloadExcelBtn");
    if (downloadButton) {
      downloadButton.addEventListener("click", () => downloadExcelReport(data));
    }
  } catch (error) {
    console.error("No se pudo cargar data.json", error);
    setText(
      "dashboard-intro",
      "No fue posible cargar los datos del dashboard. Revisá que data.json esté disponible junto al proyecto.",
    );
  }

  window.addEventListener("resize", handleResize);
});
