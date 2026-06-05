import React, { useEffect, useRef, useState } from 'react';
import '../styles/image-dropzone.css';

export default function ImageDropzone({
  label,
  helperText,
  file,
  previewUrl,
  onFileChange,
  accept = 'image/*',
  placeholder = 'Arrastrá una imagen, pegala con Ctrl+V o hacé clic para seleccionarla.',
  buttonLabel = 'Elegir archivo',
  previewAlt = 'Vista previa de la imagen'
}) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [objectUrl, setObjectUrl] = useState('');

  useEffect(() => {
    if (!file) {
      setObjectUrl('');
      return undefined;
    }

    const nextObjectUrl = URL.createObjectURL(file);
    setObjectUrl(nextObjectUrl);

    return () => URL.revokeObjectURL(nextObjectUrl);
  }, [file]);

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  const handleFiles = (files) => {
    const nextFile = files?.[0] || null;
    onFileChange(nextFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    handleFiles(Array.from(event.dataTransfer.files || []).filter((item) => item.type.startsWith('image/')));
  };

  const handlePaste = (event) => {
    const pastedFiles = Array.from(event.clipboardData?.files || []).filter((item) => item.type.startsWith('image/'));
    if (pastedFiles.length > 0) {
      event.preventDefault();
      handleFiles(pastedFiles);
    }
  };

  const displayUrl = objectUrl || previewUrl || '';

  return (
    <div
      className={dragActive ? 'image-dropzone is-dragging' : 'image-dropzone'}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={handleOpenPicker}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpenPicker();
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragActive(false);
      }}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      <input
        ref={inputRef}
        className="image-dropzone-input"
        type="file"
        accept={accept}
        onChange={(event) => handleFiles(Array.from(event.target.files || []))}
      />

      <div className="image-dropzone-preview">
        {displayUrl ? (
          <img src={displayUrl} alt={previewAlt} className="image-dropzone-image" />
        ) : (
          <div className="image-dropzone-placeholder">
            <span className="image-dropzone-icon">+</span>
          </div>
        )}
      </div>

      <div className="image-dropzone-copy">
        <strong>{label}</strong>
        <p>{placeholder}</p>
        <span>{helperText}</span>
        {file ? <small>{file.name}</small> : null}
        {displayUrl && !file ? <small>Imagen actual</small> : null}
      </div>

      <span className="image-dropzone-action">{buttonLabel}</span>
    </div>
  );
}
