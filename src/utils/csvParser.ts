import { RemovalOrder, TrackingEntry } from '../types';
import { generateUniqueId } from './uniqueKey';

function parseDate(dateString: string): string {
  try {
    // Handle ISO 8601 dates with timezone
    return new Date(dateString).toISOString();
  } catch {
    return dateString;
  }
}

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  
  return result.map(field => 
    field.trim()
      .replace(/^"(.*)"$/, '$1')
      .replace(/""/g, '"')
  );
};

const normalizeHeader = (header: string): string => {
  return header
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[\r\n]/g, '')
    .replace(/-/g, '');
};

const expectedTrackingHeaders = [
  'request-date',
  'order-id',
  'shipment-date',
  'sku',
  'fnsku',
  'disposition',
  'shipped-quantity',
  'carrier',
  'tracking-number',
  'removal-order-type'
];

export function parseFile(fileContent: string, type: 'removal' | 'tracking'): RemovalOrder[] | TrackingEntry[] {
  try {
    if (!fileContent?.trim()) {
      throw new Error('The file appears to be empty');
    }

    const lines = fileContent.split(/[\r\n]+/).filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('No data found in the file');
    }

    // Parse headers using the CSV line parser
    const rawHeaders = parseCSVLine(lines[0]);
    const headers = rawHeaders.map(normalizeHeader);
    
    const headerIndices = headers.reduce((acc, header, index) => {
      acc[header] = index;
      return acc;
    }, {} as Record<string, number>);

    // Check for missing headers
    const normalizedExpectedHeaders = expectedTrackingHeaders.map(normalizeHeader);
    const missingHeaders = normalizedExpectedHeaders.filter(header => 
      !headers.includes(header.replace(/-/g, ''))
    );

    if (missingHeaders.length > 0) {
      throw new Error(
        `Missing required headers in tracking file:\n` +
        `Missing headers: ${missingHeaders.join(', ')}\n` +
        `Found headers: ${rawHeaders.join(', ')}`
      );
    }

    return lines.slice(1)
      .filter(line => line.trim())
      .map((line, rowIndex) => {
        try {
          const values = parseCSVLine(line);
          
          if (values.length !== headers.length) {
            throw new Error(
              `Row ${rowIndex + 2} has ${values.length} columns but should have ${headers.length}`
            );
          }

          const getValue = (normalizedHeader: string) => {
            const index = headerIndices[normalizeHeader(normalizedHeader)];
            return index !== undefined ? values[index] || '' : '';
          };

          const carrier = getValue('carrier');
          const trackingNumber = getValue('tracking-number');
          
          return {
            id: generateUniqueId(),
            requestDate: parseDate(getValue('request-date')),
            orderId: getValue('order-id'),
            shipmentDate: parseDate(getValue('shipment-date')),
            sku: getValue('sku'),
            fnsku: getValue('fnsku'),
            disposition: getValue('disposition'),
            shippedQuantity: parseInt(getValue('shipped-quantity')) || 0,
            carrier: carrier,
            trackingNumber: trackingNumber,
            removalOrderType: getValue('removal-order-type'),
            storeId: '',
            spreadsheetId: '',
            uploadDate: new Date().toISOString()
          } as TrackingEntry;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          throw new Error(`Error in row ${rowIndex + 2}: ${errorMessage}`);
        }
      });
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error occurred');
    console.error('File parsing error:', error);
    throw error;
  }
}