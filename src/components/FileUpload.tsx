import { useState } from 'react';
import { Upload, X, Trash2, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useData } from '../context/DataContext';
import { parseFile } from '../utils/csvParser';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { RemovalOrder, TrackingEntry } from '../types';

interface FileUploadProps {
  type: 'removal' | 'tracking';
}

export default function FileUpload({ type }: FileUploadProps) {
  const { currentStore } = useStore();
  const { user } = useAuth();
  const { addOrders, clearOrders, addTrackingEntries, clearTrackingEntries } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!currentStore) {
      setError('Please select a store first');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentStore) {
      setError('Please select a store first');
      return;
    }

    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const transformToFrontendFormat = (entries: any[], spreadsheetId: string): RemovalOrder[] | TrackingEntry[] => {
    return entries.map(entry => ({
      ...entry,
      id: entry.id,
      spreadsheetId: spreadsheetId,
      uploadDate: new Date().toISOString(),
      storeId: currentStore?.id,
      processingStatus: 'new',
      requestDate: entry.request_date,
      shipmentDate: entry.shipment_date,
      orderId: entry.order_id,
      trackingNumber: entry.tracking_number,
      removalOrderType: entry.removal_order_type,
      shippedQuantity: entry.shipped_quantity,
      requestedQuantity: entry.shipped_quantity, // For removal orders
      actualReturnQty: 0, // For removal orders
      trackingNumbers: [], // For removal orders
      carriers: [], // For removal orders
      items: [] // For removal orders
    }));
  };

  const saveToDatabase = async (parsedData: any[], fileName: string) => {
    if (!currentStore || !user) return;

    try {
      // First create a spreadsheet entry
      const { data: spreadsheet, error: spreadsheetError } = await supabase
        .from('spreadsheets')
        .insert({
          name: fileName,
          store_id: currentStore.id,
          uploaded_by: user.id,
          type: type
        })
        .select()
        .single();

      if (spreadsheetError) throw spreadsheetError;

      // Then save each entry
      const entries = parsedData.map(entry => ({
        spreadsheet_id: spreadsheet.id,
        store_id: currentStore.id,
        request_date: entry.requestDate || new Date().toISOString(),
        order_id: entry.orderId,
        shipment_date: entry.shipmentDate,
        sku: entry.sku,
        fnsku: entry.fnsku,
        disposition: entry.disposition,
        shipped_quantity: entry.shippedQuantity,
        carrier: entry.carrier,
        tracking_number: entry.trackingNumber,
        removal_order_type: entry.removalOrderType,
        created_by: user.id
      }));

      const { data: savedEntries, error: entriesError } = await supabase
        .from('tracking_entries')
        .insert(entries)
        .select();

      if (entriesError) throw entriesError;

      // Transform the saved entries to frontend format and update state
      const frontendData = transformToFrontendFormat(savedEntries, spreadsheet.id);
      
      // Update the frontend state
      if (type === 'removal') {
        addOrders(frontendData as RemovalOrder[]);
      } else {
        addTrackingEntries(frontendData as TrackingEntry[]);
      }

      return frontendData;
    } catch (err) {
      console.error('Error saving to database:', err);
      throw err;
    }
  };

  const handleFiles = async (files: File[]) => {
    setError(null);
    setUploading(true);
    
    try {
      for (const file of files) {
        if (!file.name.endsWith('.csv') && !file.name.endsWith('.numbers')) {
          setError('Please upload CSV or Numbers files only');
          continue;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const text = e.target?.result as string;
            const result = parseFile(text, type);
            
            if (result.length === 0) {
              setError('No valid data found in the file');
              return;
            }

            await saveToDatabase(result, file.name);
          } catch (err) {
            if (err instanceof Error) {
              setError(err.message);
            } else {
              setError('Error parsing file. Please check the format.');
            }
          }
        };
        reader.onerror = () => {
          setError('Error reading file');
        };
        reader.readAsText(file);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClearData = () => {
    if (type === 'removal') {
      clearOrders();
    } else {
      clearTrackingEntries();
    }
    setShowClearConfirm(false);
  };

  return (
    <div className="relative">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            Drag and drop your {type} file here, or{' '}
            <label className="text-indigo-600 hover:text-indigo-500 cursor-pointer">
              browse
              <input
                type="file"
                className="hidden"
                accept=".csv,.numbers"
                onChange={handleFileInput}
                disabled={uploading}
              />
            </label>
          </div>
          <div className="text-xs text-gray-500">CSV or Numbers files only</div>
        </div>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 rounded flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}

      {uploading && (
        <div className="mt-2 p-2 bg-indigo-50 rounded flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2" />
          <span className="text-sm text-indigo-600">Uploading...</span>
        </div>
      )}

      <button
        onClick={() => setShowClearConfirm(true)}
        className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <Trash2 className="w-3 h-3 mr-1" />
        Clear Data
      </button>

      {showClearConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Are you sure you want to clear all data?</p>
            <div className="space-x-2">
              <button
                onClick={handleClearData}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}