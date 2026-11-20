"use client";

import { useCallback, useState, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

interface SortableImageCardProps {
  id: string;
  img: string;
  index: number;
  total: number;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMakeCover: () => void;
  onRemove: () => void;
}

function SortableImageCard({
  id,
  img,
  index,
  total,
  onMoveLeft,
  onMoveRight,
  onMakeCover,
  onRemove,
}: SortableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.45 : 1,
  };

  const isCover = index === 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl border overflow-hidden bg-card aspect-square select-none transition-all duration-200 ${
        isDragging
          ? "border-primary ring-2 ring-primary shadow-2xl scale-[1.02]"
          : isCover
          ? "border-amber-500/80 ring-2 ring-amber-500/30 shadow-md"
          : "border-border hover:border-foreground/30 hover:shadow-md"
      }`}
    >
      {/* Product Image */}
      <img
        src={img}
        alt={`Product Media ${index + 1}`}
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* Top Badges (Cover vs Position #) */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
        {isCover ? (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider bg-amber-500 text-black shadow-md flex items-center gap-1">
            <Star size={11} className="fill-current" /> Main Cover
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-black/70 text-white backdrop-blur-xs border border-white/10 shadow-xs">
            #{index + 1}
          </span>
        )}
      </div>

      {/* Drag Handle & Top Controls Overlay */}
      <div className="absolute inset-x-0 top-0 p-2.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-black/70 via-black/30 to-transparent z-20">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg bg-black/70 text-white hover:bg-black/90 transition-colors touch-none shadow-xs"
          title="Drag to swap / reposition"
        >
          <GripVertical size={15} />
        </div>

        <div className="flex items-center gap-1.5">
          {!isCover && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMakeCover();
              }}
              className="px-2 py-1 rounded-lg bg-black/70 text-amber-300 hover:bg-amber-500 hover:text-black text-[10px] font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              title="Set as Main Cover Image"
            >
              <Star size={11} className="fill-current" /> Cover
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-red-500 transition-colors shadow-xs cursor-pointer"
            title="Delete Image"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Bottom Swap Bar: Move Left / Move Right Buttons */}
      {total > 1 && (
        <div className="absolute inset-x-0 bottom-0 p-2.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
          <button
            type="button"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              onMoveLeft();
            }}
            className={`p-1.5 rounded-lg text-white transition-colors flex items-center gap-1 text-[11px] font-mono font-bold ${
              index === 0
                ? "opacity-30 cursor-not-allowed bg-black/40"
                : "bg-black/70 hover:bg-primary hover:text-primary-foreground cursor-pointer shadow-xs"
            }`}
            title="Move left (swap with previous)"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-[10px] font-mono text-white/90 font-bold uppercase tracking-wider">
            {index + 1} of {total}
          </span>

          <button
            type="button"
            disabled={index === total - 1}
            onClick={(e) => {
              e.stopPropagation();
              onMoveRight();
            }}
            className={`p-1.5 rounded-lg text-white transition-colors flex items-center gap-1 text-[11px] font-mono font-bold ${
              index === total - 1
                ? "opacity-30 cursor-not-allowed bg-black/40"
                : "bg-black/70 hover:bg-primary hover:text-primary-foreground cursor-pointer shadow-xs"
            }`}
            title="Move right (swap with next)"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Generate unique IDs for sortable items
  const sortableItems = useMemo(
    () => images.map((url, idx) => ({ id: `img-${idx}-${url.slice(-20)}`, url, originalIndex: idx })),
    [images]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true);
      const newImages: string[] = [];

      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.success && data.url) {
            newImages.push(data.url);
          }
        } catch (err) {
          console.error("Upload failed", err);
        }
      }

      onChange([...images, ...newImages]);
      setIsUploading(false);
    },
    [images, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const newImages = [...images];
    const [removed] = newImages.splice(from, 1);
    newImages.splice(to, 0, removed);
    onChange(newImages);
  };

  const makeCover = (index: number) => {
    if (index <= 0 || index >= images.length) return;
    moveImage(index, 0);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortableItems.findIndex((item) => item.id === active.id);
    const newIndex = sortableItems.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onChange(arrayMove(images, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:bg-muted/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
          <UploadCloud size={40} className={isDragActive ? "text-primary" : ""} />
          {isUploading ? (
            <p className="font-medium text-primary">Uploading images...</p>
          ) : isDragActive ? (
            <p className="font-medium text-primary">Drop images here to add...</p>
          ) : (
            <>
              <p className="font-medium text-foreground">Drag & drop images here</p>
              <p className="text-sm">or click to select files from your computer</p>
            </>
          )}
        </div>
      </div>

      {/* Rearrange & Swapping Controls Header */}
      {images.length > 0 && (
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>
              <strong>{images.length}</strong> {images.length === 1 ? "Image" : "Images"} &bull; Drag to swap or use ◀ ▶ arrows
            </span>
          </span>
          <span className="text-[11px] hidden sm:inline text-muted-foreground">
            1st image is the primary store cover
          </span>
        </div>
      )}

      {/* Sortable Image Gallery Grid */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableItems.map((item) => item.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img, index) => {
                const item = sortableItems[index];
                return (
                  <SortableImageCard
                    key={item?.id || index}
                    id={item?.id || `img-${index}`}
                    img={img}
                    index={index}
                    total={images.length}
                    onMoveLeft={() => moveImage(index, index - 1)}
                    onMoveRight={() => moveImage(index, index + 1)}
                    onMakeCover={() => makeCover(index)}
                    onRemove={() => removeImage(index)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
