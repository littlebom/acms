export function fillMissingDates(data: any[], days: number) {
    const result = [];
    const today = new Date();
    const dataMap = new Map(data.map(item => {
        const dateStr = item.date instanceof Date ? item.date.toISOString().split('T')[0] : item.date;
        return [dateStr, item.count];
    }));

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        result.push({
            date: dateStr,
            count: dataMap.get(dateStr) || 0
        });
    }
    return result;
}
