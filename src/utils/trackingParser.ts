import { TrackingEntry } from '../types';
import { generateUniqueId } from './uniqueKey';

const normalizeHeader = (header: string): string => {
  return header
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[\r\n]/g, '')
    .replace(/-/g, '');
};

const parseValue = (value: string): string => {
  return value.trim().replace(/['"]/g, '').replace(/[\r\n]/g, '');
};

export function parseTrackingFile(fileContent: string): TrackingEntry[] {
  try {
    // Validate file content
    if (!fileContent || !fileContent.trim()) {
      throw new Error('The file appears to be empty. Please check the file and try again.');
    }

    // Split by either newline or tab to support both CSV and Numbers format
    const lines = fileContent.split(/[\r\n]+/).filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('No data found in the file. Please check the file format.');
    }

    // Detect delimiter (tab for Numbers, comma for CSV)
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    
    // Get and validate headers
    const rawHeaders = lines[0].split(delimiter).map(h => h.trim());
    if (rawHeaders.length === 0) {
      throw new Error('No headers found in the file. Please check the file format.');
    }

    // Normalize headers
    const headers = rawHeaders.map(normalizeHeader);
    console.log('Found headers:', headers);

    // Required headers for tracking file
    const requiredHeaders = {
      'request-date': 'requestdate',
      'order-id': 'orderid',
      'shipment-date': 'shipmentdate',
      'sku': 'sku',
      'fnsku': 'fnsku',
      'disposition': 'disposition',
      'shipped-quantity': 'shippedquantity',
      'carrier': 'carrier',
      'tracking-number': 'trackingnumber',
      'removal-order-type': 'removalordertype'
    };

    // Validate required headers
    const missingHeaders = Object.entries(requiredHeaders)
      .filter(([_, normalized]) => !headers.includes(normalized))
      .map(([original]) => original);

    if (missingHeaders.length > 0) {
      throw new Error(
        `Missing required headers for tracking file:\n` +
        `Expected: ${Object.keys(requiredHeaders).join(', ')}\n` +
        `Missing: ${missingHeaders.join(', ')}\n` +
        `Found: ${rawHeaders.join(', ')}`
      );
    }

    // Create header index map for faster lookup
    const headerIndices = headers.reduce((acc, header, index) => {
      acc[header] = index;
      return acc;
    }, {} as Record<string, number>);

    // Parse data rows
    return lines.slice(1)
      .filter(line => line.trim())
      .map((line, rowIndex) => {
        try {
          const values = line.split(delimiter).map(parseValue);
          
          if (values.length !== headers.length) {
            throw new Error(`Row ${rowIndex + 2} has ${values.length} columns but should have ${headers.length}`);
          }

          const getValue = (normalizedHeader: string) => 
            values[headerIndices[normalizedHeader]] || '';

          return {
            id: generateUniqueId(),
            requestDate: getValue('requestdate'),
            orderId: getValue('orderid'),
            shipmentDate: getValue('shipmentdate'),
            sku: getValue('sku'),
            fnsku: getValue('fnsku'),
            disposition: getValue('disposition'),
            shippedQuantity: parseInt(getValue('shippedquantity')) || 0,
            carrier: getValue('carrier'),
            trackingNumber: getValue('trackingnumber'),
            removalOrderType: getValue('removalordertype'),
            storeId: '',
            spreadsheetId: '',
            uploadDate: ''
          };
        } catch (err) {
          throw new Error(`Error in row ${rowIndex + 2}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      });
  } catch (err) {
    console.error('File parsing error:', err);
    throw err;
  }
}