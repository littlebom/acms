// Utility functions for badge/ticket management

/**
 * Get badge size aspect ratio for image cropping
 * Supports formats like "8.6x5.4", "5.4x8.6", "9x13", "13x9", etc.
 */
export function getBadgeAspectRatio(badgeSize: string): number {
    // Parse width and height from format "WxH"
    const parts = badgeSize.split('x');
    if (parts.length === 2) {
        const width = parseFloat(parts[0]);
        const height = parseFloat(parts[1]);
        if (!isNaN(width) && !isNaN(height) && height > 0) {
            return width / height;
        }
    }

    // Fallback to default landscape ratio
    return 1.6;
}

/**
 * Get badge size display name
 */
export function getBadgeSizeLabel(badgeSize: string): string {
    const labels: Record<string, string> = {
        '8.6x5.4': 'Standard ID-1 (8.6 x 5.4 cm)',
        '8x12': 'Large Vertical (8 x 12 cm)',
        '9x13': 'Conference Standard (9 x 13 cm)',
        '10x14': 'Extra Large (10 x 14 cm)',
    };
    return labels[badgeSize] || badgeSize;
}
