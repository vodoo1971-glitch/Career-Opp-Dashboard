"use client";

export default function ImportModal({
  text,
  setText,
  sample,
  onClose,
  onImport,
}: {
  text: string;
  setText: (s: string) => void;
  sample: () => void;
  onClose: () => void;
  onImport: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <strong>Import / Restore JSON</strong>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-body">
          <p className="small">
            Paste JSON from ChatGPT or a Backup JSON file. Accepted formats: an
            array, an opportunities object, or a full backup object. Existing
            jobs with the same organization + position are updated instead of
            duplicated.
          </p>
          <textarea
            className="jsonbox"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='[{ "organization": "...", "position": "...", "jimScore": 90 }]'
          />
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={sample}>
            Insert Sample
          </button>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={onImport}>
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
