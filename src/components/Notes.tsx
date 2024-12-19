import { useState } from 'react';
import { MessageSquarePlus, X } from 'lucide-react';
import { RemovalOrder } from '../types';

interface NotesProps {
  order: RemovalOrder;
  onSave: (order: RemovalOrder) => void;
}

export default function Notes({ order, onSave }: NotesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const updatedOrder = {
      ...order,
      notes: [...(order.notes || []), newNote.trim()]
    };
    onSave(updatedOrder);
    setNewNote('');
  };

  const handleRemoveNote = (index: number) => {
    const updatedNotes = (order.notes || []).filter((_, i) => i !== index);
    onSave({
      ...order,
      notes: updatedNotes
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        title="Add/View Notes"
      >
        <MessageSquarePlus className={`w-5 h-5 ${order.notes?.length ? 'text-indigo-500' : 'text-gray-400'}`} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Notes for {order.sku}
                      </h3>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="rounded-full p-1 hover:bg-gray-100"
                      >
                        <X className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>

                    <div className="mt-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddNote();
                            }
                          }}
                        />
                        <button
                          onClick={handleAddNote}
                          disabled={!newNote.trim()}
                          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>

                      <div className="mt-4 space-y-2">
                        {order.notes?.length ? (
                          order.notes.map((note, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
                            >
                              <span className="flex-1">{note}</span>
                              <button
                                onClick={() => handleRemoveNote(index)}
                                className="ml-2 rounded-full p-1 hover:bg-gray-200"
                              >
                                <X className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-sm text-gray-500">
                            No notes yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}