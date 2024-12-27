import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface EditableCellProps {
  value: string;
  isEditing: boolean;
  onEdit: (value: string) => void;
  onStartEdit: () => void;
}

export default function EditableCell({ value, isEditing, onEdit, onStartEdit }: EditableCellProps) {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEdit(editValue);
    } else if (e.key === 'Escape') {
      setEditValue(value);
      onEdit(value);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => onEdit(editValue)}
        onKeyDown={handleKeyDown}
        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    );
  }

  return (
    <div
      onClick={onStartEdit}
      className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
    >
      {value}
    </div>
  );
}