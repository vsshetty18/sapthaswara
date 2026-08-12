'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Music2, X, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn, bytesToSize } from '@/lib/utils';

export interface SongUploaderProps {
  onUpload: (payload: Record<string, any>, file?: File) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'];

export default function SongUploader({ onUpload, isSubmitting = false, onCancel }: SongUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [movie, setMovie] = useState('');
  const [singer, setSinger] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (selected: File) => {
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFileError('Please upload an MP3, WAV, or M4A file');
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError('File must be under 50MB');
      return;
    }
    setFileError(null);
    setFile(selected);
    if (!title) {
      setTitle(selected.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) validateAndSetFile(dropped);
  }, [title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) validateAndSetFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onUpload(
      { title: title.trim(), movie: movie.trim() || undefined, singer: singer.trim() || undefined },
      file || undefined
    );

    setFile(null);
    setTitle('');
    setMovie('');
    setSinger('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
          isDragging ? 'border-gold-400 bg-gold-50' : 'border-beige-200 bg-beige-50 hover:border-gold-300'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a"
          className="hidden"
          onChange={handleFileSelect}
        />
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex w-full items-center gap-3"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-gradient">
                <Music2 className="h-5 w-5 text-walnut-600" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-walnut-600">{file.name}</p>
                <p className="text-xs text-walnut-300">{bytesToSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="rounded-full p-1.5 hover:bg-beige-100"
              >
                <X className="h-4 w-4 text-walnut-400" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Upload className="mx-auto h-8 w-8 text-walnut-300" />
              <p className="mt-3 text-sm font-medium text-walnut-500">
                Drag & drop your audio file, or click to browse
              </p>
              <p className="mt-1 text-xs text-walnut-300">MP3, WAV, or M4A — up to 50MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {fileError && <p className="text-xs text-red-500">{fileError}</p>}

      <Input
        label="Song Title"
        placeholder="e.g. Kesariya"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Movie (optional)" placeholder="e.g. Brahmastra" value={movie} onChange={(e) => setMovie(e.target.value)} />
        <Input label="Singer (optional)" placeholder="e.g. Arijit Singh" value={singer} onChange={(e) => setSinger(e.target.value)} />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={!title.trim() || isSubmitting}
          leftIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
        >
          {isSubmitting ? 'Uploading...' : 'Add Song'}
        </Button>
      </div>
    </form>
  );
}
