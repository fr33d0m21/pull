function parseDate(date_string: string): string {
    try {
        // Handle ISO 8601 dates with timezone
        return new Date(date_string).toISOString();
    } catch {
        return date_string;
    }
}

const normalize_header = (header: string): string => {
    return header
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_') // Replace any non-alphanumeric with underscore
        .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
        .replace(/_+/g, '_'); // Replace multiple underscores with single
};

export function parse_removal_file(csvContent: string) {
    const lines = csvContent.split('\n');
    if (lines.length < 2) {
        console.error('CSV file has less than 2 lines');
        return [];
    }

    // Get headers and normalize them
    const headers = parse_csv_line(lines[0]).map(normalize_header);
    console.log('Normalized headers:', headers);

    // Parse each line
    const orders = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
            try {
                const values = parse_csv_line(line);
                const order: any = {};

                headers.forEach((header, i) => {
                    if (values[i] !== undefined) {
                        let value = values[i].trim();
                        
                        // Convert specific fields
                        if (header.includes('date')) {
                            value = parseDate(value);
                        } else if (header.includes('quantity')) {
                            value = parseInt(value) || 0;
                        }
                        
                        order[header] = value;
                    }
                });

                // Validate required fields
                if (!order.sku || !order.order_id) {
                    console.error(`Line ${index + 2}: Missing required fields`, order);
                    return null;
                }

                return order;
            } catch (error) {
                console.error(`Error parsing line ${index + 2}:`, error);
                return null;
            }
        })
        .filter(Boolean); // Remove null entries

    console.log('Parsed orders:', orders);
    return orders;
}

const parse_csv_line = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let in_quotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            in_quotes = !in_quotes;
        } else if (char === ',' && !in_quotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);

    return result.map(field =>
        field
            .trim()
            .replace(/^"(.*)"$/, '$1')
            .replace(/""/g, '"')
    );
};