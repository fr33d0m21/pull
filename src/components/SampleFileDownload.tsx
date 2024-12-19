import { FileDown } from 'lucide-react';

interface SampleFileDownloadProps {
  type: 'removal' | 'tracking';
}

export default function SampleFileDownload({ type }: SampleFileDownloadProps) {
  const getHeaders = () => {
    if (type === 'removal') {
      return [
        'request-date',
        'order-id',
        'order-source',
        'order-type',
        'order-status',
        'last-updated-date',
        'sku',
        'fnsku',
        'disposition',
        'requested-quantity',
        'cancelled-quantity',
        'disposed-quantity',
        'shipped-quantity',
        'in-process-quantity',
        'removal-fee',
        'currency'
      ];
    }
    return [
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
  };

  const downloadSample = () => {
    const headers = getHeaders();
    const csvContent = [
      headers.join(','),
      type === 'removal' 
        ? '2024-03-15,ABC123,Seller-initiated Manual Removal,Return,Pending,2024-03-15,SAMPLE-SKU,X00SAMPLE,Sellable,10,0,0,0,0,5.00,USD'
        : '2024-03-15,ABC123,2024-03-16,SAMPLE-SKU,X00SAMPLE,Sellable,1,UPS,1Z999A1A0123456789,Return'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sample_${type}_file.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <button
      onClick={downloadSample}
      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <FileDown className="h-4 w-4 mr-2" />
      Download Sample CSV
    </button>
  );
}