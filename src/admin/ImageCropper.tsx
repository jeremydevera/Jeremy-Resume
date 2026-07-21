import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

const ASPECTS: { label: string; value: number }[] = [
  { label: "16:10", value: 16 / 10 },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "3:4", value: 3 / 4 },
];

async function cropToFile(file: File, area: Area): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(area.width);
    canvas.height = Math.round(area.height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("crop failed"))), type, 0.92),
    );
    const ext = type === "image/png" ? "png" : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${base}-cropped.${ext}`, { type });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ImageCropper({
  file,
  defaultAspect = 16 / 10,
  onDone,
  onCancel,
}: {
  file: File;
  defaultAspect?: number;
  onDone: (file: File) => void; // cropped OR original (skip)
  onCancel: () => void;
}) {
  const src = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(defaultAspect);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: Area, px: Area) => setArea(px), []);

  const confirm = async () => {
    if (!area) return;
    setBusy(true);
    try {
      onDone(await cropToFile(file, area));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="crop-overlay" role="dialog" aria-label="Crop image">
      <div className="crop-modal">
        <div className="crop-stage">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <div className="crop-center" aria-hidden="true" />
        </div>
        <div className="crop-controls">
          <div className="crop-aspects">
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                type="button"
                className={`pill ${Math.abs(aspect - a.value) < 0.001 ? "active" : ""}`}
                onClick={() => setAspect(a.value)}
              >
                {a.label}
              </button>
            ))}
          </div>
          <input
            className="crop-zoom"
            type="range"
            min={1}
            max={4}
            step={0.05}
            value={zoom}
            aria-label="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          <div className="crop-actions">
            <button className="btn" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn" type="button" onClick={() => onDone(file)}>
              Use original
            </button>
            <button className="btn primary" type="button" onClick={confirm} disabled={busy || !area}>
              {busy ? "Cropping…" : "Crop & upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
