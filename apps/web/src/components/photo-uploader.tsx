import { type Room, roomLabels } from '@movemate/contracts';
import { ImagePlusIcon, XIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState, type DragEvent } from 'react';
import { RoomSelect } from '@/components/room-select';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type Draft = { id: string; file: File; previewUrl: string; room: Room; error?: string };

type PhotoUploaderProps = {
  existingCounts: Partial<Record<Room, number>>;
  maxPerRoom: number;
  upload: (file: File, room: Room) => Promise<unknown>;
  disabled?: boolean;
  /** Fixes the room of every photo and hides the room pickers, for uploads made inside one room. */
  room?: Room;
};

const acceptedTypes = 'image/jpeg,image/png,image/webp';

export function PhotoUploader({ existingCounts, maxPerRoom, upload, disabled, room: fixedRoom }: PhotoUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const draftsRef = useRef(drafts);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);
  useEffect(() => () => draftsRef.current.forEach((draft) => URL.revokeObjectURL(draft.previewUrl)), []);

  function addFiles(files: FileList | null) {
    const images = [...(files ?? [])].filter((file) => file.type.startsWith('image/'));
    setDrafts((current) => [
      ...current,
      ...images.map((file) => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file), room: fixedRoom ?? ('kitchen' as Room) })),
    ]);
  }

  function removeDraft(id: string) {
    setDrafts((current) => {
      current.filter((draft) => draft.id === id).forEach((draft) => URL.revokeObjectURL(draft.previewUrl));
      return current.filter((draft) => draft.id !== id);
    });
  }

  function setRoom(id: string, room: Room) {
    setDrafts((current) => current.map((draft) => (draft.id === id ? { ...draft, room, error: undefined } : draft)));
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) addFiles(event.dataTransfer.files);
  }

  const queuedPerRoom = new Map<Room, number>();
  for (const draft of drafts) queuedPerRoom.set(draft.room, (queuedPerRoom.get(draft.room) ?? 0) + 1);
  const fullRooms = [...queuedPerRoom].filter(([room, queued]) => queued + (existingCounts[room] ?? 0) > maxPerRoom);

  async function uploadAll() {
    setIsUploading(true);
    const results = await Promise.all(
      drafts.map(async (draft) => {
        try {
          await upload(draft.file, draft.room);
          return { id: draft.id };
        } catch (error) {
          return { id: draft.id, error: error instanceof Error ? error.message : 'Upload failed' };
        }
      }),
    );
    results.filter((result) => !result.error).forEach((result) => removeDraft(result.id));
    setDrafts((current) => current.map((draft) => ({ ...draft, error: results.find((result) => result.id === draft.id)?.error })));
    setIsUploading(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-wrap items-center gap-3 rounded-xl border border-dashed bg-surface px-4 py-3 transition-colors',
          isDragging && 'border-primary bg-card',
          disabled && 'opacity-50',
        )}
      >
        <ImagePlusIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-sm text-muted-foreground">Drop photos here, or choose files. JPEG, PNG or WebP.</p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={acceptedTypes}
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = '';
          }}
        />
        <Button type="button" variant="secondary" disabled={disabled} onClick={() => inputRef.current?.click()}>
          Choose photos
        </Button>
      </div>

      {drafts.length > 0 && (
        <>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {drafts.map((draft) => (
              <li key={draft.id} className="flex flex-col gap-2">
                <div className="relative overflow-hidden rounded-lg border bg-surface">
                  <img src={draft.previewUrl} alt={draft.file.name} className="aspect-4/3 w-full object-cover" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    className="absolute top-2 right-2"
                    aria-label={`Remove ${draft.file.name}`}
                    disabled={isUploading}
                    onClick={() => removeDraft(draft.id)}
                  >
                    <XIcon />
                  </Button>
                </div>
                {!fixedRoom && <RoomSelect value={draft.room} onValueChange={(room) => setRoom(draft.id, room)} label={`Room for ${draft.file.name}`} disabled={isUploading} />}
                {draft.error && (
                  <p role="alert" className="text-sm text-destructive-text">
                    {draft.error}
                  </p>
                )}
              </li>
            ))}
          </ul>
          {fullRooms.length > 0 && (
            <p role="alert" className="text-sm text-warning-text">
              {fullRooms.map(([room]) => roomLabels[room]).join(', ')}: at most {maxPerRoom} photos per room. Move some to another room.
            </p>
          )}
          <div>
            <Button type="button" size="lg" disabled={disabled || isUploading || fullRooms.length > 0} onClick={uploadAll}>
              {isUploading && <Spinner data-icon="inline-start" />}
              Upload {drafts.length} {drafts.length === 1 ? 'photo' : 'photos'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
