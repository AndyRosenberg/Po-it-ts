import { useState, useEffect } from 'react';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { Link } from 'react-router-dom';
import { useCreatePoem } from '../hooks/useCreatePoem';
import { useAuthContext } from '../hooks/useAuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { BackButton } from '../components/BackButton';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StanzaCardProps {
  id: string;
  body: string;
  onUpdate: (id: string, body: string) => void;
  onDelete: (id: string) => void;
}

const SortableStanzaCard = ({ id, body, onUpdate, onDelete }: StanzaCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stanzaText, setStanzaText] = useState(body);
  
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition 
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  
  const handleSave = () => {
    onUpdate(id, stanzaText);
    setIsEditing(false);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="bg-slate-800 rounded-lg p-4 mb-4 border border-slate-700 shadow-lg"
    >
      <div className="flex justify-between items-start mb-3">
        <div 
          {...attributes}
          {...listeners}
          className="p-1 cursor-move text-slate-400 hover:text-slate-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
        </div>
        <div className="space-x-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(id)}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
      
      {isEditing ? (
        <div>
          <textarea
            className="w-full p-2 bg-slate-700 text-white border border-slate-600 rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 min-h-[100px]"
            value={stanzaText}
            onChange={(e) => setStanzaText(e.target.value)}
          />
          <div className="flex justify-end mt-3 space-x-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-3 py-1 bg-cyan-600 text-white rounded-md hover:bg-cyan-500"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="whitespace-pre-wrap text-slate-200">
          {body}
        </div>
      )}
    </div>
  );
};

export const CreatePoem = () => {
  useAuthRedirect();
  const { authUser } = useAuthContext();
  const { 
    stanzas, 
    isLoading, 
    error: errorMsg,
    poemTitle,
    addStanza, 
    updateStanza, 
    deleteStanza, 
    reorderStanzas,
    updateTitle,
    completePoem 
  } = useCreatePoem();
  const [newStanzaText, setNewStanzaText] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(poemTitle);
  
  // Keep titleText in sync with poemTitle
  useEffect(() => {
    setTitleText(poemTitle);
  }, [poemTitle]);

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddStanza = async () => {
    if (newStanzaText.trim()) {
      await addStanza(newStanzaText);
      setNewStanzaText('');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = stanzas.findIndex(item => item.id === active.id);
      const newIndex = stanzas.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderStanzas(oldIndex, newIndex);
      }
    }
  };

  const handleTitleUpdate = async () => {
    if (titleText.trim()) {
      try {
        await updateTitle(titleText);
        setEditingTitle(false);
      } catch (error) {
        console.error("Error updating title:", error);
        // Error is already handled by the hook and will appear in the errorMsg display
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-24">
      <div className="flex flex-col h-[90vh]">
        {/* Header */}
        <header className="py-6 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <BackButton />
              <h1 className="text-2xl font-bold text-white">Create Poem</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <UserAvatar />
              
              {stanzas.length > 0 && (
                <button 
                  onClick={completePoem}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/10 transition-all hover:shadow-cyan-500/20"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Complete Poem'}
                </button>
              )}
            </div>
          </div>
        </header>
        
        {/* Error display */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {errorMsg}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Poem title */}
          <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-white">Poem Title</h3>
              <button 
                onClick={() => setEditingTitle(!editingTitle)}
                className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                </svg>
              </button>
            </div>
            
            {editingTitle ? (
              <div>
                <input
                  type="text"
                  className="w-full p-2 bg-slate-700 text-white border border-slate-600 rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  placeholder="Enter poem title..."
                />
                <div className="flex justify-end mt-3 space-x-2">
                  <button 
                    onClick={() => setEditingTitle(false)}
                    className="px-3 py-1 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleTitleUpdate}
                    className="px-3 py-1 bg-cyan-600 text-white rounded-md hover:bg-cyan-500"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xl text-slate-200 font-medium">{titleText}</div>
            )}
          </div>
          
          {/* Stanzas list */}
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={stanzas.map(s => s.id || `temp-${s.body}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="mb-8">
                {stanzas.map((stanza) => (
                  <SortableStanzaCard
                    key={stanza.id || `temp-${stanza.body}`}
                    id={stanza.id || `temp-${stanza.body}`}
                    body={stanza.body}
                    onUpdate={updateStanza}
                    onDelete={deleteStanza}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          {/* Add new stanza */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-lg">
            <h3 className="text-lg font-medium text-white mb-3">Add a new stanza</h3>
            <textarea
              className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 min-h-[120px]"
              placeholder="Write your stanza here..."
              value={newStanzaText}
              onChange={(e) => setNewStanzaText(e.target.value)}
            />
            <div className="flex justify-end mt-4">
              <button 
                onClick={handleAddStanza}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/10 transition-all hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !newStanzaText.trim()}
              >
                {isLoading ? 'Adding...' : 'Add Stanza'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};