import React from 'react';
import { FileText, Download, FileVideo, FileAudio, FileArchive, Image as ImageIcon } from 'lucide-react';
import { MessageAttachment as AttachmentType } from '../types';

interface MessageAttachmentProps {
  attachment: AttachmentType;
  isOwner?: boolean;
}

export function MessageAttachment({ attachment, isOwner }: MessageAttachmentProps) {
  const isImage = attachment.type.startsWith('image/');

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formattedSize = formatSize(attachment.size);

  const getFileIcon = () => {
    if (attachment.type.startsWith('video/')) return <FileVideo className="w-5 h-5" />;
    if (attachment.type.startsWith('audio/')) return <FileAudio className="w-5 h-5" />;
    if (attachment.type.includes('zip') || attachment.type.includes('tar') || attachment.type.includes('rar')) return <FileArchive className="w-5 h-5" />;
    if (isImage) return <ImageIcon className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  if (isImage) {
    return (
      <div className="mt-2 relative group max-w-[320px] overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md bg-gray-50/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name}
          className="object-cover w-full max-h-[280px] min-h-[120px]"
          loading="lazy"
        />
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center pointer-events-auto"
        >
          <div className="transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg text-sm font-semibold hover:bg-white hover:scale-105 active:scale-95 cursor-pointer">
            <Download className="w-4 h-4" />
            Download
          </div>
        </a>
      </div>
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-2 flex items-center gap-3 p-3 rounded-xl border max-w-sm transition-all duration-200 group bg-white border-gray-200 hover:border-blue-300 hover:shadow-md text-gray-900`}
    >
      <div className={`p-2.5 rounded-lg transition-colors bg-blue-50 group-hover:bg-blue-100 text-blue-600`}>
        {getFileIcon()}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="text-[13px] font-semibold truncate leading-tight mb-0.5">{attachment.name}</div>
      </div>
      <div className={`p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 bg-gray-50 hover:bg-gray-100`}>
        <Download className={`w-4 h-4 text-gray-500`} />
      </div>
    </a>
  );
}
