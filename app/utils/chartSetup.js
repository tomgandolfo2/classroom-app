// app/utils/chartSetup.js

import {
  Chart,
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";

// Register the components you need
Chart.register(
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  PointElement
);
