// CSV Utility Functions (non-server, for client-side use)

// Convert data to CSV format
export function toCSV(data: any[], columns: { key: string; label: string }[]) {
    if (data.length === 0) return '';

    const headers = columns.map(c => `"${c.label}"`).join(',');
    const rows = data.map(row =>
        columns.map(c => {
            let value = row[c.key];
            if (value === null || value === undefined) value = '';
            if (typeof value === 'string') {
                value = value.replace(/"/g, '""');
                return `"${value}"`;
            }
            if (value instanceof Date) {
                return `"${value.toISOString()}"`;
            }
            return value;
        }).join(',')
    );

    return [headers, ...rows].join('\n');
}

// Paper columns for CSV export
export const PAPER_CSV_COLUMNS = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'track_name', label: 'Track' },
    { key: 'status', label: 'Status' },
    { key: 'authors', label: 'Authors' },
    { key: 'submitter_email', label: 'Contact Email' },
    { key: 'submitted_at', label: 'Submitted Date' },
    { key: 'decision_at', label: 'Decision Date' },
    { key: 'avg_score', label: 'Avg Score' },
    { key: 'recommendations', label: 'Recommendations' },
];

export const REVIEWER_CSV_COLUMNS = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'expertise', label: 'Expertise' },
    { key: 'affiliation', label: 'Affiliation' },
    { key: 'total_assignments', label: 'Total Assignments' },
    { key: 'completed_reviews', label: 'Completed Reviews' },
    { key: 'avg_score_given', label: 'Avg Score Given' },
    { key: 'is_active', label: 'Active' },
];

export const REVIEW_CSV_COLUMNS = [
    { key: 'paper_id', label: 'Paper ID' },
    { key: 'paper_title', label: 'Paper Title' },
    { key: 'reviewer_name', label: 'Reviewer' },
    { key: 'score_originality', label: 'Originality' },
    { key: 'score_methodology', label: 'Methodology' },
    { key: 'score_presentation', label: 'Presentation' },
    { key: 'score_relevance', label: 'Relevance' },
    { key: 'score_overall', label: 'Overall' },
    { key: 'recommendation', label: 'Recommendation' },
    { key: 'confidence', label: 'Confidence' },
    { key: 'submitted_at', label: 'Submitted Date' },
];

export const SCHEDULE_CSV_COLUMNS = [
    { key: 'date', label: 'Date' },
    { key: 'start_time', label: 'Start Time' },
    { key: 'end_time', label: 'End Time' },
    { key: 'room', label: 'Room' },
    { key: 'type', label: 'Type' },
    { key: 'title', label: 'Session Title' },
    { key: 'chair', label: 'Chair' },
    { key: 'speakers', label: 'Speakers' },
    { key: 'description', label: 'Description' },
];
