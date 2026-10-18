import { MAX_PROBLEM_PHOTOS, type Photo } from '@movemate/contracts';
import { ImagePlusIcon, XIcon } from 'lucide-react';
import { useEffect, useId, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';

type PhotoAttachFieldProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
  /** Photos already saved with the problem; they count toward the limit. */
  kept?: Photo[];
  onKeptChange?: (kept: Photo[]) => void;
  disabled?: boolean;
};

const acceptedTypes = 'image/jpeg,image/png,image/webp';

export function PhotoAttachField({ files, onFilesChange, kept = [], onKeptChange, disabled }: PhotoAttachFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);

  const total = files.length + kept.length;
  const full = total >= MAX_PROBLEM_PHOTOS;

  function addFiles(chosen: FileList | null) {
    const images = [...(chosen ?? [])].filter((file) => file.type.startsWith('image/'));
    onFilesChange([...files, ...images].slice(0, MAX_PROBLEM_PHOTOS - kept.length));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={acceptedTypes}
          className="sr-only"
          disabled={disabled || full}
          aria-label="Attach photos to this problem"
          tabIndex={-1}
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = '';
          }}
        />
        <Button type="button" variant="secondary" size="sm" disabled={disabled || full} onClick={() => inputRef.current?.click()}>
          <ImagePlusIcon data-icon="inline-start" />
          Attach photos
        </Button>
        <span className="text-sm text-muted-foreground">
          {total} of {MAX_PROBLEM_PHOTOS} photos
        </span>
      </div>
      {total > 0 && (
        <ul className="flex flex-wrap gap-2">
          {kept.map((photo) => (
            <Thumb key={photo.id} url={photo.url} name="saved photo" disabled={disabled} onRemove={() => onKeptChange?.(kept.filter((item) => item.id !== photo.id))} />
          ))}
          {previews.map(({ file, url }) => (
            <Thumb key={url} url={url} name={file.name} disabled={disabled} onRemove={() => onFilesChange(files.filter((item) => item !== file))} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Thumb({ url, name, onRemove, disabled }: { url: string; name: string; onRemove: () => void; disabled?: boolean }) {
  return (
    <li className="relative w-20 overflow-hidden rounded-lg border bg-surface">
      <img src={url} alt={name} className="aspect-4/3 w-full object-cover" />
      <Button type="button" variant="secondary" size="icon-sm" className="absolute top-1 right-1" aria-label={`Remove ${name}`} disabled={disabled} onClick={onRemove}>
        <XIcon />
      </Button>
    </li>
  );
}
