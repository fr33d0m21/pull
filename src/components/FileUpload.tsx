import React, { useState, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { useData } from '../context/DataContext';
import { parse_removal_file } from '../utils/csvParser';
import { supabase } from '../lib/supabase';
import { DashboardItem, WorkingItem } from '../types';

interface FileUploadProps {
  type: 'removal' | 'tracking';
}

export default function FileUpload({ type }: FileUploadProps) {
  const { currentStore } = useStore();
  const { loadStoreData } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!currentStore) {
      alert('Please select a store first');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  }, [currentStore]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentStore) {
      alert('Please select a store first');
      return;
    }

    const files = e.target.files ? Array.from(e.target.files) : [];
    await handleFiles(files);
    e.target.value = ''; // Reset input
  }, [currentStore]);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) {
        alert('Please sign in to upload files');
        return;
      }

      for (const file of files) {
        console.log('Processing file:', file.name);
        const text = await file.text();
        const parsedData = parse_removal_file(text);

        if (parsedData.length === 0) {
          console.error('No valid data found in file');
          alert('No valid data found in file');
          continue;
        }

        console.log('Creating spreadsheet entry...');
        // Create spreadsheet entry
        const { data: spreadsheet, error: spreadsheetError } = await supabase
          .from('spreadsheets')
          .insert({
            store_id: currentStore!.id,
            uploaded_by: user.id,
            type: type,
            name: file.name,
            file_name: file.name,
            row_count: parsedData.length,
            status: 'processing'
          })
          .select()
          .single();

        if (spreadsheetError) {
          console.error('Spreadsheet error:', spreadsheetError);
          throw spreadsheetError;
        }

        console.log('Created spreadsheet:', spreadsheet);

        // Create items and pullback items
        for (const order of parsedData) {
          console.log('Processing order:', order);
          try {
            // 1. Create item
            const item: Partial<DashboardItem> = {
              store_id: currentStore!.id,
              spreadsheet_id: spreadsheet.id,
              sku: order.sku,
              fnsku: order.fnsku,
              disposition: order.disposition,
              shipped_quantity: parseInt(order.shipped_quantity),
              requested_quantity: parseInt(order.shipped_quantity), // Using shipped_quantity as requested_quantity
              actual_return_qty: 0,
              status: 'new'
            };

            const { data: createdItem, error: itemError } = await supabase
              .from('items')
              .insert(item)
              .select()
              .single();

            if (itemError) {
              console.error('Item error:', itemError);
              throw itemError;
            }

            console.log('Created item:', createdItem);

            // 2. Create pullback item
            const pullbackItem: Partial<WorkingItem> = {
              item_id: createdItem.id,
              store_id: currentStore!.id,
              spreadsheet_id: spreadsheet.id,
              request_date: order.request_date,
              order_id: order.order_id,
              shipment_date: order.shipment_date,
              carrier: order.carrier,
              tracking_number: order.tracking_number,
              removal_order_type: order.removal_order_type,
              processing_status: 'new',
              notes: '',
              tracking_numbers: [order.tracking_number],
              carriers: [order.carrier]
            };

            const { error: pullbackError } = await supabase
              .from('pullback_items')
              .insert(pullbackItem);

            if (pullbackError) {
              console.error('Pullback error:', pullbackError);
              throw pullbackError;
            }

            console.log('Created pullback item for order:', order.order_id);
          } catch (error) {
            console.error('Error processing order:', order, error);
            throw error;
          }
        }

        // Update spreadsheet status to completed
        const { error: updateError } = await supabase
          .from('spreadsheets')
          .update({ status: 'completed' })
          .eq('id', spreadsheet.id);

        if (updateError) {
          console.error('Error updating spreadsheet status:', updateError);
          throw updateError;
        }

        console.log('Completed processing file:', file.name);
      }

      // Reload data
      await loadStoreData();
      setIsProcessing(false);
      alert('Files processed successfully');

    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing files. Please check the console for details.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        className="hidden"
        id="fileInput"
        multiple
      />
      <label
        htmlFor="fileInput"
        className="cursor-pointer text-blue-600 hover:text-blue-800"
      >
        {isProcessing ? (
          <span>Processing files...</span>
        ) : (
          <span>
            Click to upload or drag and drop
            <br />
            <span className="text-sm text-gray-500">CSV files only</span>
          </span>
        )}
      </label>
    </div>
  );
}