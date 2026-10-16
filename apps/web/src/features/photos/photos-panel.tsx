import type { PhotoStage, Room } from '@movemate/contracts';
import { CircleAlertIcon } from 'lucide-react';
import { PhotoGrid } from '@/components/photo-grid';
import { PhotoUploader } from '@/components/photo-uploader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { usePhotoActions, usePhotos } from './use-photos';

export function PhotosPanel({ moveId, stage }: { moveId: string; stage: PhotoStage }) {
  const photos = usePhotos(moveId, stage);
  const { upload, relabel, remove } = usePhotoActions(moveId, stage);
  const actionError = relabel.error ?? remove.error;

  if (photos.isError) {
    return (
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Could not load your photos</AlertTitle>
        <AlertDescription>Refresh the page to try again.</AlertDescription>
      </Alert>
    );
  }
  if (!photos.data) {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-6 w-1/4" />
      </div>
    );
  }

  const counts: Partial<Record<Room, number>> = {};
  for (const photo of photos.data) counts[photo.room] = (counts[photo.room] ?? 0) + 1;

  return (
    <div className="flex flex-col gap-10">
      <PhotoUploader existingCounts={counts} upload={(file, room) => upload.mutateAsync({ file, room })} />
      {actionError && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>That did not work</AlertTitle>
          <AlertDescription>{actionError.message}</AlertDescription>
        </Alert>
      )}
      <PhotoGrid
        photos={photos.data}
        disabled={relabel.isPending || remove.isPending}
        onRelabel={(photo, room) => relabel.mutate({ id: photo.id, room })}
        onDelete={(photo) => remove.mutate(photo.id)}
      />
    </div>
  );
}
