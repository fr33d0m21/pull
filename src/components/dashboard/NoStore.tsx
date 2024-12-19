import { Building2 } from 'lucide-react';

export default function NoStore() {
  return (
    <div className="mt-6 text-center">
      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No store selected</h3>
      <p className="mt-1 text-sm text-gray-500">
        Please select a store to view its dashboard
      </p>
    </div>
  );
}