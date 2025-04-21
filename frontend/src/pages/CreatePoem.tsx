import { useState, useEffect } from 'react';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { useCreatePoem } from '../hooks/useCreatePoem';
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
  SortableContext, 
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Maximum character count for stanzas
const MAX_STANZA_CHARS = 300;

interface StanzaCardProps {
  id: string;
  body: string;
  onUpdate: (id: string, body: string) => void;
  onDelete: (id: string) => void;
  disabled: boolean;
}

const SortableStanzaCard = ({ id, body, onUpdate, onDelete, disabled }: StanzaCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stanzaText, setStanzaText] = useState(body);
  const charCount = stanzaText.length;
  const charsRemaining = MAX_STANZA_CHARS - charCount;
  const isOverLimit = charCount > MAX_STANZA_CHARS;

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
  
  const handleStanzaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= MAX_STANZA_CHARS) {
      setStanzaText(newText);
    }
  };
  
  const handleSave = () => {
    if (!isOverLimit) {
      onUpdate(id, stanzaText);
      setIsEditing(false);
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      data-stanza-id={id}
      className="bg-slate-800 rounded-lg p-4 mb-4 border border-slate-700 shadow-lg"
    >
      <div className="flex justify-between items-start mb-3">
        <div 
          {...attributes}
          {...(disabled ? [] : listeners)}
          className={`p-1 text-slate-400 hover:text-slate-300 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-move'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
        </div>
        <div className="space-x-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-slate-400 hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(id)}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
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
            className={`w-full p-2 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-700 text-white border ${isOverLimit ? 'border-red-500' : 'border-slate-600'} rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 min-h-[100px]`}
            value={stanzaText}
            onChange={handleStanzaChange}
            maxLength={MAX_STANZA_CHARS}
            disabled={disabled}
          />
          <div className="flex justify-between mt-3">
            <div className={`text-sm ${
              charsRemaining <= 30 
                ? charsRemaining <= 10 
                  ? 'text-red-400' 
                  : 'text-yellow-400' 
                : 'text-slate-400'
            }`}>
              {charsRemaining} characters remaining
            </div>
            <div className="space-x-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className={`px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed ${isOverLimit ? 'bg-slate-600 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500'} text-white rounded-md`}
                disabled={isOverLimit || disabled}
              >
                Save
              </button>
            </div>
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

  // Handle completing the poem, saving any unsaved edits only when explicitly requested
  const handleCompletePoem = async () => {
    // First check if any stanzas are being edited
    const stanzaElements = document.querySelectorAll('textarea');
    let activeStanzaId = null;
    let activeStanzaText = '';
    
    // Look for textareas that are visible and being edited (within stanza cards)
    stanzaElements.forEach(element => {
      const stanzaCard = element.closest('[data-stanza-id]');
      if (stanzaCard && element.style.display !== 'none') {
        activeStanzaId = stanzaCard.getAttribute('data-stanza-id');
        activeStanzaText = element.value;
      }
    });
    
    // If an active stanza edit is found, save it first (only when "Complete Poem" is clicked)
    if (activeStanzaId && activeStanzaText && activeStanzaText.trim()) {
      await updateStanza(activeStanzaId, activeStanzaText);
    }
    
    // Always pass the current title text, whether it's been saved or not
    // This ensures the title input field value is what gets saved
    
    // Now proceed with the normal completion, which will handle title and new stanza
    await completePoem(titleText, newStanzaText || undefined);
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-24">
      <div className="flex flex-col">
        {/* Header */}
        <header className="py-6 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <BackButton preserveDraftState={true} />
              <h1 className="text-2xl font-bold text-white">Create Poem</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="px-2 py-1 text-xs rounded-full bg-amber-500/20 text-amber-200">
                Draft
              </span>
              
              <UserAvatar />
              
              {(stanzas.length > 0 || newStanzaText.trim() || titleText !== "Untitled Poem") && (
                <button 
                  onClick={handleCompletePoem}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/10 transition-all hover:shadow-cyan-500/20"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Publish Poem'}
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
        <div className="flex-1 overflow-y-auto min-h-[50vh] mb-24">
          {/* Loading overlay for when we're updating but already have stanzas loaded */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-800 opacity-50 z-10 flex justify-center items-center">
              <div className="animate-spin opacity-100 rounded-full h-32 w-32 z-11 border-t-3 border-b-3 border-cyan-500"></div>
            </div>
          )}

          {/* Poem title */}
          <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-white">Poem Title</h3>
              <button 
                onClick={() => setEditingTitle(!editingTitle)}
                className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                disabled={isLoading}
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
                  className="w-full p-2 bg-slate-700 text-white border border-slate-600 rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  placeholder="Enter poem title..."
                  disabled={isLoading}
                />
                <div className="flex justify-end mt-3 space-x-2">
                  <button 
                    onClick={() => setEditingTitle(false)}
                    className="px-3 py-1 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleTitleUpdate}
                    className="px-3 py-1 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          {/* Add new stanza */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-lg">
            <h3 className="text-lg font-medium text-white mb-3">Add a new stanza</h3>
            <textarea
              className={`w-full p-3 bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed border ${newStanzaText.length > MAX_STANZA_CHARS ? 'border-red-500' : 'border-slate-600'} rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 min-h-[120px]`}
              placeholder="Write your stanza here..."
              value={newStanzaText}
              onChange={(e) => {
                const newText = e.target.value;
                if (newText.length <= MAX_STANZA_CHARS) {
                  setNewStanzaText(newText);
                }
              }}
              maxLength={MAX_STANZA_CHARS}
              disabled={isLoading}
            />
            <div className={`text-sm mt-2 ${
              MAX_STANZA_CHARS - newStanzaText.length <= 30 
                ? MAX_STANZA_CHARS - newStanzaText.length <= 10 
                  ? 'text-red-400' 
                  : 'text-yellow-400' 
                : 'text-slate-400'
            }`}>
              {MAX_STANZA_CHARS - newStanzaText.length} characters remaining
            </div>
            <div className="flex justify-end mt-4">
              <button 
                onClick={handleAddStanza}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/10 transition-all hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !newStanzaText.trim() || newStanzaText.length > MAX_STANZA_CHARS}
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