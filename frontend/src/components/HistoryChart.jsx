"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

export function HistoryChart({ data }) {
	const dates = data.map((d) => new Date(d.date).toLocaleDateString());

	const chartData = {
		labels: dates,
		datasets: [
			{
				label: "PageRank Score",
				data: data.map((d) => d.pagerank_score),
				borderColor: "var(--primary)",
				backgroundColor: "var(--primary)",
				tension: 0.3,
				borderWidth: 2,
			},
			{
				label: "Network Percentile",
				data: data.map((d) => d.pagerank_percentile),
				borderColor: "var(--accent)",
				backgroundColor: "var(--accent)",
				tension: 0.3,
				borderWidth: 2,
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: "top",
				labels: {
					font: {
						size: 12,
						weight: "medium",
					},
					padding: 20,
					usePointStyle: true,
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				grid: {
					color: "rgba(0, 0, 0, 0.05)",
				},
			},
			x: {
				grid: {
					display: false,
				},
			},
		},
		elements: {
			point: {
				radius: 4,
				hoverRadius: 6,
			},
		},
	};

	return (
		<div className="stat-card">
			<h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
				Historical Trends
			</h2>
			<Line data={chartData} options={options} />
		</div>
	);
}
