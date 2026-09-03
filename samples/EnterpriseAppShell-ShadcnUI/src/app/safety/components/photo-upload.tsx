import * as React from "react"
import { CameraIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { Photo } from "../data"

const MAX_BYTES = 10 * 1024 * 1024
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic"]

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function PhotoTile({
  photo,
  onRemove,
}: {
  photo: Photo
  onRemove?: (photo: Photo) => void
}) {
  return (
    <Attachment orientation="vertical" className="w-32">
      <AttachmentMedia variant={photo.url ? "image" : "icon"}>
        {photo.url ? (
          <img src={photo.url} alt={photo.caption || photo.name} />
        ) : (
          <ImageIcon />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{photo.name}</AttachmentTitle>
        <AttachmentDescription>{photo.caption}</AttachmentDescription>
      </AttachmentContent>
      {onRemove && (
        <AttachmentActions className="absolute top-1 right-1">
          <AttachmentAction
            className="bg-background/80 backdrop-blur"
            aria-label={`Remove ${photo.name}`}
            onClick={() => onRemove(photo)}
          >
            <XIcon />
          </AttachmentAction>
        </AttachmentActions>
      )}
    </Attachment>
  )
}

export function PhotoUpload({
  photos,
  onChange,
  label = "Photos",
  hint = "JPG, PNG or WEBP up to 10 MB each",
  className,
}: {
  photos: Photo[]
  onChange: (next: Photo[]) => void
  label?: string
  hint?: string
  className?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const cameraRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)
  // Object URLs created here are revoked when this uploader unmounts.
  const created = React.useRef<string[]>([])

  React.useEffect(() => {
    const urls = created.current
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  function accept(files: FileList | null) {
    if (!files || files.length === 0) return
    const next: Photo[] = []
    let rejected = 0

    for (const file of Array.from(files)) {
      if (!ACCEPTED.includes(file.type) || file.size > MAX_BYTES) {
        rejected += 1
        continue
      }
      const url = URL.createObjectURL(file)
      created.current.push(url)
      next.push({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        caption: formatSize(file.size),
        url,
      })
    }

    if (next.length > 0) {
      onChange([...photos, ...next])
      toast.success(
        `${next.length} ${next.length === 1 ? "photo" : "photos"} attached`
      )
    }
    if (rejected > 0) {
      toast.error(`${rejected} file(s) skipped — images only, max 10 MB`)
    }
  }

  function remove(photo: Photo) {
    if (photo.url) URL.revokeObjectURL(photo.url)
    created.current = created.current.filter((url) => url !== photo.url)
    onChange(photos.filter((entry) => entry.id !== photo.id))
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          accept(event.dataTransfer.files)
        }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors",
          dragging && "border-primary bg-primary/5"
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <UploadIcon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon />
            Choose files
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => cameraRef.current?.click()}
          >
            <CameraIcon />
            Take photo
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          hidden
          onChange={(event) => {
            accept(event.target.files)
            event.target.value = ""
          }}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(event) => {
            accept(event.target.files)
            event.target.value = ""
          }}
        />
      </div>

      {photos.length > 0 && (
        <AttachmentGroup>
          {photos.map((photo) => (
            <PhotoTile key={photo.id} photo={photo} onRemove={remove} />
          ))}
        </AttachmentGroup>
      )}
    </div>
  )
}
