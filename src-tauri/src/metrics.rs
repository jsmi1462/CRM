use serde::Serialize;
use sqlx::SqlitePool;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MetricsSummary {
    pub total_leads: i64,
    pub conversion_rate: f64,
    pub avg_days_to_first_contact: Option<f64>,
    pub never_contacted_count: i64,
    pub contacts_this_week: i64,
    pub contacts_this_month: i64,
    pub status_breakdown: Vec<StatusCount>,
    pub monthly_new_leads: Vec<MonthlyCount>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct StatusCount {
    pub status: String,
    pub count: i64,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct MonthlyCount {
    pub month: String,
    pub count: i64,
}

pub async fn compute(pool: &SqlitePool) -> Result<MetricsSummary, sqlx::Error> {
    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM leads")
        .fetch_one(pool)
        .await?;

    let converted: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM leads WHERE status = 'converted'")
            .fetch_one(pool)
            .await?;

    let conversion_rate = if total > 0 {
        (converted as f64 / total as f64) * 100.0
    } else {
        0.0
    };

    // AVG returns NULL when no rows qualify — maps to Option<f64>
    let avg_days: Option<f64> = sqlx::query_scalar(
        "SELECT AVG(julianday(last_contacted) - julianday(created_at))
         FROM leads WHERE last_contacted IS NOT NULL",
    )
    .fetch_one(pool)
    .await?;

    let never_contacted_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM leads
         WHERE last_contacted IS NULL AND status NOT IN ('converted', 'lost')",
    )
    .fetch_one(pool)
    .await?;

    let contacts_this_week: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM leads
         WHERE last_contacted >= datetime('now', '-7 days')",
    )
    .fetch_one(pool)
    .await?;

    let contacts_this_month: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM leads
         WHERE last_contacted >= datetime('now', '-30 days')",
    )
    .fetch_one(pool)
    .await?;

    let status_breakdown: Vec<StatusCount> = sqlx::query_as(
        "SELECT status, COUNT(*) as count FROM leads
         GROUP BY status ORDER BY count DESC",
    )
    .fetch_all(pool)
    .await?;

    // Last 6 months in ascending order so charts render left-to-right
    let monthly_new_leads: Vec<MonthlyCount> = sqlx::query_as(
        "SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
         FROM leads
         GROUP BY month
         ORDER BY month ASC
         LIMIT 6",
    )
    .fetch_all(pool)
    .await?;

    Ok(MetricsSummary {
        total_leads: total,
        conversion_rate,
        avg_days_to_first_contact: avg_days,
        never_contacted_count,
        contacts_this_week,
        contacts_this_month,
        status_breakdown,
        monthly_new_leads,
    })
}
