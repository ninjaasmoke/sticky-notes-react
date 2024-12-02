import React, { useState, useEffect, useRef } from 'react';

interface Note {
    id: string;
    title: string;
    content: string;
    position: { x: number; y: number };
    noteColor?: string;
    textBoxColor?: string;
}

interface AddNoteOptions {
    title?: string;
    content?: string;
}

const noteColors: Record<string, string> = {
    "#ffb3ba": "#e6a1a7",
    "#ffdfba": "#e6c9a7",
    "#ffffba": "#e6e6a7",
    "#baffc9": "#a7e5b5",
    "#bae1ff": "#a7cbe6",
    "#b3b3b3": "#a1a1a1",
    "#ffb3ff": "#e6a7e6",
    "#c9c9ff": "#b5b5e5",
    "#ffbaff": "#e6a7e6",
    "#c9ffc9": "#b5e5b5",
    "#ffc9c9": "#e5b5b5"
};

const CloseButton: React.FC = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 48 48">
            <g>
                <ellipse cx="24" cy="45.1" rx="14.2" ry="1.9" opacity="0.15" fill="#45413C" />
                <path d="M40.1,12.8l-4.8-4.8c-0.5-0.5-1.3-0.5-1.8,0L24,17.4l-9.5-9.5c-0.5-0.5-1.3-0.5-1.8,0l-4.8,4.8c-0.5,0.5-0.5,1.3,0,1.8l9.5,9.5l-9.5,9.5c-0.5,0.5-0.5,1.3,0,1.8l4.8,4.8c0.5,0.5,1.3,0.5,1.8,0l9.5-9.5l9.5,9.5c0.5,0.5,1.3,0.5,1.8,0l4.8-4.8c0.5-0.5,0.5-1.3,0-1.8L30.6,24l9.5-9.5C40.5,14,40.5,13.2,40.1,12.8z"
                    fill="#FF6242" />
                <path d="M40.1,12.8l-4.8-4.8c-0.5-0.5-1.3-0.5-1.8,0L24,17.4l-9.5-9.5c-0.5-0.5-1.3-0.5-1.8,0l-4.8,4.8c-0.5,0.5-0.5,1.3,0,1.8l9.5,9.5l-9.5,9.5c-0.5,0.5-0.5,1.3,0,1.8l4.8,4.8c0.5,0.5,1.3,0.5,1.8,0l9.5-9.5l9.5,9.5c0.5,0.5,1.3,0.5,1.8,0l4.8-4.8c0.5-0.5,0.5-1.3,0-1.8L30.6,24l9.5-9.5C40.5,14,40.5,13.2,40.1,12.8z"
                    fill="none" stroke="#45413C" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" />
            </g>
        </svg>
    )
};

function getRandomColorPair(): [string, string] {
    const entries = Object.entries(noteColors);
    const randomIndex = Math.floor(Math.random() * entries.length);
    return entries[randomIndex];
}
class StickyNotesManager {
    private static instance: StickyNotesManager;
    private _notes: Note[] = [];
    private _listeners: ((notes: Note[]) => void)[] = [];

    private constructor() { }

    private randomRange(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    public static getInstance(): StickyNotesManager {
        if (!StickyNotesManager.instance) {
            StickyNotesManager.instance = new StickyNotesManager();
        }
        return StickyNotesManager.instance;
    }

    public addNote({ title = "New Note", content = 'start typing here...' }: AddNoteOptions = {}): string {
        const [noteColor, textBoxColor] = getRandomColorPair();
        const newNote: Note = {
            id: `note-${Date.now()}`,
            title,
            content,
            position: {
                x: this.randomRange(150, window.innerWidth - 400),
                y: this.randomRange(150, window.innerHeight - 400),
            },
            noteColor,
            textBoxColor
        };
        this._notes.push(newNote);
        this._notify();
        return newNote.id;
    }

    public deleteNote = (id: string) => {
        this._notes = this._notes.filter(note => note.id !== id);
        this._notify();
    }

    public deleteAllNotes() {
        this._notes = [];
        this._notify();
    }

    public updateNote(id: string, updates: Partial<Note>) {
        this._notes = this._notes.map(note =>
            note.id === id ? { ...note, ...updates } : note
        );
        this._notify();
    }

    public exportNotes(): string {
        return JSON.stringify(this._notes);
    }

    public getNotes(): Note[] {
        return [...this._notes];
    }

    private _notify() {
        this._listeners.forEach(listener => listener([...this._notes]));
    }

    public subscribe(listener: (notes: Note[]) => void) {
        this._listeners.push(listener);
        return () => {
            this._listeners = this._listeners.filter(l => l !== listener);
        };
    }
}

export function StickyNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const manager = StickyNotesManager.getInstance();
    const draggedNoteRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

    useEffect(() => {
        const unsubscribe = manager.subscribe(setNotes);

        const handleMouseMove = (e: MouseEvent) => {
            if (draggedNoteRef.current) {
                const { id, offsetX, offsetY } = draggedNoteRef.current;
                manager.updateNote(id, {
                    position: {
                        x: e.clientX - offsetX,
                        y: e.clientY - offsetY,
                    }
                });
            }
        };

        const handleMouseUp = () => {
            draggedNoteRef.current = null;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            unsubscribe();
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startDragging = (noteId: string, e: React.MouseEvent) => {
        const note = notes.find(n => n.id === noteId);
        if (!note) return;

        const offsetX = e.clientX - note.position.x;
        const offsetY = e.clientY - note.position.y;

        draggedNoteRef.current = { id: noteId, offsetX, offsetY };
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1000,
                padding: 0,
                margin: 0,
                boxSizing: 'border-box',
            }}
        >
            {notes.map((note) => (
                <div
                    key={note.id}
                    style={{
                        position: 'absolute',
                        padding: '8px',
                        width: '16rem',
                        height: '18rem',
                        margin: 0,
                        boxSizing: 'border-box',
                        cursor: 'move',
                        backgroundColor: note.noteColor,
                        pointerEvents: 'auto',
                        left: `${note.position.x}px`,
                        top: `${note.position.y}px`,
                        borderRadius: '0.5rem',
                        zIndex: draggedNoteRef.current?.id === note.id ? 1001 : 1000,
                    }}
                    onMouseDown={(e) => startDragging(note.id, e)}
                >
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'row-reverse',
                                height: 'min-content',
                                justifyContent: 'space-between',
                                marginBottom: '4px',
                            }}
                        >
                            <button
                                onClick={() => manager.deleteNote(note.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    boxSizing: 'border-box',
                                }}
                            >
                                <CloseButton />
                            </button>
                        </div>
                        <input
                            style={{
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                color: 'inherit',
                                border: 'none',
                                width: '100%',
                                outline: 'none',
                                backgroundColor: note.textBoxColor,
                                boxSizing: 'border-box',
                                marginBottom: '4px',
                                padding: '2px 4px',
                                borderRadius: '0.5rem',
                            }}
                            value={note.title}
                            onChange={(e) => {
                                manager.updateNote(note.id, { title: e.target.value });
                            }}
                            onMouseDown={(e) => {
                                if (e.target === e.currentTarget) {
                                    e.stopPropagation();
                                }
                            }}
                        />
                        <textarea
                            style={{
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                color: 'inherit',
                                border: 'none',
                                flex: 1,
                                width: '100%',
                                resize: 'none',
                                outline: 'none',
                                backgroundColor: note.textBoxColor,
                                pointerEvents: 'auto',
                                boxSizing: 'border-box',
                                padding: '2px 4px',
                                borderRadius: '0.5rem',
                            }}
                            value={note.content}
                            onChange={(e) => {
                                manager.updateNote(note.id, { content: e.target.value });
                            }}
                            onMouseDown={(e) => {
                                if (e.target === e.currentTarget) {
                                    e.stopPropagation();
                                }
                            }}
                        />
                    </div>
                </div>
            ))
            }
        </div >
    );
}

export const stickyNotes = StickyNotesManager.getInstance();