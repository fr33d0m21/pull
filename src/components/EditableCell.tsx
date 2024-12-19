import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface EditableCellProps {
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'select';
  options?: string[];
  className?: string;
}

export default function EditableCell({ 
  value, 
  onChange, 
  type = 'text',
  options = [],
  className = ''
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className={`cursor-pointer p-2 rounded hover:bg-gray-50 ${className}`}
        role="button"
        tabIndex={0}
      >
        {value}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      {type === 'select' ? (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={editValue as string}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(type === 'number' ? Number(e.target.value) : e.target.value)}
          onKeyDown={handleKeyDown}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      )}
      <div className="flex items-center space-x-1">
        <button
          onClick={handleSave}
          className="p-1 rounded-full hover:bg-green-100"
          title="Save"
        >
          <Check className="h-4 w-4 text-green-600" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 rounded-full hover:bg-red-100"
          title="Cancel"
        >
          <X className="h-4 w-4 text-red-600" />
        </button>
      </div>
    </div>
  );
}