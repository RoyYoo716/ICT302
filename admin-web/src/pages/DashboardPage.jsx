import { useEffect, useState } from 'react'
import MetricCard from '../components/dashboard/MetricCard.jsx'
import RecentActivity from '../components/dashboard/RecentActivity.jsx'
import ScanVolumeChart from '../components/dashboard/ScanVolumeChart.jsx'
import StatusDonutChart from '../components/dashboard/StatusDonutChart.jsx'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import { getMetrics, getRecentActivity } from '../services/api.js'

const SKELETON_ITEMS = ['total', 'active', 'blacklisted', 'suspicious', 'alerts', 'scans']

function DashboardSkeleton() {
  return (
    <>
      <section className="metrics-grid" aria-label="Loading dashboard metrics" aria-busy="true">
        {SKELETON_ITEMS.map((item) => (
          <article className="metric-card metric-card-skeleton" key={item}>
            <span className="dashboard-skeleton-icon" />
            <span className="dashboard-skeleton-copy">
              <span className="dashboard-skeleton-line dashboard-skeleton-line-strong" />
              <span className="dashboard-skeleton-line" />
            </span>
          </article>
        ))}
      </section>

      <section className="dashboard-chart-grid" aria-label="Loading dashboard charts">
        <section className="dashboard-card dashboard-chart-skeleton" />
        <section className="dashboard-card dashboard-chart-skeleton" />
      </section>

      <section className="dashboard-card recent-card dashboard-recent-skeleton" />
    </>
  )
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null)
  const [activities, setActivities] = useState([])

  useEffect(() => {
    let isMounted = true
    async function loadDashboard() {
      // Fire both requests at once instead of one after the other.
      const [dashboardMetrics, recent] = await Promise.all([
        getMetrics(),
        getRecentActivity(),
      ])
      if (!isMounted) return
      setMetrics(dashboardMetrics)
      setActivities(recent.activities)
    }
    loadDashboard()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <AdminLayout title="Dashboard" activeSection="dashboard">
      <main className="dashboard-content">
        {!metrics ? (
          <DashboardSkeleton />
        ) : (
          <>
            <section className="metrics-grid" aria-label="Dashboard metrics">
              {metrics.metricCards.map((metric) => (
                <MetricCard
                  key={metric.id}
                  icon={metric.icon}
                  label={metric.label}
                  tone={metric.tone}
                  value={metric.value}
                />
              ))}
            </section>

            <section className="dashboard-chart-grid">
              <ScanVolumeChart ranges={metrics.scanVolume} />
              <StatusDonutChart items={metrics.statusDistribution} />
            </section>

            <RecentActivity activities={activities} />
          </>
        )}
      </main>
    </AdminLayout>
  )
}
