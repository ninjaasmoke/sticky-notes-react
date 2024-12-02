# Sticky Notes React

A simple sticky notes component built with React and no other dependencies.

## Installation

```bash
npm install sticky-notes-react
```

## Usage

#### Add a note
```jsx

import { StickyNotes, stickyNotes } from 'sticky-notes-react';

export default function Home() {

  return (
    <div>

      <StickyNotes />

      <button onClick={() => {
        stickyNotes.addNote();
      }}>
        Add Note
      </button>

    </div>
  );
}

```

#### Full Example

```tsx
import { StickyNotes, stickyNotes } from 'sticky-notes-react';


export default function Home() {

  const [noteId, setNoteId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8 items-center p-8 font-[family-name:var(--font-geist-sans)]">

      <StickyNotes />

      <button onClick={() => {
        const noteId = stickyNotes.addNote();
        setNoteId(noteId);
      }}>
        Add Note
      </button>

      <button onClick={() => {
        const notes = stickyNotes.exportNotes();
        console.log(notes);
      }}>
        Export Notes
      </button>

      <button onClick={() => {
        const notes = stickyNotes.deleteAllNotes();
        console.log(notes);
      }}>
        Delete All Notes
      </button>

      <button onClick={() => {
        const notes = stickyNotes.getNotes();
        console.log(notes);
      }}>
        Get Notes
      </button>


      <button
        onClick={() => {
          if (!noteId) return;

          const notes = stickyNotes.updateNote(noteId, {
            title: "Updated Title",
            content: "Updated Note",
          });
          console.log(notes);
        }}
      >
        (Optionally) Update Note by ID
      </button>

      <button
        onClick={() => {
          if (!noteId) return;

          stickyNotes.deleteNote(noteId);
          setNoteId(null);
        }}
      >
        (Optionally) Delete Note by ID
      </button>

    </div>
  );
}
```